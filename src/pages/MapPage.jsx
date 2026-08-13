import { useRef, useState } from 'react'
import { Box, Button, CssBaseline, Paper, ThemeProvider } from '@mui/material'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import AppHeader from '../components/Layout/AppHeader'
import TeamSidebar from '../components/Sidebar/TeamSidebar'
import LocationMap from '../components/Map/LocationMap'
import { useSharedLocations } from '../hooks/useSharedLocations'
import theme, { colors, gradients } from '../theme'

const initialLocation = { latitude: 10.7769, longitude: 106.7009 }

export default function MapPage() {
  const mapRef = useRef(null)
  const [myLocation, setMyLocation] = useState(initialLocation)
  const location = useSharedLocations(setMyLocation)

  return <ThemeProvider theme={theme}><CssBaseline /><Box sx={{ display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', minHeight: '100vh', bgcolor: colors.background, overflow: 'hidden' }}><AppHeader status={location.status} /><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '260px minmax(0, 1fr)' }, gridTemplateRows: { xs: 'auto minmax(0, 1fr)', md: '1fr' }, gap: 1.75, minHeight: 0, p: 1.75, background: gradients.workspace }}><TeamSidebar name={location.name} onNameChange={location.setName} people={location.people} sharing={location.sharing} onShare={location.startSharing} onStop={location.stopSharing} onFocus={(person) => mapRef.current?.focus(person)} /><Paper component="section" elevation={2} sx={{ position: 'relative', minHeight: { xs: 460, md: 0 }, overflow: 'hidden', border: `1px solid ${colors.border}` }}><LocationMap ref={mapRef} people={location.people} /><Button variant="contained" color="secondary" startIcon={<MyLocationIcon />} onClick={() => mapRef.current?.center(myLocation)} sx={{ position: 'absolute', right: 20, bottom: 20, color: colors.primary, fontWeight: 800, textTransform: 'none', boxShadow: 4 }}>Về vị trí của tôi</Button></Paper></Box></Box></ThemeProvider>
}
