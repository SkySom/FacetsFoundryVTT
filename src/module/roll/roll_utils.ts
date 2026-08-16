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
                                    localize("Sheet.Generic.Doom"),
                                    true
                                )
                            ]
                        )
                    );
                    actorResourceChanges.push(
                        new ActorResourceChange(activeParty.uuid, doom, -spentResource.total, true)
                    );
                    await activeParty.system.alterDoom(-spentResource.total);
                } else {
                    Logger.warn("Active Party did not have PartyData");
                }
            } else {
                if (activeActor) {
                    if (activeActor.system instanceof PlayerCharacterData) {
                        try {
                            await activeActor.system.alterPlot(-spentResource.total);
                            spentResourceResults.push(
                                new RollResourceResultGroup(
                                    format("Roll.UsingPlot", { Plot: spentResource.total.toString() }),
                                    [
                                        new RollResourceResult(
                                            spentResource.resource,
                                            spentResource.total,
                                            activeActor.system.plotPoints ?? 0,
                                            (activeActor.system.plotPoints ?? 0) - spentResource.total,
                                            localize("Sheet.Generic.PlotPoints"),
                                            true
                                        )
                                    ]
                                )
                            );
                            actorResourceChanges.push(
                                new ActorResourceChange(activeActor.uuid, plotPoints, -spentResource.total, true)
                            );
                        } catch (error) {
                            actorResourceChanges.push(
                                new ActorResourceChange(activeActor.uuid, plotPoints, -spentResource.total, false)
                            );
                            Logger.error("Failed to update plot: " + error, { toast: true });
                        }
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
                const startingDoom = actorParty.system.doom ?? 0;
                try {
                    await actorParty.system.alterDoom(gainedResource.total);
                    doomResourceResult = new RollResourceResult(
                        gainedResource.resource,
                        gainedResource.total,
                        startingDoom,
                        startingDoom + gainedResource.total,
                        localize("Sheet.Generic.Doom"),
                        true
                    );
                    actorResourceChanges.push(
                        new ActorResourceChange(actorParty.uuid, doom, gainedResource.total, true)
                    );
                } catch (error) {
                    doomResourceResult = new RollResourceResult(
                        gainedResource.resource,
                        gainedResource.total,
                        0,
                        0,
                        localize("Roll.Doom.Error"),
                        false
                    );
                    Logger.error("Failed to update doom: " + error, { toast: true });
                }
            } else if (gainedResource.resource === plotPoints) {
                if (activeActor.system instanceof PlayerCharacterData) {
                    try {
                        await activeActor.system.alterPlot(gainedResource.total);
                        plotPointResourceResult = new RollResourceResult(
                            gainedResource.resource,
                            gainedResource.total,
                            activeActor.system.plotPoints ?? 0,
                            (activeActor.system.plotPoints ?? 0) + gainedResource.total,
                            localize("Sheet.Generic.PlotPoints"),
                            true
                        );
                        actorResourceChanges.push(
                            new ActorResourceChange(activeActor.uuid, plotPoints, gainedResource.total, true)
                        );
                    } catch (error) {
                        plotPointResourceResult = new RollResourceResult(
                            gainedResource.resource,
                            gainedResource.total,
                            activeActor.system.plotPoints ?? 0,
                            (activeActor.system.plotPoints ?? 0) + gainedResource.total,
                            localize("Roll.Plot.Error"),
                            false
                        );
                        actorResourceChanges.push(
                            new ActorResourceChange(activeActor.uuid, plotPoints, gainedResource.total, false)
                        );
                        Logger.error("Failed to update plot: " + error, { toast: true });
                    }
                }
            }
        }
    }

    const resourceResults: RollResourceResult[] = [];
    if (plotPointResourceResult) {
        resourceResults.push(plotPointResourceResult);
    }
    if (doomResourceResult) {
        resourceResults.push(doomResourceResult);
    }
    if (resourceResults.length > 0) {
        gainedResources.push(new RollResourceResultGroup(localize("Roll.Opportunity"), resourceResults));
    }

    return {
        spentResources: spentResourceResults,
        gainedResources: gainedResources,
        enhanceable: enhanceable,
        actorResourceChanges: actorResourceChanges
    };
}
