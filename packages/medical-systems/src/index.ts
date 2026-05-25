import { type Plugin } from "@opencode-ai/plugin"
import { createMedicalTools } from "./agent/tools.js"

export const MedicalSystemsPlugin: Plugin = async (input) => {
  const medicalTools = createMedicalTools(input.worktree)

  return {
    tool: medicalTools,
  }
}
export { type MedicalGraph } from "./core/schema.js"
export { MedicalEngine } from "./core/engine.js"
