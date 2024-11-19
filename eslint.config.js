import js from "@eslint/js";
import globals from "globals";
import jsdoc from "eslint-plugin-jsdoc";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  js.configs.recommended,
  jsdoc.configs["flat/recommended-error"],
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.nodeBuiltin,
        Generator: true,
      },
    },
    plugins: {
      jsdoc,
    },
    rules: {
      "jsdoc/require-param-description": 0,
      "jsdoc/require-returns-description": 0,
      "jsdoc/require-property-description": 0,
    },
  },
];
