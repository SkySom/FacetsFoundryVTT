import { gameSettings, renderHandlebarsTemplate } from "@util";
import type { AutocompleteMenu, ChatCommand, ChatCommands } from "commander";
import { localize } from "../util/localize";
import { log } from "../util/logger";
import { getRollAutocomplete } from "./autocomplete/roll_autocomplete";
import { FacetsRollReader, RollReadSuccess, type FacetsRollReadResult } from "@roll/facets_roll_reader";
import { Autocomplete } from "./autocomplete/autocomplete_types";

class CommandRegister {
    static register(commands: ChatCommands): void {
        log("Registering Commands");

        gameSettings().register("facets", "recentRolls", {
            name: localize("Settings.RecentRolls"),
            scope: "world",
            config: false,
            type: Array
        });

        commands.register(roll2());
    }
}

function roll2(): ChatCommand {
    return {
        name: "/roll2",
        module: "Facets",
        aliases: ["~r", "~r2"],
        icon: "<i class='fas fa-dice-two'></i>",
        description: localize("Commands.Roll2.Description"),
        callback: (chatLog: ChatLog, parameters: string, messageData: MessageData) => {
            console.log(`Facets | Roll2 Testing ${parameters}`, chatLog, messageData);
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
            }
            return rollResultMessage(parameters);
        },
        autocompleteCallback: rollAutocompleteCallback()
    };
}

async function rollResultMessage(formula: string) {
    const content: string = await renderHandlebarsTemplate("roll_result", {
        quote: "A Quote be here",
        formula: formula
    });

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

export { CommandRegister };
