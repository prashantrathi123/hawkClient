import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Tooltip } from '@mui/material';
import { useSelector } from 'react-redux';
import KeyValueInput from '../../../../commonComponents/keyValueInput/KeyValueInput.Component';
import InfoIcon from '@mui/icons-material/Info';

function Variables(props) {
    const { onChange, value, validKeys } = props;
    const isTwoPane = useSelector(state => state.apiTesterReducer.isTwoPane || false)

    const handleInputChange = (newValue, fieldId) => {
        let inputVal = value
        inputVal[`${fieldId}`] = newValue
        onChange(value);
    };


    return (
        <Box style={{ position: 'relative', height: '100%', width: '100%', display: 'block' }}>
            <Grid style={{ display: 'flex', height: '100%', width: '100%', position: 'absolute', gap: '10px', flexDirection: isTwoPane ? 'column' : 'row', overflow: 'hidden' }}>
                <Grid item style={{ height: '100%', width: '100%', backgroundColor: '#fffff' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                        <Typography>Pre Request</Typography>
                        <Tooltip
                            title="These variables are specific to this request only"
                            placement="top-start"
                        >
                            <InfoIcon />
                        </Tooltip>
                    </Box>

                    <KeyValueInput
                        language='customtext'
                        style={{ height: 'calc(100% - 24px)' }}
                        value={value.preRequest || []}
                        onValueChange={(value) => handleInputChange(value, 'preRequest')}
                        type='text'
                        disableKeyCustomText={true}
                        validKeys={validKeys}
                    />
                </Grid>
                <Grid item style={{ height: '100%', width: '100%', backgroundColor: '#fffff' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                        <Typography>Post Response</Typography>
                        <Tooltip
                            title="These variables will be added to the selected scope variables. The Value Column supports expressions such as response.body.id or response.status"
                            placement="top-start"
                        >
                            <InfoIcon />
                        </Tooltip>
                    </Box>

                    <KeyValueInput
                        language='text'
                        style={{ height: 'calc(100% - 24px)' }}
                        value={value.postResponse || []}
                        onValueChange={(value) => handleInputChange(value, 'postResponse')}
                        type='text'
                        showScope={true}
                    />;
                </Grid>
            </Grid>
        </Box>
    );
}

Variables.defaultProps = {
    value: { preRequest: [], postResponse: [] },
    validKeys: []
};

export default Variables;