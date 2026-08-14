import { Avatar, Box, Button, Divider, List, ListItemButton, ListItemIcon, Stack, Typography } from "@mui/material";
import { useState } from "react";
// --------- Icons ---------
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import LocalDiningRoundedIcon from "@mui/icons-material/LocalDiningRounded";
import HandymanRoundedIcon from "@mui/icons-material/HandymanRounded";
import { Link } from "react-router-dom";

// ------------------
import { TEAM_MEMBERS } from "../../hooks/useSharedLocations";
import { colors, gradients, fonts } from "../../theme";

const STYLE_BTN = {
    borderRadius: 1,
    display: "flex",
    alignItems: "center",
    px: 1.5,
    py: 0.75,
    gap: 1,
    mb: 1,
    boxShadow: colors.boxShadowBtn,
};

export default function TeamSidebar({ name, onNameChange, people, sharing, onShare, onStop, onFocus, onClose }) {
    const [selectedFeature, setSelectedFeature] = useState("map");
    const avatarSx = (member) => ({
        width: 32,
        height: 32,
        border: `2px solid ${colors.white}`,
        boxShadow: `0 2px 6px ${colors.avatarShadow}`,
        backgroundImage: `url(${import.meta.env.BASE_URL}avatars/team-sprite.png)`,
        backgroundSize: "200% 100%",
        backgroundPosition: member === "Mập" ? "left center" : "right center",
    });
    const focus = (person) => {
        onFocus(person);
        onClose?.();
    };
    return (
        <Box
            component="aside"
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                p: 2,
                color: colors.text,
                background: gradients.sidebar,
            }}
        >
            {/* ---------------- TIÊU ĐỀ ---------------- */}
            <Typography
                variant="span"
                color="primary.main"
                sx={{
                    display: "block",
                    fontSize: 18,
                    color: colors.primary,
                    fontWeight: 800,
                    letterSpacing: ".11em",
                    lineHeight: 1,
                    fontFamily: fonts.playful,
                }}
            >
                CHỨC NĂNG
            </Typography>
            {/* ---------------- LIST ---------------- */}
            <List disablePadding sx={{ mt: 2 }}>
                {/* --- Button 1 --- */}
                <Box
                    component={Link}
                    to="/"
                    onClick={() => {
                        setSelectedFeature("map");
                        onClose?.();
                    }}
                    sx={{
                        ...STYLE_BTN,
                        bgcolor: selectedFeature === "map" ? colors.primary : "transparent",
                        color: selectedFeature === "map" ? colors.backgroundSoft : colors.text,
                        textDecoration: "none",
                        cursor: "pointer",
                    }}
                >
                    <MapOutlinedIcon sx={{ minWidth: 36, color: "inherit" }} />
                    <Typography
                        variant="span"
                        sx={{
                            //
                            fontWeight: 400,
                            fontFamily: fonts.display,
                            color: "inherit",
                        }}
                    >
                        Mập xinh chốn đâu
                    </Typography>
                </Box>
                {/* --- Button 2 --- */}
                <Box
                    onClick={() => setSelectedFeature("timeline")}
                    sx={{
                        ...STYLE_BTN,
                        bgcolor: selectedFeature === "timeline" ? colors.primary : "transparent",
                        color: selectedFeature === "timeline" ? colors.backgroundSoft : colors.text,
                        cursor: "pointer",
                    }}
                >
                    <TimelineOutlinedIcon sx={{ minWidth: 36, color: "inherit" }} />
                    <Typography
                        variant="span"
                        sx={{
                            //
                            fontWeight: 400,
                            fontFamily: fonts.display,
                            color: "inherit",
                        }}
                    >
                        Dấu vết để lại
                    </Typography>
                </Box>
                {/* --- Button 3 --- */}
                <Box
                    component={Link}
                    to="/cook"
                    onClick={() => {
                        setSelectedFeature("kitchen");
                        onClose?.();
                    }}
                    sx={{
                        ...STYLE_BTN,
                        bgcolor: selectedFeature === "kitchen" ? colors.primary : "transparent",
                        color: selectedFeature === "kitchen" ? colors.backgroundSoft : colors.text,
                        cursor: "pointer",
                    }}
                >
                    <LocalDiningRoundedIcon sx={{ minWidth: 36, color: "inherit" }} />
                    <Typography
                        variant="span"
                        sx={{
                            //
                            fontWeight: 400,
                            fontFamily: fonts.display,
                            color: "inherit",
                        }}
                    >
                        Ngự trù
                    </Typography>
                </Box>
                {/* --- Button 4 --- */}
                <Box
                    component={Link}
                    to="/repair"
                    onClick={() => {
                        setSelectedFeature("office");
                        onClose?.();
                    }}
                    sx={{
                        ...STYLE_BTN,
                        bgcolor: selectedFeature === "office" ? colors.primary : "transparent",
                        color: selectedFeature === "office" ? colors.backgroundSoft : colors.text,
                        cursor: "pointer",
                    }}
                >
                    <HandymanRoundedIcon sx={{ minWidth: 36, color: "inherit" }} />
                    <Typography
                        variant="span"
                        sx={{
                            //
                            fontWeight: 400,
                            fontFamily: fonts.display,
                            color: "inherit",
                        }}
                    >
                        Nội Vụ Phủ
                    </Typography>
                </Box>
            </List>

            {/* ---------------- GROUPS ---------------- */}
            <Divider sx={{ my: 1, borderColor: colors.subtleBorder }} />
            <Typography
                variant="span"
                sx={{
                    //
                    mt: 1,
                    fontWeight: 400,
                    fontSize: 14,
                    fontFamily: fonts.display,
                    color: colors.textMuted,
                }}
            >
                Nô tì mau báo họ tên?
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
                {TEAM_MEMBERS.map((member) => (
                    <Button
                        key={member}
                        variant={name === member ? "contained" : "outlined"}
                        onClick={() => onNameChange(member)}
                        sx={{
                            flex: 1,
                            textTransform: "none",
                            fontWeight: 800,
                            fontFamily: fonts.display,
                            fontSize: 14,
                            color: name === member ? colors.white : colors.primary,
                            boxShadow: colors.boxShadowBtn,
                        }}
                    >
                        {member}
                    </Button>
                ))}
            </Stack>
            <Button
                variant="contained"
                color={sharing ? "primary" : "secondary"}
                onClick={sharing ? onStop : onShare}
                startIcon={sharing ? <StopCircleOutlinedIcon /> : <LocationOnOutlinedIcon />}
                sx={{
                    mt: 1.5,
                    minHeight: 46,
                    color: sharing ? colors.white : colors.primary,
                    fontWeight: 500,
                    fontSize: 16,
                    textTransform: "none",
                    fontFamily: fonts.display,
                    boxShadow: colors.boxShadowBtn,
                }}
            >
                {sharing ? "Lẩn trốn" : "Báo cáo vị trí"}
            </Button>

            {/* ---------------- PEOPLE ---------------- */}
            <Box sx={{ mt: 3 }}>
                <Typography
                    variant="span"
                    sx={{
                        //
                        mt: 1,
                        fontWeight: 400,
                        fontSize: 14,
                        fontFamily: fonts.display,
                        color: colors.textMuted,
                    }}
                >
                    Đối tượng xuất hiện ({people.length})
                </Typography>
                <List disablePadding>
                    {people.map((person) => (
                        <ListItemButton
                            key={person.user_id}
                            onClick={() => focus(person)}
                            sx={{ px: 0, borderBottom: `1px solid ${colors.subtleBorder}` }}
                        >
                            <ListItemIcon sx={{ minWidth: 42 }}>
                                <Avatar sx={avatarSx(person.display_name)} />
                            </ListItemIcon>
                            <Typography
                                variant="span"
                                sx={{
                                    display: "block",
                                    mr: "auto",
                                    fontWeight: 300,
                                    fontSize: 16,
                                    fontFamily: fonts.display,
                                    color: colors.text,
                                }}
                            >
                                {person.display_name}
                            </Typography>
                            <Typography
                                variant="span"
                                sx={{
                                    color: colors.textMuted,
                                    fontFamily: fonts.display,
                                    fontSize: 18,
                                    fontWeight: 800,
                                }}
                            >
                                ›
                            </Typography>
                        </ListItemButton>
                    ))}
                </List>
            </Box>
        </Box>
    );
}
