import { RollValue } from "../../value/roll_value";
import type { RollValueCategory } from "../../value/roll_value_category";
import { DiceCreator } from "../dice_creator";

export class RegularDiceValueCategory implements RollValueCategory {
    static readonly INSTANCE: RegularDiceValueCategory =
        new RegularDiceValueCategory();

    static readonly REGULAR_DICE_CREATOR = new DiceCreator(this.INSTANCE);
    static readonly ASSURED_DICE_CREATOR = new DiceCreator(
        this.INSTANCE,
        {},
        { maximize: true },
    );

    name: string = "regular_dice";

    pickValues(categoryDice: Array<RollValue>): Array<RollValue> {
        let positive = categoryDice
            .filter((val) => val.value() > 0)
            .sort((a, b) => a.value() - b.value())
            .slice(0, 2);

        let negative = categoryDice
            .filter((val) => val.value() < 0)
            .sort((a, b) => Math.abs(a.value()) - Math.abs(b.value()))
            .slice(0, 2);

        return [...positive, ...negative];
    }
}
