export const Init = {
    listen: (): void => {
        Hooks.once("init", () => {
            console.log("Facets | Running Init")

        })
    }
}