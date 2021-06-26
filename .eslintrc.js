module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	plugins: [
		"@typescript-eslint",
		"import",
		"eslint-plugin"
	],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
	],
	env: {
		es6: true,
		node: true
	},
	rules: {
		"no-var": "error",
		"no-unexpected-multiline": [ "error" ],
		"no-cond-assign": [ "error", "always" ],
		"no-constant-condition": [ "error" ],
		"no-empty-function": [ "error" ],
		"no-dupe-args": [ "error" ],
		"no-extra-boolean-cast": [ "error" ],
		"no-empty-pattern": [ "error" ],
		"no-extra-semi": [ "error" ],
		"no-empty-character-class": [ "error" ],
		"no-obj-calls": [ "error" ],
		"no-global-assign": [ "error" ],
		"no-dupe-keys": [ "error" ],
		"no-mixed-operators": [ "error" ],
		"no-undef": [ "error" ],
		"no-array-constructor": [ "error" ],
		"no-trailing-spaces": [ "error", {
			"skipBlankLines": false,
			"ignoreComments": false
		} ],
		"no-console": [ "error", {
			"allow": [ "log", "warn" ]
		} ],
		
		"default-case": [ "error" ],
		"dot-notation": [ "error" ],
		"eqeqeq": "warn",
		"array-bracket-spacing": [ "error", "never" ],
		"brace-style": [ "error", "1tbs" ],
		"comma-dangle": [ "error", "never" ],
		"arrow-spacing": [ "error", {
			"before": true,
			"after": true
		} ],
		"object-shorthand": [ "error", "always" ],
		"prefer-arrow-callback": [ "error", {
			"allowNamedFunctions": false
		} ],
		"space-infix-ops": [ "error" ],
		"space-in-parens": [ "error", "never" ],
		"object-curly-spacing": [ "error", "never" ],
		"indent": [ "error", 4, {
			"SwitchCase": 1
		} ],
		"function-paren-newline": [ "error", "multiline" ]
	}
}