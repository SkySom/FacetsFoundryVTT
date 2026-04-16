import { PartyData } from "@data/actor/party";
import { PlayerCharacterData } from "@data/actor/player_character";
import { BackgroundCharacterData, ForegroundCharacterData, SpotlightCharacterData } from "@data/actor";
import { CompanionData } from "@data/actor/companion";
import { RollResultChatData } from "@data/chat";
import {
    BackgroundCharacterActorSheet,
    CompanionActorSheet,
    ForegroundCharacterActorSheet,
    PartyActorSheet,
    PlayerCharacterActorSheet,
    SpotlightCharacterActorSheet
} from "@sheets/actor";
import { preloadHandlebarsTemplates, registerCustomHelpers } from "@util";
import { registerSettings } from "../../module/settings";
import type { Listener } from "./hooks.interface";

export class Init implements Listener {
    listen(): void {
        Hooks.once("init", () => {
            console.log("Facets | Running Init");

            registerCustomHelpers();
            preloadHandlebarsTemplates();

            registerSettings();
        });

        Hooks.once("init", () => {
            this.registerActorSheets();
        });
    }

    registerActorSheets() {
        Object.assign(CONFIG.Actor.dataModels, {
            backgroundCharacter: BackgroundCharacterData,
            companion: CompanionData,
            foregroundCharacter: ForegroundCharacterData,
            party: PartyData,
            playerCharacter: PlayerCharacterData,
            spotlightCharacter: SpotlightCharacterData
        });

        CONFIG.ChatMessage.dataModels = {
            rollResult: RollResultChatData
        };

        foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);

        foundry.documents.collections.Actors.registerSheet("facets", BackgroundCharacterActorSheet, {
            types: ["backgroundCharacter"],
            makeDefault: true,
            label: "FACETS.Sheet.Actor.BackgroundCharacter.Label"
        });

        foundry.documents.collections.Actors.registerSheet("facets", CompanionActorSheet, {
            types: ["companion"],
            makeDefault: true,
            label: "FACETS.Sheet.Actor.Companion.Label"
        });

        foundry.documents.collections.Actors.registerSheet("facets", ForegroundCharacterActorSheet, {
            types: ["foregroundCharacter"],
            makeDefault: true,
            label: "FACETS.Sheet.Actor.ForegroundCharacter.Label"
        });

        foundry.documents.collections.Actors.registerSheet("facets", PlayerCharacterActorSheet, {
            types: ["playerCharacter"],
            makeDefault: true,
            label: "FACETS.Sheet.Actor.PlayerCharacter.Label"
        });

        foundry.documents.collections.Actors.registerSheet("facets", PartyActorSheet, {
            types: ["party"],
            makeDefault: true,
            label: "FACETS.Sheet.Actor.Party.Label"
        });

        foundry.documents.collections.Actors.registerSheet("facets", SpotlightCharacterActorSheet, {
            types: ["spotlightCharacter"],
            makeDefault: true,
            label: "FACETS.Sheet.Actor.SpotlightCharacter.Label"
        });
    }
}
