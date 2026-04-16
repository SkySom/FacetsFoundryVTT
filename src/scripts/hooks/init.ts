import { PartyData } from "@actor/data/party";
import { PlayerCharacterData } from "@actor/data/player_character";
import { RollResultChatData } from "@data/chat";
import { preloadHandlebarsTemplates, registerCustomHelpers } from "@util";
import { registerSettings } from "../../module/settings";
import type { Listener } from "./hooks.interface";
import { BackgroundCharacterData, ForegroundCharacterData, SpotlightCharacterData } from "@data/actor";
import {
    BackgroundCharacterActorSheet,
    ForegroundCharacterActorSheet,
    PartyActorSheet,
    PlayerCharacterActorSheet,
    SpotlightCharacterActorSheet
} from "@sheets/actor";

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
            foregroundCharacter: ForegroundCharacterData,
            party: PartyData,
            playerCharacter: PlayerCharacterData,
            spotlightCharacterData: SpotlightCharacterData
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
