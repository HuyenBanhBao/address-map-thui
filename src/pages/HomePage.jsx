import { useEffect, useState } from "react";
import {
    Box,
    Button,
    ButtonBase,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Typography,
} from "@mui/material";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import HomeRepairServiceRoundedIcon from "@mui/icons-material/HomeRepairServiceRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LocalDiningRoundedIcon from "@mui/icons-material/LocalDiningRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useFamilyHealth } from "../hooks/useFamilyHealth";
import { useHouseholdTasks } from "../hooks/useHouseholdTasks";
import { useInventoryItems } from "../hooks/useInventoryItems";
import { useRecipeOrders } from "../hooks/useRecipeOrders";
import { colors, fonts, gradients } from "../theme";

const HOUR_MS = 60 * 60 * 1000;
const FAMILY_IMAGE_MODULES = import.meta.glob(["../assets/gia_dinh_*.png", "../assets/Gia_dinh_*.png"], {
    eager: true,
    import: "default",
});
const FAMILY_IMAGES = Object.entries(FAMILY_IMAGE_MODULES)
    .sort(([firstPath], [secondPath]) => {
        const firstNumber = Number(firstPath.match(/_(\d+)\.png$/i)?.[1] || 0);
        const secondNumber = Number(secondPath.match(/_(\d+)\.png$/i)?.[1] || 0);
        return firstNumber - secondNumber;
    })
    .map(([, image]) => image);

const QUOTES = [
    "Nhà là nơi những điều nhỏ bé luôn được quan tâm.",
    "Một căn nhà ấm áp bắt đầu từ những người luôn nhớ đến nhau.",
    "Mỗi việc nhỏ hôm nay sẽ làm ngày mai nhẹ nhàng hơn.",
    "Bữa cơm ngon nhất là bữa cơm có người mình thương.",
    "Nhà không cần thật lớn, chỉ cần đủ đầy yêu thương.",
    "Có người chờ mình về, nơi đó chính là nhà.",
    "Một lời hỏi han nhỏ cũng đủ làm cả ngày ấm áp.",
    "Yêu thương đôi khi chỉ là nhớ mua món người kia thích.",
    "Nhà là nơi luôn có một phần cơm dành cho bạn.",
    "Ngày dài đến đâu, về nhà là thấy nhẹ lòng.",
    "Hạnh phúc là những điều bình thường được làm cùng nhau.",
    "Chăm chút cho ngôi nhà cũng là chăm chút cho người mình thương.",
    "Một chút quan tâm mỗi ngày, một mái nhà đầy ắp yêu thương.",
    "Nhà là nơi chuyện nhỏ cũng có người để ý.",
    "Không cần dịp đặc biệt để dành cho nhau những điều dễ thương.",
    "Có nhau trong những điều nhỏ bé là một kiểu hạnh phúc.",
    "Bình yên đôi khi chỉ là một bữa cơm đủ mặt.",
    "Nhà luôn ấm khi mọi người nhớ đến nhau.",
    "Một ngôi nhà hạnh phúc được xây từ những điều rất nhỏ.",
    "Đi đâu cũng được, miễn cuối ngày mình vẫn về bên nhau.",
    "Mỗi ngày quan tâm một chút, yêu thương sẽ đầy thêm một chút.",
    "Nhà là nơi chẳng cần nói nhiều vẫn biết bạn cần gì.",
    "Có người cùng ăn, cùng cười, cùng dọn nhà — vậy là vui.",
    "Những ngày bình thường bên nhau chính là những ngày đáng nhớ.",
    "Yêu thương không ở đâu xa, đôi khi nằm ngay trong gian bếp.",
    "Một căn bếp ấm, một mái nhà vui.",
    "Nhà là nơi luôn có những điều nhỏ xíu làm mình mỉm cười.",
    "Mệt rồi thì về nhà, ở đây có người thương.",
    "Hạnh phúc là khi trong nhà luôn có tiếng gọi nhau.",
    "Chẳng cần hoàn hảo, chỉ cần luôn có nhau.",
    "Việc nhà chia đôi, niềm vui nhân đôi.",
    "Cùng nhau chăm nhà, cùng nhau giữ những ngày bình yên.",
    "Nhà sạch một chút, lòng vui thêm một chút.",
    "Mỗi góc nhỏ được chăm chút đều mang theo một chút yêu thương.",
];

