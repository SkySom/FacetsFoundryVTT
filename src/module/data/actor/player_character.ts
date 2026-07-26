import type { AnyObject } from "fvtt-types/utils";
import { FacetsBaseActorData, type FacetsActorSchema } from "./base";
import { Logger } from "@util";

type PlayerCharacterSchema = FacetsActorSchema & ReturnType<typeof playerCharacterSchema>;

type PlayerCharacterBaseData = AnyObject;

type PlayerCharacterDerivedData = AnyObject;

function playerCharacterSchema() {
    return {
        plotPoints: new foundry.data.fields.NumberField({
            initial: 0
        }),
        remoteCharacterId: new foundry.data.fields.NumberField({
            initial: -1
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

    async alterPlotPoints(amount: number): Promise<void> {
        Logger.info("Adding Plot Points");
        this.plotPoints = (this.plotPoints ?? 0) + amount
        return Promise.resolve()
    }
}

export {
    PlayerCharacterData,
    type PlayerCharacterBaseData,
    type PlayerCharacterDerivedData,
    type PlayerCharacterSchema
};

