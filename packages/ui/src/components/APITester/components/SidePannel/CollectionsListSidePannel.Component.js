import React, { useEffect, useState, useRef } from 'react';
import FolderIcon from '@mui/icons-material/Folder';
import { Typography, Grid, IconButton, Box, Menu, MenuItem, Tab, Tabs, TextField } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import { getAPITesterCollections } from "../../../../services/getAPITesterCollection"
import { TreeView } from '@mui/x-tree-view/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StyledTreeItem from '../../../../commonComponents/StyledTreeItem/StyledTreeItem';
import styles from "./CollectionList.Style"
import AddIcon from "@mui/icons-material/Add"
import CreateCollectionDialog from './CreateCollectionDialog.Component';
import RenameItemDialog from './RenamItemDialog.component';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useDispatch, useSelector } from 'react-redux';
import { deleteCollectionItem } from "../../../../services/deleteCollectionItem"
import { deleteCollectionRequest } from "../../../../services/deleteCollectionRequest"
import EnvPannel from './EnvPannel/EnvPannel.Component';
import RequestDialog from '../../../../commonComponents/RequestDailog/RequestDailog'
import { useTheme } from '@mui/material/styles';
import { CollectionIcon } from '../../../../commonComponents/icons/svgIcons.Component';
import BuildIcon from '@mui/icons-material/Build';
import ExportDialog from '../../../../commonComponents/ExportDailog/ExportDailog.Component';
import { revealInFolder } from '../../../../services/BrowseDirectory.Service';
import { cloneDeep } from 'lodash';
import { updateCollectionRequest } from '../../../../services/updateCollectionRequest';
import { Article } from '@mui/icons-material';

