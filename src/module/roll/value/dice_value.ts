import type { FacetsDice } from "../dice/facets_dice";
import { RollValue } from "./roll_value";
import type { RollValueCategory } from "./roll_value_category";

export class DiceValue extends RollValue {
    constructor(readonly dice: FacetsDice) {
        super();
    }

    override category(): RollValueCategory {
        return this.dice.category();
    }

    override async evaluate(): Promise<void> {
        return await this.dice.evaluate();
    }

    override maxValue(): number {
        return this.dice.die().faces ?? 0;
    }

    override value(): number {
        return this.dice.total();
    }
}