function getVietnameseDate(hourIndex) {
    const now = new Date();
    return {
        day: now.getDate().toString().padStart(2, "0"),
        month: `THÁNG ${now.getMonth() + 1}`,
        weekday: now.toLocaleDateString("vi-VN", { weekday: "long" }),
        full: now.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }),
        quote: QUOTES[hourIndex % QUOTES.length],
    };
}

export default function HomePage() {
    const [allFeaturesOpen, setAllFeaturesOpen] = useState(false);
    const [hourIndex, setHourIndex] = useState(() => Math.floor(Date.now() / HOUR_MS));
    const navigate = useNavigate();
    const { location } = useOutletContext();
    const { tasks } = useHouseholdTasks();
    const { items } = useInventoryItems();
    const { members } = useFamilyHealth();
    const { orderedRecipes } = useRecipeOrders();
    const date = getVietnameseDate(hourIndex);
    const familyImage = FAMILY_IMAGES[hourIndex % FAMILY_IMAGES.length];
    const pendingTasks = tasks.filter((task) => !task.done);
    const lowItems = items.filter((item) => item.stock_percent <= 20);

    useEffect(() => {
        let hourlyTimer;
        const updateHour = () => setHourIndex(Math.floor(Date.now() / HOUR_MS));
        const timeUntilNextHour = HOUR_MS - (Date.now() % HOUR_MS);
        const firstTimer = window.setTimeout(() => {
            updateHour();
            hourlyTimer = window.setInterval(updateHour, HOUR_MS);
        }, timeUntilNextHour);

        document.addEventListener("visibilitychange", updateHour);
        return () => {
            window.clearTimeout(firstTimer);
            window.clearInterval(hourlyTimer);
            document.removeEventListener("visibilitychange", updateHour);
        };
    }, []);

    const features = [
        {
            title: "Ngự trù",
            subtitle: orderedRecipes.length ? `${orderedRecipes.length} món Đại nhân đã order` : "Hôm nay ăn món gì?",
            route: "/cook",
            icon: <LocalDiningRoundedIcon />,
            color: colors.accent,
            badge: orderedRecipes.length,
        },
        {
            title: "Nội Vụ Phủ",
            subtitle: pendingTasks.length ? `${pendingTasks.length} việc đang chờ` : "Mọi việc đã hoàn thành",
            route: "/repair",
            icon: <HomeRepairServiceRoundedIcon />,
            color: colors.primaryLight,
            badge: pendingTasks.length,
        },
        {
            title: "Quốc khố",
            subtitle: lowItems.length ? `${lowItems.length} món sắp hết` : "Kho đang đầy đủ",
            route: "/toshiba",
            icon: <Inventory2RoundedIcon />,
            color: lowItems.length ? colors.colorError : colors.primary,
            badge: lowItems.length,
        },
        {
            title: "Truyền Thái Y",
            subtitle: `${members.length} hồ sơ gia đình`,
            route: "/health",
            icon: <FavoriteRoundedIcon />,
            color: colors.colorError,
            badge: 0,
        },
    ];

    return (
        <Paper
            component="main"
            square
            elevation={0}
            sx={{ height: "100%", minHeight: 0, overflow: "hidden", bgcolor: colors.background }}
        >
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 760,
                    height: "100%",
                    minHeight: 0,
                    mx: "auto",
                    p: { xs: 1.25, sm: 2 },
                    boxSizing: "border-box",
                    display: "grid",
                    gridTemplateRows: "minmax(0, 0.9fr) auto minmax(0, 1.45fr) auto",
                    gap: { xs: 1, sm: 1.25 },
                    overflow: "hidden",
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        position: "relative",
                        minHeight: 0,
                        overflow: "hidden",
                        p: { xs: 2, sm: 1.75 },
                        borderRadius: 2.5,
                        bgcolor: colors.backgroundWarm,
                        border: `1px solid ${colors.border}`,
                        boxShadow: `0 12px 30px ${colors.avatarShadow}`,
                        "@media (max-height: 650px)": { p: 1 },
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            width: 150,
                            height: 150,
                            right: -45,
                            top: -65,
                            borderRadius: "50%",
                            bgcolor: `${colors.accent}2c`,
                        }}
                    />
                    <Box
                        sx={{
                            position: "absolute",
                            width: 130,
                            height: 130,
                            left: -45,
                            bottom: -65,
                            borderRadius: "50%",
                            bgcolor: `${colors.accent}1c`,
                        }}
                    />
                    <Box
                        sx={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <Box>
                            <Box
                                sx={{
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 1.25,
                                    pl: { xs: 0.5, sm: 2 },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: { xs: 1.1, sm: 2 },
                                        flexShrink: 0,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontFamily: fonts.playful,
                                            fontSize: "clamp(38px, 7vh, 60px)",
                                            lineHeight: 1,
                                            color: colors.primary,
                                        }}
                                    >
                                        {date.day}
                                    </Typography>
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontFamily: fonts.display,
                                                fontSize: 12,
                                                fontWeight: 800,
                                                letterSpacing: ".12em",
                                                color: colors.text,
                                            }}
                                        >
                                            {date.month}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                mt: 0.35,
                                                fontFamily: fonts.body,
                                                fontSize: 15,
                                                textTransform: "capitalize",
                                                color: colors.textMuted,
                                            }}
                                        >
                                            {date.weekday}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Typography
                                key={date.quote}
                                sx={{
                                    position: "relative",
                                    mt: 2,
                                    maxWidth: 520,
                                    display: "-webkit-box",
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    fontFamily: fonts.display,
                                    fontSize: { xs: 13, sm: 15 },
                                    lineHeight: 1.45,
                                    color: colors.text,
                                    animation: "quoteFade 500ms ease both",
                                    "@keyframes quoteFade": {
                                        from: { opacity: 0, transform: "translateY(5px)" },
                                        to: { opacity: 1, transform: "translateY(0)" },
                                    },
                                    "@media (max-height: 650px)": { display: "none" },
                                }}
                            >
                                “{date.quote}”
                            </Typography>
                        </Box>
                        {familyImage && (
                            <Box
                                key={familyImage}
                                component="img"
                                src={familyImage}
                                alt="Gia đình BuBu's and DuDu's"
                                sx={{
                                    width: "clamp(150px, 30vw, 185px)",
                                    height: "clamp(120px, 17vh, 145px)",
                                    flexShrink: 1,
                                    objectFit: "contain",
                                    objectPosition: "center",
                                    filter: `drop-shadow(0 7px 10px ${colors.avatarShadow})`,
                                    animation: "familyImageFade 650ms ease both",
                                    "@keyframes familyImageFade": {
                                        from: { opacity: 0, transform: "translateX(10px) scale(0.94)" },
                                        to: { opacity: 1, transform: "translateX(0) scale(1)" },
                                    },
                                    "@media (max-height: 650px)": { width: 130, height: 100 },
                                }}
                            />
                        )}
                    </Box>
                </Paper>

                <ButtonBase
                    onClick={() => navigate("/map")}
                    sx={{ width: "100%", display: "block", textAlign: "left", borderRadius: 4 }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            position: "relative",
                            overflow: "hidden",
                            width: "100%",
                            p: { xs: 1.2, sm: 1.4 },
                            color: colors.white,
                            background: gradients.header,
                            borderRadius: 4,
                            boxShadow: `0 12px 28px ${colors.markerShadow}`,
                            "@media (max-height: 650px)": { p: 0.8 },
                        }}
                    >
                        <Box sx={{ position: "absolute", right: -18, bottom: -32, opacity: 0.13 }}>
                            <LocationOnRoundedIcon sx={{ fontSize: 130 }} />
                        </Box>
                        <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 1.25 }}>
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    display: "grid",
                                    placeItems: "center",
                                    flexShrink: 0,
                                    borderRadius: 3,
                                    bgcolor: colors.headerOverlay,
                                    border: `1px solid ${colors.headerBorder}`,
                                    "@media (max-height: 650px)": { width: 36, height: 36 },
                                }}
                            >
                                <LocationOnRoundedIcon />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontFamily: fonts.display, fontSize: 15, fontWeight: 800 }}>
                                    Where is Mập Xinh?
                                </Typography>
                                <Typography
                                    sx={{
                                        mt: 0.2,
                                        fontSize: 11,
                                        opacity: 0.78,
                                        "@media (max-height: 650px)": { display: "none" },
                                    }}
                                >
                                    {location.people.length
                                        ? `${location.people.length} đối tượng đã bị phát hiện`
                                        : "Thích khách ẩn nấp giỏi đấy!!! Đợi ta."}
                                </Typography>
                            </Box>
                            <Typography sx={{ fontFamily: fonts.display, fontSize: 22 }}>›</Typography>
                        </Box>
                    </Paper>
                </ButtonBase>

                <Box sx={{ minHeight: 0, position: "relative" }}>
                    <Box
                        className="cook-decoration"
                        sx={{
                            position: "absolute",
                            zIndex: 0,
                            width: 250,
                            height: 250,
                            left: "30%",
                            top: "30%",
                            borderRadius: "50%",
                            bgcolor: `${colors.primaryLight}1c`,
                            pointerEvents: "none",
                        }}
                    />
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            alignItems: "start",
                            gap: { xs: 1, sm: 1.15 },
                        }}
                    >
                        {features.slice(0, 6).map((feature) => (
                            <ButtonBase
                                key={feature.route}
                                onClick={() => navigate(feature.route)}
                                sx={{
                                    width: "100%",
                                    height: "auto",
                                    alignSelf: "start",
                                    display: "block",
                                    textAlign: "left",
                                    borderRadius: 2,
                                }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        position: "relative",
                                        width: "100%",
                                        height: "auto",
                                        boxSizing: "border-box",
                                        p: "12px 8px",
                                        overflow: "hidden",
                                        borderRadius: 2,
                                        bgcolor: colors.white,
                                        border: `1px solid ${colors.border}`,
                                        boxShadow: `0 8px 22px ${colors.avatarShadow}`,
                                        transition: "transform 180ms ease, box-shadow 180ms ease",
                                        "&:active": { transform: "scale(0.97)" },
                                        "@media (max-height: 650px)": { p: 0.75 },
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                display: "grid",
                                                placeItems: "center",
                                                flexShrink: 0,
                                                borderRadius: 2.25,
                                                color: feature.color,
                                                bgcolor: `${feature.color}18`,
                                                "& .MuiSvgIcon-root": { fontSize: 21 },
                                                "@media (max-height: 650px)": { width: 30, height: 30 },
                                            }}
                                        >
                                            {feature.icon}
                                        </Box>
                                        <Typography
                                            sx={{
                                                fontFamily: fonts.display,
                                                fontSize: { xs: 14, sm: 15 },
                                                fontWeight: 800,
                                                color: colors.text,
                                                "@media (max-height: 650px)": { fontSize: 11.5 },
                                            }}
                                        >
                                            {feature.title}
                                        </Typography>
                                    </Box>

                                    <Typography
                                        sx={{
                                            pl: 1,
                                            mt: 1,
                                            display: "-webkit-box",
                                            WebkitBoxOrient: "vertical",
                                            WebkitLineClamp: 2,
                                            overflow: "hidden",
                                            fontFamily: fonts.body,
                                            fontSize: 11,
                                            lineHeight: 1.3,
                                            color: colors.textMuted,
                                            "@media (max-height: 650px)": { display: "none" },
                                        }}
                                    >
                                        {feature.subtitle}
                                    </Typography>
                                </Paper>
                            </ButtonBase>
                        ))}
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
                        <Button
                            size="small"
                            startIcon={<AppsRoundedIcon />}
                            onClick={() => setAllFeaturesOpen(true)}
                            sx={{
                                minWidth: 0,
                                px: 1,
                                py: 0.35,
                                borderRadius: 99,
                                color: colors.primary,
                                fontFamily: fonts.display,
                                fontSize: 11.5,
                                fontWeight: 800,
                                textTransform: "none",
                            }}
                        >
                            Hiện tất cả
                        </Button>
                    </Box>
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        position: "relative",
                        p: 1.1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        borderRadius: 3.5,
                        bgcolor: colors.backgroundSoft,
                        border: `1px solid ${colors.border}`,
                        boxShadow: `0 -5px 18px ${colors.avatarShadow}`,
                        "@media (max-height: 650px)": { p: 0.75 },
                    }}
                >
                    <Box
                        sx={{
                            width: 38,
                            height: 38,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            borderRadius: "50%",
                            bgcolor: colors.white,
                            color:
                                orderedRecipes.length || pendingTasks.length || lowItems.length
                                    ? colors.accent
                                    : colors.primary,
                            "@media (max-height: 650px)": { width: 32, height: 32 },
                        }}
                    >
                        {orderedRecipes.length || pendingTasks.length || lowItems.length ? (
                            <NotificationsActiveRoundedIcon />
                        ) : (
                            <RestaurantMenuRoundedIcon />
                        )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            sx={{ fontFamily: fonts.display, fontSize: 13, fontWeight: 800, color: colors.text }}
                        >
                            Nhắc nhẹ hôm nay
                        </Typography>
                        <Typography sx={{ mt: 0.25, fontSize: 11.5, color: colors.textMuted }}>
                            {pendingTasks.length || lowItems.length
                                ? `${pendingTasks.length} việc đang chờ · ${lowItems.length} món cần bổ sung`
                                : "Nhà mình ổn cả, cứ thong thả tận hưởng nhé."}
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            <Dialog
                open={allFeaturesOpen}
                onClose={() => setAllFeaturesOpen(false)}
                fullWidth
                maxWidth="xs"
                sx={{
                    "& .MuiDialog-paper": {
                        width: "calc(100% - 24px)",
                        m: 1.5,
                        maxHeight: "calc(100% - 24px)",
                        overflow: "hidden",
                        borderRadius: 4,
                        bgcolor: colors.background,
                        backgroundImage: `linear-gradient(145deg, ${colors.backgroundWarm}, ${colors.background})`,
                        border: `1px solid ${colors.border}`,
                        boxShadow: `0 20px 60px ${colors.markerShadow}`,
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        pb: 0.75,
                        fontFamily: fonts.display,
                        fontSize: 21,
                        fontWeight: 800,
                        color: colors.primary,
                    }}
                >
                    Tất cả chức năng
                    <IconButton
                        aria-label="Đóng danh sách chức năng"
                        onClick={() => setAllFeaturesOpen(false)}
                        sx={{ bgcolor: colors.white, color: colors.textMuted }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: 1, pb: 2 }}>
                    <Typography sx={{ mb: 1.5, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted }}>
                        Chọn chức năng Đại nhân muốn sử dụng.
                    </Typography>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            alignItems: "start",
                            gap: 1.1,
                        }}
                    >
                        {features.map((feature) => (
                            <ButtonBase
                                key={feature.route}
                                onClick={() => {
                                    setAllFeaturesOpen(false);
                                    navigate(feature.route);
                                }}
                                sx={{ width: "100%", display: "block", textAlign: "left", borderRadius: 3 }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        p: 1.35,
                                        borderRadius: 3,
                                        bgcolor: colors.white,
                                        border: `1px solid ${colors.border}`,
                                        boxShadow: `0 8px 20px ${colors.avatarShadow}`,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            display: "grid",
                                            placeItems: "center",
                                            borderRadius: 2.5,
                                            color: feature.color,
                                            bgcolor: `${feature.color}18`,
                                        }}
                                    >
                                        {feature.icon}
                                    </Box>
                                    <Typography
                                        sx={{
                                            mt: 1,
                                            fontFamily: fonts.display,
                                            fontSize: 14,
                                            fontWeight: 800,
                                            color: colors.text,
                                        }}
                                    >
                                        {feature.title}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            mt: 0.35,
                                            display: "-webkit-box",
                                            WebkitBoxOrient: "vertical",
                                            WebkitLineClamp: 2,
                                            overflow: "hidden",
                                            fontFamily: fonts.body,
                                            fontSize: 11,
                                            lineHeight: 1.35,
                                            color: colors.textMuted,
                                        }}
                                    >
                                        {feature.subtitle}
                                    </Typography>
                                </Paper>
                            </ButtonBase>
                        ))}
                    </Box>
                </DialogContent>
            </Dialog>
        </Paper>
    );
}
