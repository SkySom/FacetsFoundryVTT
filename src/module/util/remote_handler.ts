import { gameSettings } from "@util";

export class RemoteHandler<T> {
    constructor(
        readonly path,
        readonly method
    ) {}

    async call(): Promise<T> {
        return this.#callRemote().then((json) => json as T);
    }

    async #callRemote(): Promise<unknown> {
        const url = gameSettings().get("facets", "doomAndPlotUrl");
        const token = gameSettings().get("facets", "doomAndPlotToken");

        if (url?.trim?.length == 0) {
            return Promise.reject(new Error("URL is Empty"));
        } else if (token?.trim?.length == 0) {
            return Promise.reject(new Error("Token is Empty"));
        }

        return fetch(url + "/" + this.path, {
            method: this.method,
            headers: {
                Authorization: "Bearer " + token
            }
        }).then(async (response) => {
            if (response.status >= 200 && response.status < 300) {
                return response.json();
            } else {
                return Promise.reject(new Error(`Received Status ${response.status} with Body ${await response.json()}`));
            }
        });
    }
}
