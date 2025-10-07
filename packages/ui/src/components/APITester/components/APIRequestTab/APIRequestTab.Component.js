import React, { useState, useEffect } from 'react';
import '../../../../App.css';
import { Grid, InputLabel, Box, Typography, Tab, Tabs, FormControl, Select, MenuItem, Breadcrumbs, Link, IconButton } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import Button from '@mui/material/Button';
import styles from "./APIRequestTab.Style"
import KeyValueInput from '../../../../commonComponents/keyValueInput/KeyValueInput.Component';
import { updateCollectionRequest } from "../../../../services/updateCollectionRequest"
import { useDispatch, useSelector } from 'react-redux';
import TextToInput from '../../../../commonComponents/TextToInput/TextToInput.component';
import BottomPanel from '../../components/BottomPannel/BottomPanel'
import APIResponse from '../../components/APIResponse/APIResponse.Component';
import Authorization from '../../components/Authorization/Authorization.Component';
import RequestBodyInput from '../../components/RequestBodyInput/RequestBodyInput.Component';
import { HEADERS_AUTO_SUGGESTIONS } from '../../../../constants/constants';
import SingleLineEditor from '../../../../commonComponents/singleLineEditor/singleLineEditor';
import ValidationPannel from '../ValidationPannel/ValidationPannel.Component';
import { ASSERT_OPERATORS } from '../../../../constants/constants';
import {
    createVariablesValues,
    createVariablesValuesBasisPrecedence,
    handleExecute
} from '../../../../utils/utils';
import Variables from '../Variables/Variables.Component';
import cloneDeep from 'lodash/cloneDeep';
import { isValidFolderName } from '../../../../utils/validationUtil';
import HttpIcon from '@mui/icons-material/Http';
import MarkDownEditor from '../../../../commonComponents/markDownEditor/markDownEditor.Component';
import { v4 as uuidv4 } from 'uuid';

