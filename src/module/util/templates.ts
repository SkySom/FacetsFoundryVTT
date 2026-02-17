import type { AnyObject } from "fvtt-types/utils";

const templatePaths: Record<string, string> = {
    "facets.roll_result_flat": "systems/facets/templates/chat/roll_result_flat.hbs",
    "facets.roll_result_dice": "systems/facets/templates/chat/roll_result_dice.hbs",
    "facets.roll_result_pools": "systems/facets/templates/chat/roll_result_pools.hbs",
    "facets.roll_result": "systems/facets/templates/chat/roll_result.hbs"
};

export function preloadHandlebarsTemplates() {
    return foundry.applications.handlebars.loadTemplates(templatePaths);
}

export async function renderHandlebarsTemplate(key: string, data: AnyObject, replaceSpace: boolean = true) {
    const template = templatePaths[`facets.${key}`];

    if (template == null) {
        return `<div>No template for facets.${key}</div>`;
    }
    try {
        let content = await foundry.applications.handlebars.renderTemplate(template, data);
        if (replaceSpace) {
            content = content.replace(/(\n|\r){2,}/g, "").replace(/(\s*<!--)/g, "$1");
        }
        return content;
    } catch (error) {
        console.log(error);
        return `<div>${error}</div>`;
    }
}
