import { preloadHandlebarsTemplates } from "@util"
import type { Listener } from "./hooks.interface"

export class Init implements Listener {
    listen(): void {
        Hooks.once("init", () => {
            console.log("Facets | Running Init")

            preloadHandlebarsTemplates()
        })
    }
}