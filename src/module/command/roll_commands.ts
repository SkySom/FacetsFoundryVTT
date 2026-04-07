import { PartyData } from "@actor/data/party";
import { PlayerCharacterData } from "@actor/data/player_character";
import { FacetsRollReader, RollReadFail, RollReadSuccess, type FacetsRollReadResult } from "@roll/facets_roll_reader";
import { FacetsRollResult } from "@roll/facets_roll_result";
import { FacetsRoller } from "@roll/facets_roller";
import { plotPoints, RollResourceResult } from "@roll/roll_resource";
import { gameSettings } from "@util";
import type { AutocompleteMenu, ChatCommand, ChatCommands } from "commander";
import { gameActors, gameUser } from "../util/game_getters";
import { localize } from "../util/localize";
import { Logger } from "../util/logger";
import { Autocomplete } from "./autocomplete/autocomplete_types";
import { getRollAutocomplete } from "./autocomplete/roll_autocomplete";

export function registerRollCommands(commands: ChatCommands) {
    gameSettings().register<Array<string>>("facets", "recentRolls", {
        name: localize("Settings.RecentRolls"),
        scope: "client",
        config: false,
        type: Array<string>,
        default: []
    });

    commands.register(roll2());
}

function roll2(): ChatCommand {
    return {
        name: "/roll2",
        module: "Facets",
        aliases: ["~r", "~r2"],
        icon: "<i class='fas fa-dice-two'></i>",
        description: localize("Commands.Roll2.Description"),
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

                return roller.getResults({ kept: 2 }).then((results) => rollResultMessage(parameters, results));
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

async function rollResultMessage(formula: string, result: FacetsRollResult) {
    const user = gameUser();

    const spentResourceResults: RollResourceResult[] = [];
    for (const spentResource of result.spentResources) {
        if (spentResource.resource === plotPoints) {
            if (user.isActiveGM) {
                const activeParty = gameActors().get(gameSettings().get("facets", "activeParty"));
                if (activeParty.system instanceof PartyData) {
                    spentResourceResults.push(
                        new RollResourceResult(
                            spentResource.resource,
                            spentResource.total,
                            activeParty.system.doom ?? 0,
                            (activeParty.system.doom ?? 0) - spentResource.total,
                            "Doom",
                            "Using " + spentResource.total + " Doom"
                        )
                    );
                } else {
                    Logger.warn("Active Party did not have PartyData");
                }
            } else {
                const activeActor = user.character;
                if (activeActor) {
                    if (activeActor.system instanceof PlayerCharacterData) {
                        spentResourceResults.push(
                            new RollResourceResult(
                                spentResource.resource,
                                spentResource.total,
                                activeActor.system.plotPoints ?? 0,
                                (activeActor.system.plotPoints ?? 0) - spentResource.total,
                                "Plot Points",
                                "Using " + spentResource.total + " Plot Point(s)!"
                            )
                        );
                    }
                }
            }
        }
    }

    return {
        content: "Failed to get rollResult template",
        type: "rollResult",
        system: {
            formula: formula,
            result: JSON.stringify(result.toData())
        }
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
