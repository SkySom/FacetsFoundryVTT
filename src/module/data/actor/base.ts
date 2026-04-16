import type { ActorFacets } from "@actor/base";
import type { FacetsRollData, FacetsRollPool } from "@roll/facets_roll_data";

type FacetsActorSchema = foundry.data.fields.DataSchema & ReturnType<typeof createActorSchema>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type FacetsBaseData = {};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type FacetsDerivedData = {};

function createActorSchema() {
    return {
        description: new foundry.data.fields.HTMLField({
            textSearch: true
        }),
        pools: new foundry.data.fields.ArrayField(
            new foundry.data.fields.SchemaField(
                {
                    id: new foundry.data.fields.StringField({
                        required: true,
                        nullable: false
                    }),
                    name: new foundry.data.fields.StringField({
                        label: "FACETS.Fields.Name",
                        required: true,
                        nullable: false
                    }),
                    keptDice: new foundry.data.fields.NumberField({
                        initial: 2,
                        label: "FACETS.Fields.Roll.KeptDice",
                        min: 1,
                        max: 5
                    }),
                    formula: new foundry.data.fields.StringField({
                        blank: false,
                        label: "FACETS.Fields.Roll.Formula",
                        required: true,
                        nullable: false,
                        trim: true
                    }),
                    standard: new foundry.data.fields.BooleanField({
                        required: true,
                        initial: false
                    })
                },
                {
                    required: true,
                    nullable: false
                }
            ),
            {
                initial: [
                    {
                        id: "initiative",
                        name: "Initiative",
                        keptDice: 2,
                        formula: "3d6 +3",
                        standard: true
                    }
                ],
                min: 1
            }
        )
    };
}

class FacetsBaseActorData<
    Schema extends FacetsActorSchema = FacetsActorSchema,
    BaseData extends FacetsBaseData = FacetsBaseData,
    DerivedData extends FacetsDerivedData = FacetsDerivedData
> extends foundry.abstract.TypeDataModel<Schema, ActorFacets, BaseData, DerivedData> {
    static override defineSchema(): FacetsActorSchema {
        return {
            ...createActorSchema()
        };
    }

    generatesDoom(): boolean {
        return false;
    }

    getFacetsRollData(): FacetsRollData<string> {
        return {};
    }

    getFacetsRollPools(): Record<string, FacetsRollPool> {
        const transformedPools = {};
        const poolsData = this.pools;
        for (let i = 0; i < poolsData.length; i++) {
            const poolData = poolsData[i];
            transformedPools[poolData.name.toLocaleLowerCase().replace(" ", "_")] = {
                formula: poolData.formula,
                keptDice: poolData.keptDice
            };
        }
        return transformedPools;
    }
}

export { FacetsBaseActorData };
export type { FacetsActorSchema, FacetsBaseData, FacetsDerivedData };
