import { createAssuredDiceCreators } from "./composite/assured_dice_creator";
import type { DiceCreator } from "./dice_creator";
import { ChaosDiceCreator } from "./regular/chaos_dice_creator";
import { RegularDiceValueCategory } from "./regular/regular_dice_category";

export class DiceCreatorRegistry {
    /**
     * Basic Dice Creators are those that only are ever their type while composite ones will need a list of all basic ones to create their sets
     */
    public static readonly BASIC_DICE_CREATORS: Map<string, DiceCreator> =
        new Map([
            ["d", RegularDiceValueCategory.REGULAR_DICE_CREATOR],
            ["cd", ChaosDiceCreator.INSTANCE],
        ]);

    public static readonly ASSURED_DICE_CREATORS: Map<string, DiceCreator> =
        createAssuredDiceCreators(this.BASIC_DICE_CREATORS);

    private static readonly DICE_CREATORS: Map<string, DiceCreator> = new Map([
        ...Array.from(this.BASIC_DICE_CREATORS.entries()),
        ...Array.from(this.ASSURED_DICE_CREATORS.entries()),
    ]);

    static getDiceCreator(type: string): DiceCreator | null {
        return this.DICE_CREATORS.get(type) ?? null;
    }

    static getDiceCreators(): Map<string, DiceCreator> {
        return this.DICE_CREATORS;
    }
}
