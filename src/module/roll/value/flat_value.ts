import { RollValue } from "./roll_value";
import type { RollValueCategory } from "./roll_value_category";

export class FlatRollValue extends RollValue {
    constructor(readonly modifier: number) {
        super();
    }

    override category(): RollValueCategory {
        return FlatRollValueCategory.INSTANCE;
    }

    override value(): number {
        return this.modifier;
    }

    override maxValue(): number {
        return this.value();
    }

    override toFormula(): string {
        if (this.value() < 0) {
            return `-${this.value()}`
        } else {
            return `+${this.value()}`
        }
    }
}

export class FlatRollValueCategory implements RollValueCategory {
    static readonly INSTANCE: FlatRollValueCategory =
        new FlatRollValueCategory();

    name: string = "flat_modifiers";

    pickValues(categoryValues: Array<RollValue>): Array<RollValue> {
        return categoryValues;
    }
}
