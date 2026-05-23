import { SocketManager } from "@socket";
import type { Socket } from "socketlib";
import { Facets } from "../../facets";
import type { Listener } from "./hooks.interface";

export class SocketLibListener implements Listener {
    listen(): void {
        Hooks.once("socketlib.ready", () => {
            const socket: Socket = socketlib.registerSystem("facets");
            game.facets = new Facets(new SocketManager(socket));
        });
    }
}
