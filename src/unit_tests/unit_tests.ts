import type { Quench } from "@ethaks/fvtt-quench";
import { registerRollBatch } from "./roll/roll_batch";
import { registerUtilBatch } from "./util/util_batch";
import { registerCommandBatch } from "./command/command_batch";

export function registerQuanch(quench: Quench) {
    registerCommandBatch(quench);
    registerRollBatch(quench);
    registerUtilBatch(quench);
}