export default function NestedList(props) {

  const classes = styles()
  const dispatch = useDispatch();
  const theme = useTheme();

  const ref = useRef(null);
  const refRight = useRef(null);

  const apiCollectionR = useSelector(state => state.apiTesterReducer.apiCollection)
  const expandedTreeNodes = useSelector(state => state.apiTesterReducer.expandedTreeNodes)
  const selectedTreeNodes = useSelector(state => state.apiTesterReducer.selectedTreeNodes)
  const TabsContent = useSelector(state => state.apiTesterReducer.requestTabsContent)
  const [TabsContentKeys, setTabsContentKeys] = useState(Object.keys(TabsContent))
  const currentTab = useSelector(state => state.apiTesterReducer.currentTab)

  const [apiCollection, setApiCollection] = useState({})
  const [selected, setSelected] = useState([]);
  const [isCreateCollectionDialigOpen, setIsCreateCollectionDialigOpen] = useState(false);
  const [isRenameFolderDialog, setIsRenamFolderDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(false);
  const [folderPath, setFolderPath] = useState([])
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [selectedNodeId, setSelectedNodeId] = useState('Default')
  const [selectedRequest, setSelectedRequest] = useState({})
  const [createItemAction, setCreateItemAction] = useState("CREATE_COLLECTION")
  const [isCreateRequestDialigOpen, setIsCreateRequestDialigOpen] = useState(false);
  const [isExportDailogOpen, setIsExportDailogOpen] = useState(false);
  const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
  const component = useSelector(state => state.sideBarReducer.component)
  const [searchText, setSearchText] = useState("");
  const [folderObject, setFolderObject] = useState({});

  const [requestAnchorEl, setRequestAnchorEl] = useState(null);
  const [toBeDeleteRequestId, setToBeDeleteRequestId] = useState("");
  const openRequestMenu = Boolean(requestAnchorEl);
  const [toBeDeleteFileName, setToBeDeleteFileName] = useState("");

  const [reqExampleAnchorEl, setReqExampleAnchorEl] = useState(null);
  const openReqExampleMenu = Boolean(reqExampleAnchorEl);

  const collections = Object.keys(apiCollection);

  function filterCollections(apiCollection, searchName) {
    function filterItem(item) {
      const filteredRequests = item.requests.filter(request =>
        request.name.toLowerCase().includes(searchName.toLowerCase())
      );
      const filteredFiles = item.files.filter(file =>
        file.name.toLowerCase().includes(searchName.toLowerCase())
      );

      const filteredItems = Object.entries(item.items || {}).reduce((acc, [itemId, subItem]) => {
        const filteredSubItem = filterItem(subItem);
        if (filteredSubItem) {
          acc[itemId] = filteredSubItem;
        }
        return acc;
      }, {});

      if (filteredRequests.length > 0 || filteredFiles.length > 0 || Object.keys(filteredItems).length > 0) {
        return {
          ...item,
          requests: filteredRequests,
          files: filteredFiles,
          items: filteredItems
        };
      }
      return null;
    }

    return Object.entries(apiCollection).reduce((filtered, [collectionId, collection]) => {
      const filteredCollection = filterItem(collection);
      if (filteredCollection) {
        filtered[collectionId] = filteredCollection;
      }
      return filtered;
    }, {});
  }

  const [width, setWidth] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const [sidePannelTabValue, setSidePannelTabValue] = useState('1');

  // fileFolderPath is actual path loaction which used to rename files
  const [fileFolderPath, setFileFolderPath] = useState("")
  const [currentFileName, setCurrentFileName] = useState("")
  const [renameEvent, setRenameEvent] = useState("FOLDER_OR_COLLECTION_RENAME")

  useEffect(() => {
    if (!searchText.trim()) {
      setApiCollection(apiCollectionR)
    } else {
      let filteredCollection = filterCollections(apiCollectionR, searchText)
      setApiCollection(filteredCollection)
    }
  }, [apiCollectionR])

  useEffect(() => {
    getAPITesterCollections(selectedWorkSpace).then((apiCollection) => {
      setApiCollection(apiCollection)
      dispatch({ type: "SET_API_COLLECTION", apiCollection: apiCollection });
    })
  }, [])

  useEffect(() => {
    const TabsContentKeysa = Object.keys(TabsContent)
    setTabsContentKeys(TabsContentKeysa)
  }, [currentTab])


  const handleClickOpenCollectionDialog = () => {
    setCreateItemAction("CREATE_COLLECTION")
    setIsCreateCollectionDialigOpen(true);
  };



  const handleClickMenuItem = (action) => {
    if (action == "ADD_FOLDER") {
      setIsCreateCollectionDialigOpen(true);
      setCreateItemAction("ADD_FOLDER")
    }
    if (action == "ADD_REQUEST") {
      setIsCreateRequestDialigOpen(true)
      setCreateItemAction("ADD_REQUEST")
    }
    if (action == "DELETE") {
      let payload = {
        collectionId: selectedCollection,
        path: folderPath,
        workspace: selectedWorkSpace
      }
      const index = TabsContentKeys.indexOf(currentTab);
      deleteCollectionItem(payload).then((resp) => {
        const tabValue = selectedCollection
        if (tabValue != "Default") {
          if (tabValue == currentTab) {
            let newTab = TabsContentKeys[index > 1 ? index - 1 : 0]
            dispatch({ type: "CLOSE_REQUEST_TAB_CONTENT", id: tabValue, newTab: newTab, isChangeTab: true })
          } else {
            dispatch({ type: "CLOSE_REQUEST_TAB_CONTENT", id: tabValue, newTab: TabsContentKeys[index], isChangeTab: false })
          }
        }
        dispatch({ type: "SET_API_COLLECTION", apiCollection: resp })
      })
    }
    if (action == "RENAME") {
      setIsRenamFolderDialog(true);
      setRenameEvent("FOLDER_OR_COLLECTION_RENAME")
    }
    if (action == "DUPLICATE_FOLDER") {
      setIsCreateCollectionDialigOpen(true);
      setCreateItemAction("DUPLICATE_FOLDER")
    }
    if (action == "MANAGE") {
      let selectedRequest = {
        isSaved: true,
        type: "COLLECTION",
        nodeId: selectedNodeId,
        collectionVariables: apiCollection[selectedCollection].collectionVariables || [],
        collectionDisplayName: apiCollection[selectedCollection]?.name,
        auth: apiCollection[selectedCollection].auth || {
          authType: 'none',
          basic: { username: "", password: "" },
          bearer: [],

        },
        docs: apiCollection[selectedCollection].docs,
        location: apiCollection[selectedCollection].location,
        runnerResults: [],
        collectionTabValue: 'info',
        selectedRunnerResultIndex: -1
      }
      dispatch({ type: "ADD_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: selectedCollection })
      dispatch({ type: "SET_CURRENT_TAB", currentTab: selectedCollection })
    }

    if (action == "MANAGE_FOLDER") {
      let namePath = calculateNamePath(apiCollection[selectedCollection], folderPath, [], 0, folderPath.length)
      let filePath = apiCollection[selectedCollection]?.location
      filePath = filePath + "/" + namePath.map(item => item.name).join('/')
      let selectedRequest = {
        id: selectedNodeId,
        isSaved: true,
        type: "FOLDER",
        name: folderObject?.name,
        nodeId: selectedNodeId,
        collectionId: selectedCollection,
        collectionDisplayName: apiCollection[selectedCollection]?.name,
        namePath: namePath,
        path: folderPath || [],
        docs: folderObject?.docs || '',
        location: filePath,
        collectionTabValue: 'info',
      }
      dispatch({ type: "ADD_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: selectedNodeId })
      dispatch({ type: "SET_CURRENT_TAB", currentTab: selectedNodeId })
    }

    if (action == "EXPORT") {
      setIsExportDailogOpen(true);
    }
    if (action == "SHOW_IN_FOLDER") {
      let filePath = apiCollection[selectedCollection]?.location
      let namePath = calculateNamePath(apiCollection[selectedCollection], folderPath, [], 0, folderPath.length)
      filePath = filePath + "/" + namePath.map(item => item.name).join('/')
      revealInFolder({ filePath })
    }
    setAnchorEl(null);
  }
  const handleClickOpenMenu = (event, collectionName, path, nodeId, folderObject) => {
    setSelectedCollection(collectionName)
    setFolderPath(path);
    setAnchorEl(event.currentTarget);
    setSelectedNodeId(nodeId);
    setFolderObject(folderObject);
  };

  const handleClickRequestMenuItem = (action) => {
    if (action == "DELETE") {
        let payload = {
          collectionId: selectedCollection, path: folderPath, requestId: toBeDeleteRequestId, workspace: selectedWorkSpace
        }
        const index = TabsContentKeys.indexOf(currentTab);
        deleteCollectionRequest(payload).then((resp) => {
          const tabValue = toBeDeleteRequestId
          if (tabValue != "Default") {
            if (tabValue == currentTab) {
              let newTab = TabsContentKeys[index > 1 ? index - 1 : 0]
              dispatch({ type: "CLOSE_REQUEST_TAB_CONTENT", id: tabValue, newTab: newTab, isChangeTab: true })
            } else {
              dispatch({ type: "CLOSE_REQUEST_TAB_CONTENT", id: tabValue, newTab: TabsContentKeys[index], isChangeTab: false })
            }
          }
          dispatch({ type: "SET_API_COLLECTION", apiCollection: resp })
        })

    } if (action == "DUPLICATE") {
        setIsCreateRequestDialigOpen(true)
        setCreateItemAction("DUPLICATE_REQUEST")
    }
    if (action == "OPEN") {
        handleRequestClick(selectedRequest, selectedCollection, folderPath, selectedNodeId);
    }
    if (action == "SHOW_IN_FOLDER") {
        let filePath = apiCollection[selectedCollection]?.location
        let namePath = calculateNamePath(apiCollection[selectedCollection], folderPath, [], 0, folderPath.length)
        filePath = filePath + "/" + namePath.map(item => item.name).join('/') + "/" + selectedRequest.name + ".json"
        revealInFolder({ filePath })
    }
    if (action == "RENAME") {
        let filePath = apiCollection[selectedCollection]?.location
        let namePath = calculateNamePath(apiCollection[selectedCollection], folderPath, [], 0, folderPath.length)
        let tempfileFolderPath = filePath + "/" + namePath.map(item => item.name).join('/')
        let tempcurrentFileName = selectedRequest.name + ".json"
        setRenameEvent("REQUEST_AND_FILE_RENAME")
        setFileFolderPath(tempfileFolderPath)
        setCurrentFileName(tempcurrentFileName)
        setIsRenamFolderDialog(true);
    }
    setRequestAnchorEl(null);
  }
  const handleSaveRequest = () => {
    let payload = {
      path: folderPath,
      collectionName: selectedCollection,
      workspace: selectedWorkSpace,
      request: selectedRequest
    }
    updateCollectionRequest(payload).then((resp) => {
      if (resp.error) {
        console.log("Error", error)
      } else {
        dispatch({ type: "SET_API_COLLECTION", apiCollection: resp })
        handleRequestClick(selectedRequest, selectedCollection, folderPath, selectedNodeId, false);
        const index = TabsContentKeys.indexOf(currentTab);
        const tabValue = toBeDeleteRequestId
        if (tabValue != "Default") {
          if (tabValue == currentTab) {
            let newTab = TabsContentKeys[index > 1 ? index - 1 : 0]
            dispatch({ type: "CLOSE_REQUEST_TAB_CONTENT", id: tabValue, newTab: newTab, isChangeTab: true })
          } else {
            dispatch({ type: "CLOSE_REQUEST_TAB_CONTENT", id: tabValue, newTab: TabsContentKeys[index], isChangeTab: false })
          }
        }

      }
    })
  }

  const handleClickReqExampleMenuItem = (action) => {
    if (action == "DELETE") {
      handleSaveRequest()
    }
    setReqExampleAnchorEl(null);
  }


  const handleClickOpenRequestMenu = (event, collectionName, path, requestId, request, nodeId) => {
    setSelectedCollection(collectionName)
    setFolderPath(path);
    setRequestAnchorEl(event.currentTarget);
    setToBeDeleteRequestId(requestId);

    setSelectedNodeId(nodeId);
    setSelectedRequest(request);
  }

  function deleteExampleById(request, idToDelete) {
    if (!request.examples) return request; // Ensure examples array exists

    request.examples = request.examples.filter(example => example.id !== idToDelete);
    return request
  }

  const handleClickOpenExampleMenuRequestMenu = (event, collectionName, path, requestId, example, request) => {
    setSelectedCollection(collectionName)
    setFolderPath(path);
    setReqExampleAnchorEl(event.currentTarget);
    setSelectedNodeId(requestId);
    setToBeDeleteRequestId(example.id);
    let exampleId = example.id;
    let cloneReq = cloneDeep(request);
    cloneReq = deleteExampleById(cloneReq, exampleId)
    setSelectedRequest(cloneReq);
  }

  const handleToggle = (event, nodeIds) => {
    dispatch({ type: "SET_EXPANDED_TREE_NODES", expandedTreeNodes: nodeIds });
  };

  const handleSelect = (event, nodeIds) => {
    dispatch({ type: "SET_SELECTED_TREE_NODES", selectedTreeNodes: nodeIds })
  };


  const calculateNamePath = (object, path, namePath, index, n) => {
    if (index == n - 1) {
      let namePathA = [...namePath, { path: path[index], name: object.items[`${path[index]}`]["name"] }]

      return namePathA
    }
    if (n == 0) {
      let namePathA = []
      return namePathA
    }
    let namePathA = [...calculateNamePath(object.items[`${path[index]}`], path, namePath, index + 1, n)]
    namePathA = [{ path: path[index], name: object.items[`${path[index]}`]["name"] }, ...namePathA]
    return namePathA
  }

  const handleRequestClick = (request, collectionName, path, nodeId, setCurrentTab = true) => {
    let namePath = calculateNamePath(apiCollection[collectionName], path, [], 0, path.length)

    let selectedRequest = {
      isSaved: true,
      type: "Request",
      path: path,
      namePath: namePath,
      collectionName: collectionName,
      collectionDisplayName: apiCollection[collectionName]?.name,
      request: {
        ...request,
        name: request.name,
        id: request.id,
        method: request.method,
        url: request.url,
        body: request.body,
        headers: request.headers,
        bodyType: request.bodyType,
        auth: request.auth,
        urlContent: request.urlContent || {
          query: []
        },
      },
      nodeId: nodeId,
      response: {
        body: ''
      },
      isResponseLoading: false,
      testResults: {
        assertResults: [],
        testResults: []
      },
    }
    dispatch({ type: "ADD_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: request.id })
    if (setCurrentTab) {
      dispatch({ type: "SET_CURRENT_TAB", currentTab: request.id })
    }
  }

  const pop = (path) => {
    path.pop()
    return (null)
  }

  const renderAPIFolderList = (key, folderObject, path) => {
    if (folderObject["items"]) {
      const folders = Object.keys(folderObject["items"])

      return (
        <>
          {
            folders && folders.map((folder, index) => {
              path.push(folder)
              let newPath = [...path]
              const nodeId = folder;
              return (
                <StyledTreeItem key={folder + index} nodeId={nodeId} labeltext={folderObject["items"][folder]?.name || folder} labelicon={<FolderIcon />} labeliconc={OpenMenu(key, newPath, nodeId, folderObject["items"][folder])}>
                  {renderAPIFolderList(key, folderObject["items"][folder], path)}
                  {renderRequestList(folderObject["items"][folder]["requests"], folder + index, key, newPath)}
                  {pop(path)}
                </StyledTreeItem>
              )
            })

          }
        </>
      )
    } else {
      return null
    }
  }

  const renderAPIRequestText = (method, url, request, collectionName, path, nodeId) => {
    return (
      <Typography variant="body2" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: '4px' }} noWrap onClick={() => handleRequestClick(request, collectionName, path, nodeId)}>
        <span className={classes[method]} style={{ fontSize: '12px' }}>{method}</span>
        {request.name}
      </Typography>
    )
  }

  const handleExampleClick = (example, collectionName, path, nodeId, requestId) => {
    let namePath = calculateNamePath(apiCollection[collectionName], path, [], 0, path.length)
    let request = example.originalRequest;
    let selectedRequest = {
      isSaved: true,
      type: "REQUEST_EXAMPLE",
      path: path,
      namePath: namePath,
      collectionName: collectionName,
      collectionDisplayName: apiCollection[collectionName]?.name,
      requestId: requestId,
      request: {
        ...request,
        name: example.name,
        id: example.id,
        method: request.method,
        url: request.url,
        body: request.body,
        headers: request.headers,
        bodyType: request.bodyType,
        auth: request.auth,
        urlContent: request.urlContent || {
          query: []
        },
      },
      nodeId: nodeId,
      response: example.response,
      isResponseLoading: false,
      testResults: {
        assertResults: [],
        testResults: []
      },
    }
    dispatch({ type: "ADD_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: example.id })
    dispatch({ type: "SET_CURRENT_TAB", currentTab: example.id })
  }

  const renderAPIExampleText = (example, collectionName, path, nodeId, requestId) => {
    return (
      <Typography variant="body2" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: '4px' }} noWrap onClick={() => handleExampleClick(example, collectionName, path, nodeId, requestId)}> {example.name}</Typography>
    )
  }

  const renderRequestList = (requests, parentNodeID, collectionName, path) => {
    return (
      <>
        {
          requests.map((request, i) => {
            const nodeId = request.id
            const examples = request.examples || []
            return (

              <StyledTreeItem key={parentNodeID + i} nodeId={nodeId} labeltext={renderAPIRequestText(request.method, request.url, request, collectionName, path, nodeId)} labeliconc={OpenRequestMenu(collectionName, path, request.id, request, nodeId)}>
                {examples.length > 0 ? renderExamplesList(request.examples || [], parentNodeID, collectionName, path, request.id, request) : null}
              </StyledTreeItem>

            )
          })
        }
      </>)
  }

  const renderExamplesList = (examples, parentNodeID, collectionName, path, requestId, request) => {
    return (
      <>
        {
          examples.map((example, i) => {
            const nodeId = example.id
            return (

              <StyledTreeItem key={parentNodeID + i} nodeId={nodeId} labeltext={renderAPIExampleText(example, collectionName, path, nodeId, requestId)} labeliconc={OpenExampleMenu(collectionName, path, requestId, example, request)} labelicon={<Article style={{ height: '16px' }}></Article>}>
              </StyledTreeItem>

            )
          })
        }
      </>)
  }

  const OpenExampleMenu = (collectionName, path, requestId, example, request) => {
    return (
      <IconButton style={{ height: "20px", width: "20px" }} onClick={(event) => handleClickOpenExampleMenuRequestMenu(event, collectionName, path, requestId, example, request)}><MoreVertIcon /></IconButton>
    )
  }


  const collectionTitleRenderer = (collectionName) => {
    return (
      <Typography style={{ height: '100%', display: 'flex', alignItems: 'center' }} >{collectionName}</Typography>
    )
  }

  const OpenMenu = (collectionName, path, nodeId, folderObject) => {
    return (
      <IconButton style={{ height: "20px", width: "20px" }} onClick={(event) => handleClickOpenMenu(event, collectionName, path, nodeId, folderObject)}><MoreVertIcon /></IconButton>
    )
  }

  const OpenRequestMenu = (collectionName, path, requestId, request, nodeId) => {
    return (
      <IconButton style={{ height: "20px", width: "20px" }} onClick={(event) => handleClickOpenRequestMenu(event, collectionName, path, requestId, request, nodeId)}><MoreVertIcon /></IconButton>
    )
  }


  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth = e.clientX;
        setWidth(newWidth > 50 ? newWidth : 50); // Minimum width of 50px
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
  }, [isResizing]);

  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchText(value)

    if (!value.trim()) {
      setApiCollection(apiCollectionR)
    } else {
      let filteredCollection = filterCollections(apiCollectionR, value)
      setApiCollection(filteredCollection)
    }
  }

  const renderTabContent = (tabContentId) => {
    switch (tabContentId) {
      case 'API_TESTER':
        return (
          <TabContext value={sidePannelTabValue}>
            <Tabs style={{ borderBottom: theme.palette.mode == "dark" ? "1px solid #333" : "1px solid #C8CDD7" }} variant='fullWidth' value={sidePannelTabValue} onChange={(event, value) => setSidePannelTabValue(value)}>
              <Tab style={{ fontFamily: "Noto Sans", textTransform: "none" }} label={<Box sx={{ display: 'flex', alignItems: 'center', gap: "8px" }}><CollectionIcon style={{ height: '22px' }} /> Collections</Box>} value="1" />
              <Tab style={{ fontFamily: "Noto Sans", textTransform: "none" }} label={<Box sx={{ display: 'flex', alignItems: 'center', gap: "8px" }}><BuildIcon style={{ height: '16px' }} /> ENV</Box>} value="2" />
            </Tabs>
            <TabPanel style={{ display: 'flex', flexDirection: 'column', padding: '0px', flexGrow: sidePannelTabValue == "1" ? 1 : 0 }} value="1">

              <Box className={classes.sideBarHeader}>
                <TextField
                  variant="outlined"
                  placeholder="Search..."
                  value={searchText}
                  onChange={handleSearch}
                  size="small"
                  sx={{ flexGrow: 1, paddingLeft: '10px', height: 30, '& .MuiInputBase-root': { height: '100%' } }}
                />

                <IconButton onClick={handleClickOpenCollectionDialog}><AddIcon /></IconButton>
              </Box>
              <Grid style={{ flexGrow: 1, overflow: 'hidden', paddingBottom: '5px' }}>
                <Grid className={classes.scrollableSection}>
                  <TreeView
                    aria-label="controlled"
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    expanded={expandedTreeNodes}
                    selected={selectedTreeNodes}
                    onNodeToggle={handleToggle}
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
                    {collections.map((collection, index) => {
                      let path = []
                      const nodeId = collection
                      return (

                        <StyledTreeItem key={collection + index} nodeId={nodeId} labeltext={collectionTitleRenderer(apiCollection[collection]?.name || collection)} labeliconc={OpenMenu(collection, path, nodeId)}>
                          {renderAPIFolderList(collection, apiCollection[collection], path)}
                          {renderRequestList(apiCollection[collection]["requests"], collection + index, collection, path)}
                        </StyledTreeItem >

                      )
                    })}
                  </TreeView>
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel style={{ display: 'flex', flexDirection: 'column', padding: '0px', flexGrow: sidePannelTabValue == "2" ? 1 : 0 }} value="2">
              <EnvPannel />
            </TabPanel>
          </TabContext>
        );
      default:
        return <></>
    }
  }

  return (
    <Box className={classes.sidePanel} style={{ width }}>
      <Menu sx={{ zIndex: 360 }} anchorEl={anchorEl} open={open} onClose={() => handleClickMenuItem("")}>
        <MenuItem onClick={() => handleClickMenuItem("ADD_FOLDER")}>Add Folder</MenuItem>
        <MenuItem onClick={() => handleClickMenuItem("ADD_REQUEST")}>Add Request</MenuItem>
        <MenuItem onClick={() => handleClickMenuItem("DUPLICATE_FOLDER")}><Typography>Duplicate</Typography></MenuItem>
        <MenuItem onClick={() => handleClickMenuItem("DELETE")}><Typography sx={{ color: "red" }}>Delete</Typography></MenuItem>
        <MenuItem onClick={() => handleClickMenuItem("RENAME")}><Typography >Rename</Typography></MenuItem>
        {folderPath.length == 0 ? <MenuItem onClick={() => handleClickMenuItem("MANAGE")}><Typography >Manage</Typography></MenuItem> : null}
        {folderPath.length == 0 ? <MenuItem onClick={() => handleClickMenuItem("EXPORT")}><Typography >Export</Typography></MenuItem> : null}
        {folderPath.length != 0 ? <MenuItem onClick={() => handleClickMenuItem("MANAGE_FOLDER")}><Typography >Manage</Typography></MenuItem> : null}
        <MenuItem onClick={() => handleClickMenuItem("SHOW_IN_FOLDER")}><Typography sx={{}}>Reveal In Folder</Typography></MenuItem>
      </Menu>

      <Menu anchorEl={requestAnchorEl} open={openRequestMenu} onClose={() => handleClickRequestMenuItem("")}>
        <MenuItem onClick={() => handleClickRequestMenuItem("OPEN")}><Typography sx={{}}>Open</Typography></MenuItem>
        <MenuItem onClick={() => handleClickRequestMenuItem("RENAME")}><Typography sx={{}}>Rename</Typography></MenuItem>
        <MenuItem onClick={() => handleClickRequestMenuItem("DUPLICATE")}><Typography sx={{}}>Duplicate</Typography></MenuItem>
        <MenuItem onClick={() => handleClickRequestMenuItem("DELETE")}><Typography sx={{ color: "red" }}>Delete</Typography></MenuItem>
        <MenuItem onClick={() => handleClickRequestMenuItem("SHOW_IN_FOLDER")}><Typography sx={{}}>Reveal In Folder</Typography></MenuItem>
      </Menu>

      <Menu anchorEl={reqExampleAnchorEl} open={openReqExampleMenu} onClose={() => handleClickReqExampleMenuItem("")}>
        <MenuItem onClick={() => handleClickReqExampleMenuItem("DELETE")}><Typography sx={{ color: "red" }}>Delete</Typography></MenuItem>
      </Menu>
      <CreateCollectionDialog open={isCreateCollectionDialigOpen} setOpen={setIsCreateCollectionDialigOpen} collectionId={selectedCollection} path={folderPath} setPath={setFolderPath} action={createItemAction} />

      <RenameItemDialog
        open={isRenameFolderDialog}
        setOpen={setIsRenamFolderDialog}
        apiCollection={apiCollection}
        selectedCollection={selectedCollection}
        folderPath={folderPath}
        setFolderPath={setFolderPath}
        fileFolderPath={fileFolderPath}
        currentFileName={currentFileName}
        renameEvent={renameEvent}
        setFileFolderPath={setFileFolderPath}
        setCurrentFileName={setCurrentFileName}
        setRenameEvent={setRenameEvent}
        requestOrFileType={selectedRequest.type}
      />

      <RequestDialog open={isCreateRequestDialigOpen} setOpen={setIsCreateRequestDialigOpen} collectionId={selectedCollection} path={folderPath} setPath={setFolderPath} action={createItemAction} requestId={toBeDeleteRequestId} />
      <ExportDialog open={isExportDailogOpen} setOpen={setIsExportDailogOpen} collectionId={selectedCollection} />

      {renderTabContent(component)}
    </Box>
  );
}
