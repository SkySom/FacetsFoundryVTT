import { gameSettings } from "@util";
import type { ChatCommand, ChatCommands } from "commander";
import { localize } from "../util/localize";
import { log } from "../util/logger";
import { getRollAutocomplete } from "./roll_autocomplete";
import { FacetsRollReader, RollReadSuccess, type FacetsRollReadResult } from "@roll/facets_roll_reader";

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
                    gameSettings().set("facets", "recentRolls", new Array<string>(parameters))
                }
            }
            return null;
        },
        autocompleteCallback: getRollAutocomplete
    };
}

export { CommandRegister };

