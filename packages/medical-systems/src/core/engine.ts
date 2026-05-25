import fs from "node:fs/promises"
import path from "node:path"
import { type MedicalGraph, MedicalGraphSchema, type EntityRef } from "./schema.js"

export type ValidationError = {
  level: "info" | "warning" | "error" | "critical"
  code: string
  message: string
  entity?: string
}

export class MedicalEngine {
  constructor(private workspaceRoot: string) {}

  private get configPath() {
    return path.join(this.workspaceRoot, ".opencode", "medical.json")
  }

  async load(): Promise<MedicalGraph> {
    try {
      const data = await fs.readFile(this.configPath, "utf-8")
      return MedicalGraphSchema.parse(JSON.parse(data))
    } catch (error) {
      return MedicalGraphSchema.parse({
        requirements: [],
        risks: [],
        designElements: [],
        testCases: [],
        evidence: [],
        traces: []
      })
    }
  }

  async save(graph: MedicalGraph): Promise<void> {
    const dir = path.dirname(this.configPath)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(this.configPath, JSON.stringify(graph, null, 2))
  }

  async validate(graph: MedicalGraph) {
    const errors: ValidationError[] = []

    // 1. Orphan Requirements (no implementation)
    for (const req of graph.requirements) {
      const hasImplementation = graph.traces.some(
        (t) => t.source.id === req.id && t.source.type === "requirement" && t.relationship === "implements"
      )
      if (!hasImplementation && req.status === "active") {
        errors.push({
          level: req.safetyClass === "C" ? "critical" : "error",
          code: "ORPHAN_REQUIREMENT",
          message: `Requirement ${req.id} is active but has no implementation link.`,
          entity: req.id
        })
      }

      // Check for missing verification if required
      if (req.verificationRequired && req.status === "active") {
        const hasVerification = graph.traces.some(
          (t) => t.source.id === req.id && t.source.type === "requirement" && t.relationship === "verifies"
        )
        if (!hasVerification) {
          errors.push({
            level: "warning",
            code: "MISSING_VERIFICATION",
            message: `Requirement ${req.id} is active but has no associated test case.`,
            entity: req.id
          })
        }
      }
    }

    // 2. Unmitigated Risks
    for (const risk of graph.risks) {
      if (risk.status === "identified") {
        errors.push({
          level: "error",
          code: "UNMITIGATED_RISK",
          message: `Risk ${risk.id} is identified but not mitigated or accepted.`,
          entity: risk.id
        })
      }

      const hasMitigation = graph.traces.some(
        (t) => t.target.id === risk.id && t.target.type === "risk" && t.relationship === "mitigates"
      )
      if (!hasMitigation && risk.status !== "accepted") {
        errors.push({
          level: "critical",
          code: "MISSING_CONTROL_MEASURE",
          message: `Risk ${risk.id} has no control measures linked in the graph.`,
          entity: risk.id
        })
      }

      if (risk.status === "accepted" && !risk.residualRiskRationale) {
        errors.push({
          level: "error",
          code: "MISSING_ACCEPTANCE_RATIONALE",
          message: `Risk ${risk.id} is accepted but lacks a residual risk rationale.`,
          entity: risk.id
        })
      }
    }

    // 3. Semantic Trace Validation (Invalid relationships)
    for (const trace of graph.traces) {
      if (trace.relationship === "implements" && trace.source.type !== "requirement") {
        errors.push({
          level: "error",
          code: "INVALID_RELATIONSHIP",
          message: `Only requirements can 'implement' other entities. Found ${trace.source.type} ${trace.source.id}.`,
        })
      }
    }

    return {
      valid: errors.filter(e => e.level === "error" || e.level === "critical").length === 0,
      errors,
    }
  }

  async getTracesFor(ref: EntityRef, graph: MedicalGraph) {
    const upstream = graph.traces.filter(t => t.target.id === ref.id && t.target.type === ref.type)
    const downstream = graph.traces.filter(t => t.source.id === ref.id && t.source.type === ref.type)
    return { upstream, downstream }
  }

  async getTraceabilityMatrix(graph: MedicalGraph) {
    return graph.traces.map(t => ({
      from: `${t.source.type}:${t.source.id}`,
      to: `${t.target.type}:${t.target.id}`,
      relationship: t.relationship
    }))
  }
}
