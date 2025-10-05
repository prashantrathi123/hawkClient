import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Button } from '@mui/material';
import KeyValueInput from '../../../../commonComponents/keyValueInput/KeyValueInput.Component';
import { getGlobalVariables, addGlobalVariables, updateEnvVariables } from '../../../../services/variablesService';
import { useDispatch, useSelector } from 'react-redux';
import {
    createVariablesValues,
} from '../../../../utils/utils';


function EnvVariables() {

    const dispatch = useDispatch()
    const variables = useSelector(state => state.variablesReducer.variables);
    const [envValue, setEnvValue] = useState(variables.globalVariables?.values || []);
    const currentTab = useSelector(state => state.apiTesterReducer.currentTab);
    const TabsContent = useSelector(state => state.apiTesterReducer.requestTabsContent);
    const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
    const [validKeys, setValidKeys] = useState([]);

    useEffect(() => {
        if (TabsContent[currentTab].category === "GLOBAL_VARIABLE") {
            if (variables.globalVariables.values.length === 0) {
                getGlobalVariables({ workspace: selectedWorkSpace }).then((resp) => {
                    dispatch({ type: "SET_GLOBAL_VARIABLES", globalVariables: resp })
                })
            }
        }
    }, [])

    useEffect(() => {
        if (TabsContent[currentTab].category === "GLOBAL_VARIABLE") {
            setEnvValue(variables.globalVariables?.values || []);
            let validkey = createVariablesValues(currentTab, {}, variables.globalVariables, [])
            setValidKeys(validkey)
        } else if (TabsContent[currentTab].category === "ENV_VARIABLE") {
            setEnvValue(variables.envVariables[currentTab]?.values || []);
            let validkey = createVariablesValues(currentTab, variables.envVariables, variables.globalVariables, [])
            setValidKeys(validkey)
        }
    }, [variables, currentTab])

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Check for cmd + s (Mac) or ctrl + s (Windows/Linux)
            if ((event.metaKey || event.ctrlKey) && event.key === 's') {
                event.preventDefault(); // Prevent the default save dialog
                if (TabsContent[currentTab].isSaved) {

                } else {
                    handleSave(); // Call the handle save function
                }
            }
        };

        // Add event listener for keydown
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentTab, TabsContent[currentTab].isSaved, variables, TabsContent[currentTab]]);

    const handleChange = (value) => {
        if (TabsContent[currentTab].category === "GLOBAL_VARIABLE") {
            dispatch({ type: "SET_GLOBAL_VARIABLES", globalVariables: { ...variables.globalVariables, values: value } })
        } else if (TabsContent[currentTab].category === "ENV_VARIABLE") {
            dispatch({ type: "UPDATE_ENV_VARIABLES", values: value, envId: currentTab, name: null })
        }
        let selectedRequest = {
            isSaved: false,
        }
        dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: currentTab });
    }

    const handleSave = () => {
        if (TabsContent[currentTab].category === "GLOBAL_VARIABLE") {
            addGlobalVariables({ values: variables.globalVariables.values, workspace: selectedWorkSpace }).then((resp) => {
                dispatch({ type: "SET_GLOBAL_VARIABLES", globalVariables: resp })
            })
        } else if (TabsContent[currentTab].category === "ENV_VARIABLE") {
            updateEnvVariables({ envId: currentTab, values: variables.envVariables[currentTab].values, name: variables.envVariables[currentTab].name, workspace: selectedWorkSpace }).then((resp) => {
                dispatch({ type: "SET_ENV_VARIABLES", envVariables: resp })
            })
        }
        let selectedRequest = {
            isSaved: true,
        }
        dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: currentTab });
    }

    return (
        <Box style={{ display: "flex", flexDirection: 'column', flexGrow: 1, padding: '24px' }}>
            <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>{TabsContent[currentTab].category === "GLOBAL_VARIABLE" ? "Global variables" : TabsContent[currentTab].category === "ENV_VARIABLE" ? variables.envVariables[currentTab]?.name || '' + " variables" : ""}</Typography>
                <Button variant='contained' disabled={TabsContent[currentTab].isSaved} onClick={handleSave}>Save</Button>
            </Box>
            <KeyValueInput
                value={envValue}
                onValueChange={(value) => handleChange(value)}
                type='text'
                language='customtext'
                disableKeyCustomText={true}
                validKeys={validKeys}
            />
        </Box>
    );
}

EnvVariables.defaultProps = {
};

export default EnvVariables;