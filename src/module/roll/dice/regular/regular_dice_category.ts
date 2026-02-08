import type { RollOptions } from "../../roll_options";
import { RollValue } from "../../value/roll_value";
import type { RollValueCategory } from "../../value/roll_value_category";
import { BasicDiceCreator } from "../dice_creator";

export class RegularDiceValueCategory implements RollValueCategory {
    static readonly INSTANCE: RegularDiceValueCategory =
        new RegularDiceValueCategory();

    static readonly REGULAR_DICE_CREATOR = new BasicDiceCreator(this.INSTANCE);

    name: string = "regular_dice";

    pickValues(
        categoryDice: Array<RollValue>,
        rollOptions?: RollOptions,
    ): Array<RollValue> {
        const positive = categoryDice
            .filter((val) => val.value() > 0)
            .sort((a, b) => b.value() - a.value())
            .slice(0, rollOptions?.kept ?? 2);

        const negative = categoryDice
            .filter((val) => val.value() < 0)
            .sort((a, b) =>  Math.abs(b.value()) - Math.abs(a.value()))
            .slice(0, 2);

        return [...positive, ...negative];
    }
}
