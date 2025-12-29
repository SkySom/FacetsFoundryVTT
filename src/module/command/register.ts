import type {ChatCommand, ChatCommands} from "chat-commander";

class CommandRegister {
    static register(commands: ChatCommands): void {
        console.log("Facets | Registering Commands")

        commands.register(roll2);
    }
}

const roll2: ChatCommand = {
    name: "/roll2",
    module: "Facets",
    aliases: ["~r", "~r2"],
    description: "Roll and keep the 2 Highest Dice",
    callback: (chatLog: ChatLog, parameters: string, messageData: MessageData) => {
        console.log(`Facets | Roll2 Testing ${parameters}`, chatLog, messageData);
        return null;
    }
}

export {CommandRegister}