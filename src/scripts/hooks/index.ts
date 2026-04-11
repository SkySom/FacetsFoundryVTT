import { Command } from "@scripts/hooks/command.ts";
import { Init } from "@scripts/hooks/init.ts";
import { Load } from "@scripts/hooks/load.ts";
import { Logger } from "@util";
import type { Listener } from "./hooks.interface";
import { Quench } from "./quench";
import { Ready } from "./ready";
import { CreateDocument } from "./create_document";

export class HooksFacets implements Listener {
    listen(): void {
        Logger.info("Loading Hooks");
        const listeners: Listener[] = [
            new Load(),
            new Init(),
            new Command(),
            new Quench(),
            new Ready(),
            new CreateDocument()
        ];

        for (const listener of listeners) {
            listener.listen();
        }
    }
}
