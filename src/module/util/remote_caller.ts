import type { PartyData } from "@data/actor/party";
import { PlayerCharacterData } from "@data/actor/player_character";
import { gameSettings } from "@util";
import { gameUser } from "./game_getters";

export class RemoteCaller {
    static async alterPlot(playerCharacter: PlayerCharacterData, amount: number): Promise<AlterPlotResponse> {
        if (playerCharacter.getRemoteCharacterId() < 0) {
            return Promise.reject(
                new Error(
                    `Actor ${playerCharacter.parent.name} with remote character id ${playerCharacter.getRemoteCharacterId()} is invalid`
                )
            );
        } else {
            return this.#callRemote(
                `\\character\\${playerCharacter.getRemoteCharacterId}\\plotpoints`,
                RemoteMethod.Post,
                {
                    amount: amount
                }
            ).then((json) => json as AlterPlotResponse);
        }
    }

    static async getCharacter(playerCharacter: PlayerCharacterData): Promise<CharacterResponse> {
        if (playerCharacter.getRemoteCharacterId() < 0) {
            return Promise.reject(
                new Error(
                    `Actor ${playerCharacter.parent.name} with remote character id ${playerCharacter.getRemoteCharacterId()} is invalid`
                )
            );
        } else {
            return this.#callRemote(`\\character\\${playerCharacter.getRemoteCharacterId()}`).then(
                (json) => json as CharacterResponse
            );
        }
    }

    static async alterDoom(party: PartyData, amount: number): Promise<AlterDoomResponse> {
        if (party.getRemoteDoomId() < 0) {
            return Promise.reject(
                new Error(`Actor ${party.parent.name} with remote doom id ${party.getRemoteDoomId()} is invalid`)
            );
        } else {
            return this.#callRemote(`\\doompool\\${party.getRemoteDoomId()}\\doom`, RemoteMethod.Post, {
                amount: amount
            }).then((json) => json as AlterPlotResponse);
        }
    }

    static async getDoomPool(party: PartyData): Promise<DoomPoolResponse> {
        if (party.getRemoteDoomId() < 0) {
            return Promise.reject(
                new Error(
                    `Actor ${party.parent.name} with remote doom pool id ${party.getRemoteDoomId()} is invalid`
                )
            );
        } else {
            return this.#callRemote(`\\doompool\\${party.getRemoteDoomId()}`).then(
                (json) => json as DoomPoolResponse
            );
        }
    }

    static async #callRemote(
        path: string,
        method: RemoteMethod = RemoteMethod.Get,
        data: object | undefined = undefined
    ): Promise<unknown> {
        const url = gameSettings().get("facets", "doomAndPlotUrl") as string;
        const token = gameUser().flags.facets?.remoteToken;

        if (url?.trim()?.length == 0) {
            return Promise.reject(new Error(`${url} is invalid`));
        } else if (token?.trim()?.length == 0) {
            return Promise.reject(new Error("Token is Empty"));
        }

        return fetch(url + "/" + path, {
            method: method,
            headers: {
                Authorization: "Bearer " + token
            },
            body: data ? JSON.stringify(data) : undefined
        }).then(async (response) => {
            if (response.status >= 200 && response.status < 300) {
                return response.json();
            } else {
                return Promise.reject(
                    new Error(`Received Status ${response.status} with Body ${await response.json()}`)
                );
            }
        });
    }
}

export enum RemoteMethod {
    Get = "GET",
    Post = "POST"
}

export type AlterPlotResponse = {
    readonly old: number;
    readonly current: number;
};

export type AlterDoomResponse = {
    readonly old: number;
    readonly current: number;
};

export type CharacterResponse = {
    readonly id: number;
    readonly name: string;
    readonly sheet: string;
    readonly ownerId: number;
    readonly plotPoints: number;
    readonly skills: Map<string, string>;
};

export type DoomPoolResponse = {
    readonly id: number;
    readonly name: string;
    readonly doom: number;
};
