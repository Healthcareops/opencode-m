# Roadmap: Medical Systems Engineering Addon

This roadmap outlines the evolution of the OpenCode Medical Systems Engineering addon from a traceability engine into a comprehensive regulatory runtime.

## 🟢 Phase 1: Foundation (Completed)
- [x] Initial `packages/medical-systems` structure.
- [x] Hardened Zod schema for Requirements, Risks, Design, and Tests.
- [x] Typed Entity References and Trace Relationships.
- [x] Hybrid ingestion layer for code annotations.
- [x] CLI commands: `init`, `validate`, `report`, `coverage`, `add-*`.
- [x] `@medical` subagent with safety escalation logic.

## 🟡 Phase 2: Enhanced Intelligence (Short-term)
- [ ] **AST-Aware Ingestion**: Use `ts-morph` or TypeScript Compiler API to bind traces to specific functions/classes instead of just files.
- [ ] **Cyclic Dependency Analysis**: Detect and flag circularities in the traceability graph.
- [ ] **Risk Propagation**: Automatically escalate the Safety Class of requirements that mitigate high-severity risks.
- [ ] **Advanced Validation Rules**:
  - Verification coverage check (no unverified active requirements).
  - Risk mitigation validation (ensure control measures are linked to implementation).
- [ ] **Evidence Artifacts**: Integration with test runners to automatically generate `EvidenceArtifact` entries.

## 🟠 Phase 3: Regulatory Exports (Mid-term)
- [ ] **Export Formatters**:
  - FDA-ready Traceability Matrix (Excel/PDF).
  - IEC 62304 Software Requirements Specification (SRS) generator.
  - ISO 14971 Risk Management File (RMF) export.
- [ ] **Document Versioning**: Track hashes and versions of linked documents within the graph.
- [ ] **FHIR Validation**: Integration of a FHIR resource validator for medical data standard compliance.

## 🔴 Phase 4: Full Ecosystem (Long-term)
- [ ] **TUI Dashboard**: Real-time traceability and risk coverage dashboard within the OpenCode TUI.
- [ ] **CI/CD Integration**: Hard gating of builds/merges based on compliance validation results.
- [ ] **Change Impact Analysis**: Agent-driven analysis of how a code change affects the regulatory graph.
- [ ] **HIPAA/GDPR Compliance Modules**: Specialized auditing for patient data privacy.
