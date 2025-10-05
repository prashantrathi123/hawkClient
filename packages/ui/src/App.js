import React, { useEffect } from 'react';
import './App.css';
import Home from "./components/Home/Home.Component";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';
import { draculaTheme } from './themes/draculaTheme';
import { monokaiTheme } from './themes/monokaiTheme';

const App = () => {
  const dispatch = useDispatch();

  function generateNamePath(inputPath) {
    const pathSegments = inputPath.split('/').filter(Boolean);

    // Skip the first segment ("collections") and map the rest
    const namePath = pathSegments.slice(1).map((segment) => ({
      name: segment,
      path: '', // Initialize path as an empty string
    }));

    return namePath;
  }

  const currentTab = useSelector(state => state.apiTesterReducer.currentTab)
  const TabsContent = useSelector(state => state.apiTesterReducer.requestTabsContent)
  const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
  const TabsContentKeys = Object.keys(TabsContent)

  // 🟢 Attach listeners only once
  useEffect(() => {
    if (typeof electron === 'undefined') return;

    const onNotificationHandler = (event, data) => {
      // Handle the notification or update the UI as needed
      if (data.workspace == selectedWorkSpace) {
        if (data.isEnvChange) {
          if (data.event !== "DELETE_FILE") {
            let fileData = JSON.parse(data.fileData)
            if (data.fileName != "globalVariable.json") {
              const newFilename = data.fileName.replace(/\.json$/, "");
              dispatch({ type: "UPDATE_ENV_VARIABLES", values: fileData.values, envId: data.requestId, name: newFilename })
              dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: { name: newFilename, isSaved: true }, id: data.requestId })
            } else {
              dispatch({ type: "SET_GLOBAL_VARIABLES", globalVariables: { ...fileData } })
            }
          }
        } else if (data.isCertificateChange) {
          if (data.event !== "DELETE_FILE") {
            let response = JSON.parse(data.fileData)
            dispatch({ type: "UPDATE_CLIENT_CERTIFICATES", clientCertificates: response?.clientCertificates || [] })
            dispatch({ type: "SET_CA_CERT", isEnabled: response?.caCertificate?.isEnabled || false, caPath: response?.caCertificate?.caPath })
          }

        } else {
          if (data.event === "DELETE_FILE") {
            const index = TabsContentKeys.indexOf(currentTab);
            let id = data.relativePath + "/" + data.fileName;

            // DONE: write a logic if collectionid =null and filename=collection.json then delete all the tabs where collectiondisplay name = relativepath first folder
            dispatch({ type: "DELETE_TABS_WITH_MATCHING_COLLECTION_DISPLAY_NAME", collectionId: data.collectionId, filename: data.fileName, relativePath: data.relativePath });

            if (currentTab === id) {
              let newTab = TabsContentKeys.length > 1 ? TabsContentKeys[index > 0 ? index - 1 : 1] : "Default";
              dispatch({ type: "CLOSE_REQUEST_TAB_CONTENT", id: id, newTab: newTab, isChangeTab: true });
            } else {
              dispatch({
                type: "CLOSE_REQUEST_TAB_CONTENT",
                id: id,
                newTab: currentTab === "Default" ? "Default" : TabsContentKeys[index],
                isChangeTab: false
              });
            }

            // to do whenever a request is renamed then then for delete event delete the request...think about it 
          }

          if (data.requestId != null && data.fileName != "collection.json" && data.fileName !== "item.json" && data.fileName !== "item.yaml") {
            try {
              // UPDATE this to add namePath and collectionDisplayName
              const collectionDisplayName = data.relativePath.split('/')[0];
              let JsonFormatRequest = data.isYamlFormatRequest ? data.yamlToJsonConvertedData : JSON.parse(data.fileData)
              let selectedRequest = {
                isSaved: true,
                request: { ...JsonFormatRequest, name: data.fileName.split('.').slice(0, -1).join('.') },
                collectionDisplayName,
                namePath: generateNamePath(data.relativePath)
              }
              dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: data.requestId })
              JsonFormatRequest?.examples?.map((example, index) => {
                let selectedRequest = {
                  isSaved: true,
                  request: { ...example.originalRequest, name: example.name },
                  response: example.response,
                  collectionDisplayName,
                  namePath: generateNamePath(data.relativePath)
                }
                dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: example.id })
              })
            } catch (error) {
              console.log("error in file update event", error)
            }
          }
          if (data.fileName == "item.json" || data.fileName == "item.yaml") {
            try {
              let JsonFormatRequest = data.isYamlFormatRequest ? data.yamlToJsonConvertedData : JSON.parse(data.fileData)

              let selectedRequest = {
                isSaved: true,
                type: "FOLDER",
                ...JsonFormatRequest
              }
              dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: data.requestId })
            } catch (error) {
              console.log("error in file update event for folder", error)
            }
          }
          if (data.fileName == "collection.json") {
            try {
              let selectedRequest = {
                isSaved: true,
                ...JSON.parse(data.fileData),
              }
              let id = data.collectionId
              dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: id })
            } catch (error) {
              console.log("error in file update event", error)
            }
          }
          try {
            let selectedRequest = {
              isSaved: true,
              fileContent: data.fileData,
              name: data.fileName
            }
            let id = data.relativePath + "/" + data.fileName
            dispatch({ type: "UPDATE_REQUEST_TAB_CONTENT", selectedRequest: selectedRequest, id: id })
          } catch (error) {
            console.log("error in file update event", error)
          }
        }

      } else {
      }
    };

    const updateEnvNotification = ((event, data) => {
      if (data.workspace == selectedWorkSpace) {
        dispatch({ type: "SET_ENV_VARIABLES", envVariables: data.envVariablesJson })
      }
    })

    const updateCollectionsNotification = ((event, data) => {
      if (data.workspace == selectedWorkSpace) {
        dispatch({ type: "SET_API_COLLECTION", apiCollection: data.collectionJson })
      }
    })

    // ✅ Attach listeners
    const removeNotificationListener = electron.handler.onNotification(onNotificationHandler);
    const removeUpdateEnvNotificationListener = electron.handler.updateEnvNotification(updateEnvNotification);
    const removeuUdateCollectionsNotificationListener = electron.handler.updateCollectionsNotification(updateCollectionsNotification);

    // 🔴 Cleanup listeners on unmount
    return () => {
      removeNotificationListener();
      removeUpdateEnvNotificationListener();
      removeuUdateCollectionsNotificationListener();
    };
  }, [dispatch, selectedWorkSpace]);


  const theme = useSelector(state => state.settingsReducer.theme);

  const darkTheme = useMemo(() => {
    switch (theme) {
      case "dracula":
        return createTheme(draculaTheme);
      case "monokai":
        return createTheme(monokaiTheme);
      default:
        return createTheme({
          palette: {
            mode: theme === "dark" ? "dark" : "light",
          },
        });
    }
  }, [theme]);


  return (
    <ThemeProvider theme={darkTheme}>
      <Home />
    </ThemeProvider>
  );
}

export default App;
