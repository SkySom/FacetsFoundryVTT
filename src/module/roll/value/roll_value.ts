import type { RollResourceCost } from "@roll/roll_resource";
import type { RollValueCategory } from "./roll_value_category";

export abstract class RollValue {
    abstract category(): RollValueCategory;

    abstract value(): number;

    abstract maxValue(): number;

    abstract toFormula(): string;

    rollCost(): RollResourceCost[] {
        return [];
    }

    async evaluate(): Promise<void> {
        return Promise.resolve();
    }
}
