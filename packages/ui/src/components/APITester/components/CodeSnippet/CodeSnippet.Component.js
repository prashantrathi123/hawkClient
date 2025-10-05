import React, { useState, useEffect } from 'react';
import { Box, Grid, FormControl, Select, MenuItem } from '@mui/material';
import CodeEditor from '../../../../commonComponents/codeEditor/codeEditor';
import { convertToHar, getPlaceholdersReplacedAuth } from '../../../../utils/utils';
import { getHttpSnippet } from '../../../../services/httpSnippetService';
import { useSelector } from 'react-redux';
import cloneDeep from 'lodash/cloneDeep';

function CodeSnippet(props) {
    const { request, variablesValues } = props;
    const [language, setLanguage] = useState('golang');
    const [codeString, setCodeString] = useState('');
    const [payload, setPayload] = useState({ harRequest: {} });
    const tokens = useSelector(state => state.authorizationReducer.tokens);

    const handleChange = async (event) => {
        setLanguage(event.target.value);
        switch (event.target.value) {
            case 'golang':
                payload.target = 'go'
                payload.client = null
                await getHttpSnippet(payload).then((resp) => {
                    setCodeString(resp);
                })
                break;
            case 'javascript':
                payload.target = 'javascript'
                payload.client = null
                await getHttpSnippet(payload).then((resp) => {
                    setCodeString(resp);
                })
                break;
            case 'python':
                payload.target = 'python'
                payload.client = null
                await getHttpSnippet(payload).then((resp) => {
                    setCodeString(resp);
                })
                break;
            case 'java':
                payload.target = 'java'
                payload.client = null
                await getHttpSnippet(payload).then((resp) => {
                    setCodeString(resp);
                })
                break;
            case 'sh':
                payload.target = 'shell'
                payload.client = 'curl'
                await getHttpSnippet(payload).then((resp) => {
                    setCodeString(resp);
                })
                break;
            case 'node':
                payload.target = 'node'
                payload.client = null
                await getHttpSnippet(payload).then((resp) => {
                    setCodeString(resp);
                })
                break;
            default:
                break;
        }
    };
    useEffect(() => {
        let apiRequest = cloneDeep(request)
        if (apiRequest?.auth?.authType === 'oauth2' && apiRequest?.auth?.oauth2?.currentToken?.tokenName != "none") {
            // console.log("Auth2", apiRequest?.auth)
            const sourceAuth = apiRequest.auth.oauth2
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
        const harRequest = convertToHar(apiRequest, variablesValues);
        const tempPayload = { ...payload }
        tempPayload.harRequest = harRequest;
        tempPayload.auth = getPlaceholdersReplacedAuth(apiRequest.auth, variablesValues)
        setPayload(tempPayload);
        tempPayload.target = 'go'
        tempPayload.client = null
        getHttpSnippet(tempPayload).then((resp) => {
            setLanguage('golang');
            setCodeString(resp);
        })
    }, [request])

    return (
        <Box style={{ position: 'relative', height: '100%', width: '100%', display: 'block' }}>
            <Grid style={{ display: 'flex', height: '100%', width: '100%', position: 'absolute', gap: '10px' }}>
                <Grid item style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
                    <FormControl sx={{ m: 1, minWidth: 120, margin: '4px 0px 2px 0px' }} size="small" >
                        <Select
                            id="snippet"
                            value={language}
                            onChange={handleChange}
                        >
                            <MenuItem value={'golang'}>golang</MenuItem>
                            <MenuItem value={'javascript'}>javascript</MenuItem>
                            <MenuItem value={'python'}>python</MenuItem>
                            <MenuItem value={'java'}>java unirest</MenuItem>
                            <MenuItem value={'sh'}>shell curl</MenuItem>
                            <MenuItem value={'node'}>node</MenuItem>
                        </Select>
                    </FormControl>
                    <CodeEditor
                        style={{ border: '1px solid #C8CDD7', height: 'calc(100% - 46px)', boxSizing: 'border-box', borderRadius: '4px' }}
                        isEditable={false}
                        onChange={(event) => { }}
                        value={codeString}
                        language={language === 'node' ? 'javascript' : language}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

CodeSnippet.defaultProps = {
    request: {},
    variablesValues: []
};

export default CodeSnippet;