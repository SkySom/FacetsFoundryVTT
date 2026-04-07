import { RollValue, type RollValueCategory } from "@roll";
import { plotPoints, RollResourceCost } from "@roll/roll_resource";
import type { InexactPartial } from "fvtt-types/utils";
import { BasicDiceCreator, DiceCreator } from "../dice_creator";
import { ResourceCostFacetsDice, type FacetsDice } from "../facets_dice";

export class PlotCostingDiceCreator extends DiceCreator {
    constructor(
        public readonly diceCategory: RollValueCategory,
        public readonly additionalTerms: InexactPartial<foundry.dice.terms.Die.TermData> = {}
    ) {
        super();
    }

    override category(): RollValueCategory {
        return this.diceCategory;
    }

    override create(facets: number): FacetsDice {
        return new ResourceCostFacetsDice(
            this.category(),
            new foundry.dice.terms.Die({
                faces: facets,
                number: 1,
                ...this.additionalTerms
            }),
            [new RollResourceCost(plotPoints, facets / 2)]
        );
    }
}

export class PlotRollValueCategory implements RollValueCategory {
    static readonly INSTANCE: PlotRollValueCategory = new PlotRollValueCategory();

    static readonly PLOT_DICE_CREATOR = new PlotCostingDiceCreator(this.INSTANCE);
    static readonly ENHANCED_DICE_CREATOR = new BasicDiceCreator(this.INSTANCE);

    name: string = "plot_dice";

    pickValues(categoryDice: Array<RollValue>): Array<RollValue> {
        if (categoryDice.length == 1) {
            const rollValue = categoryDice[0];
            if (rollValue.value() < rollValue.maxValue() / 2) {
                return [new HalfPlotRollValue(rollValue)];
            } else {
                return categoryDice;
            }
        } else {
            return categoryDice.sort((a, b) => b.value() - a.value()).slice(0, 1);
        }
    }
}

class HalfPlotRollValue extends RollValue {
    constructor(readonly rollValue: RollValue) {
        super();
    }

    override category(): RollValueCategory {
        return this.rollValue.category();
    }

    override value(): number {
        return Math.max(this.rollValue.value(), this.rollValue.maxValue() / 2);
    }

    override maxValue(): number {
        return this.rollValue.maxValue();
    }

    override toFormula(): string {
        return this.toFormula();
    }
}
