import type { RollOptions } from "../roll_options";
import type { RollValue } from "./roll_value";

export interface RollValueCategory {
    name: string;

    priority: number;

    pickValues(categoryDice: Array<RollValue>, rollOptions: RollOptions): Array<RollValue>;
}
