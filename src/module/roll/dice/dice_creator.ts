import type { InexactPartial } from "fvtt-types/utils";
import type { RollValueCategory } from "../value/roll_value_category";
import { FacetsDice } from "./facets_dice";

export class DiceCreator {
    constructor(
        public readonly category: RollValueCategory,
        public readonly additionalTerms: InexactPartial<foundry.dice.terms.Die.TermData> = {},
        public readonly evaluationOptions: InexactPartial<foundry.dice.terms.RollTerm.EvaluationOptions> = {},
    ) {}

    create(facets: number): FacetsDice {
        return new FacetsDice(
            this.category,
            new foundry.dice.terms.Die({
                faces: facets,
                number: 1,
                ...this.additionalTerms,
            }),
            this.evaluationOptions,
        );
    }
}
