import { FacetsBaseActorData, type FacetsActorSchema } from "@data/actor/base";
import type { AnyObject } from "fvtt-types/utils";

type ForegroundCharacterSchema = FacetsActorSchema;

type ForegroundCharacterBaseData = AnyObject;

type ForegroundCharacterDerivedData = AnyObject;

function foregroundCharacterSchema() {
    return {};
}

class ForegroundCharacterData extends FacetsBaseActorData<
    ForegroundCharacterSchema,
    ForegroundCharacterBaseData,
    ForegroundCharacterDerivedData
> {
    static override defineSchema(): ForegroundCharacterSchema {
        return {
            ...super.defineSchema(),
            ...foregroundCharacterSchema()
        };
    }

    override generatesDoom(): boolean {
        return false;
    }
}

export {
    ForegroundCharacterData,
    type ForegroundCharacterBaseData,
    type ForegroundCharacterDerivedData,
    type ForegroundCharacterSchema
};
