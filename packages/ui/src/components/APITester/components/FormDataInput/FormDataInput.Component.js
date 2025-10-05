import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import KeyValueInput from '../../../../commonComponents/keyValueInput/KeyValueInput.Component';

function FormDataInput(props) {
    const { onChange, value, validKeys } = props;
    const isTwoPane = useSelector(state => state.apiTesterReducer.isTwoPane || false)
    const [textValues, setTextValues] = useState([])
    const [fileValues, setFileValues] = useState([])

    const handleChange = (value, type) => {
        if (type === 'text') {
            setTextValues(value)
            onChange([...value,...fileValues])
        } else if (type == 'file') {
            setFileValues(value)
            onChange([...textValues, ...value])
        }
    }
    const splitArrayByType =(array)=> {
        const fileTypeArray = [];
        const textTypeArray = [];
    
        array.forEach(item => {
            if (item.type === 'file') {
                fileTypeArray.push(item);
            } else if (item.type === 'text') {
                textTypeArray.push(item);
            }
        });
    
        return { fileTypeArray, textTypeArray };
    }

    useEffect(()=>{
        const { fileTypeArray, textTypeArray } = splitArrayByType(value);
        setTextValues(textTypeArray);
        setFileValues(fileTypeArray);
    },[value])


    return (
        <Box style={{ position: 'relative', height: '100%', width: '100%', display: 'block' }}>
            <Grid style={{ display: 'flex', height: '100%', width: '100%', position: 'absolute', gap: '10px', flexDirection: isTwoPane ? 'column' : 'row' }}>
                <Grid item style={{ height: '100%', width: '100%', backgroundColor: '#fffff' }}>
                    <Typography>Text</Typography>
                    <KeyValueInput
                        language='customtext'
                        style={{ height: 'calc(100% - 24px)' }}
                        value={textValues}
                        onValueChange={(value) => handleChange(value, 'text')}
                        type='text'
                        validKeys={validKeys}
                    />
                </Grid>
                <Grid item style={{ height: '100%', width: '100%', backgroundColor: '#fffff' }}>
                    <Typography>File</Typography>
                    <KeyValueInput
                        language='customtext'
                        style={{ height: 'calc(100% - 24px)' }}
                        value={fileValues}
                        onValueChange={(value) => handleChange(value, 'file')}
                        type='file'
                        validKeys={validKeys}
                    />;
                </Grid>
            </Grid>
        </Box>
    );
}

FormDataInput.defaultProps = {
    value: []
};

export default FormDataInput;