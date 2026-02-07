import type { InexactPartial } from "fvtt-types/utils";
import type { RollValueCategory } from "../value/roll_value_category";
import { BasicFacetsDice, FacetsDice } from "./facets_dice";

export abstract class DiceCreator {
    abstract category(): RollValueCategory;

    abstract create(facets: number): FacetsDice;
}

export class BasicDiceCreator extends DiceCreator {
    constructor(
        public readonly diceCategory: RollValueCategory,
        public readonly additionalTerms: InexactPartial<foundry.dice.terms.Die.TermData> = {},
    ) {
        super();
    }

    override category(): RollValueCategory {
        return this.diceCategory;
    }

    override create(facets: number): FacetsDice {
        return new BasicFacetsDice(
            this.category(),
            new foundry.dice.terms.Die({
                faces: facets,
                number: 1,
                ...this.additionalTerms,
            }),
        );
    }
}
