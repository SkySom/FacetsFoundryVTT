import { ActorFacets } from "@actor/base";
import { DOOM_AND_PLOT_CONSTANTS } from "../../settings/doom_and_plot_settings";
import { gameSettings, gameUser } from "../../util/game_getters";
import { RemoteCaller } from "../../util/remote_caller";
import { FacetsBaseActorData, type FacetsActorSchema, type FacetsBaseData, type FacetsDerivedData } from "./base";

interface PartyDataSchema extends FacetsActorSchema {
    memberList: foundry.data.fields.SetField<foundry.data.fields.DocumentUUIDField<{ type: "Actor" }>>;
    doom: foundry.data.fields.NumberField<{
        initial: 0;
    }>;
    remoteDoomId: foundry.data.fields.NumberField<{
        initial: -1;
    }>;
    locked: foundry.data.fields.BooleanField<{
        initial: false;
    }>;
}

type PartyBaseData = FacetsBaseData & {
    members: Map<string, PartyMember>;
};

type PartyDerivedData = FacetsDerivedData;

type PartyMember = {
    actor: ActorFacets<"playerCharacter"> | null;
};

function partySchema() {
    return {
        memberList: new foundry.data.fields.SetField(
            new foundry.data.fields.DocumentUUIDField({
                type: "Actor"
            })
        ),
        doom: new foundry.data.fields.NumberField({
            initial: 0
        }),
        remoteDoomId: new foundry.data.fields.NumberField({
            initial: -1
        }),
        locked: new foundry.data.fields.BooleanField({
            initial: false
        })
    };
}

class PartyData extends FacetsBaseActorData<PartyDataSchema, PartyBaseData, PartyDerivedData> {
    static override defineSchema(): PartyDataSchema {
        return {
            ...super.defineSchema(),
            ...partySchema()
        };
    }

    override prepareBaseData(): void {
        super.prepareBaseData();
        this.members = new Map<string, PartyMember>();
        this.memberList.forEach((value) => {
            const result = fromUuidSync<Actor>(value);
            if (result instanceof ActorFacets) {
                this.members.set(result["uuid"] + "", { actor: result });
            }
        });
    }

    async setRemoteDoomId(remoteDoomId: number): Promise<void> {
        return this.parent
            .update({
                system: {
                    remoteDoomId: remoteDoomId
                }
            })
            .then();
    }

    getRemoteDoomId(): number {
        return this.remoteDoomId ?? -1;
    }

    async alterDoom(amount: number, tryOthers: boolean = true): Promise<DoomChange> {
        if (gameSettings().get("facets", "doomAndPlotLocation") == DOOM_AND_PLOT_CONSTANTS.LOCATION.LOCAL) {
            if (this.parent.ownership[gameUser().id ?? ""] == CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
                await this.parent.update({
                    system: {
                        doom: (this.doom ?? 0) + amount
                    }
                });
                return Promise.resolve(new DoomChange(this.doom ?? 0, (this.doom ?? 0) + amount));
            }

            if (tryOthers) {
                if (game.users?.activeGM?.active) {
                    return game.facets.socketManager.sendChangeDoom(this.parent.id, amount);
                }
                for (const ownership in this.parent.ownership) {
                    if (this.parent.ownership[ownership] == CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
                        if (game?.users?.get(ownership)?.active) {
                            return await game.facets.socketManager.sendChangeDoom(this.parent.id, amount, ownership);
                        }
                    }
                }
                return Promise.reject(new Error("No one online can update this party"));
            }

            return Promise.reject(new Error("This user cannot update the party"));
        } else {
            return RemoteCaller.alterDoom(this, amount);
        }
    }
}

class DoomChange {
    constructor(
        readonly old: number,
        readonly current: number
    ) {}
}

export { DoomChange, PartyData, type PartyBaseData, type PartyDataSchema, type PartyDerivedData };

