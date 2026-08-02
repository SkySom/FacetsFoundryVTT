import { PlayerCharacterData } from "@data/actor/player_character";
import { Logger } from "@util";
import type { Listener } from "./hooks.interface";

export class ContextMenus implements Listener {
    listen(): void {
        Hooks.on("getUserContextOptions", (_app, contextOptions) => {
            Logger.info("Generating User Context Options");
            contextOptions.unshift({
                //@ts-expect-error label replaces name, but fvtt-types doesn't know it
                label: "Give Plot Point",
                icon: "<i class='fa-solid fa-dice-one'></i>",
                visible: (li: HTMLElement) => {
                    if (game.user?.isActiveGM) {
                        const user = game.users?.get(li.dataset.userId ?? "");
                        if (user) {
                            if (user.character?.system instanceof PlayerCharacterData) {
                                return true;
                            }
                        }
                    }

                    return false;
                },
                callback: async (li: HTMLElement) => {
                    if (game.user?.isActiveGM) {
                        const user = game.users?.get(li.dataset.userId ?? "");
                        if (user?.character?.system instanceof PlayerCharacterData) {
                            return user.character.system.alterPlot(1);
                        }
                    }

                    return Promise.any;
                }
            });
        });
        // @ts-expect-error can't find getActorContextOptions ???
        Hooks.on("getActorContextOptions", (_app, contextOptions: ContextMenu.Entry<HTMLElement>[]) => {
            Logger.info("Generating Actor Context Options");
            contextOptions.unshift({
                //@ts-expect-error label replaces name, but fvtt-types doesn't know it
                label: "Give Plot Point",
                icon: "<i class='fa-solid fa-dice-one'></i>",
                visible: (li: HTMLElement) => {
                    if (game.user?.isActiveGM) {
                        const actor = game.actors?.get(li.dataset.entryId ?? "");
                        if (actor) {
                            if (actor?.system instanceof PlayerCharacterData) {
                                return true;
                            }
                        }
                    }

                    return false;
                },
                callback: async (li: HTMLElement) => {
                    if (game.user?.isActiveGM) {
                        const actor = game.actors?.get(li.dataset.entryId ?? "");
                        if (actor.system instanceof PlayerCharacterData) {
                            return actor.system.alterPlot(1);
                        }
                    }

                    return Promise.any;
                }
            });
        });
    }
}
