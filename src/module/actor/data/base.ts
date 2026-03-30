import type { ActorFacets } from "@actor/base";
import type { FacetsRollData } from "@roll/facets_roll_data";

interface FacetsActorSchema extends foundry.data.fields.DataSchema {
    description: foundry.data.fields.HTMLField<{ textSearch: true }>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type FacetsBaseData = {};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type FacetsDerivedData = {};

class FacetsBaseActorData<
    Schema extends FacetsActorSchema = FacetsActorSchema,
    BaseData extends FacetsBaseData = FacetsBaseData,
    DerivedData extends FacetsDerivedData = FacetsDerivedData
> extends foundry.abstract.TypeDataModel<Schema, ActorFacets, BaseData, DerivedData> {
    static override defineSchema(): FacetsActorSchema {
        return {
            description: new foundry.data.fields.HTMLField({
                textSearch: true
            })
        };
    }

    generatesDoom(): boolean {
        return false;
    }

    getFacetsRollData(): FacetsRollData<string> {
        return {};
    }
}

export { FacetsBaseActorData };
export type { FacetsActorSchema, FacetsBaseData, FacetsDerivedData };
