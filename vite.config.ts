import {svelte as sveltePlugin} from "@sveltejs/vite-plugin-svelte";
import esbuild from "esbuild";
import fs from "fs-extra";
import path from "path";
import * as Vite from "vite";
import checker from "vite-plugin-checker";
import {viteStaticCopy} from "vite-plugin-static-copy";
import tsconfigPaths from "vite-tsconfig-paths";
import packageJSON from "./package.json" with {type: "json"}

const EN_JSON = JSON.parse(fs.readFileSync("./static/lang/en.json", {encoding: "utf-8"}));

const config = Vite.defineConfig(({command, mode}): Vite.UserConfig => {
    const buildMode = mode === "production" ? "production" : "development";
    const outDir = `dist/facets`;

    // noinspection JSUnusedGlobalSymbols
    const hmrPreprocess = {
        name: "svelte-hmr-layer",
        style: ({content}: { content: string }) => ({code: `@layer system { ${content} }`}),
    };

    const plugins = [
        checker({typescript: true}),
        tsconfigPaths({loose: true}),
        sveltePlugin({
            preprocess: command === "serve" ? hmrPreprocess : undefined,
        }),
    ];

    if (buildMode === "production") {
        plugins.push(
            {
                name: "minify",
                renderChunk: {
                    order: "post",
                    async handler(code, chunk) {
                        return chunk.fileName.endsWith(".mjs")
                            ? esbuild.transform(code, {
                                keepNames: true,
                                minifyIdentifiers: false,
                                minifySyntax: true,
                                minifyWhitespace: true,
                            })
                            : code;
                    },
                },
            },
            ...viteStaticCopy({
                targets: [
                    {src: "CHANGELOG.md", dest: "."},
                    {src: "README.md", dest: "."},
                    {src: "CONTRIBUTING.md", dest: "."},
                ],
            }),
        );
    } else {
        plugins.push(
            // Foundry expects all esm files listed in system.json to exist: create empty vendor module when in dev mode
            {
                name: "touch-vendor-mjs",
                apply: "build",
                writeBundle: {
                    async handler() {
                        fs.closeSync(fs.openSync(path.resolve(outDir, "vendor.mjs"), "w"));
                    },
                },
            },
            // Vite HMR is only preconfigured for CSS files: add handler for HBS templates and localization JSON
            {
                name: "hmr-handler",
                apply: "serve",
                handleHotUpdate(context) {
                    if (context.file.startsWith(outDir)) return;
                    if (context.file.endsWith("en.json")) {
                        const basePath = context.file.slice(context.file.indexOf("lang/"));
                        console.debug(`Updating lang file at ${basePath}`);
                        fs.promises.copyFile(context.file, `${outDir}/${basePath}`).then(() => {
                            context.server.ws.send({
                                type: "custom",
                                event: "lang-update",
                                data: {path: `systems/facets/${basePath}`},
                            });
                        });
                    } else if (context.file.endsWith(".hbs")) {
                        const basePath = context.file.slice(context.file.indexOf("templates/"));
                        console.debug(`Updating template file at ${basePath}`);
                        fs.promises.copyFile(context.file, `${outDir}/${basePath}`).then(() => {
                            context.server.ws.send({
                                type: "custom",
                                event: "template-update",
                                data: {path: `systems/facets/${basePath}`},
                            });
                        });
                    }
                }
            }
        );

        const mainCss = path.resolve(__dirname, "src/facets.ts").split(path.sep).join("/");
        plugins.push({
            name: "hmr-layers",
            apply: "serve",
            transform: (code, id) => {
                if (id === mainCss) {
                    return code.replace("styles/main.style", "styles/vite-hmr.style");
                } else if (/node_modules\/.+\.css$/.test(id)) {
                    return `@layer system { ${code} }`;
                }
                return;
            },
        });
    }

    // Create dummy files for vite dev server
    if (command === "serve") {
        const message = "This file is for a running vite dev server and is not copied to a build.";
        fs.writeFileSync("./index.html", `<h1>${message}</h1>\n`);
        if (!fs.existsSync("./styles")) fs.mkdirSync("./styles");
        fs.writeFileSync(`./styles/facets.css`, `/** ${message} */\n`);
        fs.writeFileSync(`./facets.mjs`, `/** ${message} */\n\nimport "./src/facets.ts";\n`);
        fs.writeFileSync("./vendor.mjs", `/** ${message} */\n`);
    }

    const reEscape = (s: string) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

    return {
        base: command === "build" ? "./" : `/systems/facets/`,
        publicDir: "static",
        define: {
            SYSTEM_ID: JSON.stringify("facets"),
            BUILD_MODE: JSON.stringify(buildMode),
            EN_JSON: JSON.stringify(EN_JSON),
            fa: "foundry.applications",
            fav1: "foundry.appv1",
            fc: "foundry.canvas",
            fd: "foundry.documents",
            fh: "foundry.helpers",
            fu: "foundry.utils",
        },
        esbuild: {keepNames: true},
        build: {
            outDir,
            emptyOutDir: false, // Fails if world is running due to compendium locks: handled with `npm run clean`
            minify: false,
            sourcemap: buildMode === "development",
            lib: {
                name: "facets",
                entry: "src/facets.ts",
                formats: ["es"],
                fileName: "facets",
            },
            rollupOptions: {
                external: new RegExp(
                    [
                        "(?:",
                        reEscape("../icons/"),
                        "[a-z]+\/[-a-z/]+\.webp",
                        "|",
                        reEscape("ui/parchment.jpg"),
                        ")$",
                    ].join(""),
                ),
                output: {
                    assetFileNames: `styles/facets.css`,
                    chunkFileNames: "[name].mjs",
                    entryFileNames: `facets.mjs`,
                    manualChunks: {
                        vendor: buildMode === "production" ? Object.keys(packageJSON.dependencies) : [],
                    },
                },
                watch: {buildDelay: 100},
            },
            target: "es2022",
        },
        server: {
            port: 30001,
            open: "/game",
            proxy: {
                [`^(?!/systems/$facets/)`]: `http://localhost:30001/`,
                "/socket.io": {
                    target: `ws://localhost:30000`,
                    ws: true,
                },
            },
        },
        plugins,
        css: {
            devSourcemap: buildMode === "development",
            preprocessorOptions: {
                scss: {
                    additionalData: (existing: string) => {
                        return existing;
                    },
                },
            },
        },
    };
});

export default config;