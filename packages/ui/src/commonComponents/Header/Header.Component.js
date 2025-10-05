import React, { useState, useEffect } from "react"
import { AppBar, Toolbar, Typography, Grid, Box, IconButton, FormControl, Select, MenuItem, Tooltip, Badge } from "@mui/material"
import PropTypes from "prop-types"
import styles from './Header.Style'
import AddIcon from "@mui/icons-material/Add"
import { useDispatch, useSelector } from 'react-redux';
import { HorizontalSplitIcon, VerticalSplitIcon } from "../icons/icons.Component"
import CreateWorkSpaceDialog from "./CreateWorkSpaceDialog.Component"
import { getWorkSpaces, addWorkSpaces } from "../../services/workSpace.Service"
import { getAPITesterCollections } from "../../services/getAPITesterCollection"
import { getGlobalVariables, getEnvVariables } from '../../services/variablesService';
import SettingsIcon from "@mui/icons-material/Settings"
import SettingsDialog from "../Settings/SettingsDailog"
import { APP_DISPLAT_NAME } from "../../constants/constants";
import Logo from "../icons/hawklogo.Component"
import { getCertificates } from "../../services/certificates.Service"
import { getSettings } from "../../services/settingsService"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { revealInFolder } from "../../services/BrowseDirectory.Service"

const Header = (props) => {
    const classes = styles()
    const isTwoPane = useSelector(state => state.apiTesterReducer.isTwoPane || false)
    const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
    const workspaces = useSelector(state => state.workSpaceReducer.workspaces)
    const isUpdatesAvailable = useSelector(state => state.settingsReducer.isUpdatesAvailable);
    const [open, setOpen] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);
    const dispatch = useDispatch()
    const onPaneChange = () => {
        dispatch({ type: "UPDATE_IS_TWO_PANE", isTwoPane: !isTwoPane })
    }

    useEffect(() => {
        getWorkSpaces().then((res) => {
            dispatch({ type: "SET_WORK_SPACES_AND_SELECTED_WORK_SPACE", workspaces: res.workspaces, selectedWorkSpace: res.selectedWorkSpace })
        })
    }, [])

    useEffect(() => {
        dispatch({ type: "RESET__CERTIFICATES" })
        getCertificates(selectedWorkSpace).then((response) => {
            if (response.error) {
                console.log("Error in get certificates")
            } else {
                dispatch({ type: "UPDATE_CLIENT_CERTIFICATES", clientCertificates: response?.clientCertificates || [] })
                dispatch({ type: "SET_CA_CERT", isEnabled: response?.caCertificate?.isEnabled || false, caPath: response?.caCertificate?.caPath })
            }
        })
        getAPITesterCollections(selectedWorkSpace).then((apiCollection) => {
            dispatch({ type: "SET_API_COLLECTION", apiCollection: apiCollection });
        })
        getGlobalVariables({ workspace: selectedWorkSpace }).then((resp) => {
            dispatch({ type: "SET_GLOBAL_VARIABLES", globalVariables: resp })
        })
        getEnvVariables({ workspace: selectedWorkSpace }).then((resp) => {
            dispatch({ type: "SET_ENV_VARIABLES", envVariables: resp })
        })
        getSettings().then((resp) => {
            dispatch({ type: "SET_THEME", theme: resp.theme, isSettingsSaved: true })
            dispatch({ type: "SET_FONT_SIZE", fontSize: resp.fontSize, isSettingsSaved: true })
        })
        dispatch({ type: "RESET_API_TESTER_INITIAL_STATE" })
        dispatch({ type: "SET_SELECTED_ENV", selectedEnv: "none" });
    }, [selectedWorkSpace])

    const handleWorkSpaceChange = (event) => {
        const value = event.target.value
        let tempWorkSpaceVal = { workspaces: workspaces, selectedWorkSpace: value }
        addWorkSpaces(tempWorkSpaceVal).then((res) => {
            dispatch({ type: "SET_SELECTED_WORK_SPACE", selectedWorkSpace: res.selectedWorkSpace })
        })
    }

    const handleRevealInFolder = (workspace) => {
        let workSpaceObj = workspaces.find((item) => item.name == workspace)
        revealInFolder({ filePath: workSpaceObj.path })
    }

    return (
        <>
            <CreateWorkSpaceDialog open={open} setOpen={setOpen} />
            <SettingsDialog open={openSettings} setOpen={setOpenSettings} />
            <Box className={classes.header}>
                <Grid style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                    <Logo width="46px" height="46px" />
                    <Typography sx={{ fontSize: "16px" }}>{APP_DISPLAT_NAME}</Typography>
                    <Typography sx={{ fontSize: "10px" }}>by Prashant Rathi</Typography>
                </Grid>
                <Grid style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                    <Tooltip
                        title="Reveal in Folder"
                        placement="bottom-start"
                    >
                        <IconButton style={{ display: selectedWorkSpace == "none" ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onClick={() => { handleRevealInFolder(selectedWorkSpace) }}>
                            <OpenInNewIcon sx={{ color: 'white', width: '20px', height: '20px' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip
                        title="Settings"
                        placement="bottom-start"
                    >
                        <IconButton style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onClick={() => { setOpenSettings(true) }}>
                            <Badge
                                color="error"
                                variant="dot"
                                overlap="circular"
                                invisible={!isUpdatesAvailable}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <SettingsIcon sx={{ color: 'white', width: '20px', height: '20px' }} />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    <IconButton style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onClick={() => { setOpen(true) }}>
                        <AddIcon sx={{ color: 'white', width: '20px', height: '20px' }} />
                        <Typography style={{ fontSize: '12px', color: 'white' }}>workspace</Typography>
                    </IconButton>
                    <FormControl size="small" className={classes.formControl} sx={{ borderColor: "white" }}>
                        <Select
                            labelId="workspace"
                            id="workspace"
                            value={selectedWorkSpace}
                            onChange={(event) => { handleWorkSpaceChange(event) }}
                            style={{ borderColor: "white" }}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 200, // Set the maximum height of the dropdown
                                        overflowY: 'auto', // Enable vertical scrolling
                                    },
                                },
                            }}
                        >
                            <MenuItem value={"none"}><Typography style={{}}>No WorkSpace</Typography></MenuItem>
                            {
                                workspaces.map((workspace, index) => {
                                    return (
                                        <MenuItem key={index} value={workspace.name}><Typography>{workspace.name}</Typography></MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>
                    <IconButton style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }} onClick={() => onPaneChange()}>
                        {isTwoPane ? <VerticalSplitIcon /> : <HorizontalSplitIcon />}
                        <Typography style={{ fontSize: '12px', color: 'white' }}>{isTwoPane ? 'two-pane' : 'one-pane'}</Typography>
                    </IconButton>
                </Grid>
            </Box>
        </>
    )
}

Header.propTypes = {
}

export { Header }