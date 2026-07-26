import { gameSettings, localize, Logger } from "@util";
import { DOOM_AND_PLOT_CONSTANTS } from "../settings/doom_and_plot_settings";
import { gameActors } from "../util/game_getters";
import { PartyData } from "@data/actor/party";
import { PlayerCharacterData } from "@data/actor/player_character";

export default class DoomAndPlotConfigurator extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2
) {
    static override DEFAULT_OPTIONS = {
        id: "doomAndPlotConfig",
        window: {
            title: "FACETS.Settings.DoomAndPlot.Label",
            resizable: false,
            contentClasses: ["standard-form"]
        },
        position: {
            width: 600,
            height: 700
        },
        classes: ["doom-and-plot-config", "sheet", "facets", "facets-application"],
        tag: "form",
        form: {
            handler: DoomAndPlotConfigurator.onSubmit,
            closeOnSubmit: false,
            submitOnClose: true
        },
        actions: {}
    };

    static override PARTS = {
        tabs: {
            template: "templates/generic/tab-navigation.hbs"
        },
        settings: {
            template: "systems/facets/templates/apps/doom-and-plot/settings.hbs"
        },
        remoteUsers: {
            template: "systems/facets/templates/apps/doom-and-plot/remote-users.hbs"
        },
        remoteCharacters: {
            template: "systems/facets/templates/apps/doom-and-plot/remote-characters.hbs"
        },
        remoteDoom: {
            template: "systems/facets/templates/apps/doom-and-plot/remote-doom-pools.hbs"
        },
        footer: {
            template: "templates/generic/form-footer.hbs"
        }
    };

    static override TABS = {
        primary: {
            tabs: [
                {
                    id: "settings",
                    cssClass: "settings",
                    label: "FACETS.Settings.DoomAndPlot.Tab.Settings.Name"
                },
                {
                    id: "remoteUsers",
                    cssClass: "remoteUsers",
                    label: "FACETS.Settings.DoomAndPlot.Tab.RemoteUsers.Name"
                },
                {
                    id: "remoteCharacters",
                    cssClass: "remoteCharacters",
                    label: "FACETS.Settings.DoomAndPlot.Tab.RemoteCharacters.Name"
                },
                {
                    id: "remoteDoomPools",
                    cssClass: "remoteDoomPools",
                    label: "FACETS.Settings.DoomAndPlot.Tab.RemoteDoomPools.Name"
                }
            ],
            initial: "settings"
        }
    };

    override async _prepareContext(options) {
        const superContext = await super._prepareContext(options);
        const awaitRemote = await DoomAndPlotConfigurator.#getRemote()
        const thisContext = {
            tabs: this._prepareTabs("primary"),
            settings: {
                location:
                    gameSettings().get("facets", "DoomAndPlot")?.location ?? DOOM_AND_PLOT_CONSTANTS.LOCATION.LOCAL
            },
            locationOptions: {
                [DOOM_AND_PLOT_CONSTANTS.LOCATION.LOCAL]: localize("Settings.DoomAndPlot.Constants.Location.Local"),
                [DOOM_AND_PLOT_CONSTANTS.LOCATION.REMOTE]: localize("Settings.DoomAndPlot.Constants.Location.Remote")
            },
            remoteUserOptions: {
                "-1": "No Remote User"
            },
            remoteCharacterOptions: {
                "-1": "No Remote Character"
            },
            remoteDoomPoolOptions: {
                "-1": "No Remote Doom Pool"
            },
            remoteValid: false,
            characters: this.#buildPlotPointList(),
            parties: this.#buildDoomPoolList(),
            users: this.#buildUsersList(),
            buttons: [
                {
                    type: "submit",
                    icon: "fa-solid fa-save",
                    label: "SETTINGS.Save"
                }
            ]
        };
        const fullContext = foundry.utils.mergeObject(superContext, thisContext);

        return fullContext;
    }

    override async _preparePartContext(partId, context) {
        switch (partId) {
            case "settings":
            case "remoteUsers":
            case "remoteCharacters":
            case "remoteDoomPools":
                context.tab = context.tabs[partId];
                break;
            default:
        }
        return context;
    }

    #buildUsersList(): RemoteConnector[] {
        const users: RemoteConnector[] = [];
        if (game.users) {
            for (const player of game.users.players) {
                users.push({
                    id: player.id,
                    name: player.name,
                    remoteId: -1
                });
            }
        }

        users.sort((a, b) => a.name.localeCompare(b.name));

        return users;
    }

    #buildPlotPointList(): RemoteConnector[] {
        const users: RemoteConnector[] = [];
        for (const actor of gameActors()) {
            if (actor.system instanceof PlayerCharacterData) {
                users.push({
                    id: actor.id,
                    name: actor.name,
                    remoteId: -1
                });
            }
        }

        users.sort((a, b) => a.name.localeCompare(b.name));

        return users;
    }

    #buildDoomPoolList(): RemoteConnector[] {
        const parties: RemoteConnector[] = [];
        for (const actor of gameActors()) {
            if (actor.system instanceof PartyData) {
                parties.push({
                    id: actor.id,
                    name: actor.name,
                    remoteId: -1
                });
            }
        }

        parties.sort((a, b) => a.name.localeCompare(b.name));

        return parties;
    }

    static async onSubmit(
        this: DoomAndPlotConfigurator,
        _event: SubmitEvent,
        form: HTMLFormElement,
        formData: foundry.applications.ux.FormDataExtended
    ) {
        formData.process(form, { disabled: false });
        Logger.info(JSON.stringify(foundry.utils.expandObject(formData.object)));
        await this.render();
    }

    static async #getRemote(): Promise<[
        characters: RemoteCharacter[],
        doomPools: RemoteDoomPool[],
        users: RemoteUser[]
    ]> {
        return Promise.all([
            DoomAndPlotConfigurator.#getRemoteCharacters(),
            DoomAndPlotConfigurator.#getRemoteDoomPolls(),
            DoomAndPlotConfigurator.#getRemoteUsers()
        ])
    }

    static async #getRemoteCharacters(): Promise<RemoteCharacter[]> {
        return Promise.resolve([]);
    }

    static async #getRemoteUsers(): Promise<RemoteUser[]> {
        return Promise.resolve([]);
    }

    static async #getRemoteDoomPolls(): Promise<RemoteDoomPool[]> {
        return Promise.resolve([]);
    }
}

type RemoteConnector = {
    id: string;
    name: string;
    remoteId: number;
};

type RemoteUser = {
    id: number;
    name: string;
    characterPermissions: string
    doomPermissions: string,
    userPermissions: string,
    tokenPermissions: string,
    externalId: string | null;
    notes: string;
    active: boolean;
    createdBy: number | null
}

type RemoteDoomPool = {
    id: number;
    name: string;
    doom: number;
}

type RemoteCharacter = {
    id: number;
    name: string;
    sheet: string;
    ownerId: number;
    plotPoints: number;
    skills: Map<string, string>;
}
