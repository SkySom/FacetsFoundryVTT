export function gameSettings(): foundry.helpers.ClientSettings {
    if (!game.settings) {
        throw new Error("Could not get game.settings");
    }
    return game.settings;
}

export function gameUser(): User {
    if (!game.users?.current) {
        throw new Error("Could not get game.users.current");
    }
    return game.users.current;
}

export function gameActors(): Actors {
    if (!game.actors) {
        throw new Error("Could not get game.actors")
    }
    return game.actors
}

export function gameModules() {
    if (!game.modules) {
        throw new Error("Could not get game.modules");
    }
    return game.modules;
}
