import { PartyData } from "@data/actor/party";
import { PlayerCharacterData } from "@data/actor/player_character";
import { gameSettings, localize, Logger } from "@util";
import { DOOM_AND_PLOT_CONSTANTS } from "../settings/doom_and_plot_settings";
import { gameActors } from "../util/game_getters";
import type { RemoteCharacter, RemoteDoomPool, RemoteUser } from "../util/remote_caller";

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
        const awaitRemote = await DoomAndPlotConfigurator.#getRemote();
        const thisContext = {
            tabs: this._prepareTabs("primary"),
            settings: {
                location: gameSettings().get("facets", "doomAndPlotLocation") ?? DOOM_AND_PLOT_CONSTANTS.LOCATION.LOCAL,
                remoteUrl: gameSettings().get("facets", "doomAndPlotUrl"),
                remoteToken: gameSettings().get("facets", "doomAndPlotToken")
            },
            locationOptions: {
                [DOOM_AND_PLOT_CONSTANTS.LOCATION.LOCAL]: localize("Settings.DoomAndPlot.Constants.Location.Local"),
                [DOOM_AND_PLOT_CONSTANTS.LOCATION.REMOTE]: localize("Settings.DoomAndPlot.Constants.Location.Remote")
            },
            remoteCharacterOptions: awaitRemote[0],
            remoteDoomPoolOptions: awaitRemote[1],
            remoteUserOptions: awaitRemote[2],
            remoteValid: awaitRemote.every((remote) => remote.length > 1),
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
                    remoteId: player.getFlag("facets", "remoteUserId") ?? -1
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
                    remoteId: actor.system.remoteCharacterId ?? -1
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
                    remoteId: actor.system.remoteDoomId ?? -1
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
        const expandedObject = foundry.utils.expandObject(formData.object);
        Logger.info(JSON.stringify(expandedObject));

        if (expandedObject["settings"]) {
            const settings = expandedObject["settings"] as object;
            await DoomAndPlotConfigurator.#saveSettings(settings);
        }
        await DoomAndPlotConfigurator.#saveRemoteValues(expandedObject);

        await this.render();
    }

    static async #saveSettings(settings: object): Promise<void> {
        await gameSettings().set("facets", "doomAndPlotLocation", settings["location"]);
        if (settings["location"] == DOOM_AND_PLOT_CONSTANTS.LOCATION.REMOTE) {
            let validUrl = false;
            if ("remoteUrl" in settings) {
                if (settings["remoteUrl"]) {
                    const url = settings["remoteUrl"] as string;
                    const remoteUrlError = await fetch(url + "/health")
                        .then((response) => {
                            if (response.status == 200) {
                                return "";
                            } else {
                                throw new Error("Response.Status was " + response.status);
                            }
                        })
                        .catch((error) => {
                            return error;
                        });

                    if (remoteUrlError) {
                        const remoteUrlElement = document.getElementById("remoteUrl");
                        if (remoteUrlElement instanceof HTMLInputElement) {
                            remoteUrlElement.setCustomValidity("Url Health Check Failed with " + remoteUrlError);
                            remoteUrlElement.reportValidity();
                        } else {
                            Logger.error("Failed to validate Remote Url " + remoteUrlElement, { toast: true });
                        }
                    } else {
                        await gameSettings().set("facets", "doomAndPlotUrl", settings["remoteUrl"] as string);
                        validUrl = true;
                    }
                } else {
                    await gameSettings().set("facets", "doomAndPlotUrl", settings["remoteUrl"] as string);
                }
            }
            if ("remoteToken" in settings) {
                if (settings["remoteToken"] && validUrl) {
                    const token = settings["remoteToken"] as string;
                    const url = settings["remoteUrl"] as string;
                    const remoteToken: RemoteUser | Error = await fetch(url + "/token", {
                        headers: {
                            Authorization: "Bearer " + token
                        }
                    })
                        .then((response) => {
                            if (response.status == 200) {
                                return response.json();
                            } else {
                                throw new Error("Response.Status was " + response.status);
                            }
                        })
                        .then((body) => body as RemoteUser)
                        .catch((error) => {
                            return error;
                        });

                    if (remoteToken instanceof Error) {
                        const remoteUrlElement = document.getElementById("remoteUrl");
                        if (remoteUrlElement instanceof HTMLInputElement) {
                            remoteUrlElement.setCustomValidity("Url Health Check Failed with " + remoteToken);
                            remoteUrlElement.reportValidity();
                        } else {
                            Logger.error("Failed to validate Remote Url " + remoteUrlElement, {
                                toast: true
                            });
                        }
                    } else {
                        await gameSettings().set("facets", "doomAndPlotToken", settings["remoteToken"] as string);
                    }
                } else {
                    await gameSettings().set("facets", "doomAndPlotToken", settings["remoteToken"] as string);
                }
            }
        } else {
            if ("remoteUrl" in settings) {
                await gameSettings().set("facets", "doomAndPlotUrl", settings["remoteUrl"] as string);
            }
            if ("remoteToken" in settings) {
                await gameSettings().set("facets", "doomAndPlotToken", settings["remoteToken"] as string);
            }
        }
    }

    static async #saveRemoteValues(values: object): Promise<unknown> {
        const promises: Promise<unknown>[] = [];
        if (values["remoteCharacter"]) {
            const remoteCharacterValues = values["remoteCharacter"] as object;
            for (const key in remoteCharacterValues) {
                const value = remoteCharacterValues[key];
                const actor = gameActors().get(key);
                if (actor.system instanceof PlayerCharacterData) {
                    promises.push(actor.system.setRemoteCharacterId(value));
                }
            }
        }
        if (values["remoteParty"]) {
            const remoteDoomPoolValues = values["remoteParty"] as object;
            for (const key in remoteDoomPoolValues) {
                const value = remoteDoomPoolValues[key];
                const actor = gameActors().get(key);
                if (actor.system instanceof PartyData) {
                    promises.push(actor.system.setRemoteDoomId(value));
                }
            }
        }
        if (values["remoteUser"]) {
            const remoteUserValues = values["remoteUser"] as object;
            for (const key in remoteUserValues) {
                const value = remoteUserValues[key];
                const user = game.users?.get(key);
                if (user) {
                    promises.push(user.setRemoteUserId(value as number));
                }
            }
        }

        return Promise.all(promises);
    }

    static async #getRemote(): Promise<
        [characters: RemoteCharacter[], doomPools: RemoteDoomPool[], users: RemoteUser[]]
    > {
        return Promise.all([
            DoomAndPlotConfigurator.#getRemoteCharacters(),
            DoomAndPlotConfigurator.#getRemoteDoomPolls(),
            DoomAndPlotConfigurator.#getRemoteUsers()
        ]);
    }

    static async #getRemoteCharacters(): Promise<RemoteCharacter[]> {
        return DoomAndPlotConfigurator.#callRemote("character")
            .then((json) => json as RemoteCharacter[])
            .then((characters) => {
                characters.sort((a, b) => a.name.localeCompare(b.name));
                characters.unshift({
                    id: -1,
                    name: "No Remote Character",
                    sheet: "",
                    ownerId: -1,
                    plotPoints: 0,
                    skills: new Map()
                });

                return characters;
            });
    }

    static async #getRemoteUsers(): Promise<RemoteUser[]> {
        return DoomAndPlotConfigurator.#callRemote("user")
            .then((json) => json as RemoteUser[])
            .then((users) => {
                users.sort((a, b) => a.name.localeCompare(b.name));
                users.unshift({
                    id: -1,
                    name: "No Remote Doom Pool",
                    characterPermissions: "*",
                    doomPermissions: "*",
                    userPermissions: "*",
                    tokenPermissions: "*",
                    externalId: null,
                    notes: "N/A",
                    active: false,
                    createdBy: null
                });

                return users;
            });
    }

    static async #getRemoteDoomPolls(): Promise<RemoteDoomPool[]> {
        return DoomAndPlotConfigurator.#callRemote("doompool")
            .then((json) => json as RemoteDoomPool[])
            .then((doomPools) => {
                doomPools.sort((a, b) => a.name.localeCompare(b.name));
                doomPools.unshift({
                    id: -1,
                    name: "No Remote Doom Pool",
                    doom: 0
                });

                return doomPools;
            });
    }

    static async #callRemote(path: string): Promise<unknown> {
        const url = gameSettings().get("facets", "doomAndPlotUrl");
        const token = gameSettings().get("facets", "doomAndPlotToken");
        return fetch(url + "/" + path, {
            headers: {
                Authorization: "Bearer " + token
            }
        }).then((response) => response.json());
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
    characterPermissions: string;
    doomPermissions: string;
    userPermissions: string;
    tokenPermissions: string;
    externalId: string | null;
    notes: string;
    active: boolean;
    createdBy: number | null;
};

type RemoteDoomPool = {
    id: number;
    name: string;
    doom: number;
};

type RemoteCharacter = {
    id: number;
    name: string;
    sheet: string;
    ownerId: number;
    plotPoints: number;
    skills: Map<string, string>;
};
