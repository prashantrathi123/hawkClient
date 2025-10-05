import React, { useRef, useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-golang';
import 'ace-builds/src-noconflict/mode-graphqlschema';
import 'ace-builds/src-min-noconflict/mode-python';
import 'ace-builds/src-min-noconflict/mode-yaml';
import 'ace-builds/src-min-noconflict/mode-java';
import 'ace-builds/src-min-noconflict/mode-yaml';
import 'ace-builds/src-min-noconflict/mode-sh';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/ext-language_tools';
import './mode-customjson'; // Import your custom mode
import './mode-customtext';
import './mode-customxml';
import './mode-graphql';
import { useSelector } from 'react-redux';
import { replacePlaceholders } from '../../utils/utils';
import { useTheme } from '@mui/material/styles';

const CodeEditor = (props) => {
  const editorRef = useRef(null);
  const { value, onChange, language, isEditable, style, lineNumber, gutterIconText, iconType, customCompletions, validKeys, name, onCursorChange } = props;
  const theme = useSelector(state => state.settingsReducer.theme);
  const fontSize = useSelector(state => state.settingsReducer.fontSize);
  const muitheme = useTheme();

  const handleEditorChange = (newValue) => {
    onChange({ target: { value: newValue } });
  };

  const customCompleter = {
    getCompletions: function (editor, session, pos, prefix, callback) {
      // const completions = customCompletions;
      callback(null, customCompletions);
    },
  };

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current.editor;
      // const session = editor.getSession();

      // Ensure editor.completers is an array before extending it
      if (!Array.isArray(editor.completers)) {
        editor.completers = [];
      }
      // console.log("customCompletions", customCompletions)

      // If the language is "javascript", add the custom completer
      if (language === 'javascript') {
        // console.log("changed customCompletions", customCompletions)
        editor.completers = editor.completers.filter(completer => completer !== customCompleter);
        editor.completers.push(customCompleter);
      } else if (language === 'graphql') {
        // console.log("completers updated", customCompletions)
        editor.completers = [];
        editor.completers = editor.completers.filter(completer => completer !== customCompleter);
        editor.completers.push(customCompleter);
        // if (editor.isFocused()) {
        //   // editor.execCommand('startAutocomplete');
        // }
      } else {
        // If the language is not "javascript", remove the custom completer if it exists
        editor.completers = [];
        editor.completers = editor.completers.filter(completer => completer !== customCompleter);
      }
    }
  }, [customCompletions])

  useEffect(() => {
    const ace = require('ace-builds/src-noconflict/ace');

    // Add custom CSS styles
    const customCss = `
      .ace_envVariable { color: green; font-style: italic; }
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
       .ace_keywordg { color: #FF79C6; }
       .ace_typeg { color: #BD93F9; }
       .ace_variableg { color: #BD93F9; }
       .ace_stringg { color: #FFD700; }
       .ace_numericg { color: #859900; }
       .ace_commentg { color: #6272A4; }
      //  .ace_lpareng { color: #8BE9FD; }
      //  .ace_rpareng { color: #8BE9FD; }
       .ace_languageg { color: #CB4B16; }
       .ace_textg { color: #9cdcfe }

       .ace-xcode .ace_textg {
        color: #0451a5; /* Blue color */
      }
      .ace-twilight .ace_textg {
        color: #9cdcfe; /* Blue color */
      }
      .ace-xcode .ace_stringg {
        color: #a31515; /* red color */
      }
      .ace-twilight .ace_stringg {
        color: #ce9178; /* red color */
      }
      .ace-xcode .ace_numericg {
        color: #098658; /* green color */
      }
      .ace-twilight .ace_numericg {
        color: #B5CEA8; /* green color */
      }
      .ace_twilight .ace_variableg { 
        color: #BD93F9; 
      }

      .ace-xcode .ace_variable {
        color: #0451a5; /* Blue color */
      }
      .ace-twilight .ace_variable {
        color: #9cdcfe; /* Blue color */
      }
      .ace-xcode .ace_string {
        color: #a31515; /* red color */
      }
      .ace-twilight .ace_string {
        color: #ce9178; /* red color */
      }
      .ace-xcode .ace_constant.ace_numeric {
        color: #098658; /* green color */
      }
      .ace-twilight .ace_constant.ace_numeric {
        color: #B5CEA8; /* green color */
      }
      .ace-xcode .ace_constant.ace_language.ace_boolean {
        color: #2a04e4; /* blue color */
      }
      .ace-twilight .ace_constant.ace_language.ace_boolean {
        color: #4FC3F7; /* blue color */
      }
    `;
    const styleElement = document.createElement('style');
    styleElement.innerText = customCss;
    document.head.appendChild(styleElement);

    // Apply custom CSS to the Ace Editor
    ace.edit('code-editor').renderer.updateFull();

    if (editorRef.current) {
      const editor = editorRef.current.editor;
      const session = editor.getSession();

      // Ensure editor.completers is an array before extending it
      if (!Array.isArray(editor.completers)) {
        editor.completers = [];
      }

      // If the language is "javascript", add the custom completer
      if (language === 'javascript') {
        editor.completers = editor.completers.filter(completer => completer !== customCompleter);
        editor.completers.push(customCompleter);
      } else if (language === 'graphql') {
        editor.completers = [];
        editor.completers = editor.completers.filter(completer => completer !== customCompleter);
        editor.completers.push(customCompleter);
      } else {
        // If the language is not "javascript", remove the custom completer if it exists
        editor.completers = [];
        editor.completers = editor.completers.filter(completer => completer !== customCompleter);
      }

      // Add an icon in the gutter on a specific line
      session.setAnnotations([
        {
          row: lineNumber - 1, // Line numbers in Ace are zero-indexed
          column: 0,
          text: gutterIconText, // Tooltip text
          type: iconType // CSS class for the icon
        }
      ]);
    }
  }, [lineNumber]);

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

  const currentTheme = (selectedTheme) => {
    switch (selectedTheme) {
      case "dark": {
        return "twilight"
      }
      case "dracula": {
        return "dracula"
      }
      case "light": {
        return "xcode"
      }
      case "monokai": {
        return "monokai"
      }
      default: "xcode"
    }
  }

  return (
    <AceEditor
      ref={editorRef}
      style={{ width: '100%', height: '100%', ...style, borderColor: muitheme.palette.divider }}
      mode={language}
      theme={currentTheme(theme)}
      value={value}
      fontSize={fontSize}
      onChange={handleEditorChange}
      onCursorChange={onCursorChange}
      name={name}
      editorProps={{ $blockScrolling: true }}
      showPrintMargin={false}
      setOptions={{
        useWorker: false,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        wrap: true,
      }}
      readOnly={!isEditable}
    />
  );
};

CodeEditor.defaultProps = {
  isEditable: false,
  language: 'javascript',
  lineNumber: 0,
  gutterIconText: '',
  iconType: 'info',
  customCompletions: [],
  validKeys: [],
  name: 'code-editor',
  onCursorChange: () => { }
};

export default CodeEditor;
