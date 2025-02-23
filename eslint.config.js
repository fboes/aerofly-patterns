import js from "@eslint/js";
import globals from "globals";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default tseslint.config(js.configs.recommended, tseslint.configs.recommended, eslintPluginPrettierRecommended, {
  languageOptions: {
    globals: {
      ...globals.nodeBuiltin,
      Generator: true,
    },
  },
});
