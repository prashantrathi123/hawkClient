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
import { isValidFolderName } from '../../../../../utils/validationUtil';
import { duplicateEnvVariables } from '../../../../../services/variablesService'; 
import { Box, Typography } from '@mui/material';

function DuplicateEnvVariableDialog(props) {

    const { open, setOpen, variablesValues } = props;
    const [requestName, setRequestName] = useState("");

    const dispatch = useDispatch()


    const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
    const [isInvalidName, setIsInvalidName] = useState(true);
    const [isNameAlreadyExist, setIsNameAlreadyExist] = useState(false);



    const handleClose = () => {
        setIsInvalidName(true);
        setOpen(false);
        setRequestName("");
        setIsNameAlreadyExist(false)
    };

    const handleNameChange = (event) => {
        const { value } = event.target;
        setIsInvalidName(isValidFolderName(value));
        setRequestName(value)
    }

    const handleCreate = () => {
        const payload = {
            values: variablesValues,
            name: requestName,
            description: "",
            workspace: selectedWorkSpace
        }

        duplicateEnvVariables(payload).then((resp) => {
            if (resp.error) {
                setIsNameAlreadyExist(true)
            } else {
                dispatch({ type: "SET_ENV_VARIABLES", envVariables: resp })
                setOpen(false);
                setRequestName("");
            }
        })
    };


    return (
        <React.Fragment>

            <Dialog open={open} onClose={handleClose}>

                <DialogTitle>Duplicate Env Variable</DialogTitle>

                <DialogContent>

                    <DialogContentText>
                        Provide details to Duplicate Env Variable
                    </DialogContentText>

                    <Box style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "4px" }}>
                        <TextField
                            size="small"
                            margin="dense"
                            value={requestName}
                            error={isInvalidName || isNameAlreadyExist}
                            id="name"
                            label="Env Name"
                            fullWidth
                            variant="standard"
                            helperText={(isInvalidName && 'This field support valid file name') || (isNameAlreadyExist && 'name already exists')}
                            onChange={(event) => handleNameChange(event)}
                        />
                    </Box>

                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button disabled={isInvalidName} onClick={handleCreate}>Create</Button>
                </DialogActions>

            </Dialog>
        </React.Fragment>
    );
}
DuplicateEnvVariableDialog.defaultProps = {
    open: false,
    variablesValues: []
}
export default DuplicateEnvVariableDialog;