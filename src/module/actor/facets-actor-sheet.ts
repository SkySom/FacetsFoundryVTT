export class FacetsActorSheet extends foundry.appv1.sheets.ActorSheet {

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['facets', 'sheet', 'actor'],
            width: 600,
            height: 600,
            tabs: [
                {
                    navSelector: '.sheet-tabs',
                    contentSelector: '.sheet-body',
                    initial: 'features',
                },
            ],
        });
    }

    /** @override */
    get template(): string {
        return `systems/facets/templates/actor/${this.actor.type}/sheet.hbs`;
    }
}