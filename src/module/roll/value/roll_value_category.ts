import type { RollValue } from "./roll_value";

export interface RollValueCategory {
    name: string;

    pickValues(categoryDice: Array<RollValue>): Array<RollValue>;
}
