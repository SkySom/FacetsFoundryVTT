import type { RollValueCategory } from "./roll_value_category";

export interface RollValue {
    category(): RollValueCategory;

    value(): number;
}
