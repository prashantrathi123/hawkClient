import React, { useState, useMemo } from 'react';
import { Typography, Box, Grid, Button, FormControl, Select, InputLabel, MenuItem, Menu, CircularProgress } from '@mui/material';
import { TabContext } from '@mui/lab';
import CodeEditor from '../../../../commonComponents/codeEditor/codeEditor';
import KeyValueInput from '../../../../commonComponents/keyValueInput/KeyValueInput.Component';
import GraphQLInput from '../GraphQlInput/GraphQlInput.Component';
import FormDataInput from '../FormDataInput/FormDataInput.component';
import xmlFormatter from 'xml-formatter';
import jsonlint from 'jsonlint';
import { buildClientSchema, getIntrospectionQuery } from 'graphql';
import { replacePlaceholders } from '../../../../utils/utils';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { executeAPI } from '../../../../services/executeAPI';
import FilePicker from '../../../../commonComponents/FilePicker/FilePicker.Component';

function RequestBodyInput(props) {
    const { body, handleChange, bodyTabValue, requestFormUrlEncodeBody, validKeys, url, variableValuesExcludingRequest } = props;

    const [lineNumber, setLineNumber] = useState(0)
    const [gutterIconText, setGutterIconText] = useState("")
    const [iconType, setIconType] = useState("")
    const apiCollection = useSelector(state => state.apiTesterReducer.apiCollection)
    const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
    const currentTab = useSelector(state => state.apiTesterReducer.currentTab)
    const selectedTabContent = useSelector(state => state.apiTesterReducer.requestTabsContent[currentTab])
    const schema = selectedTabContent?.schema || {}
    const isSchemaFetched = selectedTabContent?.isSchemaFetched || false
    const isSchemaLoading = selectedTabContent?.isSchemaLoading || false
    const theme = useTheme();
    const dispatch = useDispatch();
    const [schemaAnchorEl, setSechemaAnchorEl] = useState(null);
    const openSchemaMenu = Boolean(schemaAnchorEl);

    const SchemMenu = (event) => {
        setSechemaAnchorEl(event.currentTarget)
    }

    const handleFileSelect = async () => {
        setSechemaAnchorEl(null); // Close the menu

        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json"; // Restrict to JSON files
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                const text = await file.text(); // Read file as text
                try {
                    const parsedJson = JSON.parse(text);
                    const clientSchema = buildClientSchema(parsedJson.data);
                    dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: { schema: clientSchema, isSchemaFetched: true, isSchemaLoading: false }, id: currentTab })
                } catch (error) {
                    dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: { isSchemaFetched: false, isSchemaLoading: false }, id: currentTab })
                    alert("Error parsing file: Please verify format of the schema is valid");
                }
            }
        };
        input.click(); // Trigger file selection dialog
    };


    const fetchSchema = async () => {
        setSechemaAnchorEl(null)
        let tempUrl = replacePlaceholders(url, validKeys)
        dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: { schema: {}, isSchemaFetched: false, isSchemaLoading: true }, id: currentTab })
        try {
            const introspectionQuery = getIntrospectionQuery();
            let headers = {};
            selectedTabContent.request.headers.map((reqHeader, index) => {
                if (reqHeader.isChecked) {
                    headers[`${reqHeader.key}`] = reqHeader.value
                }
            })
            let request = {
                method: 'POST',
                url: url,
                body: {
                    json: '',
                    graphql: {
                        query: introspectionQuery
                    }
                },
                headers: headers,
                bodyType: "graphql",
                auth: selectedTabContent.request?.auth || { authType: "none", basic: { username: "", password: "" }, bearer: [] },
                variablesValues: validKeys,
                variables: selectedTabContent.request?.variables || { preRequest: [], postResponse: [] },
                collectionScript: { preRequest: [], postResponse: [] },
                script: { preRequest: [], postResponse: [] },
                urlContent: selectedTabContent.request.urlContent,
                collectionId: selectedTabContent.collectionName,
                collectionName: apiCollection[selectedTabContent.collectionName].name,
                collectionAuth: apiCollection[selectedTabContent.collectionName].auth,
                variablesExcludingRequestVar: variableValuesExcludingRequest, // this needs to be fixed
                workspace: selectedWorkSpace,
            }
            const controller = new AbortController();
            const resp = await executeAPI({ payload: request, signal: controller.signal })
            let tempResponse = {}
            try {
                tempResponse = JSON.parse(resp.body);
            } catch (error) {
                tempResponse = {}
            }
            const clientSchema = buildClientSchema(tempResponse.data);
            dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: { schema: clientSchema, isSchemaFetched: true, isSchemaLoading: false }, id: currentTab })

        } catch (error) {
            dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: { isSchemaFetched: false, isSchemaLoading: false }, id: currentTab })
            alert("Error fetching schema: Please verify provided authorization, url and environment variables are valid");
        }
    }

    const handleBodyChange = (event, fieldId) => {

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
        handleChange(event, fieldId);
    }

    const handleFileChange = (event, index) => {
        const selectedFiles = Array.from(event.target.files);

        let body = { src: '' }
        selectedFiles.forEach(selectedFile => {
            const file = selectedFile;
            body.src = file.path

        })
        handleChange({ target: { value: body } }, 'body')
    }

    const renderBodyContent = useMemo(() => {
        switch (bodyTabValue) {
            case 'json':
                return <CodeEditor style={{ border: '1px solid #C8CDD7', boxSizing: 'border-box', borderRadius: '4px' }} isEditable={true} onChange={(event) => handleBodyChange(event, 'body')} value={body['json'] || ''} language={'customjson'} lineNumber={lineNumber} gutterIconText={gutterIconText} iconType={iconType} validKeys={validKeys} />;
            case 'xml':
                return <CodeEditor style={{ border: '1px solid #C8CDD7', boxSizing: 'border-box', borderRadius: '4px' }} isEditable={true} onChange={(event) => handleChange(event, 'body')} value={body['xml'] || ''} language={'customxml'} validKeys={validKeys} />;
            case 'text':
                return <CodeEditor style={{ border: '1px solid #C8CDD7', boxSizing: 'border-box', borderRadius: '4px' }} isEditable={true} onChange={(event) => handleChange(event, 'body')} value={body['text'] || ''} language={'customtext'} validKeys={validKeys} />;
            case 'form-data':
                return <FormDataInput value={body['form-data'] || []} onChange={(value) => handleChange({ target: { value: value } }, 'body')} validKeys={validKeys} />;
            case 'form-urlencoded':
                return <KeyValueInput language='customtext' value={requestFormUrlEncodeBody} onValueChange={(value) => handleChange({ target: { value: value } }, 'body')} validKeys={validKeys} />;
            case 'graphql':
                return <GraphQLInput onChange={(event) => handleChange(event, 'body')} value={body['graphql']} validKeys={validKeys} schema={schema} isSchemaFetched={isSchemaFetched} />;
            case 'noBody':
                return "No Body";
            case 'file':
                return (
                    <Box style={{ border: '1px solid', borderColor: theme.palette.divider, boxSizing: 'border-box', borderRadius: '4px', flexGrow: 1, padding: '4px', height: '100%' }}>
                        <FilePicker filepaths={body['file']?.src ? [body['file'].src] : []} multiple={false} index={0} handlefilechange={handleFileChange} />
                    </Box>
                );
            default:
                return <>Comming Soon</>;
        }
    })

    function formatJavaScriptCode(code) {
        switch (bodyTabValue) {
            case 'json': {
                try {
                    // Parse the JSON string to an object
                    const jsonObject = JSON.parse(body['json'] || '');

                    // Convert the object back to a string with formatting
                    const formattedCode = JSON.stringify(jsonObject, null, 2); // The '2' is the number of spaces for indentation
                    handleChange({ target: { value: formattedCode } }, 'body')
                } catch (error) {
                    // Handle JSON parsing errors
                    console.error("Error formatting code::", error);
                    return null;
                }
                return
            }
            case 'xml': {

                try {
                    const formattedCode = xmlFormatter(body['xml'], {
                        indentation: '  ', // Number of spaces per indentation level
                        filter: (node) => node.type !== 'Comment', // Optional: filter out nodes, e.g., comments
                        collapseContent: true, // Optional: collapse content between tags if it fits on one line
                        lineSeparator: '\n', // Line separator, default is '\n'
                    });

                    handleChange({ target: { value: formattedCode } }, 'body')
                } catch (error) {
                    console.error('Error formatting code:', error);
                }
                return
            }
        }

    }
    return (
        <Box style={{ position: 'relative', height: '100%', width: '100%', display: 'block' }}>
            <Grid style={{ height: '100%', width: '100%', position: 'absolute' }}>
                <Grid item style={{ height: '100%', width: '100%' }}>
                    <TabContext value={bodyTabValue}>
                        <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' }}>
                            <FormControl size="small" sx={{ margin: '4px 0px' }}>
                                <Select
                                    id="body"
                                    value={bodyTabValue}
                                    onChange={(event) => handleChange({ target: { value: event.target.value } }, 'bodyTab')}
                                >
                                    <MenuItem value={'noBody'}>No Body</MenuItem>
                                    <MenuItem value={'json'}>JSON</MenuItem>
                                    <MenuItem value={'xml'}>XML</MenuItem>
                                    <MenuItem value={'text'}>Text</MenuItem>
                                    <MenuItem value={'form-data'}>form-data</MenuItem>
                                    <MenuItem value={'form-urlencoded'}>form-urlencoded</MenuItem>
                                    <MenuItem value={'file'}>Binary/File</MenuItem>
                                    <MenuItem value={'graphql'}>GraphQL</MenuItem>
                                </Select>
                            </FormControl>
                            <Button style={{ display: bodyTabValue == 'json' || bodyTabValue == 'xml' ? 'inline-flex' : 'none', textTransform: 'none' }} onClick={() => { formatJavaScriptCode() }}>Format</Button>
                            <Box style={{ display: bodyTabValue == 'graphql' ? 'flex' : 'none', flexDirection: 'row', alignItems: 'center' }}>
                                {isSchemaLoading ? <CircularProgress size={16} /> : <>{isSchemaFetched ? <Typography sx={{ color: theme.palette.success.main }}>schema fetched</Typography> : <Typography sx={{ color: theme.palette.error.main }}>schema not fetched</Typography>}</>}
                                <Button onClick={(event) => { SchemMenu(event) }} sx={{
                                    textTransform: 'none'
                                }}>Fetch Schema</Button>
                                <Menu anchorEl={schemaAnchorEl} open={openSchemaMenu} onClose={() => { setSechemaAnchorEl(null) }}>
                                    <MenuItem onClick={() => fetchSchema()}><Typography sx={{}}>From Introspection</Typography></MenuItem>
                                    <MenuItem onClick={() => { handleFileSelect() }}><Typography>From File</Typography></MenuItem>
                                </Menu>
                            </Box>
                        </Box>
                    </TabContext>
                    <Box fontStyle={{ height: 'calc(100% - 48px)', boxSizing: 'border-box' }}> {renderBodyContent}</Box>
                </Grid>
            </Grid>
        </Box>
    );
}

RequestBodyInput.defaultProps = {
    body: {
        json: ''
    },
    bodyTabValue: '1',
    handleChange: () => { },
    requestFormUrlEncodeBody: [],
    url: "",
    variableValuesExcludingRequest: []
};

export default RequestBodyInput;
