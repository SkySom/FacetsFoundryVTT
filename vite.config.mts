import * as Vite from "vite";
import {svelte} from "@sveltejs/vite-plugin-svelte";
import {visualizer} from "rollup-plugin-visualizer";
import {sveltePreprocess} from 'svelte-preprocess'
import checker from "vite-plugin-checker";
import path from "path";
import fs from "fs-extra";

const config = Vite.defineConfig(({command, mode}): Vite.UserConfig => {
    const buildMode = mode === "production" ? "production" : "development";

    // Create dummy files for vite dev server
    if (command === "serve") {
        const message = "This file is for a running vite dev server and is not copied to a build.";
        fs.writeFileSync("./index.html", `<h1>${message}</h1>\n`);
        if (!fs.existsSync("./styles")) fs.mkdirSync("./styles");
        fs.writeFileSync(`./styles/facets}.css`, `/** ${message} */\n`);
        fs.writeFileSync(`./facets.mjs`, `/** ${message} */\n\nimport "./src/pf2e.ts";\n`);
        fs.writeFileSync("./vendor.mjs", `/** ${message} */\n`);
    }

    return {
        root: "src/",
        base: "/systems/facets/",
        publicDir: path.resolve(__dirname, "static"),
        server: {
            port: 30001,
            open: true,
            proxy: {
                "^(?!/systems/facets)": "http://localhost:30000/",
                "/socket.io": {
                    target: "ws://localhost:30000",
                    ws: true,
                },
            },
        },
        resolve: {
            alias: [
                {
                    find: "./runtimeConfig",
                    replacement: "./runtimeConfig.browser",
                },
            ],
        },
        build: {
            outDir: path.resolve(__dirname, "dist"),
            emptyOutDir: false,
            sourcemap: buildMode === "development",
            lib: {
                name: "facets",
                entry: path.resolve(__dirname, "src/facets.ts"),
                formats: ["es"],
                fileName: "facets",
            },
        },
        esbuild: {
            minifyIdentifiers: false,
            keepNames: true,
        },
        plugins: [
            svelte({
                preprocess: sveltePreprocess(),
            }),
            checker({
                typescript: true,
            }),
            visualizer({
                gzipSize: true,
                template: "treemap",
            }),

        ],
        define: {
            "process.env": process.env,
        },
        css: {
            devSourcemap: buildMode === "development",
            preprocessorOptions: {
                scss: {
                    additionalData: (existing: string) => {
                        return existing;
                    },
                }
            }
        }
    };
});

export default config;
