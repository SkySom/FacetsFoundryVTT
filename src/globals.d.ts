import { ActorFacets } from "@actor";
import { ItemFacets } from "@item";
import type { ChatCommands } from "commander";
import type { FacetsRoll } from "./module/roll/FacetsRoll";
import type { Quench } from "@ethaks/fvtt-quench";

declare global {
    namespace CONFIG {
        interface Dice {
            FacetsRoll: Document.ImplementationClassFor<"FacetsRoll">;
        }
    }

    interface DocumentClassConfig {
        Actor: typeof ActorFacets;
        Item: typeof ItemFacets;
    }

    interface MessageData {
        user: string;
        speaker: SpeakerData;
    }

    namespace Chai {
        interface AssertStatic {
            equal(actual: any, expected: any, message?: string)
        }
    }
}

declare module "fvtt-types/configuration" {
    namespace Hooks {
        import type { ChatCommands } from "commander";

        interface HookConfig {
            chatCommandsReady(chatCommands: ChatCommands): void;
            quenchReady(quench: Quench): void;
        }
    }
}

declare module "commander" {
    interface ChatCommands {
        register(command: ChatCommand, override: boolean = false): void;
    }

    interface ChatCommand {
        name: string;
        module: String;
        aliases: string[];
        description?: string;
        icon?: string;
        requiredRoles?: string;
        autocompleteCallback?: (
            menu: AutocompleteMenu,
            alias: string,
            parameters: string,
        ) => string[] | HTMLElement[];
        callback: (
            chatLog: ChatLog,
            parameters: string,
            messageData: MessageData,
        ) => object | Promise | null;
        closeOnComplete?: boolean;
    }

    interface AutocompleteMenu {}
}
