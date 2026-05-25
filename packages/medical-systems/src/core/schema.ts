import { z } from "zod"

export const EntityTypeSchema = z.enum([
  "requirement",
  "risk",
  "design",
  "implementation",
  "test",
  "document",
  "evidence"
])

export const EntityRefSchema = z.object({
  type: EntityTypeSchema,
  id: z.string(),
})

export const RequirementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(["system", "software", "user"]),
  safetyClass: z.enum(["A", "B", "C"]).default("A"),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["draft", "active", "deprecated"]),
  criticality: z.string().optional(),
  clinicalImpact: z.string().optional(),
  verificationRequired: z.boolean().default(true),
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
  controlMeasures: z.array(z.string()).default([]), // IDs of requirements or design elements
  status: z.enum(["identified", "mitigated", "accepted"]),
  residualRiskAcceptedBy: z.string().optional(),
  residualRiskRationale: z.string().optional(),
  benefitRiskAnalysis: z.string().optional(),
})

export const DesignElementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  architectureLayer: z.enum(["ui", "logic", "data", "infrastructure"]),
})

export const TestCaseSchema = z.object({
  id: z.string(),
  requirementIds: z.array(z.string()),
  type: z.enum(["unit", "integration", "system", "manual"]),
  automated: z.boolean().default(true),
  status: z.enum(["draft", "active", "deprecated"]),
})

export const EvidenceArtifactSchema = z.object({
  id: z.string(),
  type: z.enum(["test_report", "scan_result", "review_record"]),
  generatedAt: z.string(),
  hash: z.string(),
  location: z.string(),
})

export const TraceRelationshipSchema = z.enum([
  "implements",
  "verifies",
  "mitigates",
  "derived_from",
  "evidences"
])

export const TraceLinkSchema = z.object({
  source: EntityRefSchema,
  target: EntityRefSchema,
  relationship: TraceRelationshipSchema,
  metadata: z.record(z.string(), z.any()).optional(),
})

export const MedicalGraphSchema = z.object({
  version: z.string().default("1.1.0"),
  requirements: z.array(RequirementSchema).default([]),
  risks: z.array(RiskSchema).default([]),
  designElements: z.array(DesignElementSchema).default([]),
  testCases: z.array(TestCaseSchema).default([]),
  evidence: z.array(EvidenceArtifactSchema).default([]),
  traces: z.array(TraceLinkSchema).default([]),
})

export type EntityType = z.infer<typeof EntityTypeSchema>
export type EntityRef = z.infer<typeof EntityRefSchema>
export type Requirement = z.infer<typeof RequirementSchema>
export type Risk = z.infer<typeof RiskSchema>
export type DesignElement = z.infer<typeof DesignElementSchema>
export type TestCase = z.infer<typeof TestCaseSchema>
export type EvidenceArtifact = z.infer<typeof EvidenceArtifactSchema>
export type TraceRelationship = z.infer<typeof TraceRelationshipSchema>
export type TraceLink = z.infer<typeof TraceLinkSchema>
export type MedicalGraph = z.infer<typeof MedicalGraphSchema>
