import {Load} from "@scripts/hooks/load.ts";
import {Init} from "@scripts/hooks/init.ts";
import {Command} from "@scripts/hooks/command.ts";

export const HooksFacets = {
    listen(): void {
        console.log("Facets | Loading Hooks");
        const listeners: { listen(): void }[] = [
            Load,
            Init,
            Command
        ]

        for (let listener of listeners) {
            listener.listen()
        }
    }
}