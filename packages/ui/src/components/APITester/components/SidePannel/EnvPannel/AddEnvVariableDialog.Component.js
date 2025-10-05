import * as React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { addEnvVariables, importPostmanEnvVariables } from '../../../../../services/variablesService';
import { useDispatch, useSelector } from 'react-redux';
import { isValidFolderName } from '../../../../../utils/validationUtil';
import { TabContext, TabPanel } from '@mui/lab';
import { Tab, Tabs, InputLabel, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FilePicker from '../../../../../commonComponents/FilePicker/FilePicker.Component';

function AddEnvVariableDialog(props) {
  const theme = useTheme();
  const { open, setOpen } = props;
  const [name, setName] = useState("");
  const [description, setDespriction] = useState("");
  const [isInvalidName, setIsInvalidName] = useState(true);
  const [error, setError] = useState('');
  const [fileData, setFileData] = useState(null);
  const [selectedTab, setSelectedTab] = useState("1");
  const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
  const dispatch = useDispatch()

  const handleClose = () => {
    setOpen(false);
    setName("");
    setDespriction("");
    setFileData(null);
  };

  const handleNameChange = (event) => {
    const { value } = event.target;
    setIsInvalidName(isValidFolderName(value));
    setName(value)
  }
  const handleDescriptionChange = (event) => {
    const { value } = event.target;
    setDespriction(value)
  }

  const handleCreate = () => {
    const payload = {
      name: name,
      description: description,
      values: [],
      workspace: selectedWorkSpace,
    }
    addEnvVariables(payload).then((resp) => {
      if (resp.error) {
        console.log("errorDescription", resp.errorDescription)
        setError(resp.errorDescription)
      } else {
        dispatch({ type: "SET_ENV_VARIABLES", envVariables: resp })
        setOpen(false);
        setName("");
        setDespriction("");
        setFileData(null);
      }
    })
  };

  const handleTabChange = (tabValue) => {
    setSelectedTab(tabValue);
    setName("");
    setDespriction("");
    setFileData(null);
  }

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

  const handleEnvImport = () => {
    const payload = {
      name: name,
      description: description,
      postmanEnvVariables: fileData,
      workspace: selectedWorkSpace
    }
    importPostmanEnvVariables(payload).then((resp) => {
      if (resp.error) {
        setError(resp.errorDescription)
      } else {
        dispatch({ type: "SET_ENV_VARIABLES", envVariables: resp })
        setOpen(false);
        setName("");
        setDespriction("");
        setFileData(null);
      }
    })
  };

  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Environment</DialogTitle>
        <TabContext value={selectedTab}>
          <Tabs value={selectedTab} style={{ height: "36px", position: "relative", zIndex: 20, background: "background.default", overflow: 'hidden' }} onChange={(e, value) => { handleTabChange(value) }} aria-label="env tabs">
            <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", padding: "2px" }} label="Add" value="1" />
            <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", padding: "2px" }} label="Import" value="2" />
          </Tabs>
          <TabPanel value="1">
            <DialogContent>
              <DialogContentText>
                <InputLabel sx={{ color: theme.palette.error.main, display: selectedWorkSpace == 'none' ? 'block' : 'none' }}>Please select a workspace first</InputLabel>
              </DialogContentText>
              <InputLabel required sx={{
                '& .MuiInputLabel-asterisk': {
                  color: theme.palette.error.main,
                },
              }}>Name</InputLabel>
              <TextField
                size="small"
                margin="dense"
                value={name}
                error={isInvalidName || error.length > 0}
                id="name"
                placeholder='name'
                fullWidth
                variant="outlined"
                onChange={(event) => handleNameChange(event)}
                helperText={(isInvalidName && 'This field support valid file name') || (error.length > 0 && error)}
              />
              <InputLabel>Description</InputLabel>
              <TextField
                size="small"
                margin="dense"
                value={description}
                id="description"
                placeholder='description'
                fullWidth
                variant="outlined"
                onChange={(event) => handleDescriptionChange(event)}
              />
              <Typography style={{ color: theme.palette.error.main }}>{error}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button disabled={isInvalidName || selectedWorkSpace == 'none' || name.length == 0} onClick={handleCreate}>Create</Button>
            </DialogActions>
          </TabPanel>
          <TabPanel value="2">
            <DialogContent>
              <DialogContentText>
                <InputLabel sx={{ color: theme.palette.error.main, display: selectedWorkSpace == 'none' ? 'block' : 'none' }}>Please select a workspace first</InputLabel>
              </DialogContentText>
              <InputLabel required sx={{
                '& .MuiInputLabel-asterisk': {
                  color: theme.palette.error.main,
                },
              }}>Select postman env file</InputLabel>
              <FilePicker filepaths={[]} handlefilechange={(event, i) => { handleFileChange(event) }} index={0} multiple={false} />
              <InputLabel required sx={{
                '& .MuiInputLabel-asterisk': {
                  color: theme.palette.error.main,
                },
              }}>Name</InputLabel>
              <TextField
                size="small"
                margin="dense"
                value={name}
                error={isInvalidName || error.length > 0}
                id="name"
                placeholder='name'
                fullWidth
                variant="outlined"
                onChange={(event) => handleNameChange(event)}
                helperText={(isInvalidName && 'This field support valid file name') || (error.length > 0 && error)}
              />
              <InputLabel>Description</InputLabel>
              <TextField
                size="small"
                margin="dense"
                value={description}
                id="description"
                placeholder='description'
                fullWidth
                variant="outlined"
                onChange={(event) => handleDescriptionChange(event)}
              />
              <Typography style={{ color: theme.palette.error.main }}>{error}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button disabled={isInvalidName || selectedWorkSpace == 'none' || name.length == 0} onClick={handleEnvImport}>Import</Button>
            </DialogActions>
          </TabPanel>
        </TabContext>
      </Dialog>
    </React.Fragment>
  );
}
AddEnvVariableDialog.defaultProps = {
  open: false
}
export default AddEnvVariableDialog;