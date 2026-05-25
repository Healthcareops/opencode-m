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
          sourceId: match[1],
          targetId: file, // Link requirement to file
          type: "implements",
        })
      }

      // Match @risk HAZ-001
      const riskMatches = content.matchAll(/@risk\s+([A-Z0-9-]+)/g)
      for (const match of riskMatches) {
        traces.push({
          sourceId: match[1],
          targetId: file,
          type: "mitigates",
        })
      }
    }

    return { traces }
  }

  async sync(graph: MedicalGraph): Promise<MedicalGraph> {
    const scanned = await this.scanForAnnotations()

    // Merge scanned traces into graph, avoiding duplicates
    const existingTraces = new Set(graph.traces.map(t => `${t.sourceId}:${t.targetId}:${t.type}`))

    const newTraces = scanned.traces?.filter(t => {
      const key = `${t.sourceId}:${t.targetId}:${t.type}`
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
