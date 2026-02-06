import type { RollValueCategory } from "./roll_value_category";

export abstract class RollValue {
    abstract category(): RollValueCategory;

    abstract value(): number;

    async evaluate(): Promise<void> {
        return Promise.resolve()
    }
}
