import type { Quench } from "@ethaks/fvtt-quench";
import { registerRollBatch } from "./roll/roll_batch";
import { registerUtilBatch } from "./util/util_batch";

export function registerQuanch(quench: Quench) {
    registerRollBatch(quench);
    registerUtilBatch(quench);
}
