import React, { useRef, useState, useEffect } from 'react';
import { IconButton, Typography, Box, Menu, MenuItem } from '@mui/material';
import { Close } from "@mui/icons-material";

const FilePicker = (props) => {
    const { filepaths, handlefilechange, index, multiple } = props;
    const fileInputRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        setOpen(true);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (anchorEl && !anchorEl.contains(event.target)) {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [anchorEl]);

    return (
        <>
            {filepaths && filepaths.length > 0 ? (
                <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography style={{ fontSize: '12px', cursor: 'pointer' }} onClick={handleClick}>
                        {filepaths.length > 1
                            ? filepaths.length + " files selected"
                            : filepaths.length === 1
                                ? filepaths[0]
                                : "no file selected"}
                    </Typography>
                    <IconButton onClick={() => handlefilechange({ target: { id: 'value', files: [] } }, index)}>
                        <Close sx={{ height: "14px", width: "14px" }} />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                    >
                        {filepaths.map((filepath, i) => (
                            <MenuItem style={{fontSize: '12px'}} key={i}>{filepath}</MenuItem>
                        ))}
                    </Menu>
                </Box>
            ) : (
                <input
                    type="file"
                    id="value"
                    ref={fileInputRef}
                    multiple = {multiple}
                    onChange={(event) => handlefilechange(event, index)}
                />
            )}
        </>
    );
}

FilePicker.defaultProps = {
    multiple: true
  };

export default FilePicker;
