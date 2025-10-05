import React, { useState } from 'react';
import { Typography, Box, Checkbox } from '@mui/material';
import CodeEditor from '../codeEditor/codeEditor';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DescriptionIcon from '@mui/icons-material/Description';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from '@mui/material/styles';

function MarkDownEditor(props) {
    const { markdownText, handleInputChange } = props
    const theme = useTheme();

    const [isEditMarkdown, setIsEditMarkdown] = useState(false);

    const handleInternalChange = (event, fieldId) => {
        let newValue = event.target.value;

        if (typeof newValue === 'string') {
            newValue = newValue.split('\n');
        }

        handleInputChange({ target: { value: newValue } }, fieldId);
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '99.5%' }}>
            <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: 'space-between', paddingRight: '8px' }}>
                <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: '8px' }}>
                    <DescriptionIcon />
                    <Typography>Documentation</Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <Checkbox
                        checked={isEditMarkdown}
                        onChange={(event) => setIsEditMarkdown(event.target.checked)}
                        inputProps={{ 'aria-label': 'controlled' }}
                    />
                    <Typography>Edit Mode</Typography>
                </Box>
            </Box>
            {
                isEditMarkdown ? <CodeEditor
                    style={{ border: '1px solid #C8CDD7', height: 'calc(100% - 42px)', boxSizing: 'border-box', borderRadius: '4px' }}
                    isEditable={true}
                    onChange={(event) => handleInternalChange(event, 'docs')}
                    value={Array.isArray(markdownText)
                        ? markdownText.join('\n')
                        : (markdownText || '')}
                    language={'text'}
                /> :
                    <Box sx={{ overflow: 'scroll', padding: '0px 2px' }}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || "");
                                    return !inline && match ? (
                                        <SyntaxHighlighter style={oneDark} language={match[1]} {...props}>
                                            {String(children).replace(/\n$/, "")}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                                a: ({ node, ...props }) => (
                                    <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                                        {props.children}
                                    </a>
                                ),
                            }}
                        >
                            {Array.isArray(markdownText)
                                ? markdownText.join('\n')
                                : (markdownText || '')}
                        </ReactMarkdown>
                    </Box>
            }
        </Box>
    )
}

MarkDownEditor.defaultProps = {
    markdownText: []
};

export default MarkDownEditor;