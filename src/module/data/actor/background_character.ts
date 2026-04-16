import type { AnyObject } from "fvtt-types/utils";
import { FacetsBaseActorData, type FacetsActorSchema } from "../../actor/data/base";

type BackgroundCharacterSchema = FacetsActorSchema;

type BackgroundCharacterBaseData = AnyObject;

type BackgroundCharacterDerivedData = AnyObject;

function backgroundCharacterSchema() {
    return {};
}

class BackgroundCharacterData extends FacetsBaseActorData<
    BackgroundCharacterSchema,
    BackgroundCharacterBaseData,
    BackgroundCharacterDerivedData
> {
    static override defineSchema(): BackgroundCharacterSchema {
        return {
            ...super.defineSchema(),
            ...backgroundCharacterSchema()
        };
    }

    override generatesDoom(): boolean {
        return false;
    }
}

export {
    BackgroundCharacterData,
    type BackgroundCharacterBaseData,
    type BackgroundCharacterDerivedData,
    type BackgroundCharacterSchema
};
