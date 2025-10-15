import React, { useState, useEffect, useMemo } from 'react';
import { Grid, Typography, Tab, Tabs, Box, CircularProgress, Button } from '@mui/material';
import { TabContext, TabPanel, TabList } from '@mui/lab';
import CodeEditor from '../../../../commonComponents/codeEditor/codeEditor';
import { useTheme } from '@mui/material/styles';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import worker from 'pdfjs-dist/build/pdf.worker.entry';
import xmlFormatter from 'xml-formatter';

pdfjs.GlobalWorkerOptions.workerSrc = worker;


const ContentRenderer = ({ contentType, responseContent, style }) => {

    const [numPages, setNumPages] = useState(null);

    // Handle Uint8Array conversion once
    const decodedPdfData = useMemo(() => {
        if (
            contentType === 'application/pdf' &&
            typeof responseContent === 'object' &&
            responseContent !== null
        ) {
            const byteArray = Object.values(responseContent);
            return new Uint8Array(byteArray);
        }
        return null;
    }, [contentType, responseContent]);

    const handleLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    if (contentType && contentType.startsWith('text/html')) {
        // Render HTML content using dangerouslySetInnerHTML
        return (
            <iframe
                title="html-content"
                srcDoc={responseContent} // Use srcDoc to pass HTML content directly
                style={{ ...style }} // Apply custom styles
            />
        );
    } else if (contentType && contentType.startsWith('image/')) {
        // For images, the responseContent is assumed to be base64 encoded data
        const byteArray = Object.values(responseContent);
        const base64String = btoa(
            byteArray.map((byte) => String.fromCharCode(byte)).join('')
        );
        return (
            <Box style={{ ...style }}>
                <img
                    src={`data:${contentType};base64,${base64String}`}
                    alt="Response content"
                />
            </Box>
        );
    } else if (contentType && contentType.startsWith('application/pdf')) {
        const byteArray = Object.values(responseContent);
        const pdfUnint = new Uint8Array(byteArray)

        return (
            <Box style={{ ...style, overflow: 'auto', '--scale-factor': '1' }}>
                <Document
                    file={{ data: pdfUnint }}
                    onLoadSuccess={handleLoadSuccess}
                    loading="Loading PDF..."
                    error="Failed to load PDF"
                >
                    {numPages &&
                        Array.from(new Array(numPages), (_, index) => (
                            <Page
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                                width={600}
                            />
                        ))}
                </Document>
            </Box>
        );
    } else {
        if (typeof responseContent === 'object' && responseContent !== null && !Array.isArray(responseContent)) {
            const byteArray = Object.values(responseContent);
            responseContent = new TextDecoder('utf-8').decode(new Uint8Array(byteArray));
        }
        // Render any other plain text or string content
        return (
            <Box style={{ ...style }}>
                {responseContent}
            </Box>
        );
    }
};

const getResponseLanguage = (contentType) => {
    if (contentType && contentType.startsWith('text/html')) {
        return 'html'
    } else if (contentType && contentType.startsWith('application/xml')) {
        return 'xml'
    } else {
        return 'json'
    }
}

