# OpenCode Medical Systems Engineering Addon

This addon adapts OpenCode for **regulated medical systems engineering**, focusing on compliance with standards such as **IEC 62304** (Medical device software lifecycle) and **ISO 14971** (Risk management for medical devices).

## 🚀 Purpose

The goal of this addon is to provide a semantic regulatory runtime within the developer's workspace. It transforms compliance from a set of static document templates into a **live, machine-verifiable dependency graph**.

## 🏗️ Architecture & Boundaries

This addon is designed as a self-contained package within the OpenCode monorepo, maintaining clear boundaries to ensure easy synchronization with the upstream repository.

### Addon Scope (Internal to `packages/medical-systems`)
- **Compliance Graph Engine**: Logic for managing Requirements, Risks, Design Elements, and Test Cases.
- **Traceability Ingestion**: Automated scanning of `@trace`, `@risk`, `@test`, and `@design` annotations.
- **Validation Engine**: Deterministic rules for IEC 62304/ISO 14971 compliance.
- **@medical Subagent Prompt**: The specialized behavioral model for safety engineering.

### Integration Points (Minimal touch in core)
- **`packages/opencode/src/agent/agent.ts`**: Registration of the `@medical` agent.
- **`packages/opencode/src/cli/cmd/medical.ts`**: Registration of the `medical` CLI command suite.
- **`packages/opencode/src/plugin/index.ts`**: Registration of the `MedicalSystemsPlugin`.
- **`packages/opencode/package.json`**: Dependency on this package.

## 🛠️ Core Features

- **Hybrid Storage**: `.opencode/medical.json` acts as the deterministic source of truth, while code comments provide developer ergonomics.
- **Safety Escalation Logic**: The `@medical` agent automatically escalates clinical impact areas (e.g., dosage, alarms) to **Safety Class C**.
- **Bidirectional Traceability**: Track from Requirement → Design → Implementation → Verification.
- **Risk Register**: Structured ISO 14971 risk assessment including pre/post mitigation and residual risk acceptance.

## 📖 Usage

### CLI Commands
```bash
# Initialize medical systems engineering in a project
opencode medical init

# Add a requirement
opencode medical add-requirement REQ-001 "Infusion Logic" "Software shall calculate dose."

# Add a risk
opencode medical add-risk HAZ-001 "Overdose" "Software logic error"

# Validate compliance and traceability
opencode medical validate

# Generate a traceability and risk report
opencode medical report

# View coverage statistics
opencode medical coverage
```

### Code Annotations
```typescript
// @trace REQ-001
// @risk HAZ-001
// @test REQ-001
// @design DES-001
export function calculateDose() { ... }
```

### Agent Interaction
Invoke the specialized agent with `@medical` to review safety implications, check traceability, or audit the risk register.

## ⚖️ Standards Compliance
- **IEC 62304**: Supports software safety classification (A, B, C) and lifecycle traceability.
- **ISO 14971**: Implements a structured risk management file (RMF) workflow.
- **FDA SaMD**: Aligned with guidance for documentation and evidence traceability.
