/* eslint-disable react/prop-types */
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
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
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";
import LocalDiningRoundedIcon from "@mui/icons-material/LocalDiningRounded";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import HandymanRoundedIcon from "@mui/icons-material/HandymanRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Link, useLocation, useNavigate } from "react-router-dom";

// ------------------
import { TEAM_MEMBERS } from "../../hooks/useSharedLocations";
import { useRecipeOrders } from "../../hooks/useRecipeOrders";
import { colors, gradients, fonts } from "../../theme";

const STYLE_BTN = {
    minHeight: 46,
    borderRadius: 3,
    display: "flex",
    textDecoration: "none",
    alignItems: "center",
    px: 1,
    py: 0.65,
    gap: 0.75,
    mb: 0.6,
    border: `1px solid ${colors.subtleBorder}`,
    boxShadow: `0 4px 12px ${colors.avatarShadow}`,
    transition: "background-color 180ms ease, color 180ms ease, transform 180ms ease, box-shadow 180ms ease",
    "&:hover": {
        transform: "translateX(2px)",
        boxShadow: `0 7px 18px ${colors.avatarShadow}`,
    },
    "&:active": { transform: "scale(0.98)" },
};

const NAV_ITEMS = [
    { id: "home", label: "Trang chủ", route: "/", icon: HomeRoundedIcon },
    { id: "map", label: "Mập xinh chốn đâu", route: "/map", icon: MapOutlinedIcon },
    { id: "kitchen", label: "Ngự trù", route: "/cook", icon: LocalDiningRoundedIcon },
    { id: "office", label: "Nội Vụ Phủ", route: "/repair", icon: HandymanRoundedIcon },
    { id: "toshiba", label: "Quốc khố", route: "/toshiba", icon: WarehouseIcon },
    { id: "health", label: "Truyền Thái Y", route: "/health", icon: FavoriteRoundedIcon },
];

const orderAlertPulse = keyframes`
    0%, 100% { transform: rotate(0deg); }
    20% { transform: rotate(-14deg); }
    40% { transform: rotate(12deg); }
    60% { transform: rotate(-8deg); }
    80% { transform: rotate(6deg); }
`;

