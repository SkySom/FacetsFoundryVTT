import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import mochaPlugin from "eslint-plugin-mocha"

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.browser }
    },
    tseslint.configs.recommended,
    {
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "error"
        }
    },
    {
        plugins: {
            "@stylistic": stylistic
        },
        rules: {
            "@stylistic/padding-line-between-statements": [
                "error",
                { blankLine: "always", prev: "function", next: "*" },
                { blankLine: "always", prev: "*", next: "function" }
            ]
        }
    },
    mochaPlugin.configs.recommended,
    globalIgnores(["dist/*"])
]);
