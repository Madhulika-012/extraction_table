import React from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import SLExtractionTable from './components/SLExtractionTable'
import HoverScrollbars from './components/HoverScrollbars'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HoverScrollbars maxHeight="100%" sx={{ height: '100%' }}>
        <SLExtractionTable />
      </HoverScrollbars>
    </ThemeProvider>
  )
}

export default App
