import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Button, Tab, Tabs } from '@mui/material';
import { List, ListItem, ListItemText, Divider, Breadcrumbs, Link } from "@mui/material";
import { TabContext } from '@mui/lab';
import { useDispatch, useSelector } from 'react-redux';
import { updateFolderContent } from "../../../../services/duplicateCollectionItem"
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import SourceIcon from '@mui/icons-material/Source';
import MarkDownEditor from '../../../../commonComponents/markDownEditor/markDownEditor.Component';
import { Folder } from '@mui/icons-material'; 

function FolderPannel() {

    const dispatch = useDispatch()
    const currentTab = useSelector(state => state.apiTesterReducer.currentTab);
    const TabsContent = useSelector(state => state.apiTesterReducer.requestTabsContent);
    const selectedTabContent = useSelector(state => state.apiTesterReducer.requestTabsContent[currentTab])
    const collectionTabValue = useSelector(state => state.apiTesterReducer.requestTabsContent[currentTab].collectionTabValue || 'info');
    const docs = useSelector(state => state.apiTesterReducer.requestTabsContent[currentTab].docs || []);
    const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
    const workspaces = useSelector(state => state.workSpaceReducer.workspaces)

    const getWorkSpaceLocation = (workspaceName) => {
        try {
            const workspace = workspaces.find(item => item.name === workspaceName);
            return workspace ? workspace.path : null;
        } catch (error) {
            return ""
        }
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
    }, [currentTab, TabsContent[currentTab]]);

    const handleSave = () => {
        let val = {
            id: selectedTabContent.id,
            name: selectedTabContent.name
        }
        val[`docs`] = docs;
        const folderPayload = {
            collectionId: selectedTabContent.collectionId,
            folderJson: val,
            workspace: selectedWorkSpace,
            folderPathArray: selectedTabContent.path || [],
            folderId: selectedTabContent.id
        }
        updateFolderContent(folderPayload).then((resp) => {
            dispatch({ type: "SET_API_COLLECTION", apiCollection: resp })
            let selectedRequest = {
                isSaved: true,
            }
            dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: currentTab });
        })
    }

    const renderContent = (condition) => {
        switch (condition) {
            case 'info':
                return (
                    <Box style={{ position: 'relative', height: '100%', width: '100%', display: 'block' }}>
                        <Grid style={{ display: 'flex', height: '100%', width: '100%', position: 'absolute', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Box sx={{ width: '65%', height: '100%', position: 'relative' }}>
                                <MarkDownEditor markdownText={docs} handleInputChange={handleChange} />
                            </Box>
                            <Box sx={{ width: '30%', height: '100%', position: 'relative', overflow: 'scroll' }}>
                                <Typography variant="h6" gutterBottom>
                                    API Folder Details
                                </Typography>
                                <List disablePadding>
                                    {[
                                        { label: "Name", value: selectedTabContent?.name },
                                        { label: "Location", value: selectedTabContent?.location },
                                        { label: "Work Space", value: selectedWorkSpace },
                                        { label: "Work Space Location", value: getWorkSpaceLocation(selectedWorkSpace) },
                                    ].map((item, index) => (
                                        <div key={item.label}>
                                            <ListItem sx={{ py: 1, display: 'flex', gap: '8px' }}>
                                                {index == 2 ? <WorkspacesIcon /> : <></>}
                                                {index == 0 ? <Folder /> : <></>}
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
                </Breadcrumbs>
            </div>
        );
    }

    return (
        <Box style={{ display: "flex", flexDirection: 'column', flexGrow: 1, padding: '24px' }}>
            <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {renderPath()}
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
                </Tabs>
            </TabContext>
            {renderContent(collectionTabValue)}
        </Box>
    );
}

FolderPannel.defaultProps = {
};

export default FolderPannel;