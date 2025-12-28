export function registerTemplates(): void {
    const templatePaths = [
        "actors/character/sheet.hbs",

        "actors/item/item-sheet.hbs",
        "actors/item/item-item-sheet.hbs"
    ].map((t) => `systems/facets/templates/${t}`);

    foundry.applications.handlebars.loadTemplates(templatePaths);
}