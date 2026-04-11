import type { AnyObject } from "fvtt-types/utils";
import { localize } from "../util/localize";
import type { RollOptions } from "./roll_options";
import { createRollResourceCostSchema, doom, plotPoints, RollResourceCost } from "./roll_resource";
import { createTierResultSchema, getRollTiers, type TierResult } from "./tier";
import { RollValue } from "./value/roll_value";
import type { RollValueCategory } from "./value/roll_value_category";

export class FacetsRollResult {
    constructor(
        readonly total: number,
        readonly tiers: TierResult,
        readonly categories: FacetsRollCategoryResult[],
        readonly spentResources: RollResourceCost[] = [],
        readonly gainedResources: RollResourceCost[] = []
    ) {}

    toSchema(): AnyObject {
        return {
            total: this.total,
            tiers: this.tiers.toSchema(),
            categoryResults: this.categories.map((category) => category.toSchema()),
            spentResources: this.spentResources.map((resource) => resource.toSchema()),
            gainedResources: this.gainedResources.map((resource) => resource.toSchema())
        };
    }

    static fromRollValues(rollValues: RollValue[], rollOptions: RollOptions): FacetsRollResult {
        const foundCategories = [...new Set(rollValues.map((rollValue) => rollValue.category()))];
        const categoryResults: FacetsRollCategoryResult[] = [];

        for (const foundCategory of foundCategories) {
            categoryResults.push(FacetsRollCategoryResult.fromRollValues(foundCategory, rollValues, rollOptions));
        }

        const spentResources = new Map<string, RollResourceCost>();

        for (const rollValue of rollValues) {
            for (const rollCost of rollValue.rollCost()) {
                const existingCost = spentResources.get(rollCost.resource);
                if (existingCost) {
                    spentResources.set(existingCost.resource, existingCost.withAdditional(rollCost.total));
                } else {
                    spentResources.set(rollCost.resource, rollCost);
                }
            }
        }

        const onesCount = rollValues.filter((rollValue) => rollValue.value() === 1).length;

        const gainedResources =
            onesCount > 0 ? [new RollResourceCost(doom, onesCount), new RollResourceCost(plotPoints, 1)] : [];

        const total = categoryResults.values().reduce((a, b) => a + b.total, 0);

        return new FacetsRollResult(
            total,
            getRollTiers(total),
            categoryResults.sort((a, b) => a.category.priority - b.category.priority),
            [...spentResources.values()],
            gainedResources
        );
    }
}

export function createRollResultSchema() {
    return {

        total: new foundry.data.fields.NumberField({
            initial: 0,
            integer: true,
            label: "FACETS.Fields.Total",
            nullable: false
        }),
        tiers: new foundry.data.fields.SchemaField(createTierResultSchema(), {
            label: "FACETS.Fields.RollResult.Tiers"
        }),
        categoryResults: new foundry.data.fields.ArrayField(
            new foundry.data.fields.SchemaField(createCategoryResultSchema()),
            {
                label: "FACETS.Fields.RollResult.CategoryResults"
            }
        ),
        spentResources: new foundry.data.fields.ArrayField(
            new foundry.data.fields.SchemaField(createRollResourceCostSchema()),
            {
                label: "FACETS.Fields.SpentResources"
            }
        ),
        gainedResources: new foundry.data.fields.ArrayField(
            new foundry.data.fields.SchemaField(createRollResourceCostSchema()),
            {
                label: "FACETS.Fields.GainedResources"
            }
        )
    };
}

export function createCategoryResultSchema() {
    return {
        name: new foundry.data.fields.StringField({
            label: "FACETS.Fields.Name",
            nullable: false
        }),
        category: new foundry.data.fields.StringField({
            label: "FACETS.Fields.CategoryResult.Category",
            nullable: false
        }),
        total: new foundry.data.fields.NumberField({
            initial: 0,
            integer: true,
            label: "FACETS.Fields.Total",
            nullable: false
        }),
        formula: new foundry.data.fields.StringField({
            label: "FACETS.Fields.Formula",
            nullable: false
        }),
        diceResults: new foundry.data.fields.ArrayField(new foundry.data.fields.SchemaField(createDiceResultSchema()), {
            label: "FACETS.Fields.CategoryResult.DiceResults"
        })
    };
}

export function createDiceResultSchema() {
    return {
        value: new foundry.data.fields.NumberField({
            initial: 0,
            integer: true,
            label: "FACETS.Fields.Value",
            nullable: false
        }),
        facets: new foundry.data.fields.NumberField({
            initial: 0,
            integer: true,
            label: "FACETS.Fields.DiceResult.Facets",
            nullable: false
        }),
        picked: new foundry.data.fields.BooleanField({
            initial: false,
            label: "FACETS.Fields.DiceResult.Picked",
            nullable: false
        })
    };
}

export class FacetsRollCategoryResult {
    readonly name: string;

    constructor(
        readonly category: RollValueCategory,
        readonly total: number,
        readonly formula: string,
        readonly diceResults: DiceResult[]
    ) {
        this.name = localize(`Roll.Pools.${this.category.name}`);
    }

    static fromRollValues(
        category: RollValueCategory,
        rollValues: RollValue[],
        rollOptions: RollOptions
    ): FacetsRollCategoryResult {
        const categoryRollValues = rollValues.filter((rollValue) => rollValue.category() === category);

        const pickedValues = category.pickValues(categoryRollValues, rollOptions);

        const total = pickedValues.reduce((a, b) => a + b.value(), 0);

        const diceResults: DiceResult[] = [];
        const formula: string[] = [];
        for (const rollValue of categoryRollValues) {
            formula.push(rollValue.toFormula());
            diceResults.push(
                new DiceResult(
                    rollValue.value(),
                    rollValue.maxValue(),
                    pickedValues.some((pickedValue) => pickedValue == rollValue)
                )
            );
        }

        return new FacetsRollCategoryResult(category, total, formula.join(" "), diceResults);
    }

    toSchema() {
        return {
            name: this.name,
            category: this.category.name,
            total: this.total,
            formula: this.formula,
            diceResults: this.diceResults.map((diceResult) => diceResult.toSchema())
        };
    }
}

export class DiceResult {
    constructor(
        readonly value: number,
        readonly facets: number,
        readonly picked: boolean
    ) {}

    toSchema() {
        return {
            value: this.value,
            facets: this.facets,
            picked: this.picked
        };
    }
}
