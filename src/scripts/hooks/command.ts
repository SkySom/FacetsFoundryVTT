import type {ChatCommands} from "commander"
import {CommandRegister} from "@command";
import type {Listener} from "./hooks.interface";

export class Command implements Listener {
    listen(): void {
        Hooks.on("chatCommandsReady", (commands: ChatCommands) => {
            CommandRegister.register(commands);
        })
    }
}