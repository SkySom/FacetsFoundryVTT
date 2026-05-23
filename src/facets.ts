import { HooksFacets } from "@scripts/hooks/index.ts";
import { Logger } from "./module/util/logger";
import "./styles/facets.scss";
import { SocketManager } from "@socket";

export class Facets {
    private readonly socketManager: SocketManager;

    constructor(socketManager: SocketManager) {
        this.socketManager = socketManager;
    }

    getSocketManager(): SocketManager {
        return this.socketManager;
    }
}

Logger.info("Starting System.");
new HooksFacets().listen();
