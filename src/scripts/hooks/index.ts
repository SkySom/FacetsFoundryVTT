import {Init} from "./init";
import {Load} from "./load";

export const HooksFacets = {
    listen(): void {
        const listeners: { listen(): void }[] = [
            Load,
            Init
        ]

        for (const listener of listeners) {
            listener.listen()
        }
    }
}