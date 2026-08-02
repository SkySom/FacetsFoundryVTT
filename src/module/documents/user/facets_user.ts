export default class FacetsUser extends User {

    get remoteUserId(): number {
        return this.getFlag("facets", "remoteUserId");
    }

    async setRemoteUserId(remoteUserId: number): Promise<void> {
        return this.setFlag("facets", "remoteUserId", remoteUserId).then();
    }
}
