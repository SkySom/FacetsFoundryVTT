import { AssistanceRollValueCategory } from "./assistance/assistance_dice_category";
import { createAssuredDiceCreators } from "./composite/assured_dice_creator";
import { createReducedDiceCreators } from "./composite/reduced_dice_creator";
import type { DiceCreator } from "./dice_creator";
import { KeptRollValueCategory } from "./kept/kept_dice_category";
import { PlotRollValueCategory } from "./plot/plot_dice_category";
import { ChaosDiceCreator } from "./regular/chaos_dice_creator";
import { RegularRollValueCategory } from "./regular/regular_dice_category";

export class DiceCreatorRegistry {
    /**
     * Basic Dice Creators are those that only are ever their type while composite ones will need a list of all basic ones to create their sets
     */
    public static readonly BASIC_DICE_CREATORS: Map<string, DiceCreator> = new Map([
        ["d", RegularRollValueCategory.REGULAR_DICE_CREATOR],
        ["cd", ChaosDiceCreator.INSTANCE],
        ["pd", PlotRollValueCategory.PLOT_DICE_CREATOR],
        ["ed", PlotRollValueCategory.ENHANCED_DICE_CREATOR],
        ["kd", KeptRollValueCategory.KEPT_DICE_CREATOR],
        ["sd", AssistanceRollValueCategory.ASSISTANCE_DICE_CREATOR]
    ]);

    public static readonly ASSURED_DICE_CREATORS: Map<string, DiceCreator> = createAssuredDiceCreators(
        this.BASIC_DICE_CREATORS
    );

    public static readonly REDUCED_DICE_CREATORS: Map<string, DiceCreator> = createReducedDiceCreators(
        this.BASIC_DICE_CREATORS
    );

    private static readonly DICE_CREATORS: Map<string, DiceCreator> = new Map([
        ...Array.from(this.BASIC_DICE_CREATORS.entries()),
        ...Array.from(this.ASSURED_DICE_CREATORS.entries()),
        ...Array.from(this.REDUCED_DICE_CREATORS.entries())
    ]);

    static getDiceCreator(type: string): DiceCreator | null {
        return this.DICE_CREATORS.get(type) ?? null;
    }

    static getDiceCreators(): Map<string, DiceCreator> {
        return this.DICE_CREATORS;
    }
}
