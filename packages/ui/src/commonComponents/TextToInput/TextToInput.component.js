import React, { useState, useRef, useEffect } from "react"
import { Typography, TextField, Tooltip, Box } from '@mui/material';

function TextToInput(props) {

    const { inputText, setInputText, error, errorMsg } = props;
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState("inputText");
    const inputRef = useRef(null);
    const [isInvalidName, setIsInvalidName] = useState(true);
    // height of the TextField
    const height = 24

    // magic number which must be set appropriately for height
    const labelOffset = -6

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setIsEditing(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [])

    const handleTextClick = () => {
        setIsEditing(true);
    }

    const handleInputBlur = () => {
        setIsEditing(false);
    }
    return (
        <>
            {isEditing ? (
                <Box style={{ display: 'flex', flexDirection: 'row', gap: '4px', alignItems: 'center' }}>
                    <TextField
                        ref={inputRef}
                        value={inputText}
                        onChange={setInputText}
                        onBlur={handleInputBlur}
                        variant="outlined"
                        size="small"
                        error={error}
                        InputLabelProps={{
                            style: {
                                height,
                            },
                        }}

                        // /* styles the input component */
                        inputProps={{
                            style: {
                                height,
                                padding: '0 14px',
                            },
                        }}
                    />
                    <Typography style={{ color: '#d32f2f', display: error ? 'flex' : 'none', fontSize: '12px' }} >{errorMsg}</Typography>
                </Box>
            ) : (
                <Box style={{ display: 'flex', flexDirection: 'row', gap: '4px', alignItems: 'center' }}>
                    <Tooltip title="click to rename" placement="right-start">
                        <Typography style={{ cursor: 'pointer' }} onClick={handleTextClick}>{inputText}</Typography>
                    </Tooltip>
                    <Typography style={{ color: '#d32f2f', display: error ? 'flex' : 'none', fontSize: '12px' }} >{errorMsg}</Typography>
                </Box>
            )}
        </>
    )
}

TextToInput.defaultProps = {
    error: true,
    errorMsg: ""
}

export default TextToInput