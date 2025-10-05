import React, { useState, useRef, useEffect } from 'react';
import SingleLineEditor from '../singleLineEditor/singleLineEditor';  // Adjust the import according to your project structure
import { useTheme } from '@mui/material/styles';

const Autocomplete = ({ suggestions, language, value, onChange, style, validKeys }) => {
    const theme = useTheme();
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const autocompleteRef = useRef(null);

    const handleChange = (e) => {
        const inputValue = e.target.value;
        onChange(e.target.value);

        if (inputValue) {
            const filtered = suggestions.filter(suggestion =>
                suggestion.toLowerCase().includes(inputValue.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleClick = (suggestion) => {
        onChange(suggestion);
        setFilteredSuggestions([]);
        setShowSuggestions(false);
    };

    const handleClickOutside = (event) => {
        if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
            setShowSuggestions(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={autocompleteRef} style={{ position: 'relative', width: '100%' }}>
            <SingleLineEditor
                value={value}
                onChange={(value) => handleChange({ target: { value: value } })}
                language={language}
                style={{ width: '100%', ...style }}
                validKeys={validKeys}
                fontSize={12}
                scrollMargin={5}
                divStyle={{ height: '33px' }}
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
                <ul style={{
                    position: 'absolute',
                    border: theme.palette.mode == "dark" ? "1px solid #333" : "1px solid #C8CDD7",
                    borderRadius: '4px',
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.primary,
                    zIndex: 1000,
                    maxHeight: '150px',
                    overflowY: 'auto',
                    padding: 0,
                    margin: 0,
                    listStyleType: 'none'
                }}>
                    {filteredSuggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleClick(suggestion)}
                            style={{
                                padding: '8px',
                                cursor: 'pointer',
                                // backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff'
                            }}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Autocomplete;
