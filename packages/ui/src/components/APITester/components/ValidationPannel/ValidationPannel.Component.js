import React, { useState, useEffect, useRef } from 'react';
import { TextField, Checkbox, IconButton, Typography, FormControl, Select, InputLabel, MenuItem } from '@mui/material';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import styles from './ValidationPannel.Style'
import SingleLineEditor from '../../../../commonComponents/singleLineEditor/singleLineEditor';
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

function ValidationPannel(props) {
    const classes = styles()
    const { value, onChange, autoSuggestions, style, type, language } = props;
    const [requestHeaders, setReqHeaders] = useState([]);
    const theme = useTheme();

    useEffect(() => {
        setReqHeaders(value);
    }, [value]);

    const handleRequestHeader = (event, index) => {
        const { value, id } = event.target;
        let rqHeader = requestHeaders;
        rqHeader[index][id] = value;
        onChange([...rqHeader]);
    };

    const handleDeleteRequestHeader = (index) => {
        let val = requestHeaders;
        onChange([
            ...val.slice(0, index),
            ...val.slice(index + 1)
        ]);
    };

    const handleAddRequestHeader = () => {
        let rqHeader = requestHeaders;
        rqHeader.push({ isChecked: true, assertVar: "", operator: "isEqualTo", value: "", type: type });
        onChange([...rqHeader]);
    };

    const handleCheckRequestHeader = (index) => {
        let rqHeader = requestHeaders;
        const isCh = rqHeader[index].isChecked === true ? false : true;
        rqHeader[index].isChecked = isCh;
        onChange([...rqHeader]);
    };

    return (
        <TableContainer className={classes.tableContainer} style={style}>
            <Table sx={{ border: theme.palette.mode == "dark" ? "1px solid #333" : "1px solid #C8CDD7", position: 'absolute', height: 'auto', overflow: 'scroll', top: 0, left: 0 }} size="small" aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell style={{ width: '10%' }} withDivider align='left'>Rows</StyledTableCell>
                        <StyledTableCell style={{ width: '20%' }} withDivider align="left">Variable</StyledTableCell>
                        <StyledTableCell style={{ width: '20%' }} withDivider align="left">Operator</StyledTableCell>
                        <StyledTableCell style={{ width: '20%' }} withDivider align="left">Value</StyledTableCell>
                        <StyledTableCell style={{ width: '10%' }} withDivider align="right"></StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {requestHeaders.map((requestHeader, index) => {
                        return (
                            <TableRow key={index}>
                                <StyledTableCell style={{ width: '10%' }} withDivider align='left'>
                                    <Checkbox checked={requestHeader.isChecked} onClick={() => handleCheckRequestHeader(index)}
                                        sx={{
                                            '& .MuiSvgIcon-root': {
                                                fontSize: 24, // Adjust size of the checkbox icon
                                            },
                                            width: 33, // Customize overall width
                                            height: 33, // Customize overall height
                                        }} />
                                </StyledTableCell>
                                <StyledTableCell style={{ width: '20%' }} withDivider align="left">
                                    <SingleLineEditor
                                        value={requestHeader.assertVar}
                                        onChange={(value) => handleRequestHeader({ target: { value: value, id: 'assertVar' } }, index)}
                                        language={language}
                                        style={{ width: '100%' }}
                                        fontSize={12}
                                        scrollMargin={5}
                                        divStyle={{ height: '33px' }}
                                    />
                                </StyledTableCell>
                                <StyledTableCell style={{ width: '20%' }} withDivider align="left">
                                    {
                                        <FormControl size="small"
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
                                            }}>
                                            <Select
                                                id="body"
                                                value={requestHeader.operator}
                                                onChange={(event) => handleRequestHeader({ target: { value: event.target.value, id: 'operator' } }, index)}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 200, // Set the maximum height of the dropdown
                                                            overflowY: 'auto', // Enable vertical scrolling
                                                        },
                                                    },
                                                }}
                                            >
                                                {autoSuggestions && autoSuggestions.map((autoSuggestion, ind) => {
                                                    return (
                                                        <MenuItem key={ind} value={autoSuggestion}>{autoSuggestion}</MenuItem>
                                                    )
                                                })}
                                            </Select>
                                        </FormControl>
                                    }
                                </StyledTableCell>
                                <StyledTableCell style={{ width: '20%' }} withDivider align="left">
                                    <SingleLineEditor
                                        value={requestHeader.value}
                                        onChange={(value) => handleRequestHeader({ target: { value: value, id: 'value' } }, index)}
                                        language={language}
                                        style={{ width: '100%' }}
                                        fontSize={12}
                                        scrollMargin={5}
                                        divStyle={{ height: '33px' }}
                                    />
                                </StyledTableCell>
                                <StyledTableCell style={{ width: '10%' }} withDivider align="right">
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
                        <StyledTableCell align="left"></StyledTableCell>
                        <StyledTableCell align="left"></StyledTableCell>
                        <StyledTableCell align="left"></StyledTableCell>
                        <StyledTableCell align="right"></StyledTableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
}

ValidationPannel.defaultProps = {
    value: [],
    autoSuggestions: null,
    type: 'text',
    language: 'text',
};

export default ValidationPannel;
