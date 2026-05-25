import { MedicalEngine } from "../core/engine.js"
import { IngestionLayer } from "../core/ingestion.js"

export class MedicalCLI {
  private engine: MedicalEngine
  private ingestion: IngestionLayer

  constructor(private workspaceRoot: string) {
    this.engine = new MedicalEngine(workspaceRoot)
    this.ingestion = new IngestionLayer(workspaceRoot)
  }

  async init() {
    const graph = await this.engine.load()
    await this.engine.save(graph)
    console.log("Initialized medical systems engineering addon.")
  }

  async validate() {
    let graph = await this.engine.load()
    graph = await this.ingestion.sync(graph)
    const result = await this.engine.validate(graph)

    if (result.valid) {
      console.log("✅ Compliance validation passed.")
    } else {
      console.error("❌ Compliance validation failed:")
      result.errors.forEach(err => {
        const icon = err.level === "critical" ? "‼️" : err.level === "error" ? "❌" : err.level === "warning" ? "⚠️" : "ℹ️"
        console.error(`${icon} [${err.code}] ${err.message}${err.entity ? ` (Entity: ${err.entity})` : ""}`)
      })
      process.exit(1)
    }
  }

  async report() {
    let graph = await this.engine.load()
    graph = await this.ingestion.sync(graph)

    console.log("# Medical Systems Engineering Report\n")

    console.log("## Requirements")
    graph.requirements.forEach(req => {
      console.log(`- [${req.id}] ${req.title} (Class ${req.safetyClass}, ${req.status})`)
    })

    console.log("\n## Risk Register")
    graph.risks.forEach(risk => {
      console.log(`- [${risk.id}] ${risk.hazard} - Status: ${risk.status}`)
    })

    console.log("\n## Traceability Matrix")
    const matrix = await this.engine.getTraceabilityMatrix(graph)
    matrix.forEach(m => {
      console.log(`- ${m.from} --(${m.relationship})--> ${m.to}`)
    })
  }

  async coverage() {
    let graph = await this.engine.load()
    graph = await this.ingestion.sync(graph)

    const totalReqs = graph.requirements.length
    const implementedReqs = graph.requirements.filter(req =>
      graph.traces.some(t => t.source.id === req.id && t.source.type === "requirement" && t.relationship === "implements")
    ).length
    const verifiedReqs = graph.requirements.filter(req =>
      graph.traces.some(t => t.source.id === req.id && t.source.type === "requirement" && t.relationship === "verifies")
    ).length

    console.log("# Traceability Coverage Report\n")
    console.log(`Implementation Coverage: ${implementedReqs}/${totalReqs} (${totalReqs > 0 ? (implementedReqs/totalReqs*100).toFixed(1) : 0}%)`)
    console.log(`Verification Coverage: ${verifiedReqs}/${totalReqs} (${totalReqs > 0 ? (verifiedReqs/totalReqs*100).toFixed(1) : 0}%)`)
  }

  async addRequirement(id: string, title: string, description: string, type: string) {
    const graph = await this.engine.load()
    graph.requirements.push({
      id,
      title,
      description,
      type: type as any,
      safetyClass: "A",
      priority: "medium",
      status: "draft",
      verificationRequired: true
    })
    await this.engine.save(graph)
    console.log(`Added requirement ${id}`)
  }

  async addRisk(id: string, hazard: string, cause: string) {
    const graph = await this.engine.load()
    graph.risks.push({
      id,
      hazard,
      cause,
      hazardousSituation: "",
      harm: "",
      preMitigation: { severity: 3, probability: 3 },
      status: "identified",
      controlMeasures: []
    })
    await this.engine.save(graph)
    console.log(`Added risk ${id}`)
  }
}
