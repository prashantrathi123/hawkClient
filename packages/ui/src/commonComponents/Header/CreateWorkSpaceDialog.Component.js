import * as React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { addWorkSpaces } from "../../services/workSpace.Service"
import { browseDirectory } from '../../services/BrowseDirectory.Service';
import { isValidFolderName } from '../../utils/validationUtil';
import { TabContext, TabPanel, TabList } from '@mui/lab';
import { Tab, Tabs, Typography, InputLabel, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function CreateWorkSpaceDialog(props) {
  const theme = useTheme();
  const { open, setOpen } = props;
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDespriction] = useState("");
  const [folderPath, setFolderPath] = useState('');
  const [error, setError] = useState('invalid folder name');
  const dispatch = useDispatch()
  const workspaces = useSelector(state => state.workSpaceReducer.workspaces)
  const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
  const [isInvalidName, setIsInvalidName] = useState(true);
  const [createTab, setCreateTab] = useState("1");
  const [linkDirectoryPath, setLinkDirectoryPath] = useState('');

  const handleClose = () => {
    setOpen(false);
    setCollectionName("");
    setFolderPath("");
    setLinkDirectoryPath("")
    setCreateTab("1")
    setError('invalid folder name')
  };

  const handleNameChange = (event) => {
    const { value } = event.target;
    setIsInvalidName(isValidFolderName(value));
    setError(isValidFolderName(value) ? "invalid folder name" : "")
    setCollectionName(value)
  }

  const handleCreateCollection = () => {
    let tempWorkSpaces = [...workspaces]
    // Check if a workspace with the given name exists
    const workspaceExists = tempWorkSpaces.some(tempWorkSpaces => tempWorkSpaces.name === collectionName);

    // If the workspace does not exist, append the new workspace to the array
    let directoryPath = folderPath;
    if (createTab == "2") {
      directoryPath = linkDirectoryPath
    }
    if (!workspaceExists) {
      tempWorkSpaces.push({ name: collectionName, path: directoryPath });
    } else {
      setError("WorkSpace already exists");
      return
    }
    let workSpaceRequest = {
      workspaces: tempWorkSpaces,
      selectedWorkSpace: collectionName
    }
    if (createTab == "2") {
      workSpaceRequest['isLinkCollectionTriggered'] = true
      workSpaceRequest['workspacePath'] = directoryPath
      workSpaceRequest['workSpaceName'] = collectionName
    }

    addWorkSpaces(workSpaceRequest).then((res) => {
      dispatch({ type: "SET_WORK_SPACES_AND_SELECTED_WORK_SPACE", workspaces: res.workspaces, selectedWorkSpace: res.selectedWorkSpace })
      setOpen(false);
      setCollectionName("");
      setFolderPath("");
      setLinkDirectoryPath("")
      setCreateTab("1")
    })

  };

  const handlePickFolder = async () => {
    const result = await browseDirectory();
    if (result && result.length > 0) {
      setFolderPath(result[0]);
    }
  };

  function getLastPathSegment(directoryPath) {
    if (!directoryPath) return '';

    // Normalize all backslashes to forward slashes
    const normalizedPath = directoryPath.replace(/\\/g, '/');

    // Remove trailing slash if it exists
    const cleanedPath = normalizedPath.replace(/\/$/, '');

    // Split by slash and return last segment
    const segments = cleanedPath.split('/');
    return segments[segments.length - 1];
  }


  const handlePickLinkFolder = async () => {
    const result = await browseDirectory();
    if (result && result.length > 0) {
      setLinkDirectoryPath(result[0]);
      let value = getLastPathSegment(result[0]);
      setIsInvalidName(isValidFolderName(value));
      setError(isValidFolderName(value) ? "invalid folder name" : "")
      setCollectionName(value)
    }
  };

  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create Work Space</DialogTitle>
        <DialogContent>
          <TabContext value={createTab}>
            <Tabs value={createTab} style={{ height: "36px", position: "relative", zIndex: 20, background: "background.default", overflow: 'hidden' }} onChange={(e, value) => { setCreateTab(value) }} aria-label="create tabs">
              <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", padding: "2px" }} label="Add" value="1" />
              <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", padding: "2px", display: typeof electron == 'undefined' ? 'none' : 'flex' }} label="Link" value="2" />
            </Tabs>
            <TabPanel value="1">
              <InputLabel required sx={{
                '& .MuiInputLabel-asterisk': {
                  color: 'red',
                },
              }}>Name</InputLabel>
              <TextField
                size="small"
                margin="dense"
                value={collectionName}
                error={error.length > 0}
                id="name"
                label="Work Space Name"
                fullWidth
                variant="outlined"
                onChange={(event) => handleNameChange(event)}
                helperText={error}
              />
              <InputLabel sx={{ display: typeof electron == 'undefined' ? "none" : "flex" }}>Directory</InputLabel>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <TextField
                  size="small"
                  margin="dense"
                  value={folderPath ? folderPath : ''}
                  id="description"
                  label="Work Space path"
                  fullWidth
                  disabled
                  variant="outlined"
                  onChange={(event) => { }}
                  style={{ display: typeof electron == 'undefined' ? "none" : "flex" }}
                />
                <Button variant='contained' style={{ display: typeof electron == 'undefined' ? "none" : "flex" }} onClick={handlePickFolder}>Choose</Button>
              </Box>
            </TabPanel>
            <TabPanel value="2">
              <InputLabel required sx={{
                '& .MuiInputLabel-asterisk': {
                  color: 'red',
                },
                display: typeof electron == 'undefined' ? "none" : "flex"
              }}>Directory</InputLabel>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <TextField
                  size="small"
                  margin="dense"
                  value={linkDirectoryPath ? linkDirectoryPath : ''}
                  id="description"
                  label="Work Space path"
                  fullWidth
                  disabled
                  variant="outlined"
                  onChange={(event) => { }}
                  style={{ display: typeof electron == 'undefined' ? "none" : "flex" }}
                />
                <Button variant='contained' style={{ display: typeof electron == 'undefined' ? "none" : "flex" }} onClick={handlePickLinkFolder}>Choose</Button>
              </Box>
              <InputLabel style={{ color: theme.palette.error.main }}>{error === "invalid folder name" ? "" : error}</InputLabel>
            </TabPanel>
          </TabContext>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button disabled={error.length > 0} onClick={handleCreateCollection}>Create</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
CreateWorkSpaceDialog.defaultProps = {
  open: false
}
export default CreateWorkSpaceDialog;