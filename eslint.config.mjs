import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { ignores: ["dist/", "node_modules/", "src/generated/"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["test/**/*.mjs"],
    languageOptions: { globals: { fetch: "readonly" } },
  },
];
