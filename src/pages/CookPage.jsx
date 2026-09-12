import { useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { useNavigate } from "react-router-dom";
import { useRecipes } from "../hooks/useRecipes";
import { useRecipeOrders } from "../hooks/useRecipeOrders";
import { colors, fonts } from "../theme";
import familyHeaderImage from "../assets/cook_2.png";

const CATEGORIES = [
    { id: "main", label: "Món chính" },
    { id: "soup", label: "Canh" },
    { id: "side", label: "Món phụ" },
    { id: "snack", label: "Ăn vặt" },
];

const ORDER_CATEGORIES = ["main", "side", "soup", "snack"].map((categoryId) =>
    CATEGORIES.find((category) => category.id === categoryId),
);

export default function CookPage() {
    const inputRef = useRef(null);
    const orderSelectionTouchedRef = useRef(false);
    const navigate = useNavigate();
    const { recipes, loading, error, addRecipe } = useRecipes();
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [draft, setDraft] = useState({ name: "", category: "main", image: "" });
    const [orderDialogOpen, setOrderDialogOpen] = useState(false);
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const { orderedRecipes, createOrder, savingOrder, orderError } = useRecipeOrders();

    useEffect(() => {
        if (!orderDialogOpen) {
            orderSelectionTouchedRef.current = false;
            return;
        }

        if (!orderSelectionTouchedRef.current) {
            setSelectedOrderIds(orderedRecipes.map((recipe) => recipe.id));
        }
    }, [orderDialogOpen, orderedRecipes]);

    const setImageFromFile = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setDraft((current) => ({ ...current, image: reader.result }));
        reader.readAsDataURL(file);
    };

    const chooseImage = async () => {
        if (!Capacitor.isNativePlatform()) {
            inputRef.current?.click();
            return;
        }
        try {
            await Camera.requestPermissions({ permissions: ["camera", "photos"] });
            const photo = await Camera.getPhoto({
                quality: 85,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Prompt,
            });
            if (photo.dataUrl) setDraft((current) => ({ ...current, image: photo.dataUrl }));
        } catch (cameraError) {
            if (cameraError?.message !== "User cancelled photos app") console.warn(cameraError);
        }
    };

    const submit = async () => {
        if (!draft.name.trim()) return;
        setSaving(true);
        try {
            await addRecipe({ name: draft.name.trim(), category: draft.category, image: draft.image });
            setSelectedCategory(draft.category);
            setDraft({ name: "", category: "main", image: "" });
            setDialogOpen(false);
        } catch {
            // Error is shown in the recipe list so the user can retry.
        } finally {
            setSaving(false);
        }
    };

    const toggleOrderRecipe = (recipeId) => {
        orderSelectionTouchedRef.current = true;
        setSelectedOrderIds((current) =>
            current.includes(recipeId) ? current.filter((id) => id !== recipeId) : [...current, recipeId],
        );
    };
    const submitOrder = async () => {
        try {
            await createOrder(selectedOrderIds);
            setSelectedOrderIds([]);
            setOrderDialogOpen(false);
        } catch {
            // The database error is rendered in the dialog.
        }
    };

    return (
        <Paper
            component="main"
            square
            elevation={0}
            sx={{ height: "100%", minHeight: 0, position: "relative", overflow: "hidden", bgcolor: colors.background }}
        >
            <Box sx={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
                <Box
                    sx={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.5,
                        borderBottom: `1px solid ${colors.border}`,
                        bgcolor: colors.backgroundWarm,
                        overflow: "hidden",
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
                    <Box sx={{ flexShrink: 0, p: 1.5, textAlign: "center" }}>
                        <Typography
                            sx={{ fontSize: 23, fontFamily: fonts.display, fontWeight: 600, color: colors.primary }}
                        >
                            Đại nhân ngự thiện
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: 13,
                                color: colors.textMuted,
                                fontFamily: fonts.body,
                                fontWeight: 300,
                                fontStyle: "italic",
                            }}
                        >
                            “Tiểu nhân sẽ hết mình phục vụ ”
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            flex: 1,
                            placeItems: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            borderRadius: 3,
                            bgcolor: colors.headerOverlay,
                            border: `1px solid ${colors.headerBorder}`,
                        }}
                    >
                        <Box
                            component="img"
                            src={familyHeaderImage}
                            alt="Gia đình BuBu's and DuDu's"
                            sx={{
                                width: 130,
                                height: 130,
                                objectFit: "contain",
                                filter: `drop-shadow(0 3px 5px ${colors.avatarShadow})`,
                            }}
                        />
                    </Box>
                </Box>
                <Box sx={{ flexShrink: 0, bgcolor: colors.backgroundSoft, borderBottom: `1px solid ${colors.border}` }}>
                    <Tabs
                        value={selectedCategory}
                        onChange={(_, value) => setSelectedCategory(value)}
                        variant="scrollable"
                        scrollButtons={false}
                        sx={{ minHeight: 44, px: 0.5, "& .MuiTabs-indicator": { display: "none" } }}
                    >
                        {[{ id: "all", label: "All" }, ...CATEGORIES].map((category) => (
                            <Tab
                                key={category.id}
                                value={category.id}
                                label={category.label}
                                sx={{
                                    minWidth: "auto",
                                    minHeight: 44,
                                    px: 1.1,
                                    textTransform: "none",
                                    color: colors.textMuted,
                                    fontFamily: fonts.body,
                                    fontSize: 13,
                                    fontWeight: 400,
                                    "&.Mui-selected": { color: colors.primary, fontWeight: 800 },
                                }}
                            />
                        ))}
                    </Tabs>
                </Box>
                <Box
                    sx={{
                        position: "relative",
                        flex: 1,
                        minHeight: 0,
                        overflow: "hidden",
                        isolation: "isolate",
                    }}
                >
                    <Box
                        className="cook-decoration"
                        sx={{
                            position: "absolute",
                            zIndex: 0,
                            width: 400,
                            height: 400,
                            left: "-40%",
                            top: "-40%",
                            borderRadius: "50%",
                            bgcolor: `${colors.primaryLight}2c`,
                            pointerEvents: "none",
                        }}
                    />

                    <Box
                        className="cook-decoration"
                        sx={{
                            position: "absolute",
                            zIndex: 0,
                            width: 200,
                            height: 200,
                            left: "40%",
                            top: "40%",
                            borderRadius: "50%",
                            bgcolor: `${colors.accent}3c`,
                            pointerEvents: "none",
                        }}
                    />

                    <Box
                        sx={{
                            position: "relative",
                            zIndex: 1,
                            height: "100%",
                            boxSizing: "border-box",
                            overflowY: "auto",
                            overflowX: "hidden",
                            p: 1.25,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.25,
                        }}
                    >
                        {loading && <Typography sx={{ color: colors.textMuted }}>Đang tải món ăn...</Typography>}
                        {error && <Typography sx={{ color: "error.main" }}>Không thể tải/lưu món: {error}</Typography>}
                        {!loading && !error && recipes.length === 0 && (
                            <Typography sx={{ color: colors.textMuted }}>
                                Chưa có món nào. Hãy thêm món đầu tiên nhé.
                            </Typography>
                        )}
                        {CATEGORIES.filter(
                            (category) => selectedCategory === "all" || category.id === selectedCategory,
                        ).map((category) => {
                            const items = recipes.filter((recipe) => recipe.category === category.id);
                            if (items.length === 0 && selectedCategory === "all") return null;
                            return (
                                <Box
                                    key={category.id}
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                                        gap: 1.25,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            gridColumn: "1 / -1",
                                            mt: 1,
                                            color: colors.primary,
                                            fontFamily: fonts.display,
                                            fontSize: 17,
                                            fontWeight: 800,
                                        }}
                                    >
                                        {category.label}
                                    </Typography>
                                    {items.map((recipe) => (
                                        <Paper
                                            key={recipe.id}
                                            elevation={0}
                                            onClick={() => navigate(`/cook/${recipe.id}`)}
                                            sx={{
                                                overflow: "hidden",
                                                borderRadius: 2,
                                                bgcolor: colors.white,
                                                border: `1px solid ${colors.border}`,
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    aspectRatio: "1.2 / 1",
                                                    display: "grid",
                                                    placeItems: "center",
                                                    bgcolor: colors.backgroundSoft,
                                                    background: recipe.image_url
                                                        ? `center / cover no-repeat url(${recipe.image_url})`
                                                        : colors.backgroundSoft,
                                                }}
                                            >
                                                {!recipe.image_url && (
                                                    <AddPhotoAlternateRoundedIcon
                                                        sx={{ fontSize: 34, color: colors.primary }}
                                                    />
                                                )}
                                            </Box>
                                            <Box sx={{ p: 1.1 }}>
                                                <Typography
                                                    sx={{
                                                        fontFamily: fonts.display,
                                                        fontWeight: 700,
                                                        fontSize: 13,
                                                        color: colors.text,
                                                        display: "-webkit-box",
                                                        WebkitBoxOrient: "vertical",
                                                        WebkitLineClamp: 2,
                                                        overflow: "hidden",
                                                        lineHeight: 1.35,
                                                        minHeight: "2.7em",
                                                    }}
                                                >
                                                    {recipe.name}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 0.75,
                                                        mt: 0.5,
                                                        color: colors.textMuted,
                                                    }}
                                                >
                                                    <AccessTimeRoundedIcon sx={{ fontSize: 14 }} />
                                                    <Typography sx={{ fontFamily: fonts.body, fontSize: 11 }}>
                                                        {recipe.prep_minutes} phút
                                                    </Typography>
                                                    <StarRoundedIcon
                                                        sx={{ ml: "auto", fontSize: 14, color: colors.accent }}
                                                    />
                                                    <Typography
                                                        sx={{
                                                            fontFamily: fonts.body,
                                                            fontSize: 11,
                                                            color: colors.accent,
                                                        }}
                                                    >
                                                        {recipe.rating}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>
            <Box
                onClick={() => setOrderDialogOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") setOrderDialogOpen(true);
                }}
                sx={{
                    position: "absolute",
                    left: 16,
                    bottom: 16,
                    minHeight: 48,
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                    color: colors.white,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.1,
                    py: 0.65,
                    borderRadius: 3,
                    border: `1px solid ${colors.headerBorder}`,
                    boxShadow: `0 8px 22px ${colors.markerShadow}`,
                    cursor: "pointer",
                    transition: "transform 180ms ease, box-shadow 180ms ease",
                    "&:active": { transform: "scale(0.97)" },
                }}
            >
                <Box
                    sx={{
                        position: "relative",
                        width: 34,
                        height: 34,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        borderRadius: 2.25,
                        bgcolor: colors.headerOverlay,
                        border: `1px solid ${colors.headerBorder}`,
                    }}
                >
                    <ShoppingCartOutlinedIcon sx={{ fontSize: 19 }} />
                    {orderedRecipes.length > 0 && (
                        <Box
                            component="span"
                            sx={{
                                position: "absolute",
                                top: -7,
                                right: -7,
                                minWidth: 19,
                                height: 19,
                                px: 0.4,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: 10,
                                bgcolor: colors.accent,
                                color: colors.primary,
                                border: `2px solid ${colors.primary}`,
                                fontFamily: fonts.body,
                                fontSize: 10,
                                fontWeight: 800,
                            }}
                        >
                            {orderedRecipes.length}
                        </Box>
                    )}
                </Box>
                <Box>
                    <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 12, lineHeight: 1.2 }}>
                        Tiểu nhị, gọi món
                    </Typography>
                </Box>
            </Box>
            <Box
                onClick={() => setDialogOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") setDialogOpen(true);
                }}
                sx={{
                    position: "absolute",
                    right: 16,
                    bottom: 16,
                    minHeight: 48,
                    bgcolor: colors.accent,
                    color: colors.primary,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.1,
                    py: 0.65,
                    borderRadius: 3,
                    border: `1px solid ${colors.headerBorder}`,
                    boxShadow: `0 8px 22px ${colors.avatarShadow}`,
                    cursor: "pointer",
                    transition: "transform 180ms ease, box-shadow 180ms ease",
                    "&:active": { transform: "scale(0.97)" },
                    "&:hover": { bgcolor: colors.accent },
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
                        bgcolor: `${colors.white}7a`,
                        border: `1px solid ${colors.white}a8`,
                    }}
                >
                    <AddRoundedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 12, lineHeight: 1.2 }}>
                    Thêm bí kíp
                </Typography>
            </Box>
            <Dialog
                open={dialogOpen}
                onClose={() => !saving && setDialogOpen(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        width: { xs: "calc(100% - 24px)", sm: "100%" },
                        maxHeight: "calc(100dvh - 32px)",
                        m: 1.5,
                        position: "relative",
                        overflow: "hidden",
                        isolation: "isolate",
                        borderRadius: 4,
                        bgcolor: colors.background,
                        border: `1px solid ${colors.border}`,
                        boxShadow: `0 22px 60px ${colors.markerShadow}`,
                    },
                }}
            >
                <Box
                    aria-hidden="true"
                    sx={{
                        position: "absolute",
                        zIndex: 0,
                        width: 200,
                        height: 200,
                        right: -65,
                        top: 35,
                        borderRadius: "50%",
                        bgcolor: `${colors.accent}1c`,
                        pointerEvents: "none",
                    }}
                />
                <Box
                    aria-hidden="true"
                    sx={{
                        position: "absolute",
                        zIndex: 0,
                        width: 300,
                        height: 300,
                        left: -100,
                        bottom: 0,
                        borderRadius: "50%",
                        bgcolor: `${colors.primaryLight}3c`,
                        pointerEvents: "none",
                    }}
                />
                <DialogTitle
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        p: 2,
                        color: colors.primary,
                        bgcolor: `${colors.backgroundWarm}e8`,
                        borderBottom: `1px solid ${colors.border}`,
                    }}
                >
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            borderRadius: 2.5,
                            bgcolor: colors.primary,
                            color: colors.white,
                            boxShadow: `0 6px 16px ${colors.avatarShadow}`,
                        }}
                    >
                        <AddPhotoAlternateRoundedIcon />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 19 }}>
                            Thêm bí kíp mới
                        </Typography>
                        <Typography sx={{ mt: 0.2, fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>
                            Ghi lại một món ngon cho thực đơn
                        </Typography>
                    </Box>
                    <IconButton
                        aria-label="Đóng phần thêm bí kíp"
                        onClick={() => setDialogOpen(false)}
                        disabled={saving}
                        sx={{ color: colors.textMuted }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        p: "16px !important",
                        bgcolor: "transparent",
                    }}
                >
                    <input
                        ref={inputRef}
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(event) => setImageFromFile(event.target.files?.[0])}
                    />
                    <Box
                        onClick={chooseImage}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") chooseImage();
                        }}
                        sx={{
                            position: "relative",
                            aspectRatio: "1.6 / 1",
                            display: "grid",
                            placeItems: "center",
                            overflow: "hidden",
                            cursor: "pointer",
                            borderRadius: 3,
                            bgcolor: colors.backgroundSoft,
                            border: `2px dashed ${draft.image ? colors.accent : colors.primary}`,
                            background: draft.image
                                ? `center / cover no-repeat url(${draft.image})`
                                : colors.backgroundSoft,
                            boxShadow: `0 8px 20px ${colors.avatarShadow}`,
                            transition: "transform 180ms ease, border-color 180ms ease",
                            "&:active": { transform: "scale(0.99)" },
                        }}
                    >
                        {draft.image ? (
                            <Box
                                sx={{
                                    position: "absolute",
                                    right: 10,
                                    bottom: 10,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.6,
                                    px: 1.1,
                                    py: 0.65,
                                    borderRadius: 2,
                                    bgcolor: `${colors.white}e8`,
                                    color: colors.primary,
                                    boxShadow: `0 4px 12px ${colors.avatarShadow}`,
                                }}
                            >
                                <AddPhotoAlternateRoundedIcon sx={{ fontSize: 17 }} />
                                <Typography sx={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 800 }}>
                                    Đổi ảnh
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ textAlign: "center" }}>
                                <IconButton
                                    tabIndex={-1}
                                    sx={{
                                        width: 52,
                                        height: 52,
                                        bgcolor: colors.white,
                                        color: colors.primary,
                                        boxShadow: `0 6px 18px ${colors.avatarShadow}`,
                                        "&:hover": { bgcolor: colors.white },
                                    }}
                                >
                                    <AddPhotoAlternateRoundedIcon />
                                </IconButton>
                                <Typography
                                    sx={{
                                        mt: 1,
                                        fontFamily: fonts.display,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: colors.primary,
                                    }}
                                >
                                    Chọn ảnh món ăn
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <TextField
                        autoFocus
                        label="Tên món ăn"
                        value={draft.name}
                        onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                        sx={{
                            bgcolor: `${colors.white}dc`,
                            borderRadius: 2.5,
                            "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
                        }}
                    />
                    <TextField
                        select
                        label="Nhóm món"
                        value={draft.category}
                        onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                        sx={{
                            bgcolor: `${colors.white}dc`,
                            borderRadius: 2.5,
                            "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
                        }}
                    >
                        {CATEGORIES.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                {category.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        gap: 1,
                        px: 2,
                        py: 1.5,
                        bgcolor: `${colors.white}e8`,
                        borderTop: `1px solid ${colors.border}`,
                    }}
                >
                    <Button
                        onClick={() => setDialogOpen(false)}
                        disabled={saving}
                        sx={{ color: colors.textMuted, fontWeight: 700 }}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={submit}
                        disabled={saving || !draft.name.trim()}
                        startIcon={<AddRoundedIcon />}
                        sx={{
                            minHeight: 42,
                            flex: 1,
                            borderRadius: 2.5,
                            bgcolor: colors.primary,
                            fontFamily: fonts.display,
                            fontSize: 12,
                            boxShadow: "none",
                            "&:hover": { bgcolor: colors.primaryDark, boxShadow: "none" },
                        }}
                    >
                        {saving ? "Đang lưu..." : "Lưu bí kíp"}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={orderDialogOpen}
                onClose={() => !savingOrder && setOrderDialogOpen(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        width: { xs: "calc(100% - 24px)", sm: "100%" },
                        maxHeight: "calc(100dvh - 32px)",
                        m: 1.5,
                        position: "relative",
                        overflow: "hidden",
                        isolation: "isolate",
                        borderRadius: 4,
                        bgcolor: colors.background,
                        border: `1px solid ${colors.border}`,
                        boxShadow: `0 22px 60px ${colors.markerShadow}`,
                    },
                }}
            >
                <Box
                    aria-hidden="true"
                    sx={{
                        position: "absolute",
                        zIndex: 0,
                        width: 200,
                        height: 200,
                        right: -65,
                        top: 35,
                        borderRadius: "50%",
                        bgcolor: `${colors.accent}1c`,
                        pointerEvents: "none",
                    }}
                />
                <Box
                    aria-hidden="true"
                    sx={{
                        position: "absolute",
                        zIndex: 0,
                        width: 300,
                        height: 300,
                        left: -100,
                        bottom: 0,
                        borderRadius: "50%",
                        bgcolor: `${colors.primaryLight}3c`,
                        pointerEvents: "none",
                    }}
                />
                <DialogTitle
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        p: 2,
                        color: colors.primary,
                        bgcolor: `${colors.backgroundWarm}e8`,
                        borderBottom: `1px solid ${colors.border}`,
                    }}
                >
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            borderRadius: 2.5,
                            bgcolor: colors.primary,
                            color: colors.white,
                            boxShadow: `0 6px 16px ${colors.avatarShadow}`,
                        }}
                    >
                        <ShoppingCartOutlinedIcon />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 19 }}>
                            Tiểu nhị, gọi món
                        </Typography>
                    </Box>
                    <IconButton
                        aria-label="Đóng thực đơn"
                        onClick={() => setOrderDialogOpen(false)}
                        disabled={savingOrder}
                        sx={{ color: colors.textMuted }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ position: "relative", zIndex: 1, p: "16px !important", bgcolor: "transparent" }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 1,
                            mb: 1.5,
                            px: 0.25,
                        }}
                    >
                        <Typography sx={{ color: colors.textMuted, fontFamily: fonts.body, fontSize: 12 }}>
                            Đã chọn {selectedOrderIds.length}/{recipes.length} món
                        </Typography>
                        <Button
                            size="small"
                            onClick={() => {
                                orderSelectionTouchedRef.current = true;
                                setSelectedOrderIds([]);
                            }}
                            disabled={selectedOrderIds.length === 0}
                            sx={{
                                minWidth: 0,
                                px: 1,
                                color: colors.colorError,
                                flexShrink: 0,
                                fontFamily: fonts.body,
                                fontSize: 11,
                                fontWeight: 700,
                            }}
                        >
                            Bỏ chọn tất cả
                        </Button>
                    </Box>
                    {ORDER_CATEGORIES.map((category) => {
                        const categoryRecipes = recipes.filter((recipe) => recipe.category === category.id);
                        if (categoryRecipes.length === 0) return null;

                        return (
                            <Box key={category.id} sx={{ mb: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}>
                                    <Typography
                                        sx={{
                                            fontFamily: fonts.display,
                                            fontSize: 15,
                                            fontWeight: 800,
                                            color: colors.primary,
                                        }}
                                    >
                                        {category.label}
                                    </Typography>
                                    <Box
                                        component="span"
                                        sx={{
                                            minWidth: 22,
                                            height: 22,
                                            px: 0.65,
                                            display: "grid",
                                            placeItems: "center",
                                            borderRadius: 10,
                                            bgcolor: colors.backgroundSoft,
                                            color: colors.textMuted,
                                            fontFamily: fonts.body,
                                            fontSize: 10,
                                            fontWeight: 800,
                                        }}
                                    >
                                        {categoryRecipes.length}
                                    </Box>
                                </Box>
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1 }}>
                                    {categoryRecipes.map((recipe) => {
                                        const selected = selectedOrderIds.includes(recipe.id);
                                        return (
                                            <Paper
                                                key={recipe.id}
                                                component="button"
                                                type="button"
                                                role="checkbox"
                                                aria-checked={selected}
                                                onClick={() => toggleOrderRecipe(recipe.id)}
                                                elevation={0}
                                                sx={{
                                                    position: "relative",
                                                    minWidth: 0,
                                                    p: 0,
                                                    overflow: "hidden",
                                                    textAlign: "left",
                                                    borderRadius: 2.5,
                                                    bgcolor: selected ? `${colors.accent}12` : colors.white,
                                                    border: `2px solid ${selected ? colors.accent : colors.border}`,
                                                    cursor: "pointer",
                                                    transition: "transform 160ms ease, border-color 160ms ease",
                                                    "&:active": { transform: "scale(0.98)" },
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        aspectRatio: "1.8 / 1",
                                                        display: "grid",
                                                        placeItems: "center",
                                                        bgcolor: colors.backgroundSoft,
                                                        background: recipe.image_url
                                                            ? `center / cover no-repeat url(${recipe.image_url})`
                                                            : colors.backgroundSoft,
                                                    }}
                                                >
                                                    {!recipe.image_url && (
                                                        <AddPhotoAlternateRoundedIcon
                                                            sx={{ fontSize: 29, color: colors.primary }}
                                                        />
                                                    )}
                                                </Box>
                                                <Box sx={{ p: 1 }}>
                                                    <Typography
                                                        sx={{
                                                            minHeight: "2.6em",
                                                            display: "-webkit-box",
                                                            WebkitBoxOrient: "vertical",
                                                            WebkitLineClamp: 2,
                                                            overflow: "hidden",
                                                            fontFamily: fonts.display,
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                            lineHeight: 1.3,
                                                            color: colors.text,
                                                        }}
                                                    >
                                                        {recipe.name}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        top: 7,
                                                        right: 7,
                                                        width: 22,
                                                        height: 22,
                                                        display: "grid",
                                                        placeItems: "center",
                                                        borderRadius: "50%",
                                                        bgcolor: selected ? colors.white : `${colors.white}d9`,
                                                        border: `1px solid ${selected ? colors.accent : colors.border}`,
                                                        color: colors.accent,
                                                        boxShadow: `0 2px 7px ${colors.avatarShadow}`,
                                                    }}
                                                >
                                                    {selected && <CheckCircleRoundedIcon sx={{ fontSize: 22 }} />}
                                                </Box>
                                            </Paper>
                                        );
                                    })}
                                </Box>
                            </Box>
                        );
                    })}
                    {!loading && recipes.length === 0 && (
                        <Box sx={{ py: 5, textAlign: "center" }}>
                            <ShoppingCartOutlinedIcon sx={{ fontSize: 40, color: colors.border }} />
                            <Typography sx={{ mt: 1, color: colors.textMuted, fontFamily: fonts.body, fontSize: 13 }}>
                                Chưa có món nào trong thực đơn.
                            </Typography>
                        </Box>
                    )}
                    {orderError && (
                        <Typography sx={{ mt: 1, color: "error.main", fontSize: 13 }}>{orderError}</Typography>
                    )}
                </DialogContent>
                <DialogActions
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        gap: 1,
                        px: 2,
                        py: 1.5,
                        bgcolor: `${colors.white}e8`,
                        borderTop: `1px solid ${colors.border}`,
                    }}
                >
                    <Button
                        onClick={() => setOrderDialogOpen(false)}
                        disabled={savingOrder}
                        sx={{ color: colors.textMuted, fontWeight: 700 }}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={submitOrder}
                        disabled={savingOrder}
                        startIcon={selectedOrderIds.length > 0 ? <ShoppingCartOutlinedIcon /> : null}
                        sx={{
                            minHeight: 42,
                            flex: 1,
                            borderRadius: 2.5,
                            bgcolor: selectedOrderIds.length > 0 ? colors.primary : colors.colorError,
                            fontFamily: fonts.display,
                            fontSize: 12,
                            boxShadow: "none",
                            "&:hover": {
                                bgcolor: selectedOrderIds.length > 0 ? colors.primaryDark : colors.colorError,
                                boxShadow: "none",
                            },
                        }}
                    >
                        {savingOrder
                            ? "Đang lưu..."
                            : selectedOrderIds.length > 0
                              ? `Lưu order · ${selectedOrderIds.length} món`
                              : "Hủy order"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
