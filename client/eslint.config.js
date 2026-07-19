import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  { ignores: ["dist", "coverage", "node_modules"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Core React Hooks rules (the conventional Vite/React baseline). The
      // plugin's full v7 "recommended" also ships opinionated React-Compiler-era
      // rules (static-components, set-state-in-effect, …); those are opt-in and
      // deliberately not enabled here.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Allow intentionally-unused args/vars prefixed with _.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // Node-context config files.
  {
    files: ["*.{js,ts}", "vite.config.ts"],
    languageOptions: { globals: globals.node },
  },
  // Tests may use dev-only helpers.
  {
    files: ["**/*.test.{ts,tsx}"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  }
);
