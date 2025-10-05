import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Box, Grid, Tab, Tabs, Radio, RadioGroup, Checkbox, Switch, InputLabel, TextField, IconButton, Accordion, AccordionSummary, AccordionDetails, Link, Badge } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import FormControlLabel from '@mui/material/FormControlLabel';
import { APP_VERSION, APP_DISPLAT_NAME } from '../../constants/constants';
import FilePicker from '../FilePicker/FilePicker.Component';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SingleLineEditor from '../singleLineEditor/singleLineEditor';
import Logo from "../icons/hawklogo.Component"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { addCertificates } from "../../services/certificates.Service"
import { saveSettings } from "../../services/settingsService"
import { checkForUpdates } from '../../services/UpdatesService';
import { useTheme } from '@mui/material/styles';

function SettingsDialog(props) {

    const { open, setOpen } = props;
    const theme = useSelector(state => state.settingsReducer.theme);
    const muitheme = useTheme();
    const dispatch = useDispatch();
    const [setteingsTab, setSetteingsTab] = useState("1");
    const reducerClientCertificates = useSelector(state => state.settingsReducer.clientCertificates)
    const reducerCaCertificate = useSelector(state => state.settingsReducer.caCertificate)
    const selectedWorkSpace = useSelector(state => state.workSpaceReducer.selectedWorkSpace)
    const isCertSaved = useSelector(state => state.settingsReducer.isCertSaved)
    const isVerifyTLS = useSelector(state => state.settingsReducer.isVerifyTLS);
    const fontSize = useSelector(state => state.settingsReducer.fontSize);
    const isSettingsSaved = useSelector(state => state.settingsReducer.isSettingsSaved);
    const isUpdatesAvailable = useSelector(state => state.settingsReducer.isUpdatesAvailable);

    const [clientCertificates, setClientCertificates] = useState({ type: 'cert' });
    const [latestVersion, setLatestVersion] = useState("");

    useEffect(() => {
        // Function to check for updates
        const fetchUpdates = () => {
            checkForUpdates().then((resp) => {
                dispatch({ type: "SET_IS_UPDATES_AVAILABLE", isUpdatesAvailable: resp.updateAvailable });
                setLatestVersion(resp?.latestVersion || '');
            });
        };

        // Initial check
        fetchUpdates();

        // Set interval to check every 2 hours
        const intervalId = setInterval(fetchUpdates, 2 * 60 * 60 * 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    const handleClose = () => {
        setOpen(false);
    };

    const handleTextFieldChange = (event, fieldId) => {
        const { value } = event.target;
        let tempVal = { ...clientCertificates }
        tempVal[`${fieldId}`] = value;
        setClientCertificates(tempVal);
    }

    const handleSetTheme = (theme) => {
        dispatch({ type: "SET_THEME", theme: theme, isSettingsSaved: false });
    };
    const handleFileChange = (event, fieldId) => {
        const file = event.target.files[0];
        if (file) {
            if (fieldId != "caPath") {
                let tempVal = { ...clientCertificates }
                tempVal[`${fieldId}`] = file.path;
                setClientCertificates(tempVal);
            } else {
                dispatch({ type: "ADD_CA_CERT", caPath: file.path })
                dispatch({ type: "SET_IS_CERT_SAVED", isCertSaved: false })
            }
        } else {
            if (fieldId == "caPath") {
                dispatch({ type: "ADD_CA_CERT", caPath: null })
                dispatch({ type: "SET_IS_CERT_SAVED", isCertSaved: false })
            }
        }
    };

    const handleAddClientCertificate = () => {
        dispatch({ type: "ADD_CLIENT_CERTIFICATES", clientCertificates: clientCertificates })
        dispatch({ type: "SET_IS_CERT_SAVED", isCertSaved: false })
        setClientCertificates({ type: 'cert' })
    }

    const handleSaveCertificates = () => {
        let payload = {
            caCertificate: {
                isEnabled: reducerCaCertificate?.isEnabled || false,
                caPath: reducerCaCertificate?.caPath,
            },
            clientCertificates: reducerClientCertificates || []
        }
        addCertificates(payload, selectedWorkSpace).then((res) => {
            if (res.error) {
                console.log("error in save certificates")
            } else {
                dispatch({ type: "SET_IS_CERT_SAVED", isCertSaved: true })
            }
        })
    }

    const handleCertTypeChange = (event) => {
        let tempVal = { ...clientCertificates }
        tempVal[`type`] = event.target.value;
        setClientCertificates(tempVal);
    }

    const handleToggle = () => {
        dispatch({ type: "ENABLE_CA_CERT", isEnabled: !reducerCaCertificate.isEnabled })
        dispatch({ type: "SET_IS_CERT_SAVED", isCertSaved: false })
    }

    const handleDeleteCertificate = (index) => {
        let val = reducerClientCertificates;
        let updatedClientCertificates = [
            ...val.slice(0, index),
            ...val.slice(index + 1)
        ]
        dispatch({ type: "UPDATE_CLIENT_CERTIFICATES", clientCertificates: updatedClientCertificates })
        dispatch({ type: "SET_IS_CERT_SAVED", isCertSaved: false })
    }

    const handleFontChange = (event) => {
        let tempFontSize = parseInt(event.target.value, 10);

        // If parsing fails, default to 12
        tempFontSize = isNaN(tempFontSize) ? 12 : tempFontSize;

        // Ensure the font size is between 1 and 32
        tempFontSize = Math.max(1, Math.min(tempFontSize, 32));

        dispatch({ type: "SET_FONT_SIZE", fontSize: tempFontSize, isSettingsSaved: false });
    };

    const handleSaveSettings = () => {
        saveSettings({ theme, fontSize }).then((resp) => {
            dispatch({ type: "SET_THEME", theme: resp.theme, isSettingsSaved: true })
            dispatch({ type: "SET_FONT_SIZE", fontSize: resp.fontSize, isSettingsSaved: true })
        })
    }

    return (
        <React.Fragment>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle sx={{ borderBottom: '1px solid #C8CDD7', padding: '6px 24px' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Settings</Typography>
                        <Button onClick={handleClose}>Close</Button>
                    </Box>
                </DialogTitle>
                <DialogContent style={{ minWidth: '600px', height: "350px", display: 'flex', padding: '0px' }}>
                    <TabContext value={setteingsTab}>
                        <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
                            <Tabs
                                value={setteingsTab}
                                orientation="vertical"
                                variant="scrollable"
                                onChange={(e, value) => { setSetteingsTab(value); }}
                                aria-label="Settings tabs"
                                sx={{ borderRight: 1, borderColor: 'divider' }}
                            >
                                <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", padding: "8px" }} label="Theme" value="1" />
                                <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", padding: "8px" }} label="General" value="3" />
                                <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", padding: "8px" }} label="Certificates" value="4" />
                                <Tab
                                    icon={
                                        <Badge
                                            color="error"
                                            variant="dot"
                                            overlap="circular"
                                            invisible={!isUpdatesAvailable}
                                            anchorOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                        >
                                            {/* Empty box to simulate the label badge */}
                                            <Box sx={{ width: 0, height: 0 }} />
                                        </Badge>
                                    }
                                    iconPosition="end"
                                    style={{
                                        fontFamily: "Noto Sans",
                                        textTransform: "none",
                                        padding: "8px",
                                        height: "48px"
                                    }}
                                    label="Updates"
                                    value="updates"
                                />
                                <Tab style={{ fontFamily: "Noto Sans", textTransform: "none", padding: "8px" }} label="About" value="2" />
                            </Tabs>
                            <Box sx={{ flexGrow: 1, padding: '4px 24px', overflow: 'auto' }}>
                                <TabPanel value="1" sx={{ padding: '0px' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <Typography sx={{ fontWeight: 600 }}>Themes</Typography>
                                        <Box>
                                            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: "14px", minWidth: 0, flexShrink: 0 }}>
                                                Make your experience uniquely yours with themes that
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: "14px", minWidth: 0, flexShrink: 0 }}>
                                                perfectly match your style.
                                            </Typography>
                                        </Box>
                                        <RadioGroup
                                            aria-labelledby="theme"
                                            defaultValue="light"
                                            name="theme"
                                            value={theme}
                                            onChange={(event) => { handleSetTheme(event.target.value) }}
                                        >
                                            <FormControlLabel value="light" control={<Radio />} label="Light" />
                                            <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                                            <FormControlLabel value="dracula" control={<Radio />} label="Dracula" />
                                            <FormControlLabel value="monokai" control={<Radio />} label="Monokai" />
                                        </RadioGroup>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }} >
                                            <Typography>Font Size</Typography>
                                            <TextField
                                                size="small"
                                                margin="dense"
                                                value={fontSize}
                                                id="fontSize"
                                                variant="outlined"
                                                type="number"
                                                onChange={handleFontChange}
                                            />
                                        </Box>
                                        <Box>
                                            <Button disabled={isSettingsSaved} variant='contained' onClick={handleSaveSettings}>Save</Button>
                                        </Box>
                                    </Box>
                                </TabPanel>
                                <TabPanel value="2" sx={{ padding: '0px' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                                        <Logo width="46px" height="46px" />

                                        <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                                {APP_DISPLAT_NAME}
                                            </Typography>
                                            <Typography sx={{ fontSize: "10px" }}>by Prashant Rathi</Typography>
                                        </Box>

                                        <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: "14px" }}>
                                            Version: {APP_VERSION}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: "14px" }}>
                                            Developer and git friendly offline-only API testing tool.
                                        </Typography>
                                    </Box>
                                </TabPanel>
                                <TabPanel value="3" sx={{ padding: '0px' }}>
                                    <Typography sx={{ fontWeight: 600 }}>General</Typography>
                                    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                        <Checkbox
                                            checked={isVerifyTLS}
                                            onChange={(event) => dispatch({ type: "SET_IS_VERIFY_TLS", isVerifyTLS: event.target.checked })}
                                            inputProps={{ 'aria-label': 'controlled' }}
                                        />
                                        <Typography>Verify SSL/TLS</Typography>
                                    </Box>
                                </TabPanel>
                                <TabPanel value="4" sx={{ padding: '0px' }}>
                                    <Box sx={{ borderBottom: '1px solid #C8CDD7', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: "12px", paddingBottom: '8px' }}>
                                        <Typography sx={{ fontWeight: 600 }}>CA certificates</Typography>
                                        <Box sx={{ display: 'flex', gap: '30px', paddingLeft: '8px' }}>
                                            <FilePicker filepaths={reducerCaCertificate.caPath ? [reducerCaCertificate.caPath] : []} handlefilechange={(event) => handleFileChange(event, "caPath")} index={0} multiple={false} />
                                            <Switch checked={reducerCaCertificate.isEnabled} onChange={handleToggle} />
                                        </Box>
                                    </Box>
                                    <Box sx={{ borderBottom: '1px solid #C8CDD7', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: "12px", paddingBottom: '8px' }}>
                                        <Typography sx={{ fontWeight: 600 }}>Client certificates</Typography>
                                        {
                                            reducerClientCertificates.length > 0 ? reducerClientCertificates.map((clntCertificate, index) => {
                                                return (
                                                    <Box key={index} sx={{ borderBottom: index != reducerClientCertificates.length - 1 ? '1px solid #C8CDD7' : '0px', paddingLeft: '8px', paddingBottom: '8px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                        <Box sx={{ flexGrow: 1, width: 'min-content' }}>
                                                            <Accordion key={index}>
                                                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                                    <Typography>
                                                                        <Typography component="span" fontWeight="bold">host:</Typography> {clntCertificate.host || ""}
                                                                    </Typography>

                                                                </AccordionSummary>
                                                                <AccordionDetails>
                                                                    <Typography>
                                                                        <Typography component="span" fontWeight="bold">type:</Typography> {clntCertificate.type || ""}
                                                                    </Typography>
                                                                    <Typography variant="body1">
                                                                        <p><strong>certPath:</strong> {clntCertificate.certPath || ""}</p>
                                                                        {/* <br /> */}
                                                                    </Typography>
                                                                    <Typography variant="body1">
                                                                        <Typography component="span" fontWeight="bold">keyPath:</Typography> {clntCertificate.keyPath || ""}
                                                                    </Typography>
                                                                    <Typography variant="body1">
                                                                        <p><strong>pfxPath:</strong> {clntCertificate.pfxPath || ""}</p>
                                                                    </Typography>
                                                                    <Typography>
                                                                        <Typography component="span" fontWeight="bold">passphrase:</Typography> {clntCertificate.passphrase || ""}
                                                                    </Typography>
                                                                </AccordionDetails>
                                                            </Accordion>
                                                        </Box>
                                                        <Box>
                                                            <IconButton onClick={() => { handleDeleteCertificate(index) }} sx={{ height: '33px', width: '33px' }}>
                                                                <DeleteOutlineIcon />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                )
                                            }) : <Typography variant="body2" sx={{ color: 'text.secondary', paddingLeft: '8px' }}>No client Certificates Added</Typography>
                                        }
                                    </Box>
                                    <Box sx={{ borderBottom: '1px solid #C8CDD7', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: "12px", paddingBottom: '8px' }}>
                                        <Typography sx={{ fontWeight: 600 }}>Add client certificates</Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: "12px", paddingLeft: '8px' }}>
                                            <Box style={{ display: 'flex', flexDirection: 'row', gap: '4px', alignItems: 'center' }}>
                                                <InputLabel>Type:</InputLabel>
                                                <Radio
                                                    checked={clientCertificates.type === 'cert'}
                                                    onChange={handleCertTypeChange}
                                                    value="cert"
                                                    name="radio-buttons"
                                                    inputProps={{ 'aria-label': 'cert' }}
                                                />
                                                <InputLabel>cert</InputLabel>
                                                <Radio
                                                    checked={clientCertificates.type === 'pfx'}
                                                    onChange={handleCertTypeChange}
                                                    value="pfx"
                                                    name="radio-buttons"
                                                    inputProps={{ 'aria-label': 'pfx' }}
                                                />
                                                <InputLabel>pfx</InputLabel>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '56px' }}>
                                                <InputLabel required>Host:</InputLabel>
                                                <SingleLineEditor
                                                    value={clientCertificates.host || ""}
                                                    onChange={(value) => handleTextFieldChange({ target: { value: value, id: 'host' } }, "host")}
                                                    language='text'
                                                    style={{ width: '100%', background: muitheme.palette.background.paper }}
                                                    fontSize={12}
                                                    scrollMargin={5}
                                                    divStyle={{ height: '33px' }}
                                                />
                                            </Box>
                                            {clientCertificates.type == 'cert' ? <>
                                                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '48px' }}>
                                                    <InputLabel>CRT file:</InputLabel>
                                                    <FilePicker filepaths={[]} handlefilechange={(event) => handleFileChange(event, "certPath")} index={0} multiple={false} />
                                                </Box>
                                                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '48px' }}>
                                                    <InputLabel>KEY file:</InputLabel>
                                                    <FilePicker filepaths={[]} handlefilechange={(event) => handleFileChange(event, "keyPath")} index={0} multiple={false} />
                                                </Box>
                                            </> : <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '48px' }}>
                                                <InputLabel>PFX file:</InputLabel>
                                                <FilePicker filepaths={[]} handlefilechange={(event) => handleFileChange(event, "pfxPath")} index={0} multiple={false} />
                                            </Box>
                                            }
                                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                                                <InputLabel>Passphrase:</InputLabel>
                                                <SingleLineEditor
                                                    value={clientCertificates.passphrase || ""}
                                                    onChange={(value) => handleTextFieldChange({ target: { value: value, id: 'passphrase' } }, "passphrase")}
                                                    language='text'
                                                    style={{ width: '100%', background: muitheme.palette.background.paper }}
                                                    fontSize={12}
                                                    scrollMargin={5}
                                                    divStyle={{ height: '33px' }}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Button variant='contained' onClick={handleAddClientCertificate}>Add Certificate</Button>
                                                <Button variant='contained' disabled={isCertSaved} onClick={handleSaveCertificates}>Save</Button>
                                            </Box>

                                        </Box>
                                    </Box>
                                </TabPanel>
                                <TabPanel value="updates" sx={{ padding: '0px' }}>
                                    {!isUpdatesAvailable ? <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>Your app is up to date.</Box> :
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography>New version available: {latestVersion}</Typography>

                                            <Link
                                                href="https://www.hawkclient.com/download"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                underline="hover"
                                            >
                                                Download Now
                                            </Link>
                                        </Box>}
                                </TabPanel>
                            </Box>
                        </Box>
                    </TabContext>
                </DialogContent>
            </Dialog>
        </React.Fragment>

    );
}
SettingsDialog.defaultProps = {
    open: false
}
export default SettingsDialog;