import React, { useEffect, useState, useRef } from 'react';
import { Typography, Grid, IconButton, Box, Menu, MenuItem, TextField } from '@mui/material';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StyledTreeItem from '../../../../../commonComponents/StyledTreeItem/StyledTreeItem';
import styles from "./EnvPannel.Style"
import AddIcon from "@mui/icons-material/Add"
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import AddEnvVariableDialog from './AddEnvVariableDialog.Component';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { deleteEnvVariables } from '../../../../../services/variablesService';
import ExportEnvDialog from '../../../../../commonComponents/ExportDailog/ExportEnvDailog.Component';
import { revealInFolder } from '../../../../../services/BrowseDirectory.Service';
import RenameItemDialog from '../RenamItemDialog.component';
import DuplicateEnvVariableDialog from './DuplicateEnvVariableDialog.Component';

const EnvPannel = (props) => {

  const classes = styles()
  const dispatch = useDispatch();
  const selectedTreeNodes = useSelector(state => state.apiTesterReducer.selectedTreeNodes)
  const envVariables = useSelector(state => state.variablesReducer.variables.envVariables)

  const TabsContent = useSelector(state => state.apiTesterReducer.requestTabsContent)
  const [TabsContentKeys, setTabsContentKeys] = useState(Object.keys(TabsContent))
  const currentTab = useSelector(state => state.apiTesterReducer.currentTab)
  const isDeleteTabExecuted = useSelector(state => state.apiTesterReducer.isDeleteTabExecuted)
  const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
  const workspaces = useSelector(state => state.workSpaceReducer.workspaces)

  const [isAddEnvDialigOpen, setIsAddEnvDialigOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEnvId, setSelectedEnvId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [isExportEnvDailogOpen, setIsExportEnvDailogOpen] = useState(false);
  const open = Boolean(anchorEl);

  // fileFolderPath is actual path loaction which used to rename files
  const [fileFolderPath, setFileFolderPath] = useState("")
  const [currentFileName, setCurrentFileName] = useState("")
  const [renameEvent, setRenameEvent] = useState("FOLDER_OR_COLLECTION_RENAME")
  const [isRenameFolderDialog, setIsRenamFolderDialog] = useState(false);
  const [isDuplicateEnvDialog, setIsDuplicateEnvDialog] = useState(false);
  const [toBeDuplicateVariableValues, setToBeDuplicateVariableValues] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [envVariablesState, setEnvVariablesState] = useState("");

  const envVariablesKeys = Object.keys(envVariablesState)


  function filterEnvVariables(envVariables, searchName) {
    if (!searchName) return envVariables; // Return all if search is empty

    const lowerCaseSearch = searchName.toLowerCase();

    return Object.fromEntries(
      Object.entries(envVariables).filter(([key, value]) =>
        value.name.toLowerCase().includes(lowerCaseSearch)
      )
    );
  }

  useEffect(() => {
    if (!searchText.trim()) {
      setEnvVariablesState(envVariables)
    } else {
      let filteredVariables = filterEnvVariables(envVariables, searchText)
      setEnvVariablesState(filteredVariables)
    }
  }, [envVariables])

  const handleSelect = (event, nodeIds) => {
    dispatch({ type: "SET_SELECTED_TREE_NODES", selectedTreeNodes: nodeIds })
  };

  const getWorkSpaceLocation = (workspaceName) => {
    try {
      const workspace = workspaces.find(item => item.name === workspaceName);
      return workspace ? workspace.path : null;
    } catch (error) {
      return ""
    }
  }

  const handleClick = (nodeId, tabId, category) => {
    let selectedRequest = {
      isSaved: true,
      type: "ENV",
      nodeId: nodeId,
      category: category,
      name: category == "ENV_VARIABLE" ? envVariables[`${tabId}`].name : "global"
    }
    dispatch({ type: "ADD_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: tabId })
    dispatch({ type: "SET_CURRENT_TAB", currentTab: tabId })
  }

  const handleClickAddEnvVariableDialog = () => {
    setIsAddEnvDialigOpen(true);
  };

  useEffect(() => {
    const TabsContentKeysa = Object.keys(TabsContent)
    setTabsContentKeys(TabsContentKeysa)
  }, [currentTab])

  useEffect(() => {
    if (isDeleteTabExecuted == true) {
      const TabsContentKeysa = Object.keys(TabsContent)
      setTabsContentKeys(TabsContentKeysa)
      dispatch({ type: "SET_IS_DELETE_TAB_EXECUTED", isDeleteTabExecuted: false })
    }
  }, [isDeleteTabExecuted])

  const handleClickMenuItem = (action) => {
    if (action == "DELETE") {
      let payload = {
        envId: selectedEnvId,
        name: envVariables[selectedEnvId].name,
        workspace: selectedWorkSpace
      }
      const index = TabsContentKeys.indexOf(currentTab);
      deleteEnvVariables(payload).then((resp) => {
        if (selectedEnvId == currentTab) {
          let newTab = TabsContentKeys[index > 1 ? index - 1 : 0]
          dispatch({ type: "CLOSE_REQUEST_TAB_CONTENT", id: selectedEnvId, newTab: newTab, isChangeTab: true })
        } else {
          dispatch({ type: "CLOSE_REQUEST_TAB_CONTENT", id: selectedEnvId, newTab: TabsContentKeys[index], isChangeTab: false })
        }
        dispatch({ type: "SET_ENV_VARIABLES", envVariables: resp });
      })
    }
    if (action == "OPEN") {
      // setIsCreateFolderDialog(true);
      let tabId = selectedEnvId
      let category = selectedCategory
      handleClick(selectedNodeId, tabId, category);
    }
    if (action == "EXPORT") {
      setIsExportEnvDailogOpen(true);
    }
    if (action == "SHOW_IN_FOLDER") {
      let workSpaceLocation = getWorkSpaceLocation(selectedWorkSpace)
      let filePath = workSpaceLocation + "/variables/" + envVariables[selectedEnvId].name + ".json"
      revealInFolder({ filePath })
    }
    if (action == "RENAME") {
      let workSpaceLocation = getWorkSpaceLocation(selectedWorkSpace)
      let tempfileFolderPath = workSpaceLocation + "/variables"
      let tempcurrentFileName = envVariables[selectedEnvId].name + ".json"
      setRenameEvent("REQUEST_AND_FILE_RENAME")
      setFileFolderPath(tempfileFolderPath)
      setCurrentFileName(tempcurrentFileName)
      setIsRenamFolderDialog(true);
      // console.log("EnvfilePath", filePath)
    }
    if (action == "DUPLICATE") {
      setIsDuplicateEnvDialog(true);
      setToBeDuplicateVariableValues(envVariables[selectedEnvId]?.values || []);
    }
    setAnchorEl(null);
  }
  const handleClickOpenMenu = (event, nodeId, envId, category) => {
    setSelectedEnvId(envId);
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
    setSelectedNodeId(nodeId);
  };

  const OpenMenu = (nodeId, envId, category) => {
    return (
      <IconButton style={{ height: "20px", width: "20px" }} onClick={(event) => handleClickOpenMenu(event, nodeId, envId, category)}><MoreVertIcon /></IconButton>
    )
  }

  const renderLabelText = (labelText, nodeId, tabId, category) => {
    return (
      <Typography style={{ height: '100%', display: 'flex', alignItems: 'center', width: '100%' }} variant="body2" onClick={() => handleClick(nodeId, tabId, category)}>{labelText}</Typography>
    )
  }

  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchText(value)

    if (!value.trim()) {
      setEnvVariablesState(envVariables)
    } else {
      let filteredVariables = filterEnvVariables(envVariables, value)
      setEnvVariablesState(filteredVariables)
    }
  }

  return (
    <>
      <Menu sx={{ zIndex: 360 }} anchorEl={anchorEl} open={open} onClose={() => handleClickMenuItem("")}>
        <MenuItem onClick={() => handleClickMenuItem("OPEN")}><Typography >Open</Typography></MenuItem>
        <MenuItem onClick={() => handleClickMenuItem("RENAME")}><Typography>Rename</Typography></MenuItem>
        <MenuItem onClick={() => handleClickMenuItem("DUPLICATE")}><Typography>Duplicate</Typography></MenuItem>
        <MenuItem onClick={() => handleClickMenuItem("DELETE")}><Typography sx={{ color: "red" }}>Delete</Typography></MenuItem>
        <MenuItem onClick={() => handleClickMenuItem("EXPORT")}><Typography>Export</Typography></MenuItem>
        <MenuItem onClick={() => handleClickMenuItem("SHOW_IN_FOLDER")}><Typography>Reveal In Folder</Typography></MenuItem>
      </Menu>

      <DuplicateEnvVariableDialog open={isDuplicateEnvDialog} setOpen={setIsDuplicateEnvDialog} variablesValues={toBeDuplicateVariableValues} />

      <RenameItemDialog
        open={isRenameFolderDialog}
        setOpen={setIsRenamFolderDialog}
        folderPath={[]}
        setFolderPath={() => { }}
        fileFolderPath={fileFolderPath}
        currentFileName={currentFileName}
        renameEvent={renameEvent}
        setFileFolderPath={setFileFolderPath}
        setCurrentFileName={setCurrentFileName}
        setRenameEvent={setRenameEvent}
        requestOrFileType={""}
      />

      <AddEnvVariableDialog open={isAddEnvDialigOpen} setOpen={setIsAddEnvDialigOpen} />
      <ExportEnvDialog open={isExportEnvDailogOpen} setOpen={setIsExportEnvDailogOpen} envId={selectedEnvId} />
      <Box className={classes.sideBarHeader}>
        {/* <Typography style={{ paddingLeft: '10px', fontFamily: "Noto Sans", textTransform: "none" }}>Add Env</Typography> */}
        <TextField
          variant="outlined"
          placeholder="Search Env..."
          value={searchText}
          onChange={handleSearch}
          size="small"
          sx={{ flexGrow: 1, paddingLeft: '10px', height: 30, '& .MuiInputBase-root': { height: '100%' } }}
        />
        <IconButton onClick={handleClickAddEnvVariableDialog}><AddIcon /></IconButton>
      </Box>
      <Grid style={{ flexGrow: 1, overflow: 'hidden', paddingBottom: '5px' }}>
        <Grid className={classes.scrollableSection}>
          <TreeView
            aria-label="controlled"
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            expanded={[]}
            selected={selectedTreeNodes}
            onNodeSelect={handleSelect}
            multiSelect
            style={{
              width: "100%",
              position: "absolute",
              height: "100%",
              overflowY: "scroll",
              overflowX: "hidden",
              paddingBottom: "5px"
            }}
          >
            <StyledTreeItem nodeId="44fbfd20-8419-49e9-bde6-d5dce6bb02c5o" labeltext={renderLabelText("Global Env", "44fbfd20-8419-49e9-bde6-d5dce6bb02c50", "44fbfd20-8419-49e9-bde6-d5dce6bb02c5", 'GLOBAL_VARIABLE')}>
            </StyledTreeItem >
            {envVariablesKeys.map((envVariable, index) => {
              return (
                <StyledTreeItem key={envVariable + index} nodeId={envVariable} labeltext={renderLabelText(envVariablesState[`${envVariable}`]?.name || '', envVariable, envVariable, 'ENV_VARIABLE')} labeliconc={OpenMenu(envVariable, envVariable, 'ENV_VARIABLE')}>
                </StyledTreeItem >
              )
            })}
          </TreeView>
        </Grid>
      </Grid>
    </>
  );
}

export default EnvPannel;