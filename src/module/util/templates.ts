import type { AnyObject } from "fvtt-types/utils";

const templatePaths: Record<string, string> = {
    "facets.roll_result": "systems/facets/templates/chat/roll_result.hbs"
};

export function preloadHandlebarsTemplates() {
    return foundry.applications.handlebars.loadTemplates(templatePaths);
}

export async function renderHandlebarsTemplate(key: string, data: AnyObject) {
    const template = templatePaths[`facets.${key}`]

    try {
        const content = renderTemplate(template, data)
        return content;
    } catch (error) {
        console.log(error);
    }

    return "";
}