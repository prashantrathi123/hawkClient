import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Button, Tab, Tabs } from '@mui/material';
import { List, ListItem, ListItemText, Divider } from "@mui/material";
import { TabContext } from '@mui/lab';
import KeyValueInput from '../../../../commonComponents/keyValueInput/KeyValueInput.Component';
import { useDispatch, useSelector } from 'react-redux';
import { updateCollectionContent } from "../../../../services/duplicateCollectionItem"
import Authorization from '../../components/Authorization/Authorization.Component';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import SourceIcon from '@mui/icons-material/Source';
import { CollectionIcon } from '../../../../commonComponents/icons/svgIcons.Component';
import {
    createVariablesValues,
} from '../../../../utils/utils';
import MarkDownEditor from '../../../../commonComponents/markDownEditor/markDownEditor.Component';

function CollectionPannel() {

    const dispatch = useDispatch()
    const apiCollection = useSelector(state => state.apiTesterReducer.apiCollection)
    const currentTab = useSelector(state => state.apiTesterReducer.currentTab);
    const [envValue, setEnvValue] = useState([]);
    const TabsContent = useSelector(state => state.apiTesterReducer.requestTabsContent);
    const variables = useSelector(state => state.apiTesterReducer.requestTabsContent[currentTab]?.collectionVariables || []);
    const collectionTabValue = useSelector(state => state.apiTesterReducer.requestTabsContent[currentTab].collectionTabValue || 'info');
    const auth = useSelector(state => state.apiTesterReducer.requestTabsContent[currentTab].auth);
    const docs = useSelector(state => state.apiTesterReducer.requestTabsContent[currentTab].docs || []);
    const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
    const envVariables = useSelector(state => state.variablesReducer.variables);
    const workspaces = useSelector(state => state.workSpaceReducer.workspaces)

    const validKeys = createVariablesValues(envVariables.selectedEnv, envVariables.envVariables, envVariables.globalVariables, variables)

    useEffect(() => {
        setEnvValue(variables);
    }, [variables, currentTab])

    const getWorkSpaceLocation = (workspaceName) => {
        try {
            const workspace = workspaces.find(item => item.name === workspaceName);
            return workspace ? workspace.path : null;
        } catch (error) {
            return ""
        }
    }

    const handleVarChange = (value) => {
        let selectedRequest = {
            isSaved: false,
            collectionVariables: value
        }
        dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: currentTab });
    }
    const handleChange = (event, fieldId) => {
        let selectedRequest = {
            isSaved: false
        }
        selectedRequest[`${fieldId}`] = event.target.value
        dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: currentTab });
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Check for cmd + s (Mac) or ctrl + s (Windows/Linux)
            if ((event.metaKey || event.ctrlKey) && event.key === 's') {
                event.preventDefault(); // Prevent the default save dialog
                if (TabsContent[currentTab].isSaved) {

                } else {
                    handleSave(); // Call the handle save function
                }
            }
        };

        // Add event listener for keydown
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentTab, TabsContent[currentTab], variables]);

    const handleSave = () => {
        let val = apiCollection[currentTab]
        val[`auth`] = auth;
        val[`collectionVariables`] = variables;
        val[`docs`] = docs;
        const collection = {
            collectionId: currentTab,
            collectionJson: val,
            workspace: selectedWorkSpace
        }
        updateCollectionContent(collection).then((resp) => {
            dispatch({ type: "SET_API_COLLECTION", apiCollection: resp })
            let selectedRequest = {
                isSaved: true,
            }
            dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: currentTab });
        })
    }

    const renderContent = (condition) => {
        switch (condition) {
            case '1':
                return (
                    <>
                        <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography>Collection Variables</Typography>
                        </Box>
                        <KeyValueInput
                            value={variables}
                            onValueChange={(value) => handleVarChange(value)}
                            type='text'
                            validKeys={validKeys}
                            language='customtext'
                            disableKeyCustomText={true}
                        />
                    </>
                );
            case '4':
                return <Authorization value={auth || { authType: "none", basic: { username: "", password: "" }, bearer: [] }} onChange={handleChange} validKeys={validKeys} />;
            case 'info':
                return (
                    <Box style={{ position: 'relative', height: '100%', width: '100%', display: 'block' }}>
                        <Grid style={{ display: 'flex', height: '100%', width: '100%', position: 'absolute', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Box sx={{ width: '65%', height: '100%', position: 'relative' }}>
                                <MarkDownEditor markdownText={docs} handleInputChange={handleChange} />
                            </Box>
                            <Box sx={{ width: '30%', height: '100%', position: 'relative', overflow: 'scroll' }}>
                                <Typography variant="h6" gutterBottom>
                                    API Collection Details
                                </Typography>
                                <List disablePadding>
                                    {[
                                        { label: "Name", value: apiCollection[currentTab]?.name },
                                        { label: "Location", value: apiCollection[currentTab]?.location },
                                        { label: "Work Space", value: selectedWorkSpace },
                                        { label: "Work Space Location", value: getWorkSpaceLocation(selectedWorkSpace) },
                                    ].map((item, index) => (
                                        <div key={item.label}>
                                            <ListItem sx={{ py: 1, display: 'flex', gap: '8px' }}>
                                                {index == 2 ? <WorkspacesIcon /> : <></>}
                                                {index == 0 ? <CollectionIcon /> : <></>}
                                                {(index == 1 || index == 3) ? <SourceIcon /> : <></>}
                                                <ListItemText
                                                    primary={item.label}
                                                    secondary={item.value || "—"}
                                                    primaryTypographyProps={{ fontWeight: "bold" }}
                                                    secondaryTypographyProps={{ color: "text.secondary" }}
                                                />
                                            </ListItem>
                                            {index < 3 && <Divider />} {/* Adds a line between items */}
                                        </div>
                                    ))}
                                </List>
                            </Box>

                        </Grid>
                    </Box>
                )
            default:
                <></>
        }
    }

    return (
        <Box style={{ display: "flex", flexDirection: 'column', flexGrow: 1, padding: '24px' }}>
            <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>{apiCollection[currentTab]?.name}</Typography>
                <Button variant='contained' disabled={TabsContent[currentTab].isSaved} onClick={handleSave}>Save</Button>
            </Box>
            <TabContext value={collectionTabValue}>
                <Tabs
                    value={collectionTabValue}
                    allowScrollButtonsMobile
                    variant='scrollable'
                    style={{ height: "36px", position: "relative", zIndex: 21, background: "background.default", overflow: 'hidden' }}
                    onChange={(event, value) => dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: { collectionTabValue: value }, id: currentTab })}
                    aria-label="lab API tabs example"
                >
                    <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", minWidth: "0px", margin: '0px 10px', padding: '0px' }} label="Overview" value="info" />
                    <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", minWidth: "0px", margin: '0px 10px', padding: '0px' }} label="Variables" value="1" />
                    <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", minWidth: "0px", margin: '0px 10px', padding: '0px' }} label="Authorization" value="4" />
                </Tabs>
            </TabContext>
            {renderContent(collectionTabValue)}
        </Box>
    );
}

CollectionPannel.defaultProps = {
};

export default CollectionPannel;