import { useState } from "react";
import { Box, Drawer } from "@mui/material";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import TeamSidebar from "../Sidebar/TeamSidebar";
import { useSharedLocations } from "../../hooks/useSharedLocations";
import { colors, gradients } from "../../theme";

const initialLocation = { latitude: 10.7769, longitude: 106.7009 };

export default function AppShell() {
    const [myLocation, setMyLocation] = useState(initialLocation);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [mapFocus, setMapFocus] = useState(null);
    const location = useSharedLocations(setMyLocation);

    const sidebar = (
        <TeamSidebar
            name={location.name}
            onNameChange={location.setName}
            people={location.people}
            sharing={location.sharing}
            onShare={location.startSharing}
            onStop={location.stopSharing}
            onFocus={(person) => mapFocus?.(person)}
            onClose={() => setDrawerOpen(false)}
        />
    );

    return (
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
            <Box sx={{ minHeight: 0, background: gradients.workspace }}>
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
                <Outlet context={{ location, myLocation, registerMapFocus: setMapFocus, setDrawerOpen }} />
            </Box>
        </Box>
    );
}
