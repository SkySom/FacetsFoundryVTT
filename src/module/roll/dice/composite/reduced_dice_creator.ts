import type { RollValueCategory } from "../../value/roll_value_category";
import { DiceCreator } from "../dice_creator";
import { FacetsDice } from "../facets_dice";

export function createReducedDiceCreators(basicDiceCreators: Map<string, DiceCreator>): Map<string, DiceCreator> {
    const reducedDiceCreators: Map<string, DiceCreator> = new Map();

    for (const entry of basicDiceCreators) {
        reducedDiceCreators.set("r" + entry[0], new ReducedDiceCreator(entry[1]));
    }
    return reducedDiceCreators;
}

class ReducedDiceCreator extends DiceCreator {
    constructor(readonly internalDiceCreator: DiceCreator) {
        super();
    }

    override category(): RollValueCategory {
        return this.internalDiceCreator.category();
    }
    override create(facets: number): FacetsDice {
        const internalFacetsDice = this.internalDiceCreator.create(facets);

        return new ReducedFacetsDice(internalFacetsDice);
    }
}

class ReducedFacetsDice extends FacetsDice {
    constructor(readonly internalFacetsDice: FacetsDice) {
        super();
    }

    override category(): RollValueCategory {
        return this.internalFacetsDice.category();
    }

    override evaluate(): Promise<void> {
        return Promise.resolve(this.die().evaluate({ minimize: true })).then();
    }

    override die(): foundry.dice.terms.Die {
        return this.internalFacetsDice.die();
    }

    override total(): number {
        return this.internalFacetsDice.total();
    }
}
