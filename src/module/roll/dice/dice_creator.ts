import type { FacetsDice } from "./facets_dice";

export class DiceCreatorRegistry {
    private static readonly DICE_CREATORS: Map<string, DiceCreator> = new Map(
        [],
    );

    static getDiceCreator(type: string): DiceCreator | null {
        return this.DICE_CREATORS.get(type) ?? null;
    }

    static getDiceCreators(): Map<string, DiceCreator> {
        return this.DICE_CREATORS;
    }
}

interface DiceCreator {
    name: string;

    create(facets: number): FacetsDice;
}
