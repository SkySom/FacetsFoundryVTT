import type { DiceCreator } from "./dice_creator";
import { ChaosDiceCreator } from "./regular/chaos_dice_creator";
import { RegularDiceValueCategory } from "./regular/regular_dice_category";

export class DiceCreatorRegistry {
    private static readonly DICE_CREATORS: Map<string, DiceCreator> = new Map([
        ["d", RegularDiceValueCategory.REGULAR_DICE_CREATOR],
        ["cd", ChaosDiceCreator.INSTANCE],
        ["ad", RegularDiceValueCategory.ASSURED_DICE_CREATOR],
    ]);

    static getDiceCreator(type: string): DiceCreator | null {
        return this.DICE_CREATORS.get(type) ?? null;
    }

    static getDiceCreators(): Map<string, DiceCreator> {
        return this.DICE_CREATORS;
    }
}
