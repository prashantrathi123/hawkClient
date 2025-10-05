ace.define('ace/mode/customtext_highlight_rules', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text_highlight_rules'], function (require, exports, module) {
  const oop = require('ace/lib/oop');
  const TextHighlightRules = require('ace/mode/text_highlight_rules').TextHighlightRules;

  const CustomHighlightRules = function (validKeys) {
    // console.log("validKeys", validKeys)
    this.$rules = new TextHighlightRules().getRules();
    this.validKeys = validKeys ? validKeys : [];

    // Define rules for the custom mode
    this.$rules.start.push({
          token: (value) => {
            // Strip out the surrounding {{ and }} from the value
            const key = value.trim(); // Extract the key inside {{key}}
            // console.log("value", value, "key", key, "validKeys", this.validKeys)
            
            // Check if the key exists in validKeys
            const matchedKey = this.validKeys.some(entry => entry.key === key);
            
            // Return the appropriate token class
            return matchedKey ? 'valid-key' : 'invalid-key';
          },
          regex: /\{\{(.*?)\}\}/, // Regex to match {{key}} structure
        },
      )
  };

  oop.inherits(CustomHighlightRules, TextHighlightRules);
  exports.CustomHighlightRules = CustomHighlightRules;
});

ace.define('ace/mode/customtext', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text', 'ace/mode/customtext_highlight_rules'], function (require, exports, module) {
  const oop = require('ace/lib/oop');
  const TextMode = require('ace/mode/text').Mode;
  const CustomHighlightRules = require('ace/mode/customtext_highlight_rules').CustomHighlightRules;

  const Mode = function ({ validKeys = [] } = {}) {
    this.HighlightRules = function () {
      return new CustomHighlightRules(validKeys); // Ensure validKeys are passed to CustomHighlightRules
    };
  };

  oop.inherits(Mode, TextMode);

  (function () {
    this.$id = 'ace/mode/customtext';
  }).call(Mode.prototype);

  exports.Mode = Mode;
});

(function () {
  ace.require(['ace/mode/customtext'], function (m) {
    if (typeof module === 'object' && typeof exports === 'object' && module) {
      module.exports = m;
    }
  });
})();
