import { gameSettings } from "@util";
import type { Listener } from "./hooks.interface";


export class CreateDocument implements Listener {
    listen(): void {
        Hooks.on("createActor", (actor) => {
            if (actor.type === "backgroundCharacter" && gameSettings().get("facets", "backgroundCharacterAutoSetup")) {
                actor.prototypeToken.update({
                    displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
                    prependAdjective: true
                })
            }
        })
    }
    
}