import globals from "globals"
import typescriptEslint from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import path from "node:path"
import { fileURLToPath } from "node:url"
import js from "@eslint/js"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [{
  ignores: ["public", "**/zez-ui"]
}, ...compat.extends("plugin:svelte/recommended"), {
  languageOptions: {
    globals: {
      ...globals.browser
    },

    ecmaVersion: 12,
    sourceType: "module",

    parserOptions: {
      allowImportExportEverywhere: true
    }
  },

  rules: {
    semi: ["error", "never"],
    quotes: ["error", "double"],
    "comma-spacing": ["error"],
    "comma-dangle": ["error", "never"],

    indent: ["error", 2, {
      SwitchCase: 1
    }],

    "no-trailing-spaces": ["error"],
    "space-before-function-paren": ["error", "never"],
    "no-var": ["error"],
    "prefer-const": ["error"],

    "arrow-spacing": ["error", {
      before: true,
      after: true
    }],

    "template-curly-spacing": ["error", "never"],
    "no-whitespace-before-property": ["error"],
    "block-spacing": ["error"],
    "prefer-arrow-callback": ["error"],
    "prefer-spread": ["error"],
    "no-duplicate-imports": ["error"],
    "space-before-blocks": ["error"],

    "no-console": ["warn", {
      allow: ["error"]
    }],

    "space-infix-ops": ["error"],

    "no-multiple-empty-lines": ["warn", {
      max: 1
    }]
  }
}, {
  rules: {
    "svelte/no-at-html-tags": "off"
  }
}, ...compat.extends("plugin:@typescript-eslint/recommended").map(config => ({
  ...config,
  files: ["**/*.ts"]
})), {
  files: ["**/*.ts"],

  plugins: {
    "@typescript-eslint": typescriptEslint
  },

  languageOptions: {
    parser: tsParser
  },

  rules: {
    "@typescript-eslint/explicit-function-return-type": ["error", {
      "allowTypedFunctionExpressions": true,
      "allowExpressions": true
    }],

    "@typescript-eslint/ban-ts-comment": "off",

    "@typescript-eslint/no-explicit-any": "off",

    "@typescript-eslint/no-unsafe-function-type": "off",

    "@typescript-eslint/no-unused-vars": ["error", {
      vars: "all",
      args: "after-used",
      ignoreRestSiblings: true,
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_"
    }]
  }
}, {
  files: ["**/*.js"],

  languageOptions: {
    ecmaVersion: 2021,
    sourceType: "script",
    sourceType: "module"
  },

  rules: {
    "no-unused-vars": ["error", {
      vars: "all",
      args: "after-used",
      ignoreRestSiblings: true,
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_"
    }]
  }
}]
