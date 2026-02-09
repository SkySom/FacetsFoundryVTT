import type { ChatCommands } from "commander";
import { log } from "../util/logger";
import { registerRollCommands } from "./roll_commands";

class CommandRegister {
    static register(commands: ChatCommands): void {
        log("Registering Commands");

        registerRollCommands(commands);
    }
}

export { CommandRegister };

