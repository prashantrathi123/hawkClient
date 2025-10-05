ace.define("ace/mode/graphql_highlight_rules", ["require", "exports", "ace/lib/oop", "ace/mode/text_highlight_rules"], function (require, exports) {
    "use strict";

    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

    var GraphQLHighlightRules = function () {
        this.$rules = {
            "start": [
                {
                    token: "graphql.keywordg", // Updated class for GraphQL keywords
                    regex: "\\b(query|mutation|subscription|fragment|on)\\b"
                },
                {
                    token: 'graphql.languageg',
                    regex: '\\b(true|false|null)\\b'
                },
                // {
                //     token: "graphql.typeg", // Updated class for GraphQL types
                //     regex: "\\b(ID|String|Int|Float|Boolean)\\b"
                // },
                {
                    token: "graphql.variableg", // Updated class for GraphQL variables
                    regex: "\\$[a-zA-Z_][a-zA-Z0-9_]*"
                },
                {
                    token: "graphql.stringg", // Updated class for strings
                    regex: '"(?:[^"\\\\]|\\\\.)*"'
                },
                // {
                //     token: "graphql.number", // Updated class for numbers
                //     regex: "\\b[0-9]+(?:\\.[0-9]+)?\\b"
                // },
                {
                    token: 'graphql.numericg',
                    regex: '\\b\\d+\\b'
                },
                {
                    token: "graphql.commentg", // Updated class for comments
                    regex: "#.*$"
                },
                {
                    token: "graphql.paren.lpareng",
                    regex: "[({]"
                },
                {
                    token: "graphql.paren.rpareng",
                    regex: "[)}]"
                },
                {
                    token: "textg",
                    regex: ".+?"
                }
            ]
        };
        this.normalizeRules();
    };

    oop.inherits(GraphQLHighlightRules, TextHighlightRules);

    exports.GraphQLHighlightRules = GraphQLHighlightRules;
});

ace.define("ace/mode/graphql", ["require", "exports", "ace/lib/oop", "ace/mode/text", "ace/mode/graphql_highlight_rules"], function (require, exports) {
    "use strict";

    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var GraphQLHighlightRules = require("ace/mode/graphql_highlight_rules").GraphQLHighlightRules;

    var Mode = function () {
        this.HighlightRules = GraphQLHighlightRules;
    };
    oop.inherits(Mode, TextMode);

    (function () {
        this.$id = "ace/mode/graphql";
    }).call(Mode.prototype);

    exports.Mode = Mode;
});
