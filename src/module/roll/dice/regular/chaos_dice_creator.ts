import type { RollValueCategory } from "../../value/roll_value_category";
import { DiceCreator } from "../dice_creator";
import { FacetsDice } from "../facets_dice";
import { RegularDiceValueCategory } from "./regular_dice_category";

export class ChaosDiceCreator extends DiceCreator {
    static readonly INSTANCE: ChaosDiceCreator = new ChaosDiceCreator();

    constructor() {
        super(RegularDiceValueCategory.INSTANCE);
    }

    override create(facets: number): FacetsDice {
        return new ChaosFacetsDice(
            this.category,
            new foundry.dice.terms.Die({
                faces: facets,
                number: 1,
            }),
        );
    }
}

export class ChaosFacetsDice extends FacetsDice {
    constructor(category: RollValueCategory, die: foundry.dice.terms.Die) {
        super(category, die);
    }

    override total(): number {
        return -super.total();
    }
}
