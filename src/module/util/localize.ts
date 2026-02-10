export function localize(key: string): string {
    return game.i18n?.localize("FACETS." + key) ?? key;
}

export function format(key: string, data?: Record<string, string>): string {
    return game.i18n?.format("FACETS." + key, data) ?? key;
}