function APIResponse(props) {
    const theme = useTheme();
    const { response, isTwoPane, isResponseLoading, testResults, showSaveResponseButton, saveResponse } = props
    const [responseTabValue, setResponseTabValue] = useState('1');

    useEffect(() => {

        try {
            let contentType = response?.headers ? response.headers["content-type"] : '' || ''
            if (contentType && (contentType.startsWith('text/html')) || contentType.startsWith('image/') || contentType.startsWith('application/pdf')) {
                setResponseTabValue('5');
            } else {
                setResponseTabValue('1');
            }
        } catch (error) {
            setResponseTabValue('1');
        }

    }, [response]);

    const handleResponseTabChange = (event, newValue) => {
        setResponseTabValue(newValue);
    };

    const formatJSONString = (jsonString, contentType) => {
        if (contentType && contentType.startsWith('application/xml')) {
            try {
                const formattedCode = xmlFormatter(jsonString, {
                    indentation: '  ', // Number of spaces per indentation level
                    filter: (node) => node.type !== 'Comment', // Optional: filter out nodes, e.g., comments
                    collapseContent: true, // Optional: collapse content between tags if it fits on one line
                    lineSeparator: '\n', // Line separator, default is '\n'
                });
                return formattedCode
            } catch (error) {
                return jsonString;
            }
        } else {
            try {
                // Check if the input is a byte array (Uint8Array, Buffer, etc.)
                if (typeof jsonString === 'object' && jsonString !== null && !Array.isArray(jsonString)) {
                    const byteArray = Object.values(jsonString);
                    jsonString = new TextDecoder('utf-8').decode(new Uint8Array(byteArray));
                }

                // Parse the JSON string into an object
                const jsonObj = JSON.parse(jsonString);

                // Convert the object back to a JSON string with indentation
                const formattedJSON = JSON.stringify(jsonObj, null, "\t");

                return formattedJSON;
            } catch (error) {
                // Handle the case where it's not a valid JSON or is binary data (like an image)
                return jsonString; // Return the original input if formatting fails
            }
        }

    };
    let assertreslt = JSON.stringify(testResults.assertResults)

    const getStatusCodeColor = (statusCode) => {
        // const theme = useTheme(); // Access the MUI theme

        if (statusCode >= 100 && statusCode < 200) {
            return theme.palette.info.light; // Light Blue for 1xx Informational
        } else if (statusCode >= 200 && statusCode < 300) {
            return theme.palette.success.main; // Green for 2xx Success
        } else if (statusCode >= 300 && statusCode < 400) {
            return theme.palette.warning.main; // Yellow for 3xx Redirection
        } else if (statusCode >= 400 && statusCode < 500) {
            return theme.palette.error.light; // Orange for 4xx Client Error
        } else if (statusCode >= 500 && statusCode < 600) {
            return theme.palette.error.main; // Red for 5xx Server Error
        } else {
            return theme.palette.grey[500]; // Grey for undefined or other status codes
        }
    };

    return (
        <TabContext value={responseTabValue}>
            <Box style={{ display: 'flex', flexDirection: 'column', padding: isTwoPane ? "0px 0px 0px 3px" : "3px 0px 0px 0px" }}>
                <Grid container style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Typography style={{ textAlign: "center", justifyContent: "center", marginTop: "15px", textTransform: "none", minWidth: "90px", paddingLeft: '2px', fontSize: '14px' }}>Status: <span style={{ fontSize: '12px', color: getStatusCodeColor(response.status) }}>{response.status} {response.statusText}</span></Typography>
                    <Typography style={{ textAlign: "center", justifyContent: "center", marginTop: "15px", textTransform: "none", minWidth: "90px", fontSize: '14px' }}>Time: <span style={{ fontSize: '12px', color: theme.palette.primary.main }}>{response.timeTaken}</span></Typography>
                    <Typography style={{ textAlign: "center", justifyContent: "center", marginTop: "15px", textTransform: "none", minWidth: "90px", paddingRight: '2px', fontSize: '14px' }}>Size: <span style={{ fontSize: '12px', color: theme.palette.primary.main }}>{response.responseSizeKB}</span></Typography>
                </Grid>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Tabs value={responseTabValue} allowScrollButtonsMobile variant='scrollable' style={{}} onChange={handleResponseTabChange} aria-label="lab API tabs example">
                        <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", minWidth: "0px", margin: '0px 10px', padding: '0px' }} label="Body" value="1" />
                        <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", minWidth: "0px", margin: '0px 10px', padding: '0px' }} label="Preview" value="5" />
                        <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", minWidth: "0px", margin: '0px 10px', padding: '0px' }} label={`Headers ${Object.keys(response?.headers || {}).length || 0}`} value="2" />
                        <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", minWidth: "0px", margin: '0px 10px', padding: '0px' }} label={`Cookies ${response.cookies?.length || 0}`} value="3" />
                    </Tabs>
                    <Button sx={{ display: showSaveResponseButton ? 'flex' : 'none', fontSize: '12px', textTransform: 'none' }} disabled={isResponseLoading || response?.statusText?.length == 0 || response.statusText == undefined} onClick={() => saveResponse()}>Save Response</Button>
                </Box>
            </Box>
            <TabPanel style={{ padding: isTwoPane ? "0px 2px 0px 5px" : "0px 2px 2px 2px", marginTop: "0px", flexGrow: responseTabValue == "1" ? 1 : 0 }} value="1">
                {isResponseLoading ?
                    <Box style={{ display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: theme.palette.divider, boxSizing: 'border-box', borderRadius: '4px', height: '100%', width: '100%', boxSizing: 'border-box', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress />
                        <Typography>Loading...</Typography>
                    </Box> :
                    <CodeEditor style={{ border: '1px solid #C8CDD7', boxSizing: 'border-box', borderRadius: '4px' }} isEditable={false} onChange={() => { }} value={formatJSONString(response.body, response?.headers?.["content-type"])} language={response?.headers ? (response.headers["content-type"] && getResponseLanguage(response.headers["content-type"])) : 'json' || 'json'} />
                }
            </TabPanel>
            <TabPanel style={{ padding: isTwoPane ? "0px 2px 0px 5px" : "0px 2px 2px 2px", marginTop: "0px", flexGrow: responseTabValue == "2" ? 1 : 0 }} value="2">
                {isResponseLoading ?
                    <Box style={{ display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: theme.palette.divider, boxSizing: 'border-box', borderRadius: '4px', height: '100%', width: '100%', boxSizing: 'border-box', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress />
                        <Typography>Loading...</Typography>
                    </Box> :
                    <CodeEditor style={{ border: '1px solid #C8CDD7', boxSizing: 'border-box', borderRadius: '4px' }} isEditable={false} onChange={() => { }} value={JSON.stringify(response.headers, null, "\t")} language={'json'} />
                }
            </TabPanel>
            <TabPanel style={{ padding: isTwoPane ? "0px 2px 0px 5px" : "0px 2px 2px 2px", marginTop: "0px", flexGrow: responseTabValue == "3" ? 1 : 0 }} value="3">
                {isResponseLoading ?
                    <Box style={{ display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: theme.palette.divider, boxSizing: 'border-box', borderRadius: '4px', height: '100%', width: '100%', boxSizing: 'border-box', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress />
                        <Typography>Loading...</Typography>
                    </Box> :
                    <CodeEditor style={{ border: '1px solid #C8CDD7', boxSizing: 'border-box', borderRadius: '4px' }} isEditable={false} onChange={() => { }} value={JSON.stringify(response.cookies, null, "\t")} language={'json'} />
                }
            </TabPanel>
            <TabPanel style={{ padding: isTwoPane ? "0px 2px 0px 5px" : "0px 2px 2px 2px", marginTop: "0px", flexGrow: responseTabValue == "5" ? 1 : 0 }} value="5">
                {isResponseLoading ?
                    <Box style={{ display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: theme.palette.divider, boxSizing: 'border-box', borderRadius: '4px', height: '100%', width: '100%', boxSizing: 'border-box', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress />
                        <Typography>Loading...</Typography>
                    </Box> :
                    <Box style={{ position: 'relative', height: '100%', width: '100%', display: 'block' }}>
                        <Box style={{ display: 'flex', height: '100%', width: '100%', position: 'absolute' }}>
                            <ContentRenderer style={{ border: '1px solid', borderColor: theme.palette.divider, boxSizing: 'border-box', borderRadius: '4px', height: '100%', width: '100%', boxSizing: 'border-box', overflow: 'scroll', position: 'absolute' }} contentType={response?.headers ? response.headers["content-type"] : '' || ''} responseContent={response.body} />
                        </Box>
                    </Box>
                }
            </TabPanel>
        </TabContext>
    );
}

APIResponse.defaultProps = {
    response: {},
    testResults: {
        assertResults: []
    },
    isTwoPane: false,
    showSaveResponseButton: false,
    saveResponse: () => { }
};

export default APIResponse;