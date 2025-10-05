import React, { useEffect, useRef, useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/theme-monokai';
import './mode-custom'; // Import the custom mode
import './styles.css'; // Ensure this imports the CSS file with the styles defined above
import styles from "./singleLineEditor.Style";
import { useSelector } from 'react-redux';
import { replacePlaceholders } from '../../utils/utils';

const SingleLineEditor = ({ value, onChange, language, handleEnter, isLoading, validKeys, fontSize, divStyle, scrollMargin, ...otherProps }) => {
  const editorRef = useRef(null);
  const classes = styles();
  const theme = useSelector(state => state.settingsReducer.theme);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const ace = require('ace-builds/src-noconflict/ace');

    // Add custom styles for valid and invalid keys
    const customCss = `
      .ace_valid-key { color: green; font-style: italic; }
      .ace_invalid-key { color: red; font-style: italic; }
      .tooltip {
        position: absolute;
        background-color: #333;
        color: #fff;
        padding: 5px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        display: none;
        max-height: 150px;  /* Limit the height */
        max-width: 300px;   /* Limit the width */
        overflow: auto;     /* Enable scrolling when content exceeds size */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Optional: Adds a shadow effect */
        word-wrap: break-word; /* Ensure long text wraps */
      }
    `;
    const styleElement = document.createElement('style');
    styleElement.innerText = customCss;
    document.head.appendChild(styleElement);

    // Apply the custom CSS to the Ace Editor
    ace.edit('editor').renderer.updateFull();

  }, []);

  useEffect(() => {
    const editor = editorRef.current.editor;

    // Dynamically update the mode with validKeys
    // const CustomMode = require('./mode-custom').Mode;
    // const customModeInstance = new CustomMode(validKeys); // Pass validKeys to the mode

    // editor.getSession().setMode(customModeInstance);

    if (editor && validKeys.length > 0) {
      // console.log("validKeys",validKeys)
      editor.session.setMode({
        path: `ace/mode/${language}`,
        validKeys: validKeys, // Pass validKeys to the mode
      });
    }

    // Tooltip logic
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    document.body.appendChild(tooltip);

    const handleMouseMove = (e) => {
      const pos = editor.renderer.screenToTextCoordinates(e.clientX, e.clientY);
      const session = editor.getSession();
      const token = session.getTokenAt(pos.row, pos.column);
      if (token && token.type === 'valid-key') {
        const key = token.value.replace('{{', '').replace('}}', ''); // Extract key from {{key}}
        const matchedKey = validKeys.find(entry => entry.key === key);

        if (matchedKey) {
          tooltip.style.display = 'block';
          tooltip.innerHTML = `<strong>scope:</strong>  ${matchedKey.scope || "Request"}<br><br><strong>value:</strong>  ${replacePlaceholders(matchedKey.value, validKeys)}`;
          tooltip.style.left = `${e.clientX + 10}px`;
          tooltip.style.top = `${e.clientY + 10}px`;
        }
      } else {
        tooltip.style.display = 'none';
      }
    };

    const handleMouseLeave = () => {
      tooltip.style.display = 'none';
    };

    editor.container.addEventListener('mousemove', handleMouseMove);
    editor.container.addEventListener('mouseleave', handleMouseLeave); // Handle mouse leave

    return () => {
      editor.container.removeEventListener('mousemove', handleMouseMove);
      editor.container.removeEventListener('mouseleave', handleMouseLeave);
      tooltip.remove(); // Clean up the tooltip when the component is unmounted
    };
  }, [validKeys]);

  useEffect(() => {
    const editor = editorRef.current.editor;

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevent adding a new line
        if (!isLoading) {
          handleEnter();
        }
      }
    };

    // Add the keydown event listener
    editor.container.addEventListener('keydown', handleKeyDown);

    return () => {
      // Clean up the keydown event listener
      editor.container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading, handleEnter]);

  useEffect(() => {
    const editor = editorRef.current.editor;

    const handleFocus = () => {
      editor.container.classList.add('focused');
    };

    const handleBlur = () => {
      editor.container.classList.remove('focused');
    };

    editor.on('focus', handleFocus);
    editor.on('blur', handleBlur);

    return () => {
      editor.off('focus', handleFocus);
      editor.off('blur', handleBlur);
    };
  }, []);

  const currentTheme = (selectedTheme) => {
    switch (selectedTheme) {
      case "dark": {
        return "twilight"
      }
      case "dracula": {
        return "dracula"
      }
      case "light": {
        return "github"
      }
      case "monokai": {
        return "monokai"
      }
      default: "github"
    }
  }

  return (
    <div style={{ flexGrow: 1, position: 'relative', height: '41px', ...divStyle }}>
      <AceEditor
        ref={editorRef}
        mode={language} // Set mode to the custom mode we defined
        theme={currentTheme(theme)}
        name="editor"
        fontSize={fontSize}
        showGutter={false}
        highlightActiveLine={false}
        value={value}
        onChange={onChange}
        showPrintMargin={false}
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          maxLines: isFocused ? 6 : 1, // Allow unlimited lines on focus
          minLines: 1,
          wrap: isFocused ? true : false,
          highlightActiveLine: false,
          highlightGutterLine: false,
        }}
        onFocus={() => setIsFocused(true)} // Track focus to expand height
        onBlur={() => setIsFocused(false)} // Collapse height on blur
        onLoad={(editor) => {
          editor.renderer.setScrollMargin(scrollMargin, scrollMargin, scrollMargin, scrollMargin) // Ensure spacing around the content
        }}
        style={{
          flexGrow: 1,
          color: 'text.primary', // Default text color
        }}
        className={classes.ace_editor_single_line} // Apply the base class for styling
        {...otherProps}
      />
    </div>
  );
};

SingleLineEditor.defaultProps = {
  language: 'text',
  handleEnter: () => { },
  isLoading: false,
  validKeys: [],
  fontSize: 14,
  divStyle: {},
  scrollMargin: 10,
};

export default SingleLineEditor;
