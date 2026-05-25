import fs from "node:fs/promises"
import path from "node:path"
import { type MedicalGraph, MedicalGraphSchema } from "./schema.js"

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
      return MedicalGraphSchema.parse({ requirements: [], risks: [], traces: [] })
    }
  }

  async save(graph: MedicalGraph): Promise<void> {
    const dir = path.dirname(this.configPath)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(this.configPath, JSON.stringify(graph, null, 2))
  }

  async validate(graph: MedicalGraph) {
    const errors: string[] = []

    // Check for orphan requirements (no implementation link)
    for (const req of graph.requirements) {
      const hasImplementation = graph.traces.some(
        (t) => t.sourceId === req.id && t.type === "implements"
      )
      if (!hasImplementation && req.status === "active") {
        errors.push(`Requirement ${req.id} is active but has no implementation link.`)
      }
    }

    // Check for unmitigated risks
    for (const risk of graph.risks) {
      if (risk.status !== "mitigated" && risk.status !== "accepted") {
        errors.push(`Risk ${risk.id} is not mitigated or accepted.`)
      }
      if (risk.controlMeasures.length === 0 && risk.status !== "accepted") {
        errors.push(`Risk ${risk.id} has no control measures.`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  async getTraceabilityMatrix(graph: MedicalGraph) {
    // Basic implementation for now
    return graph.traces.map(t => ({
      from: t.sourceId,
      to: t.targetId,
      relationship: t.type
    }))
  }
}
