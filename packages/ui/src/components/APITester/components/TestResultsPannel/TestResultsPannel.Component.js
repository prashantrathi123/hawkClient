import React from 'react';
import { Typography, Box, Grid, InputLabel } from '@mui/material';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

function TestResults(props) {
    const { testResults } = props;
    const theme = useTheme();

    const isTwoPane = useSelector(state => state.apiTesterReducer.isTwoPane || false)

    return (
        <Box style={{ position: 'relative', height: '100%', width: '100%', display: 'block' }}>
            <Grid style={{ display: 'flex', height: '100%', width: '100%', position: 'absolute', gap: '10px', flexDirection: isTwoPane ? 'column' : 'row' }}>
                <Grid item style={{ height: '100%', width: '100%' }}>
                    <InputLabel>Validation Results {"(" + (testResults.assertResults?.filter((item) => item.success)?.length || 0) + "/" + (testResults.assertResults?.filter((item) => item.isChecked)?.length || 0) + ")"}</InputLabel>
                    <Box style={{ border: theme.palette.mode == "dark" ? "1px solid #333" : "1px solid #C8CDD7", height: 'calc(100% - 24px)', boxSizing: 'border-box', borderRadius: '4px', overflow: 'scroll', padding: '4px' }}>
                        {
                            testResults.assertResults && testResults.assertResults.map((assertResult, index) => {
                                if (assertResult.isChecked == false) {
                                    return null
                                } else {
                                    return (
                                        <Box key={index} style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                                            {assertResult.success ? <CheckIcon style={{ color: theme.palette.success.main }} /> : <CloseIcon style={{ color: theme.palette.error.main }} />}
                                            <Box>
                                                <Typography style={{ color: assertResult.success ? theme.palette.success.main : theme.palette.error.main }}>{assertResult.assertVar} {assertResult.operator} {assertResult.value}</Typography>
                                                <Typography style={{ color: assertResult.success ? theme.palette.success.main : theme.palette.error.main, fontSize: '12px' }}>  {assertResult.error}</Typography>
                                            </Box>
                                        </Box>
                                    )
                                }
                            })
                        }
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}

TestResults.defaultProps = {
    testResults: {
        assertResults: [],
        testResults: []
    }
};

export default TestResults;