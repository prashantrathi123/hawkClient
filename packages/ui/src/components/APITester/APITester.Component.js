import React, { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { Box, Typography, Tab, Tabs, IconButton, FormControl, Select, MenuItem, Link } from '@mui/material';
import styles from "./APITester.Style"
import CollectionBar from './components/SidePannel/CollectionsListSidePannel.Component'
import { useDispatch, useSelector } from 'react-redux';
import { Close } from "@mui/icons-material"
import './components/JsonEditor.css'; // Import a stylesheet for styling
import EnvVariables from './components/EnvVariables/EnvVariables.Component';
import APIRequestTab from './components/APIRequestTab/APIRequestTab.Component';
import { getGlobalVariables, getEnvVariables } from '../../services/variablesService';
import CollectionPannel from './components/CollectionPannel/CollectionPannel.Component';
import { useTheme } from '@mui/material/styles';
import { APP_DISPLAT_NAME } from '../../constants/constants';
import { SvgIcon } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import { Article, Folder } from '@mui/icons-material'; 
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import Logo  from '../../commonComponents/icons/hawklogo.Component';
import FolderPannel from './components/FolderPannel/FolderPannel.Component';

function APITester() {
    const classess = styles()
    const theme = useTheme();

    const TabsContent = useSelector(state => state.apiTesterReducer.requestTabsContent)
    const [TabsContentKeys, setTabsContentKeys] = useState(Object.keys(TabsContent))

    const currentTab = useSelector(state => state.apiTesterReducer.currentTab)
    const selectedTabContent = useSelector(state => state.apiTesterReducer.requestTabsContent[currentTab])
    const isDeleteTabExecuted = useSelector(state => state.apiTesterReducer.isDeleteTabExecuted)
    const variables = useSelector(state => state.variablesReducer.variables);
    const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)

    const envVariablesKeys = Object.keys(variables.envVariables)

   

    const [width, setWidth] = useState('calc(100% - 375px)');
    const [isResizing, setIsResizing] = useState(false);
    const [startPos, setStartPos] = useState(0);
    const [startSize, setStartSize] = useState(0);

    const dispatch = useDispatch()

    // set variables on load so that they can be used while sending the request
    useEffect(()=>{
        if (variables.globalVariables?.values?.length || 0 === 0) {
            getGlobalVariables({workspace: selectedWorkSpace}).then((resp) => {
                dispatch({ type: "SET_GLOBAL_VARIABLES", globalVariables: resp })
            })
        }
        getEnvVariables({workspace: selectedWorkSpace}).then((resp) => {
            dispatch({ type: "SET_ENV_VARIABLES", envVariables: resp })
        })
    },[])

    useEffect(() => {
        const TabsContentKeysa = Object.keys(TabsContent)
        setTabsContentKeys(TabsContentKeysa)
    }, [currentTab])

    useEffect(() => {
        // console.log("delete tab")
        if (isDeleteTabExecuted == true) {
            // console.log("delete tab true")
            const TabsContentKeysa = Object.keys(TabsContent)
            setTabsContentKeys(TabsContentKeysa)
            dispatch({ type: "SET_IS_DELETE_TAB_EXECUTED", isDeleteTabExecuted: false })
        }
    }, [isDeleteTabExecuted])

    const handleMouseDown = (e) => {
        setIsResizing(true);
        setStartPos(e.clientX);
        setStartSize(parseInt(getComputedStyle(document.querySelector('.mainResize')).width, 10));
      };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isResizing) {
                const newWidth = startSize - (e.clientX - startPos);
                setWidth(newWidth > 50 ? `${newWidth}px` : '50px'); // Minimum width of 50px
            }
        };

        const handleMouseUp = () => {
            if (isResizing) {
                setIsResizing(false);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, startPos, startSize]);

    const handleCurrentTabTabChange = (event, newValue) => {
        dispatch({ type: "SET_CURRENT_TAB", currentTab: newValue })
    }

    const handelCancelTab = (event, tabValue, index) => {
        event.stopPropagation();
        if (tabValue != "Default") {
            if (tabValue == currentTab) {
                let newTab = TabsContentKeys[index > 1 ? index - 1 : 0]
                dispatch({ type: "CLOSE_REQUEST_TAB_CONTENT", id: tabValue, newTab: newTab, isChangeTab: true })
            } else {
                dispatch({ type: "CLOSE_REQUEST_TAB_CONTENT", id: tabValue, newTab: TabsContentKeys[index], isChangeTab: false })
            }

        }
    }

    const renderTabContent = (tabContentId) => {
        switch (tabContentId) {
            case 'ENV':
                return <EnvVariables/>;
            case 'Overview':
                return (
                <Box style={{ padding: '24px', display: "flex", flexDirection: 'column', flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <Logo/>
                    <Typography>Welcome to <span style={{fontWeight: 600}}>{APP_DISPLAT_NAME}</span> <span style={{fontSize: '10px'}}>by Prashant Rathi</span></Typography>
                    <Typography>A developer and git friendly offline-only API client designed for efficient API testing and development.</Typography>
                    <Link 
                      href="https://www.hawkclient.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                        Visit HawkClient
                      </Link>
                    <Link 
                      href="https://www.hawkclient.com/docs" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                        Docs
                      </Link>
                    <Link 
                      href="https://github.com/prashantrathi123/hawkClient" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                        Star us on github
                      </Link>
                    <Link 
                      href="https://github.com/prashantrathi123/hawkClient/issues" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                        Raise an issue
                      </Link>
                </Box>
                );
            case 'Request':
                return <APIRequestTab setTabsContentKeys={setTabsContentKeys} isRequestExapmle={false}/>
            case 'COLLECTION':
                return <CollectionPannel/>
            case 'REQUEST_EXAMPLE':
                return <APIRequestTab setTabsContentKeys={setTabsContentKeys} isRequestExapmle={true}/>
            case 'FOLDER':
                    return < FolderPannel/>
            default:
                return <>Comming Soon</>
        }
    }

    function getFileName(filePath) {
        // Split the path by "/" or "\\" to handle both Unix and Windows paths
        const parts = filePath.split(/[/\\]/);

        // The last element is the filename
        return parts[parts.length - 1];
    }
    const handleEnvChange = (event) => {
        const envId = event.target.value;
        dispatch({ type: "SET_SELECTED_ENV", selectedEnv: envId });
    }

    const renderTabName = (tabType, TabsContentKey) => {
        switch (tabType) {
            case 'Request':
                return <><span className={classess[TabsContent[TabsContentKey].request.method]}>{TabsContent[TabsContentKey].request.method}</span> {TabsContent[TabsContentKey].request.name}</>
            case 'COLLECTION': {
                return (
                    <>
                        <SvgIcon viewBox="0 0 24 24">
                            {/* Bucket base */}
                            <path d="M5 10 L5 18 C5 19.1 5.9 20 7 20 H17 C18.1 20 19 19.1 19 18 V10 Z" fill="none" stroke="currentColor" strokeWidth="2" />

                            {/* Bucket cover */}
                            <path d="M4 8 H20 C20.55 8 21 8.45 21 9 C21 9.55 20.55 10 20 10 H4 C3.45 10 3 9.55 3 9 C3 8.45 3.45 8 4 8 Z" fill="none" stroke="currentColor" strokeWidth="2" />

                            {/* Handle */}
                            <path d="M8 8 C8 6 16 6 16 8" fill="none" stroke="currentColor" strokeWidth="2" />
                        </SvgIcon>
                        {TabsContent[TabsContentKey].collectionDisplayName}
                    </>
                )
            }
            case 'ENV': {
                return (<><BuildIcon style={{ height: '16px' }} /> {TabsContent[TabsContentKey].name}</>)
            }
            case 'REQUEST_EXAMPLE': {
                return (<><Article style={{ height: '16px' }} /> {TabsContent[TabsContentKey].request.name}</>)
            }
            case 'FOLDER':
                    return <><Folder style={{ height: '16px' }} /> {TabsContent[TabsContentKey].name}</>
            default:
                return <>{tabType}</>
        }
    }

    return (
        <>
            <CollectionBar />
            <Box className={classess.mainArea + ' ' + 'mainResize'} style={{ width }}>
                <div className={classess.sideResizer} onMouseDown={(event) => handleMouseDown(event)} />
                <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', borderBottom: theme.palette.mode == "dark" ? "1px solid #333" : "1px solid #C8CDD7", boxSizing: 'border-box', alignItems: 'center' }}>
                    <Tabs value={currentTab} className={classess.tabs} scrollButtons allowScrollButtonsMobile variant='scrollable' style={{ height: "36px" }} onChange={handleCurrentTabTabChange} aria-label="lab API tabs example">
                        {
                            Object.keys(TabsContent).map((TabsContentKey, index) => {
                                if (TabsContent[TabsContentKey]) {
                                    return (
                                        <Tab
                                            key={index}
                                            style={{ fontFamily: "Noto Sans", textTransform: "none", padding: "2px" }}
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: "8px" }}>
                                                    {renderTabName(TabsContent[TabsContentKey].type, TabsContentKey)}
                                                    {TabsContent[TabsContentKey].type !== "Overview" ? (
                                                        <Box
                                                            component="span"
                                                            onClick={(event) => handelCancelTab(event, TabsContentKey, index)}
                                                            sx={{
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                height: "22px",
                                                                width: "22px",
                                                                '&:hover': {
                                                                    backgroundColor: theme.palette.action.hover, // Adjust the color as needed
                                                                    borderRadius: '50%', // Makes the hover effect look better around the icon
                                                                }
                                                            }}
                                                        >
                                                            {
                                                                TabsContent[TabsContentKey].isSaved ? <Close sx={{ height: "12px", width: "12px" }} /> :
                                                                    <FiberManualRecordIcon sx={{ height: "12px", width: "12px", color: theme.palette.warning.main }} />
                                                            }
                                                        </Box>
                                                    ) : null}
                                                </Box>
                                            }
                                            value={TabsContentKey}
                                        />
                                    )
                                }
                                else return null
                            }
                            )
                        }
                    </Tabs>
                    <FormControl size="small" style={{width: '190px'}}>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={variables.selectedEnv}
                            onChange={(event) => handleEnvChange(event)}
                        >
                            <MenuItem value={"none"}><Typography >No Environment</Typography></MenuItem>
                            {envVariablesKeys.map((value,index)=>{
                                return(
                                    <MenuItem key={index} value={value}><Typography >{variables.envVariables[value].name}</Typography></MenuItem>
                                )
                            })}
                        </Select>
                    </FormControl>
                </Box>
                {renderTabContent(selectedTabContent?.type || "Default")}
            </Box>
        </>
    );
}

export default APITester;
