import React, { useState, useEffect } from 'react';
import { Checkbox, IconButton, Typography, FormControl, Select, MenuItem } from '@mui/material';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import styles from './KeyValueInput.Style'
import SingleLineEditor from '../singleLineEditor/singleLineEditor';
import AutoComplete from '../autoComplete/autoComplete.Component';
import FilePicker from '../FilePicker/FilePicker.Component';
import { useTheme } from '@mui/material/styles';

const StyledTableCell = ({ children, withDivider, ...props }) => {
    const theme = useTheme();
    return (
        <TableCell
            sx={{
                borderRight: withDivider ? theme.palette.mode == "dark" ? "1px solid #333" : "1px solid #C8CDD7" : 'none',
            }}
            {...props}
        >
            {children}
        </TableCell>
    )
};

function KeyValueInput(props) {
    const classes = styles()
    const { value, onValueChange, autoSuggestions, style, type, language, validKeys, disableKeyCustomText, showScope } = props;
    const [requestHeaders, setReqHeaders] = useState([]);
    const theme = useTheme();

    useEffect(() => {
        setReqHeaders(value);
    }, [value]);

    const handleRequestHeader = (event, index) => {
        const { value, id } = event.target;
        let rqHeader = requestHeaders;
        rqHeader[index][id] = value;
        onValueChange([...rqHeader]);
    };

    const handleDeleteRequestHeader = (index) => {
        let val = requestHeaders;
        onValueChange([
            ...val.slice(0, index),
            ...val.slice(index + 1)
        ]);
    };

    const handleAddRequestHeader = () => {
        let rqHeader = requestHeaders;
        rqHeader.push({
            isChecked: true,
            key: "",
            value: "",
            type: type,
        });
        onValueChange([...rqHeader]);
    };

    const handleCheckRequestHeader = (index) => {
        let rqHeader = requestHeaders;
        const isCh = rqHeader[index].isChecked === true ? false : true;
        rqHeader[index].isChecked = isCh;
        onValueChange([...rqHeader]);
    };

    const handleFileChange = (event, index) => {
        const { id } = event.target;
        const selectedFiles = Array.from(event.target.files);
        let rqHeader = requestHeaders;
        rqHeader[index][id] = []
        selectedFiles.forEach(selectedFile => {
            const file = selectedFile;

            rqHeader[index][id].push(file.path);
        })

        onValueChange([...rqHeader]);
    }

    return (
        <TableContainer className={classes.tableContainer} style={style}>
            <Table sx={{ border: theme.palette.mode == "dark" ? "1px solid #333" : "1px solid #C8CDD7", position: 'absolute', height: 'auto', overflow: 'scroll', top: 0, left: 0 }} size="small" aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell style={{ width: (showScope) ? '10%' : '15%' }} withDivider align='left'>Rows</StyledTableCell>
                        {(showScope) ? <StyledTableCell style={{ width: '20%' }} withDivider align='left'>{(showScope) ? "Scope" : "Value Source"}</StyledTableCell> : null}
                        <StyledTableCell style={{ width: (showScope) ? '30%' : '35%' }} withDivider align="left">Key</StyledTableCell>
                        <StyledTableCell style={{ width: (showScope) ? '30%' : '35%' }} withDivider align="left">Value</StyledTableCell>
                        <StyledTableCell style={{ width: (showScope) ? '10%' : '15%' }} withDivider align="right"></StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {requestHeaders.map((requestHeader, index) => {
                        return (
                            <TableRow key={index}>
                                <StyledTableCell style={{ width: showScope ? '10%' : '15%' }} withDivider align='left'>
                                    <Checkbox
                                        checked={requestHeader.isChecked}
                                        onClick={() => handleCheckRequestHeader(index)}
                                        sx={{
                                            '& .MuiSvgIcon-root': {
                                                fontSize: 24, // Adjust size of the checkbox icon
                                            },
                                            width: 33, // Customize overall width
                                            height: 33, // Customize overall height
                                        }}
                                    />
                                </StyledTableCell>
                                {showScope ? <StyledTableCell style={{ width: '20%' }} withDivider align='left'>
                                    <FormControl
                                        size="small"
                                        fullWidth
                                        sx={{
                                            height: '33px',
                                            '& .MuiInputBase-root': {
                                                height: '33px', // Adjust select height
                                                padding: '0 8px', // Adjust inner padding
                                            },
                                            '& .MuiSelect-select': {
                                                display: 'flex',
                                                alignItems: 'center', // Center-align text vertically
                                            },
                                        }}
                                    >
                                        <Select
                                            id="scope"
                                            value={(requestHeader.scope == "" || !requestHeader.scope) ? "Collection" : requestHeader.scope}
                                            onChange={(event) => handleRequestHeader({ target: { value: event.target.value, id: 'scope' } }, index)}
                                        >
                                            <MenuItem key={"1"} value={"Collection"}><Typography >Collection</Typography></MenuItem>
                                            <MenuItem key={"2"} value={"Env"}><Typography >Env</Typography></MenuItem>
                                            <MenuItem key={"3"} value={"Global"}><Typography >Global</Typography></MenuItem>
                                        </Select>
                                    </FormControl>
                                </StyledTableCell> : null}
                                <StyledTableCell style={{ width: (showScope) ? '30%' : '35%' }} withDivider align="left">
                                    {autoSuggestions ? (
                                        <AutoComplete
                                            value={requestHeader.key}
                                            onChange={(tempvalue) => handleRequestHeader({ target: { value: tempvalue, id: 'key' } }, index)}
                                            suggestions={autoSuggestions.keys}
                                            language={'customtext'}
                                            validKeys={validKeys}
                                        />
                                    ) : (
                                        <SingleLineEditor
                                            value={requestHeader.key}
                                            onChange={(value) => handleRequestHeader({ target: { value: value, id: 'key' } }, index)}
                                            language={disableKeyCustomText ? 'text' : language}
                                            style={{ width: '100%' }}
                                            validKeys={validKeys}
                                            fontSize={12}
                                            scrollMargin={5}
                                            divStyle={{ height: '33px' }}
                                        />
                                    )}
                                </StyledTableCell>
                                <StyledTableCell style={{ width: (showScope) ? '30%' : '35%' }} withDivider align="left">
                                    {type == 'text' ? autoSuggestions ? (
                                        <AutoComplete
                                            value={requestHeader.value}
                                            onChange={(tempvalue) => handleRequestHeader({ target: { value: tempvalue, id: 'value' } }, index)}
                                            suggestions={autoSuggestions.values[requestHeader.key] || []}
                                            language={'customtext'}
                                            validKeys={validKeys}
                                        />
                                    ) : (
                                        <SingleLineEditor
                                            value={requestHeader.value}
                                            onChange={(value) => handleRequestHeader({ target: { value: value, id: 'value' } }, index)}
                                            language={language}
                                            style={{ width: '100%' }}
                                            validKeys={validKeys}
                                            fontSize={12}
                                            scrollMargin={5}
                                            divStyle={{ height: '33px' }}
                                        />
                                    ) : <FilePicker filepaths={requestHeader.value} handlefilechange={handleFileChange} index={index} />}
                                </StyledTableCell>
                                <StyledTableCell style={{ width: (showScope) ? '10%' : '15%' }} withDivider align="right">
                                    <IconButton onClick={() => { handleDeleteRequestHeader(index) }} sx={{ height: '33px', width: '33px' }}>
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                </StyledTableCell>
                            </TableRow>
                        );
                    })}
                    <TableRow>
                        <StyledTableCell align='left'>
                            <IconButton onClick={() => { handleAddRequestHeader() }} sx={{ height: '33px', width: '33px' }}><AddIcon /></IconButton>
                        </StyledTableCell>
                        {(showScope) ? <StyledTableCell align="left"></StyledTableCell> : null}
                        <StyledTableCell align="left"></StyledTableCell>
                        <StyledTableCell align="left"></StyledTableCell>
                        <StyledTableCell align="right"></StyledTableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
}

KeyValueInput.defaultProps = {
    value: [],
    autoSuggestions: null,
    type: 'text',
    language: 'text',
    disableKeyCustomText: false,
    showScope: false,
};

export default KeyValueInput;
