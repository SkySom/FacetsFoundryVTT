import { FacetsRollReader, RollReadFail, RollReadSuccess, type FacetsRollReadResult } from "@roll/facets_roll_reader";
import { FacetsRollResults } from "@roll/facets_roll_result";
import { FacetsRoller } from "@roll/facets_roller";
import { gameSettings, renderHandlebarsTemplate } from "@util";
import type { AutocompleteMenu, ChatCommand, ChatCommands } from "commander";
import { localize } from "../util/localize";
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

async function rollResultMessage(formula: string, result: FacetsRollResults) {
    let content: string = await renderHandlebarsTemplate("roll_result", {
        quote: "A Quote be here",
        formula: formula,
        result: result.toData()
    });

    content = content.replace(/(\n|\r){2,}/g, "").replace(/(\s*<!--)/g, "$1");;

    return {
        content: content
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
