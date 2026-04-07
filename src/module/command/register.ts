import type { ChatCommands } from "commander";
import { registerRollCommands } from "./roll_commands";
import { Logger } from "@util";

class CommandRegister {
    static register(commands: ChatCommands): void {
        Logger.info("Registering Commands");

        registerRollCommands(commands);
    }
}

export { CommandRegister };

