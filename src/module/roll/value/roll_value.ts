import type { RollValueCategory } from "./roll_value_category";

export abstract class RollValue {
    abstract category(): RollValueCategory;

    abstract value(): number;

    abstract maxValue(): number;

    async evaluate(): Promise<void> {
        return Promise.resolve()
    }
}
