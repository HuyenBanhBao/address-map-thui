import { useRef, useState } from "react";
import { Box, Button, CssBaseline, Drawer, Fab, Paper, ThemeProvider, Typography } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AppHeader from "../components/Layout/AppHeader";
import TeamSidebar from "../components/Sidebar/TeamSidebar";
import LocationMap from "../components/Map/LocationMap";
import { useSharedLocations } from "../hooks/useSharedLocations";
import theme, { colors, gradients, fonts } from "../theme";

const initialLocation = { latitude: 10.7769, longitude: 106.7009 };

export default function MapPage() {
    const mapRef = useRef(null);
    const [myLocation, setMyLocation] = useState(initialLocation);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const location = useSharedLocations(setMyLocation);
    const sidebar = (
        <TeamSidebar
            name={location.name}
            onNameChange={location.setName}
            people={location.people}
            sharing={location.sharing}
            onShare={location.startSharing}
            onStop={location.stopSharing}
            onFocus={(person) => mapRef.current?.focus(person)}
            onClose={() => setDrawerOpen(false)}
        />
    );
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    display: "grid",
                    gridTemplateRows: "auto minmax(0, 1fr)",
                    height: "100dvh",
                    bgcolor: colors.background,
                    overflow: "hidden",
                }}
            >
                <AppHeader status={location.status} onMenuOpen={() => setDrawerOpen(true)} />
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "310px minmax(0, 1fr)" },
                        minHeight: 0,
                        background: gradients.workspace,
                    }}
                >
                    <Box sx={{ display: { xs: "none", lg: "block" }, borderRight: `1px solid ${colors.border}` }}>
                        {sidebar}
                    </Box>
                    <Drawer
                        open={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                        transitionDuration={{ enter: 340, exit: 240 }}
                        slotProps={{
                            backdrop: { sx: { backgroundColor: `${colors.primary}80`, backdropFilter: "blur(3px)" } },
                            paper: {
                                sx: {
                                    width: "300px !important",
                                    minWidth: "300px !important",
                                    maxWidth: "300px !important",
                                    height: "100%",
                                    boxShadow: `14px 0 36px ${colors.markerShadow}`,
                                },
                            },
                        }}
                    >
                        {sidebar}
                    </Drawer>
                    <Paper
                        component="section"
                        square
                        elevation={0}
                        sx={{ position: "relative", overflow: "hidden", minHeight: 0 }}
                    >
                        <LocationMap ref={mapRef} people={location.people} />
                        <Paper
                            elevation={5}
                            sx={{
                                position: "absolute",
                                left: 12,
                                right: 12,
                                bottom: 14,
                                display: "flex",
                                alignItems: "center",
                                gap: 1.25,
                                p: 1.25,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 3,
                                bgcolor: colors.accent,
                            }}
                        >
                            <PeopleAltOutlinedIcon color="primary" />
                            <Box>
                                <Typography
                                    variant="span"
                                    sx={{
                                        //
                                        display: "block",
                                        mb: 0.5,
                                        fontWeight: 800,
                                        fontFamily: fonts.display,
                                        fontSize: 16,
                                    }}
                                >
                                    Báo cáo Đại nhân !!!
                                </Typography>
                                <Typography
                                    variant="span"
                                    sx={{
                                        //
                                        display: "block",
                                        fontWeight: 300,
                                        fontSize: 13,
                                        color: colors.text,
                                        fontFamily: fonts.display,
                                    }}
                                >
                                    Phát hiện {location.people.length} đối tượng lộ vị trí do bủm thúi
                                </Typography>
                            </Box>
                            <Button
                                size="small"
                                onClick={() => setDrawerOpen(true)}
                                sx={{ ml: "auto", textTransform: "none", fontWeight: 800 }}
                            >
                                Xem
                            </Button>
                        </Paper>
                    </Paper>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
