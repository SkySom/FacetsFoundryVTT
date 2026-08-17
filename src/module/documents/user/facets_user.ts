import { RemoteCaller } from "../../util/remote_caller";

export default class FacetsUser extends User {

    get remoteUserId(): number | undefined {
        return this.getFlag("facets", "remoteUserId");
    }

    get remoteToken(): string | undefined {
        return this.getFlag("facets", "remoteToken")
    }

    async setRemoteUserId(remoteUserId: number): Promise<void> {
        const previousRemoteUserId = this.remoteUserId
        await this.setFlag("facets", "remoteUserId", remoteUserId);

        let tokenPromise = Promise.resolve()
        if (this.remoteUserId != previousRemoteUserId || !this.remoteToken) {
            if (previousRemoteUserId) {
                tokenPromise = RemoteCaller.deleteToken(this)
            }

            tokenPromise = tokenPromise.then(() => RemoteCaller.createToken(this))
                .then(token => this.setFlag("facets", "remoteToken", token.jwt))
                .then()
        }
        return tokenPromise;
    }
}
