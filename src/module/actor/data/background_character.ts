import type { AnyObject } from "fvtt-types/utils";
import { FacetsBaseActorData, type FacetsActorSchema } from "./base";

interface BackgroundCharacterSchema extends FacetsActorSchema {
    plotPoints: foundry.data.fields.NumberField<{ initial: 0 }>;
}

type BackgroundCharacterBaseData = AnyObject;

type BackgroundCharacterDerivedData = AnyObject;

function backgroundCharacterSchema() {
    return {
        plotPoints: new foundry.data.fields.NumberField({
            initial: 0
        })
    };
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

