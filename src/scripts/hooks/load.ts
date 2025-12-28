export class Load {
    static listen(): void {

        CONFIG.FACETS = FACETS;

        /**
         * Set an initiative formula for the system
         * @type {String}
         */
        CONFIG.Combat.initiative = {
            formula: '1d20 + @abilities.dex.mod',
            decimals: 2,
        };

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
    }
}