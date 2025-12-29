import type {ChatCommands} from "chat-commander"
import {CommandRegister} from "@command";

const Command = {
    listen: (): void => {
        Hooks.on("chatCommandsReady", (commands: ChatCommands): void => {
            CommandRegister.register(commands);
        })
    }
}

export {Command}