import type { AnyObject } from "fvtt-types/utils";
import { FacetsBaseActorData, type FacetsActorSchema } from "./base";
import { gameSettings } from "@util";
import { DOOM_AND_PLOT_CONSTANTS } from "../../settings/doom_and_plot_settings";

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

    async setRemoteCharacterId(remoteCharacterId: number): Promise<void> {
        return this.parent.update({
            system: {
                remoteCharacterId: remoteCharacterId
            }
        }).then()
    }

    async alterPlot(alter: number): Promise<PlotChange> {
        if (gameSettings().get("facets", "doomAndPlotLocation") === DOOM_AND_PLOT_CONSTANTS.LOCATION.LOCAL) {
            const original = this.plotPoints ?? 0;
            return this.parent
                .update({
                    system: {
                        plotPoints: original + alter
                    }
                })
                .then(() => new PlotChange(original, original + alter));
        } else {
            return Promise.resolve(new PlotChange(0, 0));
        }
    }
}

class PlotChange {
    constructor(
        readonly old: number,
        readonly current: number
    ) {}
}

export {
    PlayerCharacterData,
    type PlayerCharacterBaseData,
    type PlayerCharacterDerivedData,
    type PlayerCharacterSchema,
    type PlotChange
};
