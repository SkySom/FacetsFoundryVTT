import type { RollValueCategory } from "../value/roll_value_category";

/**
 * The Default Facets Dice used by all basic dice
 *
 * If you add methods you may need to update the composite dice
 */
export abstract class FacetsDice {
    abstract category(): RollValueCategory;

    abstract evaluate(): Promise<void>;

    abstract die(): foundry.dice.terms.Die;

    abstract total(): number;
}

export class BasicFacetsDice extends FacetsDice {
    constructor(
        public readonly internalCategory: RollValueCategory,
        public readonly internalDie: foundry.dice.terms.Die,
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
        return this.die().total ?? 0;
    }
}
