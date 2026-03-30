export function gameSettings(): foundry.helpers.ClientSettings {
    if (!game.settings) {
        throw new Error("Could not get game.settings");
    }
    return game.settings;
}

export function gameModules() {
    if (!game.modules) {
        throw new Error("Could not get game.modules");
    }
    return game.modules;
}
