import * as React from 'react';
import { useState } from 'react';
import { Box, Typography, Radio, Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Tab, Tabs, TextField, InputLabel, } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { TabContext, TabPanel } from '@mui/lab';

import { useTheme } from '@mui/material/styles';

function ManageTokensDialog(props) {
    const theme = useTheme();
    const { fetchTokenAPICall } = props;

    const dispatch = useDispatch();
    const open = useSelector(state => state.authorizationReducer.openManageTokens)
    const isFetchingToken = useSelector(state => state.authorizationReducer.isFetchingToken)
    const tokens = useSelector(state => state.authorizationReducer.tokens)
    const isAuthCodeFlow = useSelector(state => state.authorizationReducer.isAuthCodeFlow)
    const errorFetchingToken = useSelector(state => state.authorizationReducer.errorFetchingToken)

    const [tokenTab, setTokensTab] = useState("default");
    const [code, setCode] = useState("");
    const handleClose = () => {
        dispatch({ type: 'SET_OPEN_MANAGE_TOKENS', openManageTokens: false })
        dispatch({ type: 'ERROR_FETCHING_TOKEN', errorFetchingToken: '' })
        setCode("")
        setTokensTab("default")
    };



    return (
        <React.Fragment>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', padding: '6px 24px' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Manage Tokens</Typography>
                        <Button onClick={handleClose}>Close</Button>
                    </Box>
                </DialogTitle>
                <DialogContent style={{ minWidth: '600px', height: "350px", display: 'flex', padding: '0px' }}>
                    <TabContext value={tokenTab}>
                        <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
                            <Box sx={{ borderRight: 1, borderColor: 'divider' }}>
                                <Tabs
                                    value={tokenTab}
                                    orientation="vertical"
                                    variant="scrollable"
                                    onChange={(e, value) => { setTokensTab(value); }}
                                    aria-label="tokens tabs"
                                >
                                    <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", padding: "8px" }} label="All Tokens" value="default" />
                                    {tokens?.map((token, index) => {
                                        return (
                                            <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", padding: "8px" }} label={token.name} value={token.name} />
                                        )
                                    })
                                    }
                                </Tabs>
                            </Box>
                            <Box sx={{ flexGrow: 1, padding: '4px 24px', overflow: 'auto' }}>
                                {isAuthCodeFlow ? <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px', padding: '4px 24px', overflow: 'auto' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                        <InputLabel>Code</InputLabel>
                                        <TextField sx={{ flexGrow: 1 }} size='small' value={code} onChange={(event) => setCode(event.target.value)}></TextField>
                                    </Box>
                                    <Typography sx={{ fontSize: '10px' }}>Provide the code recieved in the redirection url in browser and click Get Access Token</Typography>
                                    <Button variant='contained' onClick={() => fetchTokenAPICall(code)}>Get Access Token</Button>
                                </Box> : isFetchingToken ? <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><CircularProgress /></Box>
                                    : <Box sx={{ flexGrow: 1, padding: '4px 24px', overflow: 'auto' }}>
                                        <TabPanel value="default" sx={{ padding: '0px' }} >
                                            {errorFetchingToken.length > 0 ? <>{errorFetchingToken}</> : <></>}
                                        </TabPanel>
                                        {tokens?.map((token, index) => {
                                            return (
                                                <TabPanel value={token.name} sx={{ padding: '0px' }} >
                                                    {token?.token ? (
                                                        <Box sx={{ padding: 2, borderRadius: 2 }}>
                                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Access Token:</Typography>
                                                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{token.token.access_token || 'N/A'}</Typography>

                                                            {token.token.token_type && (
                                                                <>
                                                                    <Typography variant="body1" sx={{ fontWeight: 'bold', marginTop: 1 }}>Token Type:</Typography>
                                                                    <Typography variant="body2">{token.token.token_type}</Typography>
                                                                </>
                                                            )}

                                                            {token.token.expires_in && (
                                                                <>
                                                                    <Typography variant="body1" sx={{ fontWeight: 'bold', marginTop: 1 }}>Expires In:</Typography>
                                                                    <Typography variant="body2">{token.token.expires_in} seconds</Typography>
                                                                </>
                                                            )}

                                                            {token.token.refresh_token && (
                                                                <>
                                                                    <Typography variant="body1" sx={{ fontWeight: 'bold', marginTop: 1 }}>Refresh Token:</Typography>
                                                                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{token.token.refresh_token}</Typography>
                                                                </>
                                                            )}

                                                            {token.token.scope && (
                                                                <>
                                                                    <Typography variant="body1" sx={{ fontWeight: 'bold', marginTop: 1 }}>Scope:</Typography>
                                                                    <Typography variant="body2">{token.token.scope}</Typography>
                                                                </>
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="body2" sx={{ padding: 2 }}>No token available</Typography>
                                                    )}
                                                </TabPanel>
                                            )
                                        })
                                        }
                                    </Box>
                                }
                            </Box>
                        </Box>
                    </TabContext>
                </DialogContent>
            </Dialog>
        </React.Fragment >
    );
}
ManageTokensDialog.defaultProps = {
    fetchTokenAPICall: () => { }
}
export default ManageTokensDialog;