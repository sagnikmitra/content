import pluginJs from "@eslint/js";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { ...globals.node }, // Add Node.js globals
    },
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
];
