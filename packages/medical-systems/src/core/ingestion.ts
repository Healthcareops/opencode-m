import fs from "node:fs/promises"
import path from "node:path"
import { type MedicalGraph, type TraceLink } from "./schema.js"
import { glob } from "glob"

export class IngestionLayer {
  constructor(private workspaceRoot: string) {}

  async scanForAnnotations(): Promise<Partial<MedicalGraph>> {
    const files = await glob("**/*.{ts,js,py,cpp,h}", {
      cwd: this.workspaceRoot,
      ignore: ["node_modules/**", ".git/**", "dist/**"],
    })

    const traces: TraceLink[] = []

    for (const file of files) {
      const content = await fs.readFile(path.join(this.workspaceRoot, file), "utf-8")

      // Match @trace REQ-001
      const traceMatches = content.matchAll(/@trace\s+([A-Z0-9-]+)/g)
      for (const match of traceMatches) {
        traces.push({
          source: { type: "requirement", id: match[1] },
          target: { type: "implementation", id: file },
          relationship: "implements",
        })
      }

      // Match @risk HAZ-001
      const riskMatches = content.matchAll(/@risk\s+([A-Z0-9-]+)/g)
      for (const match of riskMatches) {
        traces.push({
          source: { type: "implementation", id: file },
          target: { type: "risk", id: match[1] },
          relationship: "mitigates",
        })
      }

      // Match @test REQ-001
      const testMatches = content.matchAll(/@test\s+([A-Z0-9-]+)/g)
      for (const match of testMatches) {
        traces.push({
          source: { type: "requirement", id: match[1] },
          target: { type: "test", id: file },
          relationship: "verifies",
        })
      }

      // Match @design DES-001
      const designMatches = content.matchAll(/@design\s+([A-Z0-9-]+)/g)
      for (const match of designMatches) {
        traces.push({
          source: { type: "implementation", id: file },
          target: { type: "design", id: match[1] },
          relationship: "derived_from",
        })
      }
    }

    return { traces }
  }

  async sync(graph: MedicalGraph): Promise<MedicalGraph> {
    const scanned = await this.scanForAnnotations()

    // Merge scanned traces into graph, avoiding duplicates
    const existingTraces = new Set(graph.traces.map(t =>
      `${t.source.type}:${t.source.id}:${t.target.type}:${t.target.id}:${t.relationship}`
    ))

    const newTraces = scanned.traces?.filter(t => {
      const key = `${t.source.type}:${t.source.id}:${t.target.type}:${t.target.id}:${t.relationship}`
      if (existingTraces.has(key)) return false
      existingTraces.add(key)
      return true
    }) ?? []

    return {
      ...graph,
      traces: [...graph.traces, ...newTraces],
    }
  }
}
