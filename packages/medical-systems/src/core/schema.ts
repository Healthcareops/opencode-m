import { z } from "zod"

export const RequirementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(["system", "software", "user"]),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["draft", "active", "deprecated"]),
  traceIds: z.array(z.string()).default([]), // Links to other requirements or design elements
})

export const RiskSchema = z.object({
  id: z.string(),
  hazard: z.string(),
  cause: z.string(),
  hazardousSituation: z.string(),
  harm: z.string(),
  preMitigation: z.object({
    severity: z.number().min(1).max(5),
    probability: z.number().min(1).max(5),
  }),
  postMitigation: z.object({
    severity: z.number().min(1).max(5),
    probability: z.number().min(1).max(5),
  }).optional(),
  controlMeasures: z.array(z.string()).default([]), // IDs of requirements or design elements that mitigate this risk
  status: z.enum(["identified", "mitigated", "accepted"]),
})

export const TraceLinkSchema = z.object({
  sourceId: z.string(),
  targetId: z.string(),
  type: z.enum(["implements", "verifies", "mitigates", "derived_from"]),
  metadata: z.record(z.string(), z.any()).optional(),
})

export const MedicalGraphSchema = z.object({
  version: z.string().default("1.0.0"),
  requirements: z.array(RequirementSchema).default([]),
  risks: z.array(RiskSchema).default([]),
  traces: z.array(TraceLinkSchema).default([]),
})

export type Requirement = z.infer<typeof RequirementSchema>
export type Risk = z.infer<typeof RiskSchema>
export type TraceLink = z.infer<typeof TraceLinkSchema>
export type MedicalGraph = z.infer<typeof MedicalGraphSchema>
