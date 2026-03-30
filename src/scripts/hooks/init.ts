import { preloadHandlebarsTemplates, registerCustomHelpers } from "@util";
import type { Listener } from "./hooks.interface";
import { PartyActorSheet } from "../../module/sheet/actor/party_sheet";
import { PartyData } from "@actor/data/party";
import { PlayerCharacterData } from "@actor/data/player_character";

export class Init implements Listener {
    listen(): void {
        Hooks.once("init", () => {
            console.log("Facets | Running Init");

            registerCustomHelpers();
            preloadHandlebarsTemplates();

            this.registerActorSheets();
        });
    }

    registerActorSheets() {
        Object.assign(CONFIG.Actor.dataModels, {
            party: PartyData,
            playerCharacter: PlayerCharacterData
        });

        foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);

        foundry.documents.collections.Actors.registerSheet("facets", PartyActorSheet, {
            types: ["party"],
            makeDefault: true,
            label: "FACETS.Sheet.Actor.Party.Label"
        });
    }
}
