import { useEffect, useRef, useState } from "react";
import { Box, Collapse, Fab, Paper, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import { useOutletContext } from "react-router-dom";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import LocationMap from "../components/Map/LocationMap";
import { colors, fonts } from "../theme";

const reportBadgePulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
`;

export default function MapPage() {
    const mapRef = useRef(null);
    const [reportOpen, setReportOpen] = useState(false);
    const { location, registerMapFocus, setDrawerOpen } = useOutletContext();

    useEffect(() => {
        registerMapFocus(() => (person) => mapRef.current?.focus(person));
        return () => registerMapFocus(null);
    }, [registerMapFocus]);

    return (
        <Paper component="section" square elevation={0} sx={{ position: "relative", overflow: "hidden", minHeight: 0, height: "100%" }}>
            <LocationMap ref={mapRef} people={location.people} />
            <Box
                sx={{
                    position: "absolute",
                    right: 16,
                    bottom: 18,
                    left: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 1,
                }}
            >
                <Fab
                    aria-label="Mở báo cáo vị trí"
                    onClick={() => setReportOpen((open) => !open)}
                    sx={{
                        flexShrink: 0,
                        width: 45,
                        height: 45,
                        bgcolor: colors.accent,
                        color: colors.primary,
                        border: `2px solid ${colors.white}`,
                        boxShadow: `0 8px 20px ${colors.markerShadow}`,
                        "&:hover": { bgcolor: colors.accent },
                    }}
                >
                    <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />
                    <Box
                        component="span"
                        sx={{
                            position: "absolute",
                            top: -5,
                            right: -4,
                            minWidth: 21,
                            height: 21,
                            px: 0.5,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "50%",
                            bgcolor: colors.primary,
                            color: colors.white,
                            border: `2px solid ${colors.white}`,
                            fontSize: 11,
                            fontWeight: 800,
                            animation: location.people.length > 0 ? `${reportBadgePulse} 1.8s ease-in-out infinite` : "none",
                        }}
                    >
                        {location.people.length}
                    </Box>
                </Fab>
                <Collapse
                    orientation="horizontal"
                    in={reportOpen}
                    timeout={{ enter: 380, exit: 260 }}
                    sx={{ display: "flex", "& .MuiCollapse-wrapperInner": { display: "flex" } }}
                >
                    <Paper
                        elevation={5}
                        onClick={() => {
                            setDrawerOpen(true);
                            setReportOpen(false);
                        }}
                        sx={{
                            width: "min(300px, calc(100vw - 106px))",
                            minWidth: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.25,
                            p: 1.25,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 3,
                            bgcolor: colors.accent,
                            cursor: "pointer",
                        }}
                    >
                        <Box sx={{ px: 1 }}>
                            <Typography variant="span" sx={{ display: "block", mb: 0.5, fontWeight: 800, fontFamily: fonts.display, fontSize: 16 }}>
                                Báo cáo Đại nhân !!!
                            </Typography>
                            <Typography variant="span" sx={{ display: "block", fontWeight: 300, fontSize: 13, color: colors.text, fontFamily: fonts.display }}>
                                Phát hiện {location.people.length} đối tượng lộ vị trí do bủm thúi
                            </Typography>
                        </Box>
                    </Paper>
                </Collapse>
            </Box>
        </Paper>
    );
}
