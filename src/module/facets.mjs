import {FacetsItem} from './documents/item.mjs';
import {FacetsActorSheet} from './sheets/actor-sheet.mjs';
import {FacetsItemSheet} from './sheets/item-sheet.mjs';
import * as models from './data/_module.mjs';
import {FacetsActor} from "./documents/actor.mjs";

Hooks.once('init', function () {
    // Add custom constants for configuration.
    // Define custom Document and DataModel classes
    CONFIG.Actor.documentClass = FacetsActor;

    // Note that you don't need to declare a DataModel
    // for the base actor/item classes - they are included
    // with the Character/NPC as part of super.defineSchema()
    CONFIG.Actor.dataModels = {
        character: models.FacetsCharacter,
        npc: models.FacetsNPC,
    };
    CONFIG.Item.documentClass = FacetsItem;
    CONFIG.Item.dataModels = {
        gear: models.FacetsGear,
        feature: models.FacetsFeature,
        spell: models.FacetsSpell,
    };

    // Active Effects are never copied to the Actor,
    // but will still apply to the Actor from within the Item
    // if the transfer property on the Active Effect is true.
    CONFIG.ActiveEffect.legacyTransferral = false;

    // Register sheet application classes
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('facets', FacetsActorSheet, {
        makeDefault: true,
        label: 'FACETS.SheetLabels.Actor',
    });
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('facets', FacetsItemSheet, {
        makeDefault: true,
        label: 'FACETS.SheetLabels.Item',
    });
});

