import { FacetsBaseActorData, type FacetsActorSchema } from "@data/actor/base";
import type { AnyObject } from "fvtt-types/utils";

type SpotlightCharacterSchema = FacetsActorSchema;

type SpotlightCharacterBaseData = AnyObject;

type SpotlightCharacterDerivedData = AnyObject;

function spotlightCharacterSchema() {
    return {};
}

class SpotlightCharacterData extends FacetsBaseActorData<
    SpotlightCharacterSchema,
    SpotlightCharacterBaseData,
    SpotlightCharacterDerivedData
> {
    static override defineSchema(): SpotlightCharacterSchema {
        return {
            ...super.defineSchema(),
            ...spotlightCharacterSchema()
        };
    }

    override generatesDoom(): boolean {
        return false;
    }
}

export {
    SpotlightCharacterData,
    type SpotlightCharacterBaseData,
    type SpotlightCharacterDerivedData,
    type SpotlightCharacterSchema
};
