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
import { saveFile } from '../../services/BrowseDirectory.Service';

function ExportEnvDialog(props) {

  const { open, setOpen, envId } = props;
  const dispatch = useDispatch()
  const [error, setError] = useState("");

  const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
  const envVariables = useSelector(state => state.variablesReducer.variables.envVariables)

  const handleClose = () => {
    setOpen(false);
  };

  function convertToPostmanEnv(values) {
    return values.map(item => {
        return {
            key: item.key,
            value: item.value,
            type: "default", // Postman uses "default" as type
            enabled: item.isChecked || false // If "isChecked" is true, enabled should be true
        };
    });
}

  const handlePostmanExport = () => {
      const content = envVariables[envId]
      content.values = convertToPostmanEnv(content.values);
      content["_postman_variable_scope"] = "environment"
      saveFile({
        content: JSON.stringify(content, null, 2),
        defaultFileName: `${content?.name || "env"}_postman_env_hawk.json`
    })
      setOpen(false);
    
  }

  return (
      <React.Fragment>
          <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Export Env</DialogTitle>
              <DialogContent>
                  <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <Button onClick={handlePostmanExport}>Postman Env</Button>
                  </Box>
              </DialogContent>
              <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
              </DialogActions>
          </Dialog>
      </React.Fragment>
  );
}
ExportEnvDialog.defaultProps = {
  open: false,
  envId: null
}
export default ExportEnvDialog;