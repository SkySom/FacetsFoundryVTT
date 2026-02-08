import type { RollValueCategory } from "../../value/roll_value_category";
import { BasicDiceCreator } from "../dice_creator";
import { FacetsDice } from "../facets_dice";
import { RegularRollValueCategory } from "./regular_dice_category";

export class ChaosDiceCreator extends BasicDiceCreator {
    static readonly INSTANCE: ChaosDiceCreator = new ChaosDiceCreator();

    constructor() {
        super(RegularRollValueCategory.INSTANCE);
    }

    override create(facets: number): FacetsDice {
        return new ChaosFacetsDice(
            this.diceCategory,
            new foundry.dice.terms.Die({
                faces: facets,
                number: 1
            })
        );
    }
}

export class ChaosFacetsDice extends FacetsDice {
    constructor(
        public readonly internalCategory: RollValueCategory,
        public readonly internalDie: foundry.dice.terms.Die
    ) {
        super();
    }

    override category(): RollValueCategory {
        return this.internalCategory;
    }

    override die(): foundry.dice.terms.Die {
        return this.internalDie;
    }

    override evaluate(): Promise<void> {
        return Promise.resolve(this.die().evaluate()).then();
    }

    override total(): number {
        return -(this.die().total ?? 0);
    }
}
