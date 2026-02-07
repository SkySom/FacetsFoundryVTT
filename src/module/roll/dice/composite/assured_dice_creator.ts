import type { RollValueCategory } from "../../value/roll_value_category";
import { DiceCreator } from "../dice_creator";
import { FacetsDice } from "../facets_dice";

export function createAssuredDiceCreators(basicDiceCreators: Map<string, DiceCreator>): Map<string, DiceCreator> {
    let assuredDiceCreators: Map<string, DiceCreator> = new Map();

    for (let entry of basicDiceCreators) {
        assuredDiceCreators.set("a" + entry[0], new AssuredDiceCreator(entry[1]));
    }
    return assuredDiceCreators;
}

class AssuredDiceCreator extends DiceCreator {
    constructor(readonly internalDiceCreator: DiceCreator) {
        super();
    }

    override category(): RollValueCategory {
        return this.internalDiceCreator.category();
    }
    override create(facets: number): FacetsDice {
        let internalFacetsDice = this.internalDiceCreator.create(facets);

        return new AssuredFacetsDice(internalFacetsDice);
    }
}

class AssuredFacetsDice extends FacetsDice {
    constructor(readonly internalFacetsDice: FacetsDice) {
        super();
    }

    override category(): RollValueCategory {
        return this.internalFacetsDice.category();
    }

    override evaluate(): Promise<void> {
        return Promise.resolve(this.die().evaluate({ maximize: true })).then();
    }

    override die(): foundry.dice.terms.Die {
        return this.internalFacetsDice.die();
    }

    override total(): number {
        return this.internalFacetsDice.total();
    }
}
