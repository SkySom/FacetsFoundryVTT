import { PartyData } from "@actor/data/party";
import { PlayerCharacterData } from "@actor/data/player_character";
import { chatDataConfig } from "@data/chat";
import { preloadHandlebarsTemplates, registerCustomHelpers } from "@util";
import { registerSettings } from "../../module/settings";
import { PartyActorSheet } from "../../module/sheet/actor/party_sheet";
import { PlayerCharacterActorSheet } from "../../module/sheet/actor/player_character_sheet";
import type { Listener } from "./hooks.interface";
import { BackgroundCharacterData } from "@actor/data/background_character";

export class Init implements Listener {
    listen(): void {
        Hooks.once("init", () => {
            console.log("Facets | Running Init");

            registerCustomHelpers();
            preloadHandlebarsTemplates();

            registerSettings();

            this.registerActorSheets();
        });
    }

    registerActorSheets() {
        Object.assign(CONFIG.Actor.dataModels, {
            backgroundCharacter: BackgroundCharacterData,
            party: PartyData,
            playerCharacter: PlayerCharacterData
        });

        CONFIG.ChatMessage.dataModels = chatDataConfig;

        foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);

        foundry.documents.collections.Actors.registerSheet("facets", PartyActorSheet, {
            types: ["party"],
            makeDefault: true,
            label: "FACETS.Sheet.Actor.Party.Label"
        });

        foundry.documents.collections.Actors.registerSheet("facets", PlayerCharacterActorSheet, {
            types: ["playerCharacter"],
            makeDefault: true,
            label: "FACETS.Sheet.Actor.PlayerCharacter.Label"
        });
    }
}
