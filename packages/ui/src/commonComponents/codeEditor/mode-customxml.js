ace.define('ace/mode/customxml_highlight_rules', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/xml_highlight_rules'], function (require, exports, module) {
    const oop = require('ace/lib/oop');
    const XmlHighlightRules = require('ace/mode/xml_highlight_rules').XmlHighlightRules;
  
    const CustomHighlightRules = function (validKeys) {
      this.$rules = new XmlHighlightRules().getRules();
      this.validKeys = validKeys ? validKeys : [];
    //   console.log('Initial rules:', this.$rules);
      this.$rules.start.push({
        token: (value) => {
          // Strip out the surrounding {{ and }} from the value
          const key = value.trim(); // Extract the key inside {{key}}
          // console.log("value", value, "key", key, "validKeys", this.validKeys)
          
          // Check if the key exists in validKeys
          const matchedKey = this.validKeys.some(entry => entry.key === key);
          
          // Return the appropriate token class
          return matchedKey ? 'valid-key' : 'invalid-key';
        }, // Token for envVariable highlighting
        regex: /\{\{(.*?)\}\}/,
      });
    };
  
    oop.inherits(CustomHighlightRules, XmlHighlightRules);
  
    exports.CustomHighlightRules = CustomHighlightRules;
    // console.log('CustomXmlHighlightRules loaded');
  });
  
  ace.define('ace/mode/customxml', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/xml', 'ace/mode/customxml_highlight_rules'], function (require, exports, module) {
    const oop = require('ace/lib/oop');
    const TextMode = require('ace/mode/xml').Mode;
    const CustomHighlightRules = require('ace/mode/customxml_highlight_rules').CustomHighlightRules;
  
    const Mode = function ({ validKeys = [] } = {}) {
      this.HighlightRules = function () {
        return new CustomHighlightRules(validKeys); // Ensure validKeys are passed to CustomHighlightRules
      };
    };
  
    oop.inherits(Mode, TextMode);
  
    (function () {
      this.$id = 'ace/mode/customxml';
    }).call(Mode.prototype);
  
    exports.Mode = Mode;
  });
  
  (function () {
    ace.require(['ace/mode/customxml'], function (m) {
      if (typeof module === 'object' && typeof exports === 'object' && module) {
        module.exports = m;
      }
    });
  })();
  