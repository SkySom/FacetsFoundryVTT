import type { ChatCommand, ChatCommands } from "commander";
import { localize } from "../util/localize";

class CommandRegister {
    static register(commands: ChatCommands): void {
        console.log("Facets | Registering Commands");

        commands.register(roll2());
    }
}

function roll2(): ChatCommand {
    return {
        name: "/roll2",
        module: "Facets",
        aliases: ["~r", "~r2"],
        description: localize("Commands.Roll2.Description"),
        callback: (chatLog: ChatLog, parameters: string, messageData: MessageData) => {
            console.log(`Facets | Roll2 Testing ${parameters}`, chatLog, messageData);
            return null;
        }
    };
}

export { CommandRegister };
