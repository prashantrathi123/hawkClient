import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Button } from '@mui/material';
import CodeEditor from '../../../../commonComponents/codeEditor/codeEditor';
import { useSelector } from 'react-redux';
import { format } from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import prettierPluginGraphql from 'prettier/parser-graphql';
import jsonlint from 'jsonlint';
import generateCustomCompletions from '../../../../commonComponents/graphQLEditor/autoCompletionFetcher';
import { parse as parseGraphQL, validate } from 'graphql';

function GraphQLInput(props) {
    const { onChange, value, validKeys, schema, isSchemaFetched } = props;
    const [tempValue, setTempValue] = useState({ query: '', variables: '' });
    const isTwoPane = useSelector(state => state.apiTesterReducer.isTwoPane || false)
    const [lineNumber, setLineNumber] = useState(0)
    const [gutterIconText, setGutterIconText] = useState("")
    const [iconType, setIconType] = useState("")
    const [customCompletions, setCustomCompletions] = useState([]);

    const [queryLineNumber, setQueryLineNumber] = useState(0)
    const [queryGutterIconText, setQueryGutterIconText] = useState("")
    const [queryIconType, setQueryIconType] = useState("")


    const handleCursorChange = () => {
        const editor = ace.edit('graphql-editor');
        const pos = editor.getCursorPosition(); // { row, column }
        const innerValue = editor.getValue()
        const completions = generateCustomCompletions(schema, innerValue || "", pos, value?.query || "");
        setCustomCompletions(completions);
    };

    function getLineNumberFromError(errorString) {
        // Regular expression to match "Parse error on line X:"
        const regex = /Parse error on line (\d+):/;

        // Execute the regex on the error string
        const match = errorString.match(regex);

        // If a match is found, extract the line number
        if (match) {
            return parseInt(match[1], 10);
        } else {
            // Return null or a default value if no match is found
            return null;
        }
    }

    jsonlint.parseError = function (str, hash) {
        let loc = hash.loc;
        setLineNumber(loc.first_line);
        setGutterIconText(str);
        setIconType("error");
    };

    useEffect(() => {
        if (value) {
            
        }
    }, [value]);

    const handleInputChange = (event, fieldId) => {
        const newValue = event.target.value;
        let inputVal = { ...value }
        inputVal[`${fieldId}`] = newValue
        if (fieldId == 'variables') {
            try {
                jsonlint.parse(event.target.value.replace(/(?<!"[^":{]*){{[^}]*}}(?![^"},]*")/g, '1'));
                setLineNumber(0)
                setGutterIconText("")
                setIconType("")
            } catch (error) {
                const errorString = error.message || "Unknown error";
                const errorHash = {};  // You can customize this based on available error details

                errorHash.loc = {
                    first_line: getLineNumberFromError(errorString)
                }

                // Call parseError manually
                jsonlint.parseError(errorString, errorHash);
            }
        } else if (fieldId == 'query') {
            try {
                setQueryLineNumber(0);
                setQueryGutterIconText("");
                setQueryIconType("");
                const ast = parseGraphQL(newValue);

                // Validate against the provided schema
                if (isSchemaFetched) {
                    const errors = validate(schema, ast);

                    if (errors.length > 0) {
                        setQueryLineNumber(errors[0].locations[0].line);
                        setQueryGutterIconText(errors[0].message);
                        setQueryIconType("error");
                    } else {
                        setQueryLineNumber(0);
                        setQueryGutterIconText("");
                        setQueryIconType("");
                    }
                }

            } catch (error) {
                setQueryLineNumber(error?.locations[0]?.line || 1);
                setQueryGutterIconText(error.message);
                setQueryIconType("error");
            }
        }
        onChange({ target: { value: { query: inputVal.query, variables: inputVal.variables } } })
    };
    function formatJsonCode(code, fieldId) {
        const options = {
            parser: 'json',
            plugins: [parserBabel]
        };
        if (fieldId == "query") {
            options.parser = 'graphql'
            options.plugins = [prettierPluginGraphql]
            try {
                const formattedCode = format(code, { ...options });
                handleInputChange({ target: { value: formattedCode } }, fieldId)
            } catch (error) {
                console.error('Error formatting code:', error);
                return code; // Return original code if formatting fails
            }
        }

        if (fieldId == "variables") {
            try {
                // Parse the JSON string to an object
                const jsonObject = JSON.parse(code);

                // Convert the object back to a string with formatting
                const formattedCode = JSON.stringify(jsonObject, null, 2); // The '2' is the number of spaces for indentation
                handleInputChange({ target: { value: formattedCode } }, fieldId)
            } catch (error) {
                // Handle JSON parsing errors
                console.error("Error formatting code::", error);
                return null;
            }
        }
    }

    return (
        <Box style={{ position: 'relative', height: '100%', width: '100%', display: 'block' }}>
            <Grid style={{ display: 'flex', height: '100%', width: '100%', position: 'absolute', gap: '10px', flexDirection: isTwoPane ? 'column' : 'row', overflow: 'hidden' }}>
                <Grid item style={{ height: '100%', width: '100%' }}>
                    <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: '24px' }}>
                        <Typography>Query</Typography>
                        <Button sx={{ textTransform: 'none' }} onClick={() => { formatJsonCode(value?.query || "", 'query') }}>Format</Button>
                    </Box>
                    <CodeEditor
                        style={{ border: '1px solid #C8CDD7', height: 'calc(100% - 24px)', boxSizing: 'border-box', borderRadius: '4px' }}
                        isEditable={true}
                        onChange={(event) => handleInputChange(event, 'query')}
                        value={value?.query || ""}
                        language={'graphql'}
                        name='graphql-editor'
                        onCursorChange={handleCursorChange} // Monitor cursor movement
                        customCompletions={customCompletions}
                        lineNumber={queryLineNumber}
                        gutterIconText={queryGutterIconText}
                        iconType={queryIconType}
                    />
                </Grid>
                <Grid item style={{ height: '100%', width: '100%' }}>
                    <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: '24px' }}>
                        <Typography>Variables</Typography>
                        <Button sx={{ textTransform: 'none' }} onClick={() => { formatJsonCode(value?.variables || "", 'variables') }}>Format</Button>
                    </Box>
                    <CodeEditor
                        style={{ border: '1px solid #C8CDD7', height: 'calc(100% - 24px)', boxSizing: 'border-box', borderRadius: '4px' }}
                        isEditable={true}
                        onChange={(event) => handleInputChange(event, 'variables')}
                        value={value?.variables || ""}
                        language={'customjson'}
                        lineNumber={lineNumber}
                        gutterIconText={gutterIconText}
                        iconType={iconType}
                        validKeys={validKeys}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

GraphQLInput.defaultProps = {
    value: `{"query":,"variables":}`,
    schema: null,
    isSchemaFetched: false,
};

export default GraphQLInput;
