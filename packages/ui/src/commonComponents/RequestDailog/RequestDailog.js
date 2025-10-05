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
import { isValidFolderName } from '../../utils/validationUtil';
import { addCollectionRequest } from '../../services/addCollectionRequest';
import { duplicateCollectionRequest } from '../../services/duplicateCollectionRequest';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, FormLabel } from '@mui/material';

function CreateRequestDialog(props) {

  const { open, setOpen, collectionId, path, setPath, action, requestId } = props;
  const [requestName, setRequestName] = useState("");
  const [requestType, setRequestType] = useState("http");

  const dispatch = useDispatch();
  const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace);
  const [isInvalidName, setIsInvalidName] = useState(true);
  const [isNameAlreadyExist, setIsNameAlreadyExist] = useState(false);

  const handleClose = () => {
    setIsInvalidName(true);
    setOpen(false);
    setRequestName("");
    setIsNameAlreadyExist(false);
    setRequestType("http");
  };

  const handleNameChange = (event) => {
    const { value } = event.target;
    setIsInvalidName(isValidFolderName(value));
    setRequestName(value);
  };

  const handleCreateCollection = () => {
    if (action === "DUPLICATE_REQUEST") {
      const payload = {
        collectionId,
        path,
        name: requestName,
        requestId,
        workspace: selectedWorkSpace
      };
      duplicateCollectionRequest(payload).then((resp) => {
        if (resp.error) {
          setIsNameAlreadyExist(true);
        } else {
          dispatch({ type: "SET_API_COLLECTION", apiCollection: resp });
          handleClose();
          setPath([]);
        }
      });
    } else {
      const payload = {
        collectionId,
        path,
        name: requestName,
        workspace: selectedWorkSpace,
        type: requestType
      };
      addCollectionRequest(payload).then((resp) => {
        if (resp.error) {
          setIsNameAlreadyExist(true);
        } else {
          dispatch({ type: "SET_API_COLLECTION", apiCollection: resp });
          handleClose();
          setPath([]);
        }
      });
    }
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>{action === "DUPLICATE_REQUEST" ? "Duplicate" : "Create"} {action === "DUPLICATE_FILE" ? "File" : "Request"}</DialogTitle>
        <DialogContent>
          {action !== "DUPLICATE_FILE" && action !== "DUPLICATE_REQUEST" && (
            <Box sx={{ mt: 2 }}>
              <FormLabel component="legend">Request Type</FormLabel>
              <RadioGroup
                row
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
              >
                <FormControlLabel value="http" control={<Radio />} label="HTTP" />
              </RadioGroup>
            </Box>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px", mt: 2 }}>
            <FormLabel component="legend">{action === "DUPLICATE_FILE" ? "File" : "Request"} Name</FormLabel>
            <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "4px" }}>
              <TextField
                size="small"
                margin="dense"
                value={requestName}
                error={isInvalidName || isNameAlreadyExist}
                id="name"
                // label="Request Name"
                fullWidth
                variant="outlined"
                helperText={(isInvalidName && 'This field support valid file name') || (isNameAlreadyExist && 'name already exists')}
                onChange={handleNameChange}
              />
              <Typography sx={{ display: action === "DUPLICATE_FILE" ? 'flex' : 'none' }}>.js</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button disabled={isInvalidName} onClick={handleCreateCollection}>Create</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

CreateRequestDialog.defaultProps = {
  open: false,
  collectionId: null,
  path: []
};

export default CreateRequestDialog;