export default function TeamSidebar({ name, onNameChange, people, sharing, onShare, onStop, onFocus, onClose }) {
    const routerLocation = useLocation();
    const [selectedFeature, setSelectedFeature] = useState("home");
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const { orderedRecipes } = useRecipeOrders();
    const navigate = useNavigate();
    useEffect(() => {
        if (routerLocation.pathname === "/") setSelectedFeature("home");
        else if (routerLocation.pathname.startsWith("/map")) setSelectedFeature("map");
        else if (routerLocation.pathname.startsWith("/cook")) setSelectedFeature("kitchen");
        else if (routerLocation.pathname.startsWith("/repair")) setSelectedFeature("office");
        else if (routerLocation.pathname.startsWith("/toshiba")) setSelectedFeature("toshiba");
        else if (routerLocation.pathname.startsWith("/health")) setSelectedFeature("health");
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
                minHeight: 0,
                boxSizing: "border-box",
                overflow: "hidden",
                color: colors.text,
                background: gradients.sidebar,
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    flexShrink: 0,
                    overflow: "hidden",
                    px: 1.5,
                    pt: 1.5,
                    pb: 1.35,
                    color: colors.white,
                    background: gradients.header,
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        width: 120,
                        height: 120,
                        top: -70,
                        right: -35,
                        borderRadius: "50%",
                        bgcolor: colors.headerOverlay,
                    }}
                />
                <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            borderRadius: 3,
                            bgcolor: colors.headerOverlay,
                            border: `1px solid ${colors.headerBorder}`,
                        }}
                    >
                        <HomeRoundedIcon />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            sx={{
                                fontFamily: fonts.body,
                                fontSize: 9,
                                fontWeight: 800,
                                letterSpacing: ".14em",
                                opacity: 0.75,
                            }}
                        >
                            BẢNG ĐIỀU KHIỂN
                        </Typography>
                        <Typography noWrap sx={{ mt: 0.2, fontFamily: fonts.display, fontSize: 17, fontWeight: 800 }}>
                            Nhà mình hôm nay
                        </Typography>
                    </Box>
                    <IconButton
                        aria-label="Đóng bảng chức năng"
                        onClick={() => onClose?.()}
                        sx={{
                            color: colors.white,
                            bgcolor: colors.headerOverlay,
                            border: `1px solid ${colors.headerBorder}`,
                        }}
                    >
                        <CloseRoundedIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Box>
                <Box
                    sx={{
                        position: "relative",
                        mt: 1.15,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.7,
                        px: 1,
                        py: 0.65,
                        borderRadius: 2.5,
                        bgcolor: colors.headerOverlay,
                    }}
                >
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: colors.online }} />
                    <Typography sx={{ fontFamily: fonts.body, fontSize: 11.5, opacity: 0.88 }}>
                        {sharing ? "Đang chia sẻ vị trí" : `${people.length} người đang hiển thị`}
                    </Typography>
                </Box>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    px: 1.35,
                    py: 1.25,
                    scrollbarWidth: "thin",
                    scrollbarColor: `${colors.border} transparent`,
                    "&::-webkit-scrollbar": { width: 4 },
                    "&::-webkit-scrollbar-thumb": { borderRadius: 99, bgcolor: colors.border },
                }}
            >
                <Typography
                    sx={{
                        px: 0.65,
                        mb: 0.75,
                        fontFamily: fonts.body,
                        fontSize: 9.5,
                        fontWeight: 800,
                        letterSpacing: ".14em",
                        color: colors.textMuted,
                    }}
                >
                    KHÔNG GIAN NHÀ
                </Typography>
                <List disablePadding>
                    {NAV_ITEMS.map((item) => {
                        const ItemIcon = item.icon;
                        const active = selectedFeature === item.id;

                        return (
                            <Box
                                key={item.id}
                                component={Link}
                                to={item.route}
                                onClick={() => {
                                    setSelectedFeature(item.id);
                                    onClose?.();
                                }}
                                sx={{
                                    ...STYLE_BTN,
                                    background: active ? gradients.header : `${colors.white}b8`,
                                    color: active ? colors.white : colors.text,
                                    borderColor: active ? colors.primary : colors.subtleBorder,
                                    boxShadow: active ? `0 8px 18px ${colors.avatarShadow}` : "none",
                                    cursor: "pointer",
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 34,
                                        height: 34,
                                        display: "grid",
                                        placeItems: "center",
                                        flexShrink: 0,
                                        borderRadius: 2.25,
                                        bgcolor: active ? colors.headerOverlay : colors.backgroundSoft,
                                    }}
                                >
                                    <ItemIcon sx={{ fontSize: 20, color: "inherit" }} />
                                </Box>
                                <Typography
                                    sx={{
                                        flex: 1,
                                        minWidth: 0,
                                        fontFamily: fonts.display,
                                        fontSize: 12.5,
                                        fontWeight: 700,
                                        color: "inherit",
                                    }}
                                >
                                    {item.label}
                                </Typography>
                                <ChevronRightRoundedIcon
                                    sx={{ fontSize: 18, color: "inherit", opacity: active ? 0.9 : 0.35 }}
                                />
                            </Box>
                        );
                    })}
                </List>

                <Box
                    onClick={() => setOrderDialogOpen(true)}
                    sx={{
                        ...STYLE_BTN,
                        mt: 1,
                        mb: 0,
                        position: "relative",
                        minHeight: 60,
                        px: 1.1,
                        background: `linear-gradient(135deg, ${colors.accent}34, ${colors.white})`,
                        border: `1px solid ${colors.accent}70`,
                        color: colors.text,
                        cursor: "pointer",
                    }}
                >
                    {orderedRecipes.length > 0 && (
                        <Box
                            component="span"
                            sx={{
                                position: "absolute",
                                top: 5,
                                right: 38,
                                width: 18,
                                height: 18,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: colors.accent,
                                transformOrigin: "top center",
                                animation: `${orderAlertPulse} 1.2s ease-in-out infinite`,
                            }}
                        >
                            <NotificationsActiveIcon sx={{ fontSize: 21 }} />
                        </Box>
                    )}
                    <Box
                        sx={{
                            width: 38,
                            height: 38,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            borderRadius: 2.5,
                            bgcolor: colors.accent,
                            color: colors.primary,
                        }}
                    >
                        <ReceiptLongRoundedIcon sx={{ fontSize: 21 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontFamily: fonts.display, fontSize: 13, fontWeight: 800, color: "inherit" }}>
                            Đại nhân order
                        </Typography>
                        <Typography
                            noWrap
                            sx={{ mt: 0.2, fontFamily: fonts.body, fontSize: 10.5, color: colors.textMuted }}
                        >
                            {orderedRecipes.length ? `${orderedRecipes.length} món đang chờ` : "Chưa có món được gọi"}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            minWidth: 25,
                            height: 25,
                            px: 0.5,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 99,
                            bgcolor: colors.primary,
                            color: colors.white,
                            fontFamily: fonts.display,
                            fontSize: 11,
                            fontWeight: 800,
                        }}
                    >
                        {orderedRecipes.length}
                    </Box>
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
                    PaperProps={{
                        sx: {
                            width: "calc(100% - 24px)",
                            m: 1.5,
                            borderRadius: 4,
                            bgcolor: colors.background,
                            border: `1px solid ${colors.border}`,
                            boxShadow: `0 24px 70px ${colors.markerShadow}`,
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            pb: 1,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius: 2.5,
                                    bgcolor: `${colors.accent}35`,
                                    color: colors.primary,
                                }}
                            >
                                <ReceiptLongRoundedIcon />
                            </Box>
                            <Box>
                                <Typography
                                    sx={{
                                        fontFamily: fonts.display,
                                        fontSize: 18,
                                        fontWeight: 800,
                                        color: colors.primary,
                                    }}
                                >
                                    Đại nhân order
                                </Typography>
                                <Typography
                                    sx={{ mt: 0.1, fontFamily: fonts.body, fontSize: 10.5, color: colors.textMuted }}
                                >
                                    {orderedRecipes.length} món đã được gọi
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton
                            aria-label="Đóng danh sách món đã gọi"
                            onClick={() => setOrderDialogOpen(false)}
                            sx={{ bgcolor: colors.white, color: colors.textMuted }}
                        >
                            <CloseRoundedIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ pt: 1 }}>
                        {orderedRecipes.length === 0 ? (
                            <Paper
                                elevation={0}
                                sx={{ p: 2.5, textAlign: "center", borderRadius: 3, bgcolor: colors.backgroundSoft }}
                            >
                                <LocalDiningRoundedIcon sx={{ fontSize: 34, color: colors.primary }} />
                                <Typography sx={{ mt: 0.75, fontFamily: fonts.display, color: colors.textMuted }}>
                                    Đại nhân chưa gọi món.
                                </Typography>
                            </Paper>
                        ) : (
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "repeat(2, minmax(0, 1fr))",
                                        sm: "repeat(3, minmax(0, 1fr))",
                                    },
                                    gap: 1.25,
                                }}
                            >
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
                                            borderRadius: 2.5,
                                            cursor: "pointer",
                                            bgcolor: colors.white,
                                            border: `1px solid ${colors.border}`,
                                            boxShadow: `0 6px 16px ${colors.avatarShadow}`,
                                            transition: "transform 180ms ease, box-shadow 180ms ease",
                                            "&:active": { transform: "scale(0.97)" },
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
                <Paper
                    elevation={0}
                    sx={{
                        p: 1.15,
                        borderRadius: 1.5,
                        bgcolor: `${colors.white}c9`,
                        border: `1px solid ${colors.border}`,
                        boxShadow: `0 6px 18px ${colors.avatarShadow}`,
                    }}
                >
                    <Typography sx={{ mt: 0.35, px: 0.2, fontFamily: fonts.display, fontSize: 12, color: colors.text }}>
                        Đại nhân muốn truyền ai?
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ mt: 0.9 }}>
                        {TEAM_MEMBERS.map((member) => (
                            <Button
                                key={member}
                                variant={name === member ? "contained" : "outlined"}
                                onClick={() => onNameChange(member)}
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
                                    minHeight: 38,
                                    px: 0.75,
                                    borderRadius: 2.25,
                                    textTransform: "none",
                                    fontWeight: 800,
                                    fontFamily: fonts.display,
                                    fontSize: 12,
                                    color: name === member ? colors.white : colors.primary,
                                    bgcolor: name === member ? colors.primary : colors.background,
                                    borderColor: name === member ? colors.primary : colors.border,
                                    boxShadow: name === member ? `0 5px 12px ${colors.avatarShadow}` : "none",
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
                            width: "100%",
                            minHeight: 44,
                            borderRadius: 2.5,
                            color: sharing ? colors.white : colors.primary,
                            fontWeight: 800,
                            fontSize: 13,
                            textTransform: "none",
                            fontFamily: fonts.display,
                            boxShadow: `0 7px 16px ${colors.avatarShadow}`,
                        }}
                    >
                        {sharing ? "Lẩn trốn" : "Báo cáo vị trí"}
                    </Button>
                </Paper>

                {/* ---------------- PEOPLE ---------------- */}
                <Box sx={{ mt: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 0.5 }}>
                        <Typography
                            variant="span"
                            sx={{
                                fontWeight: 800,
                                fontSize: 9.5,
                                letterSpacing: ".12em",
                                fontFamily: fonts.body,
                                color: colors.textMuted,
                            }}
                        >
                            ĐỐI TƯỢNG XUẤT HIỆN
                        </Typography>
                        <Box
                            sx={{
                                minWidth: 24,
                                height: 24,
                                px: 0.55,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: 99,
                                bgcolor: colors.backgroundSoft,
                                color: colors.primary,
                                fontFamily: fonts.display,
                                fontSize: 10,
                                fontWeight: 800,
                            }}
                        >
                            {people.length}
                        </Box>
                    </Box>
                    <List disablePadding sx={{ mt: 0.7 }}>
                        {people.map((person) => (
                            <ListItemButton
                                key={person.user_id}
                                onClick={() => focus(person)}
                                sx={{
                                    mb: 0.65,
                                    px: 0.75,
                                    py: 0.7,
                                    borderRadius: 2.5,
                                    bgcolor: `${colors.white}b8`,
                                    border: `1px solid ${colors.subtleBorder}`,
                                    transition: "transform 180ms ease, background-color 180ms ease",
                                    "&:hover": { bgcolor: colors.white, transform: "translateX(2px)" },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 42 }}>
                                    <Avatar sx={avatarSx(person.display_name)} />
                                </ListItemIcon>
                                <Typography
                                    variant="span"
                                    sx={{
                                        display: "block",
                                        mr: "auto",
                                        fontWeight: 700,
                                        fontSize: 13,
                                        fontFamily: fonts.display,
                                        color: colors.text,
                                    }}
                                >
                                    {person.display_name}
                                </Typography>
                                <ChevronRightRoundedIcon sx={{ fontSize: 20, color: colors.textMuted }} />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            </Box>
        </Box>
    );
}
