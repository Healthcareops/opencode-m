import { cmd } from "./cmd"
import { MedicalCLI } from "@opencode-ai/medical-systems/cli/commands"
import { InstanceRef } from "@/effect/instance-ref"
import { Effect } from "effect"
import { effectCmd } from "../effect-cmd"
import type { Argv } from "yargs"

const MedicalInitCommand = effectCmd({
  command: "init",
  describe: "initialize medical systems engineering in the current project",
  handler: Effect.fn("Cli.medical.init")(function* () {
    const ctx = yield* InstanceRef
    if (!ctx) return
    const cli = new MedicalCLI(ctx.worktree)
    yield* Effect.promise(() => cli.init())
  }),
})

const MedicalValidateCommand = effectCmd({
  command: "validate",
  describe: "validate compliance and traceability",
  handler: Effect.fn("Cli.medical.validate")(function* () {
    const ctx = yield* InstanceRef
    if (!ctx) return
    const cli = new MedicalCLI(ctx.worktree)
    yield* Effect.promise(() => cli.validate())
  }),
})

const MedicalReportCommand = effectCmd({
  command: "report",
  describe: "generate a compliance report",
  handler: Effect.fn("Cli.medical.report")(function* () {
    const ctx = yield* InstanceRef
    if (!ctx) return
    const cli = new MedicalCLI(ctx.worktree)
    yield* Effect.promise(() => cli.report())
  }),
})

const MedicalCoverageCommand = effectCmd({
  command: "coverage",
  describe: "show traceability coverage statistics",
  handler: Effect.fn("Cli.medical.coverage")(function* () {
    const ctx = yield* InstanceRef
    if (!ctx) return
    const cli = new MedicalCLI(ctx.worktree)
    yield* Effect.promise(() => cli.coverage())
  }),
})

const MedicalAddRequirementCommand = effectCmd({
  command: "add-requirement <id> <title> <description>",
  describe: "add a new medical software requirement",
  builder: (yargs: Argv) =>
    yargs
      .positional("id", { type: "string", demandOption: true })
      .positional("title", { type: "string", demandOption: true })
      .positional("description", { type: "string", demandOption: true })
      .option("type", { type: "string", default: "software" }),
  handler: Effect.fn("Cli.medical.addRequirement")(function* (args) {
    const ctx = yield* InstanceRef
    if (!ctx) return
    const cli = new MedicalCLI(ctx.worktree)
    yield* Effect.promise(() => cli.addRequirement(args.id as string, args.title as string, args.description as string, args.type as string))
  }),
})

const MedicalAddRiskCommand = effectCmd({
  command: "add-risk <id> <hazard> <cause>",
  describe: "add a new risk entry",
  builder: (yargs: Argv) =>
    yargs
      .positional("id", { type: "string", demandOption: true })
      .positional("hazard", { type: "string", demandOption: true })
      .positional("cause", { type: "string", demandOption: true }),
  handler: Effect.fn("Cli.medical.addRisk")(function* (args) {
    const ctx = yield* InstanceRef
    if (!ctx) return
    const cli = new MedicalCLI(ctx.worktree)
    yield* Effect.promise(() => cli.addRisk(args.id as string, args.hazard as string, args.cause as string))
  }),
})

export const MedicalCommand = cmd({
  command: "medical",
  describe: "medical systems engineering tools",
  builder: (yargs) =>
    yargs
      .command(MedicalInitCommand)
      .command(MedicalValidateCommand)
      .command(MedicalReportCommand)
      .command(MedicalCoverageCommand)
      .command(MedicalAddRequirementCommand)
      .command(MedicalAddRiskCommand)
      .demandCommand(),
  async handler() {},
})
