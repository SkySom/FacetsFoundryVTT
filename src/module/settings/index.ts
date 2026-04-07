import { gameSettings } from "@util";

export function registerSettings() {
    gameSettings().register("facets", "createdFirstParty", {
        name: "Created First Party", // Doesn't appear in any UI
        scope: "world",
        config: false,
        type: new foundry.data.fields.BooleanField()
    });

    gameSettings().register("facets", "activeParty", {
        name: "Active Party",
        scope: "world",
        config: false,
        type: String
        /* TODO: After ActorDirectory setup
        onChange: () => {
            ui?.actors?.render({ parts: ["parties"] });
        }
        */
    });
}
