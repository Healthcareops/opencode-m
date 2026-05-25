import { tool } from "@opencode-ai/plugin"
import { MedicalEngine } from "../core/engine.js"
import { IngestionLayer } from "../core/ingestion.js"
import { RequirementSchema, RiskSchema } from "../core/schema.js"

export const createMedicalTools = (workspaceRoot: string) => {
  const engine = new MedicalEngine(workspaceRoot)
  const ingestion = new IngestionLayer(workspaceRoot)

  return {
    validate_medical_compliance: tool({
      description: "Validate the project for medical compliance and traceability.",
      args: {},
      async execute() {
        let graph = await engine.load()
        graph = await ingestion.sync(graph)
        const result = await engine.validate(graph)
        return JSON.stringify(result, null, 2)
      },
    }),

    add_medical_requirement: tool({
      description: "Add a new medical software requirement to the graph.",
      args: {
        requirement: RequirementSchema,
      },
      async execute({ requirement }) {
        const graph = await engine.load()
        graph.requirements.push(requirement)
        await engine.save(graph)
        return `Requirement ${requirement.id} added successfully.`
      },
    }),

    add_medical_risk: tool({
      description: "Add a new risk entry to the risk register (ISO 14971).",
      args: {
        risk: RiskSchema,
      },
      async execute({ risk }) {
        const graph = await engine.load()
        graph.risks.push(risk)
        await engine.save(graph)
        return `Risk ${risk.id} added successfully.`
      },
    }),

    get_medical_traceability: tool({
      description: "Retrieve the current traceability matrix.",
      args: {},
      async execute() {
        let graph = await engine.load()
        graph = await ingestion.sync(graph)
        const matrix = await engine.getTraceabilityMatrix(graph)
        return JSON.stringify(matrix, null, 2)
      },
    }),

    get_medical_traces_for: tool({
      description: "Get upstream and downstream traces for a specific entity.",
      args: {
        type: tool.schema.enum(["requirement", "risk", "design", "implementation", "test", "document", "evidence"]),
        id: tool.schema.string(),
      },
      async execute({ type, id }) {
        let graph = await engine.load()
        graph = await ingestion.sync(graph)
        const traces = await engine.getTracesFor({ type: type as any, id }, graph)
        return JSON.stringify(traces, null, 2)
      },
    }),
  }
}
