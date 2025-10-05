import * as React from 'react';
import { useState } from 'react';
import { 
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Box
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { exportPostmanCollection, getCollectionByName } from '../../services/duplicateCollectionItem';
import { saveFile } from '../../services/BrowseDirectory.Service';

function ExportDialog(props) {

  const { open, setOpen, collectionId } = props;
  const dispatch = useDispatch()
  const [error, setError] = useState("");

  const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
  const apiCollection = useSelector(state => state.apiTesterReducer.apiCollection)

  const handleClose = () => {
    setOpen(false);
  };

  const handleHawkExport = () => {
    let payload = {
        workspace: selectedWorkSpace,
        collectionId: collectionId,
        includefiles: true
    }
    getCollectionByName(payload).then((resp)=>{
        if (resp.error) {
            setError(resp.errorDescription)
        } else {
        saveFile({
            content: JSON.stringify(resp, null, 2),
            defaultFileName: `${apiCollection[collectionId]?.name || "collection"}_collection_hawk.json`
        })
          setOpen(false);
        }
    })
  }

  const handlePostmanExport = () => {
    const payload = {
        collectionId: collectionId,
        workspace: selectedWorkSpace
      }
      exportPostmanCollection(payload).then((resp) => {
        if (resp.error) {
            setError(resp.errorDescription)
        } else {
        saveFile({
            content: JSON.stringify(resp, null, 2),
            defaultFileName: `${resp?.info?.name || "collection"}_postman_collection_hawk.json`
        })
          setOpen(false);
        }
      })
    
  }

  return (
      <React.Fragment>
          <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Export collection</DialogTitle>
              <DialogContent>
                  <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <Button onClick={handlePostmanExport}>Postman Collection</Button>
                      <Button onClick={handleHawkExport}>HawkClient Collection</Button>
                  </Box>
              </DialogContent>
              <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
              </DialogActions>
          </Dialog>
      </React.Fragment>
  );
}
ExportDialog.defaultProps = {
  open: false,
  collectionId: null
}
export default ExportDialog;