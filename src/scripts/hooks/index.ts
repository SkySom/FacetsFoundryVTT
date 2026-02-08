import {Load} from "@scripts/hooks/load.ts";
import {Init} from "@scripts/hooks/init.ts";
import {Command} from "@scripts/hooks/command.ts";
import type {Listener} from "./hooks.interface";
import { Quench } from "./quench";

export class HooksFacets implements Listener {
    listen(): void {
        console.log("Facets | Loading Hooks");
        const listeners: Listener[] = [
            new Load,
            new Init,
            new Command,
            new Quench
        ]

        for (const listener of listeners) {
            listener.listen()
        }
    }
}