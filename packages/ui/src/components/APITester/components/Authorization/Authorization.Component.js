import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Tab, TextField, Tabs, FormControl, Select, MenuItem, InputLabel, Divider, Button } from '@mui/material';
import { TabContext, TabPanel, TabList } from '@mui/lab';
import SingleLineEditor from '../../../../commonComponents/singleLineEditor/singleLineEditor';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import ManageTokensDialog from './components/ManageTokensDialog';
import { executeAPI } from '../../../../services/executeAPI';

function Authorization(props) {
    const theme = useTheme();
    const dispatch = useDispatch()

    const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
    const currentTab = useSelector(state => state.apiTesterReducer.currentTab)
    const selectedTabContent = useSelector(state => state.apiTesterReducer.requestTabsContent[currentTab])
    const apiCollection = useSelector(state => state.apiTesterReducer.apiCollection)

    const tokens = useSelector(state => state.authorizationReducer.tokens)

    const { onChange, value, showInherit, validKeys } = props;
    const [authorizationTabValue, setAuthorizationTabValue] = useState('1')
    const [basicAuthValues, setBasicAuthValues] = useState({
        username: '',
        password: ''
    });

    const getAuthTypeByTabValue = (condition) => {
        switch (condition) {
            case '1':
                return 'none'
            case '2':
                return 'bearer'
            case '3':
                return 'basic'
            case '4':
                return 'oauth2'
            case '5':
                return 'inherit'
            case '6':
                return 'awsV4'
            case 'digest':
                return 'digest'
            case 'ntlm':
                return 'ntlm'
            default:
                return 'none'
        }
    }

    const getTabValueByAuthType = (condition) => {
        switch (condition) {
            case 'none':
                return '1'
            case 'bearer':
                return '2'
            case 'basic':
                return '3'
            case 'oauth2':
                return '4'
            case 'inherit':
                return '5'
            case 'awsV4':
                return '6'
            case 'digest':
                return 'digest'
            case 'ntlm':
                return 'ntlm'
            default:
                return '1'
        }
    }

    useEffect(() => {
        let authType = value?.authType || 'none'
        const tabValue = getTabValueByAuthType(authType)
        setAuthorizationTabValue(tabValue)
        const username = value.basic?.username || '';
        const password = value.basic?.password || '';
        setBasicAuthValues({ username, password });
    }, [value])

    const handleAuthorizationTabChange = (event, val) => {
        let authType = getAuthTypeByTabValue(val)
        let authVal = value
        authVal.authType = authType
        onChange({ target: { value: authVal } }, 'auth')
        setAuthorizationTabValue(val)
    }

    const handleAuthChange = (event, authType, key) => {
        const keyValue = event.target.value;
        let authVal = { ...value }; // Create a copy of the value to avoid direct mutation

        if (authType === 'bearer') {
            let bearerTempValue = [{
                key: key,
                value: keyValue,
                type: 'string'
            }];
            authVal.bearer = bearerTempValue;
            onChange({ target: { value: authVal } }, 'auth');
        }

        if (authType === 'basic') {
            let basicTempVal = {
                ...authVal.basic
            };
            basicTempVal[`${key}`] = keyValue;
            authVal.basic = basicTempVal;
            onChange({ target: { value: authVal } }, 'auth');
        }
        if (authType === 'awsV4') {
            let tempAwsV4 = { ...authVal.awsV4 };
            tempAwsV4[`${key}`] = keyValue
            authVal.awsV4 = tempAwsV4;
            onChange({ target: { value: authVal } }, 'auth');
        }
        if (authType === 'oauth2') {
            let tempOauth2 = {
                ...authVal.oauth2,
                currentToken: {
                    ...authVal.oauth2?.currentToken, // Ensure currentToken exists
                }
            };

            // If the key belongs to `currentToken`, update it there
            if (key.startsWith("currentToken.")) {
                const nestedKey = key.replace("currentToken.", ""); // Extract actual key inside `currentToken`
                if (nestedKey == 'tokenName') {
                    if (keyValue == "manage") {
                        dispatch({ type: 'SET_OPEN_MANAGE_TOKENS', openManageTokens: true })
                    } else {
                        tempOauth2.currentToken[nestedKey] = keyValue;
                    }

                } else {
                    tempOauth2.currentToken[nestedKey] = keyValue;
                }
            } else {
                tempOauth2[`${key}`] = keyValue
            }

            authVal.oauth2 = tempOauth2;
            onChange({ target: { value: authVal } }, 'auth');
        }
        if (authType == 'digest') {
            let tempDigest = { ...authVal.digest };
            tempDigest[`${key}`] = keyValue
            authVal.digest = tempDigest;
            onChange({ target: { value: authVal } }, 'auth');
        }
        if (authType == 'ntlm') {
            let tempNtlm = { ...authVal.ntlm };
            tempNtlm[`${key}`] = keyValue
            authVal.ntlm = tempNtlm;
            onChange({ target: { value: authVal } }, 'auth');
        }
    };

    const getGrantType = (authType) => {
        const grantTypeMapping = {
            authCode: "authorization_code",
            authCodePKCE: "authorization_code", // PKCE still uses "authorization_code"
            implicit: "implicit",
            passwordCred: "password",
            clientCred: "client_credentials"
        };

        return grantTypeMapping[authType] || "";
    };

    const getOAuthRequest = (code = '') => {
        const request = {
            method: 'POST',
            url: value?.oauth2?.accessTokenUrl || '',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
            },
            auth: value?.oauth2?.clientAuthentication === "clientCredInBody" ? {
                authType: 'none'
            } : {
                authType: 'basic',
                basic: {
                    username: value?.oauth2?.clientId || '',
                    password: value?.oauth2?.clientSecret || '',
                }
            },
            bodyType: 'form-urlencoded',
            body: {
                "form-urlencoded": [
                    {
                        isChecked: true,
                        key: "grant_type",
                        value: getGrantType(value?.oauth2?.grantType || "clientCred"),
                        type: "text"
                    },
                    ...(value?.oauth2?.scope ? [{
                        isChecked: true,
                        key: "scope",
                        value: value.oauth2.scope,
                        type: "text"
                    }] : []),
                    ...(value?.oauth2?.grantType === "passwordCred"
                        ? [
                            {
                                isChecked: true,
                                key: "username",
                                value: value?.oauth2?.username || '',
                                type: "text"
                            },
                            {
                                isChecked: true,
                                key: "password",
                                value: value?.oauth2?.password || '',
                                type: "text"
                            }
                        ]
                        : []),
                    ...(value?.oauth2?.clientAuthentication === "clientCredInBody"
                        ? [
                            {
                                isChecked: true,
                                key: "client_id",
                                value: value?.oauth2?.clientId || '',
                                type: "text"
                            },
                            {
                                isChecked: true,
                                key: "client_secret",
                                value: value?.oauth2?.clientSecret || '',
                                type: "text"
                            }
                        ]
                        : []),
                    ...(value?.oauth2?.grantType === "authCode"
                        ? [
                            {
                                isChecked: true,
                                key: "code",
                                value: code || '',
                                type: "text"
                            },
                            {
                                isChecked: true,
                                key: "redirect_uri",
                                value: value?.oauth2?.callbackUrl || '',
                                type: "text"
                            }
                        ]
                        : []),
                    ...(value?.oauth2?.grantType === "authCodePKCE"
                        ? [
                            {
                                isChecked: true,
                                key: "code",
                                value: code || '',
                                type: "text"
                            },
                            {
                                isChecked: true,
                                key: "redirect_uri",
                                value: value?.oauth2?.callbackUrl || '',
                                type: "text"
                            },
                            {
                                isChecked: true,
                                key: "code_verifier",
                                value: value?.oauth2?.codeVerifier || '',
                                type: "text"
                            }
                        ]
                        : []),
                ]
            },
            urlContent: [],
            variablesValues: validKeys,
            variables: { preRequest: [], postResponse: [] },
            collectionScript: { preRequest: [], postResponse: [] },
            script: { preRequest: [], postResponse: [] },
            collectionAuth: {
                authType: 'none',
            },
            variablesExcludingRequestVar: [], // this needs to be fixed
            workspace: selectedWorkSpace,
            collectionId: selectedTabContent.type == "Request" ? selectedTabContent.collectionName : currentTab,
            collectionName: selectedTabContent.type == "Request" ? apiCollection[selectedTabContent.collectionName].name : apiCollection[currentTab].name,
        };
        return request
    }

    const fetchTokenAPICall = async (code = '') => {
        dispatch({ type: 'SET_IS_AUTH_CODE_FLOW', isAuthCodeFlow: false })
        const tokenName = value?.oauth2?.tokenName || 'Token Name'
        const request = getOAuthRequest(code);
        const controller = new AbortController();
        const resp = await executeAPI({ payload: request, signal: controller.signal })
        dispatch({ type: 'SET_IS_FETCHING_TOKEN', isFetchingToken: false })
        try {
            let parsedBody = JSON.parse(resp.body)
            if (resp.status == 200) {
                dispatch({ type: 'ADD_TOKEN', tokenName: tokenName, token: parsedBody })
            } else {
                dispatch({ type: 'ERROR_FETCHING_TOKEN', errorFetchingToken: 'error fetching token' })
            }
        } catch (error) {
            dispatch({ type: 'ERROR_FETCHING_TOKEN', errorFetchingToken: error })
        }
    }

    const fetchToken = async () => {
        dispatch({ type: 'SET_OPEN_MANAGE_TOKENS', openManageTokens: true })
        dispatch({ type: 'SET_IS_FETCHING_TOKEN', isFetchingToken: true })

        if (value?.oauth2?.grantType === "authCode") {
            dispatch({ type: 'SET_IS_AUTH_CODE_FLOW', isAuthCodeFlow: true })
            const authUrl = `${value?.oauth2?.authUrl}?response_type=code&client_id=${value?.oauth2?.clientId}&redirect_uri=${value?.oauth2?.callbackUrl}&scope=${value?.oauth2?.scope || ''}&state=${value?.oauth2?.state || 'random_state_value'}`;
            window.open(authUrl, '_blank');
        } else if (value?.oauth2?.grantType === "authCodePKCE") {
            dispatch({ type: 'SET_IS_AUTH_CODE_FLOW', isAuthCodeFlow: true })
            const authUrl = `${value?.oauth2?.authUrl}?response_type=code&client_id=${value?.oauth2?.clientId}&redirect_uri=${value?.oauth2?.callbackUrl}&scope=${value?.oauth2?.scope || ''}&state=${value?.oauth2?.state || 'random_state_value'}&code_challenge=${value?.oauth2?.codeVerifier || ''}&code_challenge_method=${value?.oauth2?.codeChallangeMethod || 'S256'}`;
            window.open(authUrl, '_blank');
        } else {
            await fetchTokenAPICall()
        }
    }

    return (
        <Box style={{ position: 'relative', height: '100%', width: '100%', display: 'block' }}>
            <ManageTokensDialog fetchTokenAPICall={fetchTokenAPICall} />
            <Grid style={{ height: '100%', width: '100%', position: 'absolute' }}>
                <Grid item style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
                    <TabContext value={authorizationTabValue}>
                        <FormControl size="small" sx={{ margin: '4px 0px' }}>
                            <Select
                                id="auth"
                                value={authorizationTabValue}
                                onChange={(event) => handleAuthorizationTabChange({ target: { value: event.target.value } }, event.target.value)}
                            >
                                <MenuItem style={{ display: showInherit ? "flexx" : "none" }} value={'5'}>Inherit</MenuItem>
                                <MenuItem value={'1'}>No Auth</MenuItem>
                                <MenuItem value={'2'}>Bearer Token</MenuItem>
                                <MenuItem value={'3'}>Basic Auth</MenuItem>
                                <MenuItem value={'6'}>AWS V4</MenuItem>
                                <MenuItem value={'4'}>OAuth 2</MenuItem>
                                <MenuItem value={'digest'}>Digest</MenuItem>
                                <MenuItem value={'ntlm'}>NTLM</MenuItem>
                            </Select>
                        </FormControl>
                        <Box
                            style={{ border: theme.palette.mode == "dark" ? "1px solid #333" : "1px solid #C8CDD7", height: 'calc(100% - 48px)', boxSizing: 'border-box', borderRadius: '4px', overflow: 'scroll' }}
                        >
                            <TabPanel value="1">
                                <Typography>No Authentication Selected</Typography>
                            </TabPanel>
                            <TabPanel value="2">
                                <Grid style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <Typography>Bearer Token</Typography>
                                    <SingleLineEditor language='customtext' value={value?.bearer?.[0]?.value ?? ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'bearer', 'token')} placeholder='token'
                                        validKeys={validKeys}
                                        style={{
                                            width: "100%"
                                        }}
                                        fontSize={12}
                                        scrollMargin={5}
                                    />
                                </Grid>
                            </TabPanel>
                            <TabPanel value="3">
                                <Grid style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <Typography>Basic Auth</Typography>
                                    <InputLabel>Username</InputLabel>
                                    <SingleLineEditor language='customtext' value={value?.basic?.username || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'basic', 'username')} placeholder='username'
                                        validKeys={validKeys}
                                        style={{
                                            width: "100%"
                                        }}
                                        fontSize={12}
                                        scrollMargin={5}
                                    />
                                    <InputLabel>Password</InputLabel>
                                    <SingleLineEditor language='customtext' value={value?.basic?.password || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'basic', 'password')} placeholder='password' validKeys={validKeys}
                                        style={{
                                            width: "100%"
                                        }}
                                        fontSize={12}
                                        scrollMargin={5} />
                                </Grid>
                            </TabPanel>
                            <TabPanel value="4">
                                <Grid style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <Typography>OAuth 2</Typography>
                                    <Divider />
                                    <Typography>Current Token</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <InputLabel sx={{ fontSize: '12px' }} >Token</InputLabel>
                                        <FormControl size="small" sx={{ margin: '4px 0px' }}>
                                            <Select
                                                id="auth"
                                                value={value?.oauth2?.currentToken?.tokenName || 'none'}
                                                onChange={(event) => handleAuthChange({ target: { value: event.target.value } }, 'oauth2', 'currentToken.tokenName')}
                                            >
                                                <MenuItem value={'none'}>None</MenuItem>
                                                {tokens?.map((token, index) => {
                                                    return (
                                                        <MenuItem value={token.name} >{token.name}</MenuItem>
                                                    )
                                                })
                                                }
                                                <MenuItem value={'manage'}>Manage Tokens</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography></Typography>
                                        <Box sx={{ width: '60%' }}>
                                            <SingleLineEditor language='text' value={tokens.find(t => t.name === value?.oauth2?.currentToken?.tokenName)?.token?.access_token || ''} onChange={(value) => { }} placeholder='token'
                                                style={{
                                                    width: "100%"
                                                }}
                                                fontSize={12}
                                                scrollMargin={5}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <InputLabel sx={{ fontSize: '12px' }} >Header Prefix</InputLabel>
                                        <Box sx={{ width: '60%' }}>
                                            <SingleLineEditor language='customtext' value={value?.oauth2?.currentToken?.headerPrefix || 'Bearer'} onChange={(value) => handleAuthChange({ target: { value: value } }, 'oauth2', 'currentToken.headerPrefix')} placeholder='headerPrefix' validKeys={validKeys}
                                                style={{
                                                    width: "100%"
                                                }}
                                                fontSize={12}
                                                scrollMargin={5}
                                            />
                                        </Box>
                                    </Box>
                                    <Divider />

                                    <Typography>Configure New Token</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <InputLabel sx={{ fontSize: '12px' }}>Token Name</InputLabel>
                                        <Box sx={{ width: '60%' }}>
                                            <SingleLineEditor language='customtext' value={value?.oauth2?.tokenName || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'oauth2', 'tokenName')} placeholder='tokenName' validKeys={validKeys}
                                                style={{
                                                    width: "100%"
                                                }}
                                                fontSize={12}
                                                scrollMargin={5}
                                            />
                                        </Box>
                                    </Box>
                                    {/* <TextField variant="outlined" size="small" placeholder='Grant type' /> */}
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <InputLabel sx={{ fontSize: '12px' }} >Grant type</InputLabel>
                                        <FormControl size="small" sx={{ margin: '4px 0px' }}>
                                            <Select
                                                id="auth"
                                                value={value?.oauth2?.grantType || 'clientCred'}
                                                onChange={(event) => handleAuthChange({ target: { value: event.target.value } }, 'oauth2', 'grantType')}
                                            >
                                                <MenuItem value={'authCode'}>Authorization Code</MenuItem>
                                                <MenuItem value={'authCodePKCE'}>Authorization Code(With PKCE)</MenuItem>
                                                {/* <MenuItem value={'implicit'}>Implicit</MenuItem> */}
                                                <MenuItem value={'passwordCred'}>Password Credentials</MenuItem>
                                                <MenuItem value={'clientCred'}>Client Credentials</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    <Box sx={{ display: ['authCode', 'implicit', 'authCodePKCE'].includes(value?.oauth2?.grantType || 'clientCred') ? 'flex' : 'none', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <InputLabel sx={{ fontSize: '12px' }} >Callback URL</InputLabel>
                                        <Box sx={{ width: '60%' }}>
                                            <SingleLineEditor language='customtext' value={value?.oauth2?.callbackUrl || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'oauth2', 'callbackUrl')} placeholder='callbackUrl' validKeys={validKeys}
                                                style={{
                                                    width: "100%"
                                                }}
                                                fontSize={12}
                                                scrollMargin={5}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: ['authCode', 'implicit', 'authCodePKCE'].includes(value?.oauth2?.grantType || 'clientCred') ? 'flex' : 'none', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <InputLabel sx={{ fontSize: '12px' }} >Auth URL</InputLabel>
                                        <Box sx={{ width: '60%' }}>
                                            <SingleLineEditor language='customtext' value={value?.oauth2?.authUrl || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'oauth2', 'authUrl')} placeholder='authUrl' validKeys={validKeys}
                                                style={{
                                                    width: "100%"
                                                }}
                                                fontSize={12}
                                                scrollMargin={5}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: ['authCode', 'passwordCred', 'authCodePKCE', 'clientCred'].includes(value?.oauth2?.grantType || 'clientCred') ? 'flex' : 'none', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <InputLabel sx={{ fontSize: '12px' }} >Access Token URL</InputLabel>
                                        <Box sx={{ width: '60%' }}>
                                            <SingleLineEditor language='customtext' value={value?.oauth2?.accessTokenUrl || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'oauth2', 'accessTokenUrl')} placeholder='accessTokenUrl' validKeys={validKeys}
                                                style={{
                                                    width: "100%"
                                                }}
                                                fontSize={12}
                                                scrollMargin={5}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <InputLabel sx={{ fontSize: '12px' }} >Client ID</InputLabel>
                                        <Box sx={{ width: '60%' }}>
                                            <SingleLineEditor language='customtext' value={value?.oauth2?.clientId || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'oauth2', 'clientId')} placeholder='clientId' validKeys={validKeys}
                                                style={{
                                                    width: "100%"
                                                }}
                                                fontSize={12}
                                                scrollMargin={5}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: ['authCode', 'passwordCred', 'authCodePKCE', 'clientCred'].includes(value?.oauth2?.grantType || 'clientCred') ? 'flex' : 'none', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <InputLabel sx={{ fontSize: '12px' }} >Client Secret</InputLabel>
                                        <Box sx={{ width: '60%' }}>
                                            <SingleLineEditor language='customtext' value={value?.oauth2?.clientSecret || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'oauth2', 'clientSecret')} placeholder='clientSecret' validKeys={validKeys}
                                                style={{
                                                    width: "100%"
                                                }}
                                                fontSize={12}
                                                scrollMargin={5}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: ['authCodePKCE'].includes(value?.oauth2?.grantType || 'clientCred') ? 'flex' : 'none', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <InputLabel sx={{ fontSize: '12px' }} >Code Challenge Method</InputLabel>
                                        <Box sx={{ width: '60%' }}>
                                            <SingleLineEditor language='customtext' value={value?.oauth2?.codeChallangeMethod || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'oauth2', 'codeChallangeMethod')} placeholder='codeChallangeMethod' validKeys={validKeys}
                                                style={{
                                                    width: "100%"
                                                }}
                                                fontSize={12}
                                                scrollMargin={5}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: ['authCodePKCE'].includes(value?.oauth2?.grantType || 'clientCred') ? 'flex' : 'none', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <InputLabel sx={{ fontSize: '12px' }} >Code Verifier</InputLabel>
                                        <Box sx={{ width: '60%' }}>
                                            <SingleLineEditor language='customtext' value={value?.oauth2?.codeVerifier || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'oauth2', 'codeVerifier')} placeholder='codeVerifier' validKeys={validKeys}
                                                style={{
                                                    width: "100%"
                                                }}
                                                fontSize={12}
                                                scrollMargin={5}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: ['passwordCred'].includes(value?.oauth2?.grantType || 'clientCred') ? 'flex' : 'none', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <InputLabel sx={{ fontSize: '12px' }} >Username</InputLabel>
                                        <Box sx={{ width: '60%' }}>
                                            <SingleLineEditor language='customtext' value={value?.oauth2?.username || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'oauth2', 'username')} placeholder='username' validKeys={validKeys}
                                                style={{
                                                    width: "100%"
                                                }}
                                                fontSize={12}
                                                scrollMargin={5}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: ['passwordCred'].includes(value?.oauth2?.grantType || 'clientCred') ? 'flex' : 'none', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <InputLabel sx={{ fontSize: '12px' }} >Password</InputLabel>
                                        <Box sx={{ width: '60%' }}>
                                            <SingleLineEditor language='customtext' value={value?.oauth2?.password || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'oauth2', 'password')} placeholder='password' validKeys={validKeys}
                                                style={{
                                                    width: "100%"
                                                }}
                                                fontSize={12}
                                                scrollMargin={5}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <InputLabel sx={{ fontSize: '12px' }} >Scope</InputLabel>
                                        <Box sx={{ width: '60%' }}>
                                            <SingleLineEditor language='customtext' value={value?.oauth2?.scope || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'oauth2', 'scope')} placeholder='scope' validKeys={validKeys}
                                                style={{
                                                    width: "100%"
                                                }}
                                                fontSize={12}
                                                scrollMargin={5}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: ['authCode', 'implicit', 'authCodePKCE'].includes(value?.oauth2?.grantType || 'clientCred') ? 'flex' : 'none', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <InputLabel sx={{ fontSize: '12px' }} >State</InputLabel>
                                        <Box sx={{ width: '60%' }}>
                                            <SingleLineEditor language='customtext' value={value?.oauth2?.state || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'oauth2', 'state')} placeholder='state' validKeys={validKeys}
                                                style={{
                                                    width: "100%"
                                                }}
                                                fontSize={12}
                                                scrollMargin={5}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <InputLabel sx={{ fontSize: '12px' }} >Client Authentication</InputLabel>
                                        <FormControl size="small" sx={{ margin: '4px 0px' }}>
                                            <Select
                                                id="auth"
                                                value={value?.oauth2?.clientAuthentication || 'basicAuthHeader'}
                                                onChange={(event) => handleAuthChange({ target: { value: event.target.value } }, 'oauth2', 'clientAuthentication')}
                                            >
                                                <MenuItem value={'basicAuthHeader'}>Send As Basic Auth Header</MenuItem>
                                                <MenuItem value={'clientCredInBody'}>Send As Client Credentials In Body</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    <Divider />
                                    <Button variant='contained' onClick={fetchToken}>Get New Access Token</Button>
                                </Grid>
                            </TabPanel>
                            <TabPanel value="5">
                                <Typography>Inherit</Typography>
                            </TabPanel>
                            <TabPanel value="6">
                                <Grid style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <Typography>AWS V4</Typography>
                                    <InputLabel>Access Key</InputLabel>
                                    <SingleLineEditor language='customtext' placeholder='Access Key' value={value?.awsV4?.accessKey || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'awsV4', 'accessKey')} validKeys={validKeys}
                                        style={{
                                            width: "100%"
                                        }}
                                        fontSize={12}
                                        scrollMargin={5} />
                                    <InputLabel>Secret Key</InputLabel>
                                    <SingleLineEditor language='customtext' placeholder='Secret Key' value={value?.awsV4?.secretKey || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'awsV4', 'secretKey')} validKeys={validKeys}
                                        style={{
                                            width: "100%"
                                        }}
                                        fontSize={12}
                                        scrollMargin={5} />
                                    <InputLabel>AWS Region</InputLabel>
                                    <SingleLineEditor language='customtext' placeholder='AWS Region' value={value?.awsV4?.region || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'awsV4', 'region')} validKeys={validKeys}
                                        style={{
                                            width: "100%"
                                        }}
                                        fontSize={12}
                                        scrollMargin={5} />
                                    <InputLabel>Service</InputLabel>
                                    <SingleLineEditor language='customtext' placeholder='Service' value={value?.awsV4?.service || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'awsV4', 'service')} validKeys={validKeys}
                                        style={{
                                            width: "100%"
                                        }}
                                        fontSize={12}
                                        scrollMargin={5} />
                                    <InputLabel>Session Token</InputLabel>
                                    <SingleLineEditor language='customtext' placeholder='Session Token' value={value?.awsV4?.sessionToken || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'awsV4', 'sessionToken')} validKeys={validKeys}
                                        style={{
                                            width: "100%"
                                        }}
                                        fontSize={12}
                                        scrollMargin={5} />
                                </Grid>
                            </TabPanel>
                            <TabPanel value="digest">
                                <Grid style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <Typography>Digest</Typography>
                                    <InputLabel>Username</InputLabel>
                                    <SingleLineEditor language='customtext' placeholder='Username' value={value?.digest?.username || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'digest', 'username')} validKeys={validKeys}
                                        style={{
                                            width: "100%"
                                        }}
                                        fontSize={12}
                                        scrollMargin={5} />
                                    <InputLabel>Password</InputLabel>
                                    <SingleLineEditor language='customtext' placeholder='Password' value={value?.digest?.password || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'digest', 'password')} validKeys={validKeys}
                                        style={{
                                            width: "100%"
                                        }}
                                        fontSize={12}
                                        scrollMargin={5} />
                                </Grid>
                            </TabPanel>
                            <TabPanel value="ntlm">
                                <Grid style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <Typography>NTLM</Typography>
                                    <InputLabel>Username</InputLabel>
                                    <SingleLineEditor language='customtext' placeholder='Username' value={value?.ntlm?.username || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'ntlm', 'username')} validKeys={validKeys}
                                        style={{
                                            width: "100%"
                                        }}
                                        fontSize={12}
                                        scrollMargin={5} />
                                    <InputLabel>Password</InputLabel>
                                    <SingleLineEditor language='customtext' placeholder='Password' value={value?.ntlm?.password || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'ntlm', 'password')} validKeys={validKeys}
                                        style={{
                                            width: "100%"
                                        }}
                                        fontSize={12}
                                        scrollMargin={5} />
                                    <InputLabel>Domain</InputLabel>
                                    <SingleLineEditor language='customtext' placeholder='Domain' value={value?.ntlm?.domain || ''} onChange={(value) => handleAuthChange({ target: { value: value } }, 'ntlm', 'domain')} validKeys={validKeys}
                                        style={{
                                            width: "100%"
                                        }}
                                        fontSize={12}
                                        scrollMargin={5} />
                                </Grid>
                            </TabPanel>
                        </Box>
                    </TabContext>

                </Grid>
            </Grid>
        </Box>
    );
}

Authorization.defaultProps = {
    showInherit: false
};

export default Authorization;