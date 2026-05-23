import { RollResultChatData } from "@data/chat";
import type { Listener } from "./hooks.interface";
import { doom } from "@roll/roll_resource";
import { gameActors } from "../../module/util/game_getters";
import { PartyData } from "@data/actor/party";
import type { ActorFacets } from "@actor";

export class PlayerJoin implements Listener {
    listen(): void {
        Hooks.on("userConnected", async (user: User.Implementation, connected: boolean) => {
            if (game.messages && connected && user.isActiveGM) {
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

                const pulledParties = new Map<string, ActorFacets<"party">>();
                const tokenToParty = new Map<string, string>();

                for (const message of game.messages) {
                    if (message.timestamp < oneMonthAgo.getMilliseconds()) {
                        break;
                    }

                    if (message.system instanceof RollResultChatData) {
                        const rollResult: RollResultChatData = message.system;

                        for (const spentResourceGroup of rollResult.spentResources) {
                            for (const spentResource of spentResourceGroup.resources) {
                                if (!spentResource.applied && spentResource.resource == doom) {
                                    if (message.speakerActor && message.speakerActor.id) {
                                        let partyId = tokenToParty.get(message.speakerActor.id);
                                        if (!partyId) {
                                            const foundParty = gameActors()
                                                .values()
                                                .find((actor) => {
                                                    if (actor.system instanceof PartyData) {
                                                        if (actor.system.members[message.speakerActor?.uuid ?? ""]) {
                                                            return true;
                                                        }
                                                    }
                                                    return false;
                                                });

                                            if (foundParty) {
                                                tokenToParty.set(message.speakerActor.id, foundParty.id)
                                                partyId = foundParty.id
                                            } else {
                                                tokenToParty.set(message.speakerActor.id, "na")
                                                partyId = "na"
                                            }
                                        }

                                        if (partyId && partyId != "na") {
                                            let partyActor = pulledParties.get(partyId);
                                            if (!partyActor) {
                                                partyActor = gameActors().get(partyId) as ActorFacets<"party">;
                                                pulledParties.set(partyId, partyActor)
                                            }

                                            if (partyActor) {
                                                partyActor.update({
                                                    "system": {
                                                        "doom": (partyActor.system.doom ?? 0) + (spentResource.total ?? 0)
                                                    }
                                                })

                                                spentResource.applied = true;

                                                message.update({
                                                    "system": {
                                                        "spentResources": rollResult.spentResources
                                                    }
                                                })
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
}
