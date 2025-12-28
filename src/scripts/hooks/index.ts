import {Load} from "@scripts/hooks/load.ts";
import {Init} from "@scripts/hooks/init.ts";

export const HooksFacets = {
    listen(): void {
        const listeners: { listen(): void }[] = [
            Load,
            Init
        ]

        for (let listener of listeners) {
            listener.listen()
        }
    }
}