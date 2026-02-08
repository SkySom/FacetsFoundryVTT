import type { RollValue } from "@roll/value/roll_value";
import type { RollValueCategory } from "@roll/value/roll_value_category";
import { BasicDiceCreator } from "../dice_creator";

export class KeptRollValueCategory implements RollValueCategory {
    static readonly INSTANCE: KeptRollValueCategory = new KeptRollValueCategory();

    static readonly KEPT_DICE_CREATOR = new BasicDiceCreator(this.INSTANCE);

    name: string = "kept_dice";

    pickValues(categoryDice: Array<RollValue>): Array<RollValue> {
        return categoryDice;
    }
}
