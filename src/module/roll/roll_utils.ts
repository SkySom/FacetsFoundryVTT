import { ActorFacets } from "@actor";
import { PartyData } from "@data/actor/party";
import { PlayerCharacterData } from "@data/actor/player_character";
import { gameSettings, localize, Logger } from "@util";
import { gameActors, gameUser } from "../util/game_getters";
import { format } from "../util/localize";
import type { FacetsRollResult } from "./facets_roll_result";
import { ActorResourceChange, doom, plotPoints, RollResourceResult, RollResourceResultGroup } from "./roll_resource";

export async function handleResourceSpendAndGain(
    result: FacetsRollResult,
    test: boolean
): Promise<{
    spentResources: RollResourceResultGroup[];
    gainedResources: RollResourceResultGroup[];
    enhanceable: boolean;
    actorResourceChanges: ActorResourceChange[];
}> {
    const user = gameUser();
    const activeParty = gameActors().get(gameSettings().get("facets", "activeParty"));
    const activeActor = user.character;

    const spentResourceResults: RollResourceResultGroup[] = [];
    const actorResourceChanges: ActorResourceChange[] = [];

    let enhanceable = true;

    for (const spentResource of result.spentResources) {
        if (spentResource.resource === plotPoints) {
            enhanceable = false;
            if (user.isActiveGM) {
                if (activeParty.system instanceof PartyData) {
                    spentResourceResults.push(
                        new RollResourceResultGroup(
                            format("Roll.UsingDoom", { Doom: spentResource.total.toString() }),
                            [
                                new RollResourceResult(
                                    spentResource.resource,
                                    spentResource.total,
                                    activeParty.system.doom ?? 0,
                                    (activeParty.system.doom ?? 0) - spentResource.total,
                                    localize("Sheet.Generic.Doom")
                                )
                            ]
                        )
                    );
                    actorResourceChanges.push(new ActorResourceChange(activeParty.uuid, doom, -spentResource.total));
                    await activeParty.update({
                        //@ts-expect-error update types
                        "system.doom": (activeParty.system.doom ?? 0) - spentResource.total
                    });
                } else {
                    Logger.warn("Active Party did not have PartyData");
                }
            } else {
                if (activeActor) {
                    if (activeActor.system instanceof PlayerCharacterData) {
                        spentResourceResults.push(
                            new RollResourceResultGroup(
                                format("Roll.UsingPlot", { Plot: spentResource.total.toString() }),
                                [
                                    new RollResourceResult(
                                        spentResource.resource,
                                        spentResource.total,
                                        activeActor.system.plotPoints ?? 0,
                                        (activeActor.system.plotPoints ?? 0) - spentResource.total,
                                        localize("Sheet.Generic.PlotPoints")
                                    )
                                ]
                            )
                        );
                        actorResourceChanges.push(
                            new ActorResourceChange(activeActor.uuid, plotPoints, -spentResource.total)
                        );
                        await activeActor.update({
                            //@ts-expect-error update types
                            "system.plotPoints": (activeActor.system.plotPoints ?? 0) - spentResource.total
                        });
                    }
                }
            }
        }
    }

    let doomResourceResult: RollResourceResult | null = null;
    let plotPointResourceResult: RollResourceResult | null = null;
    const gainedResources: RollResourceResultGroup[] = [];

    let actorParty = activeParty as ActorFacets<"party">;

    if (activeActor) {
        const foundParty = gameActors()
            .values()
            .find((actor) => {
                if (actor.system instanceof PartyData) {
                    if (actor.system.members[activeActor.uuid]) {
                        return true;
                    }
                }
                return false;
            });

        if (foundParty instanceof ActorFacets && foundParty.system instanceof PartyData) {
            actorParty = foundParty as ActorFacets<"party">;
        }
    }

    if (!test && !user.isActiveGM && activeActor) {
        for (const gainedResource of result.gainedResources) {
            if (gainedResource.resource === doom) {
                doomResourceResult = new RollResourceResult(
                    gainedResource.resource,
                    gainedResource.total,
                    actorParty.system.doom ?? 0,
                    (actorParty.system.doom ?? 0) + gainedResource.total,
                    localize("Sheet.Generic.Doom")
                );
                actorResourceChanges.push(new ActorResourceChange(actorParty.uuid, doom, gainedResource.total));
                await actorParty.update({
                    //@ts-expect-error update types
                    "system.doom": (actorParty.system.doom ?? 0) + gainedResource.total
                });
            } else if (gainedResource.resource === plotPoints) {
                if (activeActor.system instanceof PlayerCharacterData) {
                    plotPointResourceResult = new RollResourceResult(
                        gainedResource.resource,
                        gainedResource.total,
                        activeActor.system.plotPoints ?? 0,
                        (activeActor.system.plotPoints ?? 0) + gainedResource.total,
                        localize("Sheet.Generic.PlotPoints")
                    );
                    actorResourceChanges.push(
                        new ActorResourceChange(activeActor.uuid, plotPoints, gainedResource.total)
                    );
                    await activeActor.update({
                        //@ts-expect-error update types
                        "system.plotPoints": (activeActor.system.plotPoints ?? 0) + gainedResource.total
                    });
                }
            }
        }
    }

    if (doomResourceResult && plotPointResourceResult) {
        gainedResources.push(
            new RollResourceResultGroup(localize("Roll.Opportunity"), [plotPointResourceResult, doomResourceResult])
        );
    }

    return {
        spentResources: spentResourceResults,
        gainedResources: gainedResources,
        enhanceable: enhanceable,
        actorResourceChanges: actorResourceChanges
    };
}
