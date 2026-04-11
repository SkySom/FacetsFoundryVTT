import { rollResultMessage } from "@data/chat/roll_result";
import { FacetsRollReader, RollReadFail, RollReadSuccess, type FacetsRollReadResult } from "@roll/facets_roll_reader";
import { FacetsRoller } from "@roll/facets_roller";
import { gameSettings } from "@util";
import type { AutocompleteMenu, ChatCommand, ChatCommands } from "commander";
import { localize } from "../util/localize";
import { Autocomplete } from "./autocomplete/autocomplete_types";
import { getRollAutocomplete } from "./autocomplete/roll_autocomplete";

const numberToWords = ["one", "two", "three", "four", "five", "six"];
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
        icon: "<i class='fas fa-dice-" + numberToWords[kept - 1] + "'></i>",
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

                return roller.getResults({ kept: kept }).then((results) =>
                    foundry.utils.mergeObject(
                        {
                            content: "Failed to handle RollResultChatData"
                        },
                        rollResultMessage(parameters, results, kept, true)
                    )
                );
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
        icon: "<i class='fas fa-dice-" + numberToWords[kept - 1] + "'></i>",
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

                return roller.getResults({ kept: kept }).then((results) =>
                    foundry.utils.mergeObject(
                        {
                            content: "Failed to handle RollResultChatData"
                        },
                        rollResultMessage(parameters, results, kept, true)
                    )
                );
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
