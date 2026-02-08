import { RollValue, type RollValueCategory } from "@roll";
import { BasicDiceCreator } from "../dice_creator";

export class PlotRollValueCategory implements RollValueCategory {
    static readonly INSTANCE: PlotRollValueCategory = new PlotRollValueCategory();

    static readonly PLOT_DICE_CREATOR = new BasicDiceCreator(this.INSTANCE);
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
}
