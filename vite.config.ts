import esbuild from "esbuild";
import fs from "fs-extra";
import path from "path";
import * as Vite from "vite";
import checker from "vite-plugin-checker";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tsconfigPaths from "vite-tsconfig-paths";
//import packageJSON from "./package.json" with {type: "json"}

const config = Vite.defineConfig(({ command, mode }): Vite.UserConfig => {
    const buildMode = mode === "production" ? "production" : "development";
    const outDir = `dist/facets`;

    const plugins = [checker({ typescript: true }), tsconfigPaths({ loose: true })];

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
                                  minifyWhitespace: true
                              })
                            : code;
                    }
                }
            },
            ...viteStaticCopy({
                targets: [
                    { src: "CHANGELOG.md", dest: "." },
                    { src: "README.md", dest: "." },
                    { src: "CONTRIBUTING.md", dest: "." }
                ]
            })
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
            }
        });
    }

    const reEscape = (s: string) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

    return {
        base: command === "build" ? "./" : `/systems/facets/`,
        publicDir: "static",
        define: {
            SYSTEM_ID: JSON.stringify("facets"),
            BUILD_MODE: JSON.stringify(buildMode),
            fa: "foundry.applications",
            fav1: "foundry.appv1",
            fc: "foundry.canvas",
            fd: "foundry.documents",
            fh: "foundry.helpers",
            fu: "foundry.utils"
        },
        esbuild: { keepNames: true },
        build: {
            outDir,
            emptyOutDir: false, // Fails if world is running due to compendium locks: handled with `npm run clean`
            minify: false,
            sourcemap: buildMode === "development",
            lib: {
                name: "facets",
                entry: "src/facets.ts",
                formats: ["es"],
                fileName: "facets"
            },
            rollupOptions: {
                external: new RegExp(
                    [
                        "(?:",
                        reEscape("../icons/"),
                        "[a-z]+/[-a-z/]+.webp",
                        "|",
                        reEscape("ui/parchment.jpg"),
                        ")$"
                    ].join("")
                ),
                output: {
                    assetFileNames: `styles/facets.css`,
                    chunkFileNames: "[name].mjs",
                    entryFileNames: `facets.mjs`,
                    manualChunks: {
                        //Not needed until Dependencies has anything
                        //vendor: buildMode === "production" ? Object.keys(packageJSON.dependencies) : [],
                    }
                },
                watch: {
                    buildDelay: 1000
                }
            },
            target: "es2022"
        },
        plugins,
        css: {
            devSourcemap: buildMode === "development",
            preprocessorOptions: {
                scss: {
                    additionalData: (existing: string) => {
                        return existing;
                    }
                }
            }
        }
    };
});

export default config;
