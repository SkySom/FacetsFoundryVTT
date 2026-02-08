import { FacetsRollReader, RollReadSuggest, type FacetsRollReadResult } from "@roll/facets_roll_reader";
import { gameSettings } from "@util";
import type { AutocompleteMenu, ChatCommands } from "commander";
import { localize } from "../util/localize";

export function getRollAutocomplete(menu: AutocompleteMenu, alias: string, parameters: string): HTMLElement[] {
    const commands: ChatCommands = game.chatCommands;
    if (!commands) {
        return [];
    }

    const rollSettings: string[] | null = gameSettings().get("facets", "recentRolls");

    let recentRolls: HTMLElement[];
    if (rollSettings != null) {
        recentRolls = rollSettings
            .slice()
            .filter((roll) => roll.includes(parameters))
            .map((r) => commands.createCommandElement(alias + " " + r, r));
    } else {
        recentRolls = [];
        gameSettings().set("facets", "recentRolls", new Array<string>());
    }

    const rollAutocompletes: HTMLElement[] = [];
    if (menu.maxEntries > 5) {
        rollAutocompletes.push(commands.createInfoElement(localize("Commands.RollInfo.Basic")));
        rollAutocompletes.push(commands.createInfoElement(localize("Commands.RollInfo.DiceTypes")));
        if (recentRolls.length) {
            rollAutocompletes.push(
                commands.createInfoElement(`<hr><p class="notes">${localize("Commands.RollInfo.Recent")}</p>`)
            );
        }
    }

    for (let i = 0; i < recentRolls.length && rollAutocompletes.length < menu.maxEntries; i++) {
        rollAutocompletes.push(recentRolls[i]);
    }

    if (rollAutocompletes.length < menu.maxEntries) {
        const rollReader = new FacetsRollReader(parameters);
        const rollRead: FacetsRollReadResult = rollReader.evaluate(true);

        if (rollRead instanceof RollReadSuggest) {
            if (rollAutocompletes.length > 0 || menu.maxEntries > 5) {
                rollAutocompletes.push(
                    commands.createInfoElement(`<hr><p class="notes">${localize("Commands.RollInfo.Suggestion")}</p>`)
                );
            }
            for (const suggestion of rollRead.suggestions) {
                if (rollAutocompletes.length < menu.maxEntries) {
                    rollAutocompletes.push(commands.createCommandElement(alias + " " + suggestion, suggestion));
                }
            }
        }
    }

    return rollAutocompletes;
}
