export function getAdjective(): string {
    const adjectives = Object.values(
        foundry.utils.getProperty(game?.i18n?.translations || {}, CONFIG.Token.adjectivesPrefix) || {}
    );
    return adjectives[Math.floor(Math.random() * adjectives.length)];
}
