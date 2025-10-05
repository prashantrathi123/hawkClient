ace.define('ace/mode/customjson_highlight_rules', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/json_highlight_rules'], function (require, exports, module) {
    const oop = require('ace/lib/oop');
    const JsonHighlightRules = require('ace/mode/json_highlight_rules').JsonHighlightRules;

    const CustomHighlightRules = function (validKeys) {
        JsonHighlightRules.call(this);

        this.$rules = this.getRules();
        this.validKeys = validKeys ? validKeys : [];

        // Add rule for capturing and highlighting {{key}} variables
        // Add envVariable rule at the beginning of the start rules
        this.$rules.start.unshift({
            token: (value) => {
                const key = value.trim();
                const matchedKey = this.validKeys.some(entry => entry.key === key);
                return matchedKey ? 'valid-key' : 'invalid-key';
            },
            regex: /\{\{(.*?)\}\}/,
            onMatch: (val) => {
                const keyMatch = val.match(/\{\{(.*?)\}\}/);
                if (keyMatch) {
                    const key = keyMatch[1].trim();
                    const matchedKey = this.validKeys.some(entry => entry.key === key);
                    return matchedKey ? 'valid-key' : 'invalid-key';
                }
                return null;
            }
        });

        // Modify string rules to handle {{key}} inside string values
        const stringRules = this.$rules.string;
        for (let i = 0; i < stringRules.length; i++) {
            if (stringRules[i].token === "string") {
                stringRules.splice(i + 1, 0, {
                      token: (value) => {
                          const key = value.trim();
                          const matchedKey = this.validKeys.some(entry => entry.key === key);
                          return matchedKey ? 'valid-key' : 'invalid-key';
                      },
                      regex: /\{\{(.*?)\}\}/
                });
            }
        }

        // Handle variable highlighting in key-value pairs
        // Modify the start rules for variable tokens
        const stringAndVariableTokens = ['variable'];
        this.$rules.start.forEach((rule, index) => {
            if (stringAndVariableTokens.includes(rule.token)) {
                this.$rules.start[index] = {
                    token: rule.token,
                    regex: rule.regex,
                    onMatch: (val) => {
                        const envVariableRegex = /\{\{(.*?)\}\}/;

                        // Check if the value contains a variable {{key}}
                        const keyMatch = val.match(envVariableRegex);

                        if (keyMatch) {
                            const key = keyMatch[1].trim();
                            const matchedKey = this.validKeys.some(entry => entry.key === key);

                            // Tokenize: Return parts separately: quotes, key inside {{}} and remaining string
                            const parts = [];

                            // Add the part before the {{key}} (e.g., the starting quote)
                            if (keyMatch.index > 0) {
                                parts.push({ type: rule.token, value: val.slice(0, keyMatch.index) });
                            }

                            // Add the key itself with the correct token (valid-key or invalid-key)
                            parts.push({ type: matchedKey ? 'valid-key' : 'invalid-key', value: keyMatch[0] });

                            // Add the part after the {{key}} (e.g., the closing quote or any remaining text)
                            if (keyMatch.index + keyMatch[0].length < val.length) {
                                parts.push({ type: rule.token, value: val.slice(keyMatch.index + keyMatch[0].length) });
                            }

                            return parts;
                        }

                        // If no {{key}} is found, return the default token
                        return rule.token;
                    }
                };
            }
        });
    };

    oop.inherits(CustomHighlightRules, JsonHighlightRules);

    CustomHighlightRules.prototype = Object.create(JsonHighlightRules.prototype);
    CustomHighlightRules.prototype.constructor = CustomHighlightRules;

    exports.CustomJsonHighlightRules = CustomHighlightRules;
});

ace.define('ace/mode/customjson', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/json', 'ace/mode/customjson_highlight_rules'], function (require, exports, module) {
    const oop = require('ace/lib/oop');
    const TextMode = require('ace/mode/json').Mode;
    const CustomJsonHighlightRules = require('ace/mode/customjson_highlight_rules').CustomJsonHighlightRules;

    const Mode = function ({ validKeys = [] } = {}) {
        TextMode.call(this);
        this.HighlightRules = function () {
            return new CustomJsonHighlightRules(validKeys);
        };
    };

    oop.inherits(Mode, TextMode);

    (function () {
        this.$id = 'ace/mode/customjson';
    }).call(Mode.prototype);

    exports.Mode = Mode;
});

(function () {
    ace.require(['ace/mode/customjson'], function (m) {
        if (typeof module === 'object' && typeof exports === 'object' && module) {
            module.exports = m;
        }
    });
})();