function APIRequestTab(props) {
    const { setTabsContentKeys } = props
    const classess = styles()

    const apiCollection = useSelector(state => state.apiTesterReducer.apiCollection)
    const currentTab = useSelector(state => state.apiTesterReducer.currentTab)
    const selectedTabContent = useSelector(state => state.apiTesterReducer.requestTabsContent[currentTab])
    const TabsContent = useSelector(state => state.apiTesterReducer.requestTabsContent)
    const isDeleteTabExecuted = useSelector(state => state.apiTesterReducer.isDeleteTabExecuted)
    const isTwoPane = useSelector(state => state.apiTesterReducer.isTwoPane || false)
    const variables = useSelector(state => state.variablesReducer.variables);
    const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
    const reducerClientCertificates = useSelector(state => state.settingsReducer.clientCertificates);
    const reducerCaCertificates = useSelector(state => state.settingsReducer.caCertificate);
    const reducerIsVerifyTLS = useSelector(state => state.settingsReducer.isVerifyTLS);
    const [isNameAlreadyExist, setIsNameAlreadyExist] = useState(false);
    const tokens = useSelector(state => state.authorizationReducer.tokens);

    const validKeys = createVariablesValuesBasisPrecedence(selectedTabContent.request?.variables?.preRequest || [], createVariablesValues(variables.selectedEnv, variables.envVariables, variables.globalVariables, TabsContent[selectedTabContent.collectionName]
        ? TabsContent[selectedTabContent.collectionName]?.collectionVariables
        : apiCollection[selectedTabContent.collectionName]?.collectionVariables || []))
    const variableValuesExcludingRequest = createVariablesValues(variables.selectedEnv, variables.envVariables, variables.globalVariables, TabsContent[selectedTabContent.collectionName]
        ? TabsContent[selectedTabContent.collectionName]?.collectionVariables
        : apiCollection[selectedTabContent.collectionName]?.collectionVariables || []);

    const [response, setResponse] = useState(selectedTabContent.response);
    const [isResponseLoading, setIsResponseLoading] = useState(selectedTabContent.isResponseLoading);

    let requestTabValue = selectedTabContent.requestTabValue || '1'
    const [nameError, setNameError] = useState(false);


    const dispatch = useDispatch()


    useEffect(() => {
        const TabsContentKeysa = Object.keys(TabsContent)
        setTabsContentKeys(TabsContentKeysa)
    }, [currentTab])

    useEffect(() => {
        setResponse(selectedTabContent.response)
        setIsResponseLoading(selectedTabContent.isResponseLoading)
    }, [selectedTabContent.response])

    useEffect(() => {
        // console.log("delete tab")
        if (isDeleteTabExecuted == true) {
            const TabsContentKeysa = Object.keys(TabsContent)
            setTabsContentKeys(TabsContentKeysa)
            dispatch({ type: "SET_IS_DELETE_TAB_EXECUTED", isDeleteTabExecuted: false })
        }
    }, [isDeleteTabExecuted])

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Check for cmd + s (Mac) or ctrl + s (Windows/Linux)
            if ((event.metaKey || event.ctrlKey) && event.key === 's') {
                event.preventDefault(); // Prevent the default save dialog
                if (selectedTabContent.isSaved || nameError) {

                } else {
                    handleSaveRequest(); // Call the handle save function
                }
            }
        };

        // Add event listener for keydown
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentTab, selectedTabContent, nameError]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Check for cmd + Enter (Mac) or ctrl + Enter (Windows/Linux)
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault(); // Prevent the default save dialog
                if (!selectedTabContent.isResponseLoading) {
                    handleSend();
                }
            }
        };

        // Add event listener for keydown
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentTab, selectedTabContent.isResponseLoading]);


    function parseQueryString(queryString) {
        let questionMarkIndex = queryString.indexOf('?');

        if (questionMarkIndex === -1) {
            return [];
        } else {
            queryString = queryString.substring(questionMarkIndex + 1, queryString.length);
        }


        // Split the query string into key-value pairs
        let pairs = queryString.split('&');

        // Initialize the result array
        let result = [];

        // Iterate over each pair
        pairs.forEach(pair => {
            // Split each pair into key and value
            let [key, value] = pair.split('=');

            // Push the structured object into the result array
            result.push({
                isChecked: true,
                key: key,
                value: value ? value : '',
                type: "text"
            });
        });

        // Return the result array
        return result;
    }

    function updateRequestURLField(request, fieldId, newValue) {
        if (fieldId === "urlContent") {
            // Update the urlContent
            request.urlContent = newValue;
            try {


                // Reconstruct the URL with updated query parameters
                let url = new URL(request.url);
                url.search = ''; // Clear existing query params
                newValue.query.forEach(param => {
                    if (param.isChecked) {
                        url.searchParams.append(param.key, param.value);
                    }
                });
                request.url = url.toString();
            } catch (error) {
                let queryString = "?"
                newValue.query.forEach(param => {
                    if (param.isChecked) {
                        // url.searchParams.append(param.key, param.value);
                        queryString += `${param.key}=` + `${param.value}&`
                    }
                });
                queryString = queryString.slice(0, -1);
                request.url = request.url.split('?')[0] + queryString;
            }

            // setUrl(request.url)
        } else if (fieldId === "url") {
            // Update the url
            request.url = newValue;

            // Parse the URL and update the urlContent
            try {
                let url = new URL(newValue);
                request.urlContent = { query: [] };
                url.searchParams.forEach((value, key) => {
                    request.urlContent?.query?.push({
                        isChecked: true,
                        key: key,
                        value: value,
                        type: "text"
                    });
                });
            } catch (error) {
                request.urlContent = { query: [] };
                request.urlContent.query = parseQueryString(request.url);
            }

        }
        return request;
    }


    const handleChange = (event, fieldId) => {
        if (selectedTabContent.type == "REQUEST_EXAMPLE") {
            return
        }
        const { value } = event.target;

        if (fieldId == "name") {
            setNameError(isValidFolderName(value))
        }
        let selectedRequest = {
            isSaved: false,
            type: "Request",
            path: selectedTabContent.path,
            namePath: selectedTabContent.namePath,
            collectionName: selectedTabContent?.collectionName,
            collectionDisplayName: selectedTabContent?.collectionDisplayName,
            request: {
                ...selectedTabContent.request,
                name: selectedTabContent?.request.name || "",
                id: selectedTabContent.request.id,
                method: selectedTabContent.request.method,
                url: selectedTabContent.request.url,
                body: selectedTabContent.request.body,
                headers: selectedTabContent.request.headers,
                bodyType: selectedTabContent.request.bodyType,
                auth: selectedTabContent.request.auth,
                urlContent: selectedTabContent.request.urlContent,
                docs: selectedTabContent.request.docs
            }
        }
        if (fieldId !== "bodyTab" && fieldId != 'body') {
            selectedRequest.request[`${fieldId}`] = value;
            if (fieldId === "urlContent" || fieldId === "url") {
                selectedRequest.request = updateRequestURLField(selectedRequest.request, fieldId, value)
            }
        } else if (fieldId == "bodyTab") {
            selectedRequest.request.bodyType = value;
            let bodyVal = selectedTabContent.request.body
            if (value == 'form-urlencoded') {
                // bodyVal[value] = selectedTabContent.request.bodyType == 'form-urlencoded' ? selectedTabContent.request.body['form-urlencoded'] ? selectedTabContent.request.body['form-urlencoded'] : [] : []
                // setBody(bodyVal)
            }
            selectedRequest.request.body = bodyVal
        } else if (fieldId == 'body') {
            let bodyVal = selectedTabContent.request.body || {}
            bodyVal[`${selectedTabContent.request.bodyType || 'json'}`] = value
            selectedRequest.request.body = bodyVal;
        }

        dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: currentTab })
    }

    const recursiveExecute = async (apiRequestVar, variablesValues, variablesValuesRef, collectionId, apiCollection, tabId, signal, shouldOpenTab, executedRequests = new Set(), isAPICall = false) => {
        let apiRequest = cloneDeep(apiRequestVar)
        if (signal.aborted) {
            return;
        }
        // Check if the request has already been executed
        if (executedRequests.has(apiRequest.id)) {
            return;
        }

        // Mark this request as executed
        executedRequests.add(apiRequest.id);

        if (signal.aborted) {
            return;
        }
        const clonedTabContent = cloneDeep(selectedTabContent);
        const collectionVariable = TabsContent[clonedTabContent.collectionName]
            ? TabsContent[clonedTabContent.collectionName]?.collectionVariables
            : apiCollection[clonedTabContent.collectionName]?.collectionVariables || [];
        variablesValues = createVariablesValues(variablesValuesRef.selectedEnv, variablesValuesRef.envVariables, variablesValuesRef.globalVariables, collectionVariable);
        const certificates = {
            clientCertificates: reducerClientCertificates,
            caCertificate: reducerCaCertificates,
            isVerifyTLS: reducerIsVerifyTLS
        };
        // Oauth2 token addition in header
        if ((apiRequest?.auth?.authType === 'oauth2' && apiRequest?.auth?.oauth2?.currentToken?.tokenName != "none") ||
            (apiRequest?.auth?.authType === 'inherit' && apiCollection?.[collectionId]?.auth?.authType === 'oauth2' && apiCollection?.[collectionId]?.auth?.oauth2?.currentToken?.tokenName != "none")) {

            const sourceAuth = apiRequest?.auth?.authType === 'oauth2' ? apiRequest.auth.oauth2 : apiCollection[collectionId]?.auth?.oauth2;
            const OAuthToken = tokens.find(t => t.name === sourceAuth?.currentToken?.tokenName)?.token?.access_token || '';
            const authHeaderPrefix = sourceAuth?.currentToken?.headerPrefix || 'Bearer ';
            const authHeaderValue = authHeaderPrefix + OAuthToken;

            if (apiRequest?.headers) {
                const authHeaderIndex = apiRequest.headers.findIndex(header => header.key.toLowerCase() === 'authorization');

                if (authHeaderIndex !== -1) {
                    // Replace existing Authorization header
                    apiRequest.headers[authHeaderIndex].value = authHeaderValue;
                } else {
                    // Add new Authorization header
                    apiRequest.headers.push({
                        isChecked: true,
                        key: 'Authorization',
                        value: authHeaderValue,
                        type: 'text'
                    });
                }
            } else {
                apiRequest.headers = []
                const authHeaderIndex = apiRequest.headers.findIndex(header => header.key.toLowerCase() === 'authorization');

                if (authHeaderIndex !== -1) {
                    // Replace existing Authorization header
                    apiRequest.headers[authHeaderIndex].value = authHeaderValue;
                } else {
                    // Add new Authorization header
                    apiRequest.headers.push({
                        isChecked: true,
                        key: 'Authorization',
                        value: authHeaderValue,
                        type: 'text'
                    });
                }
            }
        }

        const result = await handleExecute(apiRequest, variablesValues, collectionId, apiCollection, selectedWorkSpace, signal, variablesValuesRef.globalVariables?.values, variablesValuesRef.envVariables?.[variablesValuesRef.selectedEnv]?.values || [], variablesValuesRef.envVariables?.[variablesValuesRef.selectedEnv]?.name || "none", certificates);

        variablesValuesRef.globalVariables = result.globalVariables

        dispatch({ type: "SET_GLOBAL_VARIABLES", globalVariables: result.globalVariables })
        if ((variablesValuesRef.envVariables?.[variablesValuesRef.selectedEnv]?.name || "none") != "none") {
            variablesValuesRef.envVariables = result.envVariables
            dispatch({ type: "SET_ENV_VARIABLES", envVariables: result.envVariables })
        }
        if (!isAPICall) {
            dispatch({ type: "SET_RESPONSE", response: result.apiResponse, isResponseLoading: false, id: tabId });
            dispatch({ type: "SET_ASSERT_RESULT", assertResults: result.assertResults, isResponseLoading: false, id: tabId });
        }
        dispatch({ type: "SET_API_COLLECTION", apiCollection: result.collectionResponse });
        if (TabsContent[collectionId]) {
            let selectedRequest = {
                isSaved: true,
                collectionVariables: result.collectionVar
            };
            dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: collectionId });
        }

        return { variablesValuesRef };
    }

    const handleSend = async () => {
        const clonedTabContent = cloneDeep(selectedTabContent);

        // variables that will be used to replace placholder {{}} with variables values if placholder key matches with variable key
        const collectionVariable = TabsContent[clonedTabContent.collectionName]
            ? TabsContent[clonedTabContent.collectionName]?.collectionVariables
            : apiCollection[clonedTabContent.collectionName]?.collectionVariables || [];
        let variablesValues = createVariablesValues(variables.selectedEnv, variables.envVariables, variables.globalVariables, collectionVariable);

        // variablesValues = createVariablesValuesBasisPrecedence([...clonedTabContent.request?.variables?.preRequest || []], variablesValues);
        dispatch({ type: "SET_IS_RESPONSE_LOADING", isResponseLoading: true, id: currentTab });
        const apiRequest = {
            ...selectedTabContent.request,
            method: selectedTabContent.request.method,
            url: selectedTabContent.request.url,
            headers: selectedTabContent.request.headers,
            auth: selectedTabContent.request.auth || {},
            bodyType: selectedTabContent.request.bodyType || 'noBody',
            body: selectedTabContent.request.body,
            urlContent: clonedTabContent.request.urlContent,
            variables: clonedTabContent.request.variables,
        };
        const controller = new AbortController();
        dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: { abortController: controller }, id: currentTab });

        let variablesValuesRef = {
            selectedEnv: variables.selectedEnv,
            envVariables: variables.envVariables,
            globalVariables: variables.globalVariables,
        };

        await recursiveExecute(apiRequest, variablesValues, variablesValuesRef, clonedTabContent.collectionName, apiCollection, currentTab, controller.signal, false);
        let selectedRequest = {
            isResponseLoading: false,
        }
        dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: currentTab });
    };

    const handleCancelClick = () => {
        if (selectedTabContent.abortController) {
            selectedTabContent.abortController.abort(); // Cancel the execution
            dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: { abortController: null }, id: currentTab });
        }
    };

    const handleSaveRequest = (reqExamples = null) => {
        let payload = {
            path: selectedTabContent.path,
            collectionName: selectedTabContent?.collectionName,
            workspace: selectedWorkSpace,
            request: {
                ...selectedTabContent.request,
                name: selectedTabContent?.request.name || "",
                id: selectedTabContent.request.id,
                method: selectedTabContent.request.method,
                headers: selectedTabContent.request.headers,
                body: selectedTabContent.request.body,
                url: selectedTabContent.request.url,
                bodyType: selectedTabContent.request.bodyType || 'noBody',
                auth: selectedTabContent.request.auth,
                urlContent: selectedTabContent.request.urlContent,
                docs: selectedTabContent.request.docs
            }
        }
        if (reqExamples != null) {
            payload.request['examples'] = reqExamples
        }
        updateCollectionRequest(payload).then((resp) => {
            if (resp.error) {
                setIsNameAlreadyExist(true)
            } else {
                setIsNameAlreadyExist(false)
                dispatch({ type: "SET_API_COLLECTION", apiCollection: resp })
                let selectedRequest = {
                    isSaved: true,
                    type: "Request",
                    path: selectedTabContent.path,
                    namePath: selectedTabContent.namePath,
                    collectionName: selectedTabContent?.collectionName,
                    collectionDisplayName: selectedTabContent?.collectionDisplayName,
                    request: {
                        ...selectedTabContent.request,
                        name: selectedTabContent.request.name,
                        id: selectedTabContent.request.id,
                        method: selectedTabContent.request.method,
                        url: selectedTabContent.request.url,
                        body: selectedTabContent.request.body,
                        headers: selectedTabContent.request.headers,
                        bodyType: selectedTabContent.request.bodyType || 'noBody',
                        auth: selectedTabContent.request.auth,
                        urlContent: selectedTabContent.request.urlContent,
                        docs: selectedTabContent.request.docs
                    }
                }
                dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: currentTab })
            }
        })
    }

    const handleRequestTabChange = (event, newValue) => {
        dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: { requestTabValue: newValue }, id: currentTab })
    };


    const handleBreadCrumbsClick = (event) => {
        event.preventDefault();
    }

    const renderPath = () => {
        return (
            <div role="presentation" onClick={handleBreadCrumbsClick}>
                <Breadcrumbs aria-label="breadcrumb">
                    {selectedTabContent?.collectionDisplayName && (<Link underline="hover" color="inherit" href="/">
                        {selectedTabContent?.collectionDisplayName}
                    </Link>)}
                    {selectedTabContent.namePath.map((p, index) => {
                        return (
                            <Link
                                key={index}
                                underline="hover"
                                color="inherit"
                                href="/material-ui/getting-started/installation/"
                            >
                                {p.name}
                            </Link>
                        )
                    })}
                    <TextToInput inputText={selectedTabContent?.request.name || ""} setInputText={(event) => handleChange(event, 'name')} error={nameError || isNameAlreadyExist} errorMsg={(nameError && "invalid file name") || (isNameAlreadyExist && "name already exist")} />
                </Breadcrumbs>
            </div>
        );
    }

    const formatJSONString = (jsonString) => {
        try {
            // Check if the input is a byte array (Uint8Array, Buffer, etc.)
            if (typeof jsonString === 'object' && jsonString !== null && !Array.isArray(jsonString)) {
                const byteArray = Object.values(jsonString);
                jsonString = new TextDecoder('utf-8').decode(new Uint8Array(byteArray));
            }

            // Parse the JSON string into an object
            const jsonObj = JSON.parse(jsonString);

            // Convert the object back to a JSON string with indentation
            const formattedJSON = JSON.stringify(jsonObj, null, "\t");

            return formattedJSON;
        } catch (error) {
            // Handle the case where it's not a valid JSON or is binary data (like an image)
            // console.error('Error formatting JSON:', error, jsonString);
            return jsonString; // Return the original input if formatting fails
        }
    };

    const saveResponse = () => {
        let response = selectedTabContent.response
        let examples = selectedTabContent.request?.examples || []
        let name = selectedTabContent.request.name + ": Example" + examples.length;
        let contentType = response?.headers ? response.headers["content-type"] : '' || ''
        let value = {
            id: uuidv4(),
            name: name,
            originalRequest: {
                method: selectedTabContent.request.method,
                url: selectedTabContent.request.url,
                urlContent: selectedTabContent.request.urlContent,
                headers: selectedTabContent.request.headers,
                bodyType: selectedTabContent.request.bodyType || 'noBody',
                body: selectedTabContent.request.body,
            },
            response: {
                status: response?.status,
                statusText: response?.statusText,
                timeTaken: response?.timeTaken,
                responseSizeKB: response?.responseSizeKB,
                headers: response?.headers || {},
                body: contentType && contentType.startsWith('image/') ? response?.body : formatJSONString(response?.body || '')
            }
        }

        value.name = name
        examples.push(value)
        handleChange({ target: { value: examples } }, 'examples')
        handleSaveRequest(examples)
    }

    return (
        <Box style={{ display: "flex", flexDirection: 'column', flexGrow: 1 }}>
            <Grid container wrap='nowrap' style={{ flexDirection: 'column', gap: "10px", justifyContent: "space-between", overflow: "auto", position: "relative", flexGrow: 1 }}>
                <Grid item style={{ backgroundColor: "background.default", zIndex: 56 }}>

                    <Grid container style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: "2px", padding: "0 5px", height: "38px" }}>
                        <Grid item><Grid container style={{ gap: "10px", flexDirection: "row", alignItems: 'center' }}>
                            <HttpIcon className={classess.GET} />
                            <InputLabel>{renderPath()}</InputLabel>
                        </Grid>
                        </Grid>
                        <Button disabled={selectedTabContent.isSaved || nameError} variant='contained' size="small" style={{ height: "38px", display: selectedTabContent.type == "REQUEST_EXAMPLE" ? 'none' : 'flex' }} onClick={() => handleSaveRequest()}>Save</Button>
                    </Grid>
                    <Grid container style={{ gap: "5px", flexDirection: "row", padding: "0 5px" }}>
                        <Box className={classess.method}>
                            <FormControl size="small" fullWidth>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={selectedTabContent.request.method}
                                    onChange={(event) => handleChange(event, 'method')}
                                >
                                    <MenuItem value={"GET"}><Typography className={classess.GET}>GET</Typography></MenuItem>
                                    <MenuItem value={"POST"}><Typography className={classess.POST}>POST</Typography></MenuItem>
                                    <MenuItem value={"PUT"}><Typography className={classess.PUT}>PUT</Typography></MenuItem>
                                    <MenuItem value={"DELETE"}><Typography className={classess.DELETE}>DELETE</Typography></MenuItem>
                                    <MenuItem value={"PATCH"}><Typography className={classess.PATCH}>PATCH</Typography></MenuItem>
                                    <MenuItem value={"HEAD"}><Typography className={classess.HEAD}>HEAD</Typography></MenuItem>
                                    <MenuItem value={"OPTIONS"}><Typography className={classess.OPTIONS}>OPTIONS</Typography></MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <SingleLineEditor
                            value={selectedTabContent.request?.url || ''}
                            onChange={(value) => handleChange({ target: { value: value } }, 'url')}
                            placeholder='Enter URL'
                            language='customtext'
                            handleEnter={handleSend}
                            isLoading={selectedTabContent.isResponseLoading}
                            validKeys={validKeys}
                            style={{ width: "100%" }}
                        />
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                                if (selectedTabContent.isResponseLoading) {
                                    handleCancelClick();
                                } else {
                                    handleSend();
                                }
                            }}
                            disabled={selectedTabContent.type == "REQUEST_EXAMPLE"}
                        >
                            {selectedTabContent.isResponseLoading ? 'Cancel' : 'Send'}
                        </Button>
                    </Grid>
                </Grid>

                <Grid style={{ position: "relative", overflowY: "hidden", overflowX: "hidden", flexGrow: 1, display: 'flex', flexDirection: 'row', paddingBottom: '4px' }}>
                    <Box style={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box style={{ position: 'absolute', width: '100%', height: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <TabContext value={requestTabValue}>
                                <Tabs value={requestTabValue} allowScrollButtonsMobile variant='scrollable' style={{ height: "36px", position: "relative", zIndex: 20, background: "background.default", overflow: 'hidden' }} onChange={handleRequestTabChange} aria-label="lab API tabs example">
                                    <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", minWidth: "0px", margin: '0px 10px', padding: '0px' }} label="Body" value="1" />
                                    <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", minWidth: "0px", margin: '0px 10px', padding: '0px' }} label={`Headers ${selectedTabContent.request?.headers?.length || 0}`} value="2" />
                                    <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", minWidth: "0px", margin: '0px 10px', padding: '0px', display: selectedTabContent.type == "REQUEST_EXAMPLE" ? 'none' : 'flex' }} label="Auth" value="3" />
                                    <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", minWidth: "0px", margin: '0px 10px', padding: '0px' }} label="Params" value="5" />
                                    <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", minWidth: "0px", margin: '0px 10px', padding: '0px', display: selectedTabContent.type == "REQUEST_EXAMPLE" ? 'none' : 'flex' }} label="Variables" value="8" />
                                    <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", minWidth: "0px", margin: '0px 10px', padding: '0px', display: selectedTabContent.type == "REQUEST_EXAMPLE" ? 'none' : 'flex' }} label="Validations" value="7" />
                                    <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", minWidth: "0px", margin: '0px 10px', padding: '0px', display: selectedTabContent.type == "REQUEST_EXAMPLE" ? 'none' : 'flex' }} label="Docs" value="docs" />
                                </Tabs>
                                <TabPanel style={{ display: 'flex', flexDirection: 'column', padding: "0px 2px", marginTop: "0px", position: "relative", flexGrow: requestTabValue == "1" ? 1 : 0 }} value="1">
                                    <RequestBodyInput body={selectedTabContent.request?.body || {}} handleChange={handleChange} bodyTabValue={selectedTabContent.request?.bodyType || "noBody"} requestFormUrlEncodeBody={selectedTabContent.request.bodyType == 'form-urlencoded' ? selectedTabContent.request.body?.['form-urlencoded'] ? selectedTabContent.request.body['form-urlencoded'] : [] : []} validKeys={validKeys} url={selectedTabContent?.request?.url || ""} variableValuesExcludingRequest={variableValuesExcludingRequest} />
                                </TabPanel>
                                <TabPanel style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: "0px 2px", marginTop: "0px", position: "relative", flexGrow: requestTabValue == "2" ? 1 : 0 }} value="2">
                                    <KeyValueInput value={selectedTabContent.request?.headers || []} onValueChange={(value) => handleChange({ target: { value: value } }, 'headers')} autoSuggestions={HEADERS_AUTO_SUGGESTIONS} validKeys={validKeys} />
                                </TabPanel>
                                <TabPanel style={{ display: 'flex', flexDirection: 'column', padding: "0px 2px", marginTop: "0px", position: "relative", flexGrow: requestTabValue == "3" ? 1 : 0 }} value="3">
                                    <Authorization value={selectedTabContent.request?.auth || { authType: 'none' }} onChange={handleChange} showInherit={true} validKeys={validKeys} />
                                </TabPanel>
                                <TabPanel style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: "0px 2px", marginTop: "0px", position: "relative", flexGrow: requestTabValue == "5" ? 1 : 0 }} value="5">
                                    <Typography style={{ fontSize: '15px' }}>Query Params</Typography>
                                    <KeyValueInput language='customtext' value={selectedTabContent.request?.urlContent?.query || []} onValueChange={(value) => handleChange({ target: { value: { ...(selectedTabContent.request?.urlContent || {}), query: value } } }, 'urlContent')} validKeys={validKeys} />
                                </TabPanel>
                                <TabPanel style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: "0px 2px", marginTop: "0px", position: "relative", flexGrow: requestTabValue == "7" ? 1 : 0 }} value="7">
                                    <ValidationPannel language='text' autoSuggestions={ASSERT_OPERATORS} value={selectedTabContent.request?.validation || selectedTabContent.request?.assert || []} onChange={(value) => handleChange({ target: { value: value } }, 'validation')} />
                                </TabPanel>
                                <TabPanel style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: "0px 2px", marginTop: "0px", position: "relative", flexGrow: requestTabValue == "8" ? 1 : 0 }} value="8">
                                    <Variables value={selectedTabContent.request.variables || { preRequest: '', postResponse: '' }} onChange={(value) => handleChange({ target: { value: value } }, 'variables')} validKeys={validKeys} />
                                </TabPanel>
                                <TabPanel style={{ display: 'flex', flexDirection: 'column', overflowY: 'scroll', alignItems: 'flex-start', padding: "0px 2px", marginTop: "0px", position: "relative", flexGrow: requestTabValue == "docs" ? 1 : 0, width: requestTabValue == "docs" ? '100%' : '0%' }} value="docs">
                                    <MarkDownEditor markdownText={selectedTabContent.request?.docs || []} handleInputChange={handleChange} />
                                </TabPanel>
                            </TabContext>
                        </Box>
                    </Box>
                    <BottomPanel style={{ height: '100%', display: isTwoPane ? 'flex' : 'none' }} isTwoPane={true}>
                        <APIResponse response={selectedTabContent.response} testResults={selectedTabContent.testResults} isTwoPane={true} isResponseLoading={selectedTabContent.isResponseLoading} saveResponse={saveResponse} showSaveResponseButton={selectedTabContent.type == "REQUEST_EXAMPLE" ? false : true} />
                    </BottomPanel>

                </Grid>

            </Grid>
            <BottomPanel style={{ display: isTwoPane ? 'none' : 'flex', width: '100%' }}>
                <APIResponse response={selectedTabContent.response} testResults={selectedTabContent.testResults} isResponseLoading={selectedTabContent.isResponseLoading} saveResponse={saveResponse} showSaveResponseButton={selectedTabContent.type == "REQUEST_EXAMPLE" ? false : true} />
            </BottomPanel>
        </Box>
    );
}

export default APIRequestTab;
