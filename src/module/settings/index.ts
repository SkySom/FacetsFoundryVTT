import { gameSettings } from "@util";
import DoomAndPlotConfigurator from "../apps/doom_and_plot_configurator";
import { DOOM_AND_PLOT_CONSTANTS } from "./doom_and_plot_settings";

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

    gameSettings().register("facets", "backgroundCharacterAutoSetup", {
        name: "Setup Background Character Tokens", // Doesn't appear in any UI
        scope: "world",
        config: true,
        type: new foundry.data.fields.BooleanField({
            initial: true
        })
    });

    gameSettings().register("facets", "doomAndPlotLocation", {
        name: "Doom and Plot Location",
        scope: "world",
        config: false,
        type: new foundry.data.fields.StringField({
            initial: DOOM_AND_PLOT_CONSTANTS.LOCATION.LOCAL,
            choices: [DOOM_AND_PLOT_CONSTANTS.LOCATION.LOCAL, DOOM_AND_PLOT_CONSTANTS.LOCATION.REMOTE]
        })
    });

    gameSettings().register("facets", "doomAndPlotUrl", {
        name: "Doom and Plot Url",
        scope: "world",
        config: false,
        type: new foundry.data.fields.StringField({
            initial: ""
        })
    });

    gameSettings().register("facets", "doomAndPlotToken", {
        name: "Doom and Plot Token",
        scope: "world",
        config: false,
        type: new foundry.data.fields.StringField({
            initial: ""
        })
    });

    gameSettings().registerMenu("facets", "doom-and-plot", {
        name: "FACETS.Settings.DoomAndPlot.Name",
        label: "FACETS.Settings.DoomAndPlot.Label",
        hint: "FACETS.Settings.DoomAndPlot.Hint",
        icon: "fa-solid fa-dice-one",
        type: DoomAndPlotConfigurator,
        restricted: true
    });
}
