import type { RollValue } from "./roll_value";
import type { RollValueCategory } from "./roll_value_category";


export class FlatRollValue implements RollValue {
    readonly modifier: number;

    constructor(modifier: number) {
        this.modifier = modifier;
    }

    category(): RollValueCategory {
        return FlatRollValueCategory.INSTANCE;
    } 

    value(): number {
        return this.modifier;
    }
}

export class FlatRollValueCategory implements RollValueCategory {
    static readonly INSTANCE: FlatRollValueCategory = new FlatRollValueCategory();

    name: string = "Flat bonuses";

    pickValues(categoryValues: Array<RollValue>): Array<RollValue> {
        return categoryValues;
    }
}