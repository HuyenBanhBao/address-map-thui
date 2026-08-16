/* eslint-disable react/prop-types */
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { keyframes } from "@mui/system";
// --------- Icons ---------
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";
import LocalDiningRoundedIcon from "@mui/icons-material/LocalDiningRounded";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import HandymanRoundedIcon from "@mui/icons-material/HandymanRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { Link, useLocation, useNavigate } from "react-router-dom";

// ------------------
import { TEAM_MEMBERS } from "../../hooks/useSharedLocations";
import { useRecipeOrders } from "../../hooks/useRecipeOrders";
import { colors, gradients, fonts } from "../../theme";

const STYLE_BTN = {
    borderRadius: 1,
    display: "flex",
    textDecoration: "none",
    alignItems: "center",
    px: 1.5,
    py: 0.75,
    gap: 1,
    mb: 1,
    boxShadow: colors.boxShadowBtn,
};

const orderAlertPulse = keyframes`
    0%, 100% { transform: rotate(0deg); }
    20% { transform: rotate(-14deg); }
    40% { transform: rotate(12deg); }
    60% { transform: rotate(-8deg); }
    80% { transform: rotate(6deg); }
`;

export default function TeamSidebar({ name, onNameChange, people, sharing, onShare, onStop, onFocus, onClose }) {
    const routerLocation = useLocation();
    const [selectedFeature, setSelectedFeature] = useState("map");
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const { orderedRecipes } = useRecipeOrders();
    const navigate = useNavigate();
    useEffect(() => {
        if (routerLocation.pathname.startsWith("/cook")) setSelectedFeature("kitchen");
        else if (routerLocation.pathname.startsWith("/repair")) setSelectedFeature("office");
        else if (routerLocation.pathname.startsWith("/toshiba")) setSelectedFeature("toshiba");
        else if (routerLocation.pathname === "/") setSelectedFeature("map");
    }, [routerLocation.pathname]);
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
                {/* --- Button 2 ---
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
                </Box> */}
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
                {/* --- Button 5 --- */}
                <Box
                    component={Link}
                    to="/toshiba"
                    onClick={() => {
                        setSelectedFeature("toshiba");
                        onClose?.();
                    }}
                    sx={{
                        ...STYLE_BTN,
                        bgcolor: selectedFeature === "toshiba" ? colors.primary : "transparent",
                        color: selectedFeature === "toshiba" ? colors.backgroundSoft : colors.text,
                        cursor: "pointer",
                    }}
                >
                    <WarehouseIcon sx={{ minWidth: 36, color: "inherit" }} />
                    <Typography
                        variant="span"
                        sx={{
                            //
                            fontWeight: 400,
                            fontFamily: fonts.display,
                            color: "inherit",
                        }}
                    >
                        Quốc khố
                    </Typography>
                </Box>
            </List>

            <Box
                onClick={() => setOrderDialogOpen(true)}
                sx={{
                    ...STYLE_BTN,
                    mb: 0,
                    position: "relative",
                    bgcolor: colors.accent,
                    color: colors.text,
                    cursor: "pointer",
                }}
            >
                {orderedRecipes.length > 0 && (
                    <Box
                        component="span"
                        sx={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            width: 18,
                            height: 18,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: colors.primary,
                            transformOrigin: "top center",
                            animation: `${orderAlertPulse} 1.2s ease-in-out infinite`,
                        }}
                    >
                        <NotificationsActiveIcon sx={{ fontSize: 21 }} />
                    </Box>
                )}
                <ReceiptLongRoundedIcon sx={{ minWidth: 36, color: "inherit" }} />
                <Typography sx={{ flex: 1, fontFamily: fonts.display, fontWeight: 500, color: "inherit" }}>
                    Đại nhân order
                </Typography>
                <Typography
                    sx={{
                        minWidth: 20,
                        textAlign: "center",
                        borderRadius: "50%",
                        bgcolor: colors.backgroundSoft,
                        color: colors.primary,
                        fontSize: 12,
                        fontWeight: 800,
                    }}
                >
                    {orderedRecipes.length}
                </Typography>
            </Box>
            <Box sx={{ display: "none" }}>
                <List disablePadding sx={{ mb: 1, px: 1 }}>
                    {orderedRecipes.length === 0 ? (
                        <Typography sx={{ py: 1, color: colors.textMuted, fontSize: 12 }}>
                            Đại nhân chưa gọi món.
                        </Typography>
                    ) : (
                        orderedRecipes.map((recipe) => (
                            <Typography
                                key={recipe.id}
                                sx={{ py: 0.5, color: colors.text, fontFamily: fonts.display, fontSize: 13 }}
                            >
                                • {recipe.name}
                            </Typography>
                        ))
                    )}
                </List>
            </Box>

            <Dialog
                open={orderDialogOpen}
                onClose={() => setOrderDialogOpen(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.background } }}
            >
                <DialogTitle sx={{ fontFamily: fonts.display, fontWeight: 800, color: colors.primary }}>
                    Đại nhân order
                </DialogTitle>
                <DialogContent>
                    {orderedRecipes.length === 0 ? (
                        <Typography sx={{ color: colors.textMuted }}>Đại nhân chưa gọi món.</Typography>
                    ) : (
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1.25 }}>
                            {orderedRecipes.map((recipe) => (
                                <Paper
                                    key={recipe.id}
                                    onClick={() => {
                                        setOrderDialogOpen(false);
                                        onClose?.();
                                        navigate(`/cook/${recipe.id}`);
                                    }}
                                    elevation={0}
                                    sx={{
                                        overflow: "hidden",
                                        borderRadius: 1,
                                        cursor: "pointer",
                                        bgcolor: colors.white,
                                        border: `1px solid ${colors.border}`,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            aspectRatio: "1.2 / 1",
                                            bgcolor: colors.backgroundSoft,
                                            background: recipe.image_url
                                                ? `center / cover no-repeat url(${recipe.image_url})`
                                                : colors.backgroundSoft,
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            p: 1,
                                            display: "-webkit-box",
                                            overflow: "hidden",
                                            WebkitBoxOrient: "vertical",
                                            WebkitLineClamp: 2,
                                            boxSizing: "border-box",
                                            lineHeight: 1.35,
                                            minHeight: 45,
                                            maxHeight: 45,
                                            fontFamily: fonts.display,
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: colors.text,
                                        }}
                                    >
                                        {recipe.name}
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

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
