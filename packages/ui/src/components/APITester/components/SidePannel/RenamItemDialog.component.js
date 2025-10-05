import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useDispatch, useSelector } from 'react-redux';
import { isValidFolderName } from '../../../../utils/validationUtil';
import { renameCollectionItem } from "../../../../services/duplicateCollectionItem"
import { renameFileAndRequest } from '../../../../services/updateCollectionRequest';
import { InputLabel } from '@mui/material';

function RenameItemDialog(props) {

  const { open, setOpen, selectedCollection, folderPath, setFolderPath, renameEvent, fileFolderPath, currentFileName, setFileFolderPath, setCurrentFileName, setRenameEvent, requestOrFileType } = props;
  const [Fpath, setFpath] = useState("");
  const [folderName, setFolderName] = useState("");
  const [isInvalidName, setIsInvalidName] = useState(true);
  const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
  const [isNameAlreadyExist, setIsNameAlreadyExist] = useState(false);
  const dispatch = useDispatch()

  function removeFileExtension(fileName) {
    return fileName.replace(/\.[^/.]+$/, "");
  }

  function getFileExtension(fileName) {
    const match = fileName.match(/\.([^/.]+)$/);
    return match ? match[1] : "";
  }

  useEffect(() => {
    setFpath(folderPath)
  }, [folderPath])

  useEffect(() => {
    if (renameEvent == "REQUEST_AND_FILE_RENAME") {
      if (requestOrFileType != "File") {
        setFolderName(removeFileExtension(currentFileName))
      } else {
        setFolderName(currentFileName)
      }
    }
  }, [renameEvent])

  const handleClose = () => {
    setOpen(false);
    setFolderName("")
    setFolderPath([])
    setIsNameAlreadyExist(false)
    setIsInvalidName(true);

    setCurrentFileName("")
    setFileFolderPath("")
    setRenameEvent("FOLDER_OR_COLLECTION_RENAME")
  };

  const handleNameChange = (event) => {
    const { value } = event.target;
    setIsInvalidName(isValidFolderName(value))
    setFolderName(value)
  }

  const handleRename = () => {
    if (renameEvent == "REQUEST_AND_FILE_RENAME") {

      let payload = {
        workspace: selectedWorkSpace,
        fileFolderPath: fileFolderPath,
        currentFileName: currentFileName,
        newFileName: folderName
      }
      if (requestOrFileType != "File") {
        if (getFileExtension(currentFileName) != "") {

          payload.newFileName = folderName + "." + getFileExtension(currentFileName)
        } else {
          payload.newFileName = folderName
        }
      }
      renameFileAndRequest(payload).then((resp) => {
        if (resp.error) {
          setIsNameAlreadyExist(true)
        } else {
          dispatch({ type: "SET_API_COLLECTION", apiCollection: resp })
          setOpen(false);
          setFolderName("")
          setCurrentFileName("")
          setFileFolderPath("")
          setRenameEvent("FOLDER_OR_COLLECTION_RENAME")
        }
      })

    } else {
      let payload = {
        collectionId: selectedCollection,
        path: folderPath,
        name: folderName,
        workspace: selectedWorkSpace
      }
      renameCollectionItem(payload).then((resp) => {
        if (resp.error) {
          setIsNameAlreadyExist(true)
        } else {
          dispatch({ type: "SET_API_COLLECTION", apiCollection: resp })
          setOpen(false);
          setFolderName("")
        }
      })
    }

  };

  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Rename {renameEvent == "REQUEST_AND_FILE_RENAME" ? "File" : "Folder"}</DialogTitle>

        <DialogContent>

          <DialogContentText>
            Provide new {renameEvent == "REQUEST_AND_FILE_RENAME" ? "file" : "folder"} name {renameEvent == "REQUEST_AND_FILE_RENAME" ? "" : ""}
          </DialogContentText>

          <InputLabel required sx={{ '& .MuiInputLabel-asterisk': { color: 'red' } }}>
            Name
          </InputLabel>

          <TextField
            size="small"
            margin="dense"
            value={folderName}
            error={isInvalidName || isNameAlreadyExist || folderName.length == 0}
            id="name"
            placeholder='name'
            fullWidth
            variant="outlined"
            helperText={(isInvalidName && 'This field support valid folder/file name') || (isNameAlreadyExist && 'name already exists')}
            onChange={(event) => handleNameChange(event)}
          />

        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button disabled={isInvalidName || folderName.length == 0} onClick={handleRename}>Rename</Button>
        </DialogActions>

      </Dialog>
    </React.Fragment>
  );
}
RenameItemDialog.defaultProps = {
  open: false,
  renameEvent: "FOLDER_OR_COLLECTION_RENAME"
}
export default RenameItemDialog;