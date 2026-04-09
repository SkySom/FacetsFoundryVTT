import { PartyData } from "@actor/data/party";
import { PlayerCharacterData } from "@actor/data/player_character";
import { FacetsRollReader, RollReadFail, RollReadSuccess, type FacetsRollReadResult } from "@roll/facets_roll_reader";
import { FacetsRollResult } from "@roll/facets_roll_result";
import { FacetsRoller } from "@roll/facets_roller";
import { doom, plotPoints, RollResourceResult, RollResourceResultGroup } from "@roll/roll_resource";
import { gameSettings } from "@util";
import type { AutocompleteMenu, ChatCommand, ChatCommands } from "commander";
import { gameActors, gameUser } from "../util/game_getters";
import { format, localize } from "../util/localize";
import { Logger } from "../util/logger";
import { Autocomplete } from "./autocomplete/autocomplete_types";
import { getRollAutocomplete } from "./autocomplete/roll_autocomplete";
import { ActorFacets } from "@actor";

export function registerRollCommands(commands: ChatCommands) {
    gameSettings().register<Array<string>>("facets", "recentRolls", {
        name: localize("Settings.RecentRolls"),
        scope: "client",
        config: false,
        type: Array<string>,
        default: []
    });

    for (let i = 1; i <= 5; i++) {
        commands.register(roll(i));
        commands.register(test(i));
    }
}

function roll(kept: number): ChatCommand {
    const alias = ["~r" + kept];

    if (kept === 2) {
        alias.push("~r");
    }
    return {
        name: "/roll" + kept,
        module: "Facets",
        aliases: alias,
        icon: "<i class='fas fa-dice-two'></i>",
        description: localize("Commands.Roll" + kept + ".Description"),
        callback: (_chatLog: ChatLog, parameters: string) => {
            const rollResult: FacetsRollReadResult = new FacetsRollReader(parameters).evaluate();
            if (rollResult instanceof RollReadSuccess) {
                const recentRolls: string[] = gameSettings().get("facets", "recentRolls");
                if (recentRolls != null) {
                    const existingPosition = recentRolls.indexOf(parameters);
                    if (existingPosition != -1) {
                        recentRolls.splice(existingPosition, 1);
                    }
                    recentRolls.unshift(parameters);
                    gameSettings().set("facets", "recentRolls", recentRolls);
                } else {
                    gameSettings().set("facets", "recentRolls", new Array<string>(parameters));
                }

                const roller = FacetsRoller.fromTokens(rollResult.rollTokens);

                return roller.getResults({ kept: kept }).then((results) => rollResultMessage(parameters, results, false));
            } else if (rollResult instanceof RollReadFail) {
                return ChatMessage.create({
                    content: `Failed to read roll: ${rollResult.error}`
                });
            }
            return ChatMessage.create({
                content: "Failed to get Roll Result"
            });
        },
        autocompleteCallback: rollAutocompleteCallback()
    };
}

function test(kept: number): ChatCommand {
    const alias = ["~t" + kept];

    if (kept === 2) {
        alias.push("~t");
    }
    return {
        name: "/test" + kept,
        module: "Facets",
        aliases: alias,
        icon: "<i class='fas fa-dice-two'></i>",
        description: localize("Commands.Test" + kept + ".Description"),
        callback: (_chatLog: ChatLog, parameters: string) => {
            const rollResult: FacetsRollReadResult = new FacetsRollReader(parameters).evaluate();
            if (rollResult instanceof RollReadSuccess) {
                const recentRolls: string[] = gameSettings().get("facets", "recentRolls");
                if (recentRolls != null) {
                    const existingPosition = recentRolls.indexOf(parameters);
                    if (existingPosition != -1) {
                        recentRolls.splice(existingPosition, 1);
                    }
                    recentRolls.unshift(parameters);
                    gameSettings().set("facets", "recentRolls", recentRolls);
                } else {
                    gameSettings().set("facets", "recentRolls", new Array<string>(parameters));
                }

                const roller = FacetsRoller.fromTokens(rollResult.rollTokens);

                return roller.getResults({ kept: kept }).then((results) => rollResultMessage(parameters, results, true));
            } else if (rollResult instanceof RollReadFail) {
                return ChatMessage.create({
                    content: `Failed to read roll: ${rollResult.error}`
                });
            }
            return ChatMessage.create({
                content: "Failed to get Roll Result"
            });
        },
        autocompleteCallback: rollAutocompleteCallback()
    };
}

async function rollResultMessage(formula: string, result: FacetsRollResult, test: boolean) {
    const resourceResultGroups = await handleResourceSpendAndGain(result, test);

    return {
        content: "Failed to get rollResult template",
        type: "rollResult",
        system: {
            formula: formula,
            total: result.total,
            result: JSON.stringify(result.toData()),
            spentResources: JSON.stringify(resourceResultGroups.spentResources),
            gainedResources: JSON.stringify(resourceResultGroups.gainedResources),
            enhanceable: resourceResultGroups.enhanceable
        }
    };
}

async function handleResourceSpendAndGain(result: FacetsRollResult, test: boolean): Promise<{
    spentResources: RollResourceResultGroup[];
    gainedResources: RollResourceResultGroup[];
    enhanceable: boolean;
}> {
    const user = gameUser();
    const activeParty = gameActors().get(gameSettings().get("facets", "activeParty"));
    const activeActor = user.character;

    const spentResourceResults: RollResourceResultGroup[] = [];

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
        enhanceable: enhanceable
    };
}

function rollAutocompleteCallback(): (
    autocompleteMenu: AutocompleteMenu,
    alias: string,
    parameters: string
) => string[] | HTMLElement[] {
    return convertCallback((alias: string, parameters: string, maxEntries: number) => {
        return getRollAutocomplete(alias, parameters, maxEntries, () => gameSettings().get("facets", "recentRolls"));
    });
}

function convertCallback(
    callback: (alias: string, parameters: string, maxEntries: number) => Autocomplete[]
): (autocompleteMenu: AutocompleteMenu, alias: string, parameters: string) => string[] | HTMLElement[] {
    return (menu, alias, parameters) => {
        const chatCommands = game.chatCommands;
        if (chatCommands == null) {
            return [];
        }
        const autoCompleteArray = callback(alias, parameters, menu.maxEntries);
        const elementArray: HTMLElement[] = [];

        for (const autoComplete of autoCompleteArray) {
            elementArray.push(autoComplete.toHTMLElement(chatCommands));
        }

        return elementArray;
    };
}
