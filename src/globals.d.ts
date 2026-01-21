import {ActorFacets} from "@actor";
import {ItemFacets} from "@item";
import type {ChatCommands} from "commander";

declare global {
    interface CONFIG {

    }

    interface DocumentClassConfig {
        Actor: typeof ActorFacets;
        Item: typeof ItemFacets;
    }

    interface MessageData {
        user: string;
        speaker: SpeakerData
    }
}

declare module "fvtt-types/configuration" {
  namespace Hooks {
    import type { ChatCommands } from "commander";

    interface HookConfig {
      chatCommandsReady(chatCommands: ChatCommands): void;
    }
  }
}

declare module 'commander' {
    interface ChatCommands {
        register(command: ChatCommand, override: boolean = false): void
    }

    interface ChatCommand {
        name: string,
        module: String,
        aliases: string[],
        description?: string,
        icon?: string,
        requiredRoles?: string,
        callback: (chatLog: ChatLog, parameters: string, messageData: MessageData) => object | Promise | null,
        closeOnComplete?: boolean
    }
}
