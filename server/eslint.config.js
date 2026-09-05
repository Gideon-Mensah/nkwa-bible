export default [
  {
    files: ["src/**/*.js", "scripts/**/*.js", "test/**/*.js"],
    languageOptions: { ecmaVersion: 2024, sourceType: "module", globals: { console: "readonly", process: "readonly", Buffer: "readonly", URL: "readonly", AbortSignal: "readonly", fetch: "readonly", setTimeout: "readonly", clearTimeout: "readonly" } },
    rules: { "no-unused-vars": ["error", { argsIgnorePattern: "^_" }], "no-undef": "error" },
  },
];
