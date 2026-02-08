import type { RollValue } from "@roll/value/roll_value";
import type { RollValueCategory } from "@roll/value/roll_value_category";
import { BasicDiceCreator } from "../dice_creator";

export class AssistanceRollValueCategory implements RollValueCategory {
    static readonly INSTANCE: AssistanceRollValueCategory = new AssistanceRollValueCategory();

    static readonly ASSISTANCE_DICE_CREATOR = new BasicDiceCreator(this.INSTANCE);

    name: string = "assistance_dice";

    pickValues(categoryDice: Array<RollValue>): Array<RollValue> {
        return categoryDice.sort((a, b) => b.value() - a.value()).slice(0, 1);
    }
}
