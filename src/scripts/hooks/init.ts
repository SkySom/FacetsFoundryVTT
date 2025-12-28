
export const Init = {
    listen: (): void => {
        Hooks.once("init", () => {
            console.log("Facets System | Initializing Facets System");

            CONFIG.Combat.initiative.decimals = 0;
        })
    }
}