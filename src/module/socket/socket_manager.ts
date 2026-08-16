import { DoomChange, PartyData } from "@data/actor/party";
import type { Socket } from "socketlib";
import { gameActors } from "../util/game_getters";

export class SocketManager {
    private readonly socket: Socket;

    constructor(socket: Socket) {
        this.socket = socket;
        this.socket.register("changeDoom", this.changeDoom);
    }

    sendChangeDoom(partyId: string, change: number, userId: string | null = null): Promise<boolean> {
        if (userId) {
            return this.socket.executeAsUser("changeDoom", userId, [partyId, change]);
        } else {
            return this.socket.executeAsGM("changeDoom", [partyId, change]);
        }
    }

    private async changeDoom(values: [string, number]): Promise<DoomChange> {
        const partyActor = gameActors().get(values[0]);

        if (partyActor?.system instanceof PartyData) {
            const partyData = partyActor.system;

            return partyData.alterDoom(values[1], false);
        }

        return Promise.reject(new Error("Could not find Party to change doom"));
    }
}
