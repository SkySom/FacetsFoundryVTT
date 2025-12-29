import {Load} from "@scripts/hooks/load.ts";
import {Init} from "@scripts/hooks/init.ts";

export const HooksFacets = {
    listen(): void {
        console.log("Facets | Loading Hooks");
        const listeners: { listen(): void }[] = [
            Load,
            Init
        ]

        for (let listener of listeners) {
            listener.listen()
        }
    }
}