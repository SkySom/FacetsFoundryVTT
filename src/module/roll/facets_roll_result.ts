import type { AnyObject } from "fvtt-types/utils";
import { getRollTiers, type TierResult } from "./tier";
import { RollValue } from "./value/roll_value";
import type { RollValueCategory } from "./value/roll_value_category";
import type { RollOptions } from "./roll_options";

export class FacetsRollResults {
    constructor(
        readonly total: number,
        readonly tiers: TierResult,
        readonly categories: Map<string, FacetsRollCategoryResult>
    ) {}

    toData(): AnyObject {
        return {
            total: this.total,
            tiers: this.tiers,
            categories: Object.fromEntries(this.categories)
        };
    }

    static fromRollValues(rollValues: RollValue[], rollOptions: RollOptions): FacetsRollResults {
        const foundCategories = [...new Set(rollValues.map((rollValue) => rollValue.category()))];
        const categoryResults = new Map<string, FacetsRollCategoryResult>();

        for (const foundCategory of foundCategories) {
            categoryResults.set(
                foundCategory.name,
                FacetsRollCategoryResult.fromRollValues(foundCategory, rollValues, rollOptions)
            );
        }

        const total = categoryResults.values().reduce((a, b) => a + b.total, 0);

        return new FacetsRollResults(total, getRollTiers(total), categoryResults);
    }
}

export class FacetsRollCategoryResult {
    constructor(
        readonly category: RollValueCategory,
        readonly total: number,
        readonly diceResult: DiceResult[]
    ) {}

    static fromRollValues(
        category: RollValueCategory,
        rollValues: RollValue[],
        rollOptions: RollOptions
    ): FacetsRollCategoryResult {
        const categoryRollValues = rollValues.filter((rollValue) => rollValue.category() === category);

        const pickedValues = category.pickValues(categoryRollValues, rollOptions);

        const total = pickedValues.reduce((a, b) => a + b.value(), 0);

        const diceResults: DiceResult[] = [];

        for (const rollValue of categoryRollValues) {
            diceResults.push(new DiceResult(
                rollValue.value(),
                rollValue.maxValue(),
                pickedValues.some(pickedValue => pickedValue == rollValue)
            ));
        }

        return new FacetsRollCategoryResult(category, total, diceResults);
    }
}

export class DiceResult {
    constructor(
        readonly value: number,
        readonly facets: number,
        readonly picked: boolean
    ) {}
}
