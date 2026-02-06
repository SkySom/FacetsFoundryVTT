import type { InexactPartial } from "fvtt-types/utils";
import type { RollValueCategory } from "../value/roll_value_category";

export class FacetsDice {
    constructor(
        public readonly category: RollValueCategory,
        public readonly die: foundry.dice.terms.Die,
        public readonly evaluationOptions: InexactPartial<foundry.dice.terms.RollTerm.EvaluationOptions> = {},
    ) {}

    evaluate(): Promise<void> {
        return Promise.resolve(
            this.die.evaluate(this.evaluationOptions),
        ).then();
    }

    total(): number {
        return this.die.total ?? 0;
    }
}
