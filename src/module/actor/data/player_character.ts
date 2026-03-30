import type { AnyObject } from "fvtt-types/utils";
import { FacetsBaseActorData, type FacetsActorSchema } from "./base";

interface PlayerCharacterSchema extends FacetsActorSchema {
    plotPoints: foundry.data.fields.NumberField<{ initial: 0 }>;
}

type PlayerCharacterBaseData = AnyObject;

type PlayerCharacterDerivedData = AnyObject;

function playerCharacterSchema() {
    return {
        plotPoints: new foundry.data.fields.NumberField({
            initial: 0
        })
    };
}

class PlayerCharacterData extends FacetsBaseActorData<
    PlayerCharacterSchema,
    PlayerCharacterBaseData,
    PlayerCharacterDerivedData
> {
    static override defineSchema(): PlayerCharacterSchema {
        return {
            ...super.defineSchema(),
            ...playerCharacterSchema()
        };
    }

    override generatesDoom(): boolean {
        return true;
    }
}

export {
    PlayerCharacterData,
    type PlayerCharacterBaseData,
    type PlayerCharacterDerivedData,
    type PlayerCharacterSchema
};

