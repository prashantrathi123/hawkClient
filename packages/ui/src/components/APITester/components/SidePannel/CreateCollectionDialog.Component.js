import * as React from 'react';
import { useState } from 'react';
import { Box, Typography, Radio } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useDispatch, useSelector } from 'react-redux';
import { browseDirectory } from '../../../../services/BrowseDirectory.Service';
import { isValidFolderName } from '../../../../utils/validationUtil';
import { addCollectionItem } from '../../../../services/addCollectionItem'
import { duplicateCollectionItem, linkCollection, importPostmanCollection } from '../../../../services/duplicateCollectionItem';
import { TabContext, TabPanel, TabList } from '@mui/lab';
import { Tab, Tabs, InputLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FilePicker from '../../../../commonComponents/FilePicker/FilePicker.Component';

function CreateCollectionDialog(props) {
  const theme = useTheme();
  const { open, setOpen, collectionId, path, setPath, action } = props;
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDespriction] = useState("");
  const dispatch = useDispatch()
  const [directoryPath, setDirectoryPath] = useState('');
  const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
  const [isInvalidName, setIsInvalidName] = useState(true);
  const [isNameAlreadyExist, setIsNameAlreadyExist] = useState(false);
  const [createTab, setCreateTab] = useState("1");
  const [linkDirectoryPath, setLinkDirectoryPath] = useState('');
  const [error, setError] = useState('');
  const [fileData, setFileData] = useState(null);

  const [collectionType, setCollectionType] = useState('postman');

  const handleCollectionTypeChange = (event) => {
    setCollectionType(event.target.value);
  };

  const handleClose = () => {
    setOpen(false);
    setCollectionName("");
    setCollectionDespriction("");
    setDirectoryPath("");
    setIsNameAlreadyExist(false)
    setIsInvalidName(true);
    setLinkDirectoryPath('');
    setCreateTab('1');
    setFileData(null);
    setError('');
  };

  const handleNameChange = (event) => {
    const { value } = event.target;
    setIsInvalidName(isValidFolderName(value));
    setCollectionName(value)
  }
  const handleDescriptionChange = (event) => {
    const { value } = event.target;
    setCollectionDespriction(value)
  }

  const handleCreateCollection = () => {
    if (createTab == '1') {
      if (action == "DUPLICATE_FOLDER") {
        const payload = {
          collectionId: collectionId,
          path: path,
          name: collectionName,
          description: collectionDescription,
          directoryPath: directoryPath,
          workspace: selectedWorkSpace
        }
        duplicateCollectionItem(payload).then((resp) => {
          if (resp.error) {
            // setIsNameAlreadyExist(true)
            setError(resp.errorDescription)
          } else {
            dispatch({ type: "SET_API_COLLECTION", apiCollection: resp })
            setOpen(false);
            setCollectionName("");
            setCollectionDespriction("");
            setDirectoryPath("");
            setPath([]);
            setLinkDirectoryPath('');
            setError('');
          }
        })
      } else {
        const payload = {
          collectionId: action == "ADD_FOLDER" ? collectionId : null,
          path: action == "ADD_FOLDER" ? path : [],
          name: collectionName,
          description: collectionDescription,
          directoryPath: directoryPath,
          workspace: selectedWorkSpace
        }
        addCollectionItem(payload).then((resp) => {
          if (resp.error) {
            setError(resp.errorDescription)
          }
          else {
            dispatch({ type: "SET_API_COLLECTION", apiCollection: resp })
            setOpen(false);
            setCollectionName("");
            setCollectionDespriction("");
            setDirectoryPath("");
            setPath([]);
            setLinkDirectoryPath('');
            setError('');
          }
        })
      }
    } else if (createTab == '2') {
      const payload = {
        directoryPath: linkDirectoryPath,
        workspace: selectedWorkSpace
      }
      linkCollection(payload).then((resp) => {
        if (resp.error) {
          setError(resp.errorDescription)
        }
        else {
          dispatch({ type: "SET_API_COLLECTION", apiCollection: resp })
          setOpen(false);
          setCollectionName("");
          setCollectionDespriction("");
          setDirectoryPath("");
          setPath([]);
          setLinkDirectoryPath('');
          setError('');
        }
      })
    } else if (createTab == '3') {
      const payload = {
        path: [],
        name: collectionName,
        directoryPath: directoryPath,
        workspace: selectedWorkSpace,
        postmanCollection: fileData,
        type: collectionType
      }
      importPostmanCollection(payload).then((resp) => {
        if (resp.error) {
          setError(resp.errorDescription)
        }
        else {
          dispatch({ type: "SET_API_COLLECTION", apiCollection: resp })
          setOpen(false);
          setCollectionName("");
          setCollectionDespriction("");
          setDirectoryPath("");
          setPath([]);
          setLinkDirectoryPath('');
          setError('');
        }
      })

    }
  };

  const handlePickFolder = async () => {
    const result = await browseDirectory();
    if (result && result.length > 0) {
      setDirectoryPath(result[0]);
    }
  };

  const handlePickLinkFolder = async () => {
    const result = await browseDirectory();
    if (result && result.length > 0) {
      setLinkDirectoryPath(result[0]);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const json = JSON.parse(e.target.result);
            setFileData(json);
            setError('');
          } catch (err) {
            setError('Error parsing JSON file.');
          }
        };
        reader.readAsText(file);
      } else {
        setError('Please upload a valid JSON file.');
      }
    }
  };

  const title = (actionType) => {
    switch (actionType) {
      case "DUPLICATE_FOLDER":
        return "Duplicate Folder"
      case "ADD_FOLDER":
        return "Add Folder"
      default:
        return "Add Collection"
    }
  }

  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{title(action)}</DialogTitle>
        <DialogContent>
          <TabContext value={createTab}>
            <Tabs value={createTab} style={{ height: "36px", position: "relative", zIndex: 20, background: "background.default", overflow: 'hidden' }} onChange={(e, value) => { setCreateTab(value) }} aria-label="create tabs">
              <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", padding: "2px" }} label="Add" value="1" />
              <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", padding: "2px", display: (action == "ADD_FOLDER" || typeof electron == 'undefined') ? 'none' : action == "CREATE_COLLECTION" ? 'flex' : 'none' }} label="Link" value="2" />
              <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", padding: "2px", display: action == "CREATE_COLLECTION" ? 'flex' : 'none' }} label="Import" value="3" />
            </Tabs>
            <TabPanel value="1">
              <DialogContentText>
                <InputLabel sx={{ color: theme.palette.error.main, display: selectedWorkSpace == 'none' ? 'block' : 'none' }}>Please select a workspace first</InputLabel>
              </DialogContentText>
              <InputLabel required sx={{
                '& .MuiInputLabel-asterisk': {
                  color: theme.palette.error.main,
                },
              }}>Name</InputLabel>
              <Box style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "4px" }}>
                <TextField
                  size="small"
                  margin="dense"
                  value={collectionName}
                  error={isInvalidName || isNameAlreadyExist}
                  id="name"
                  placeholder='name'
                  fullWidth
                  variant="outlined"
                  helperText={(isInvalidName && 'This field support valid file/folder name') || (isNameAlreadyExist && 'name already exists')}
                  onChange={(event) => handleNameChange(event)}
                />
              </Box>
              <InputLabel style={{ display: "flex" }}>Description</InputLabel>
              <TextField
                size="small"
                margin="dense"
                value={collectionDescription}
                id="description"
                placeholder='description'
                fullWidth
                variant="outlined"
                onChange={(event) => handleDescriptionChange(event)}
                style={{ display: "flex" }}
              />
              <InputLabel style={{ display: (action == "ADD_FOLDER" || typeof electron == 'undefined') ? 'none' : (path.length) == 0 ? 'flex' : 'none' }}>
                Directory</InputLabel>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <TextField
                  size="small"
                  margin="dense"
                  value={directoryPath ? directoryPath : ''}
                  id="directory"
                  placeholder='directory'
                  fullWidth
                  disabled
                  variant="outlined"
                  onChange={(event) => { }}
                  style={{ display: (action == "ADD_FOLDER" || typeof electron == 'undefined') ? 'none' : (path.length) == 0 ? 'flex' : 'none' }}
                />
                <Button variant='contained' style={{ display: (action == "ADD_FOLDER" || typeof electron == 'undefined') ? 'none' : (path.length) == 0 ? 'flex' : 'none' }} disabled={action == "ADD_FOLDER"} onClick={handlePickFolder}>Choose</Button>
              </Box>
              <Typography style={{ color: theme.palette.error.main }}>{error}</Typography>
            </TabPanel>

            <TabPanel value="2">
              <DialogContentText>
                <InputLabel sx={{ color: theme.palette.error.main, display: selectedWorkSpace == 'none' ? 'block' : 'none' }}>Please select a workspace first</InputLabel>
              </DialogContentText>
              <InputLabel required sx={{
                '& .MuiInputLabel-asterisk': {
                  color: theme.palette.error.main,
                },
              }}>Directory</InputLabel>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <TextField
                  size="small"
                  margin="dense"
                  value={linkDirectoryPath ? linkDirectoryPath : ''}
                  id="directory"
                  placeholder='directory'
                  fullWidth
                  disabled
                  variant="outlined"
                  onChange={(event) => { }}
                  style={{}}
                />
                <Button variant='contained' style={{}} disabled={action == "ADD_FOLDER"} onClick={handlePickLinkFolder}>Choose</Button>
              </Box>
              <Typography style={{ color: theme.palette.error.main }}>{error}</Typography>
            </TabPanel>

            <TabPanel value="3">
              <DialogContentText>
                <InputLabel sx={{ color: theme.palette.error.main, display: selectedWorkSpace == 'none' ? 'block' : 'none' }}>Please select a workspace first</InputLabel>
              </DialogContentText>
              <Box style={{ display: 'flex', flexDirection: 'row', gap: '4px', alignItems: 'center' }}>
                <Radio
                  checked={collectionType === 'postman'}
                  onChange={handleCollectionTypeChange}
                  value="postman"
                  name="radio-buttons"
                  inputProps={{ 'aria-label': 'postman' }}
                />
                <InputLabel>postman</InputLabel>
                <Radio
                  checked={collectionType === 'hawkclient'}
                  onChange={handleCollectionTypeChange}
                  value="hawkclient"
                  name="radio-buttons"
                  inputProps={{ 'aria-label': 'hawkclient' }}
                />
                <InputLabel>hawkclient</InputLabel>
              </Box>
              <Box style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                <FilePicker filepaths={[]} handlefilechange={(event, i) => { handleFileChange(event) }} index={0} multiple={false} />
              </Box>
              <InputLabel required sx={{
                '& .MuiInputLabel-asterisk': {
                  color: theme.palette.error.main,
                },
              }}>Name</InputLabel>
              <TextField
                size="small"
                margin="dense"
                value={collectionName}
                error={isInvalidName || isNameAlreadyExist}
                id="name"
                placeholder='name'
                fullWidth
                variant="outlined"
                helperText={(isInvalidName && 'This field support valid file/folder name') || (isNameAlreadyExist && 'name already exists')}
                onChange={(event) => handleNameChange(event)}
              />

              <InputLabel sx={{
                '& .MuiInputLabel-asterisk': {
                  color: theme.palette.error.main,
                },
                display: typeof electron == 'undefined' ? 'none' : 'flex'
              }}>Directory</InputLabel>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <TextField
                  size="small"
                  margin="dense"
                  value={linkDirectoryPath ? linkDirectoryPath : ''}
                  id="directory"
                  placeholder='directory'
                  fullWidth
                  disabled
                  variant="outlined"
                  onChange={(event) => { }}
                  style={{ display: typeof electron == 'undefined' ? 'none' : 'flex' }}
                />
                <Button variant='contained' style={{ display: typeof electron == 'undefined' ? 'none' : 'flex' }} disabled={action == "ADD_FOLDER"} onClick={handlePickLinkFolder}>Choose</Button>
              </Box>
              <Typography style={{ color: theme.palette.error.main }}>{error}</Typography>
            </TabPanel>

          </TabContext>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button disabled={isInvalidName && createTab != '2' || selectedWorkSpace == 'none'} onClick={handleCreateCollection}>Create</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment >
  );
}
CreateCollectionDialog.defaultProps = {
  open: false,
  collectionId: null,
  path: []
}
export default CreateCollectionDialog;