import { useRef, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
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
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { useRecipes } from "../hooks/useRecipes";
import { colors, fonts } from "../theme";

const CATEGORIES = [
    { id: "main", label: "Món chính" },
    { id: "soup", label: "Canh" },
    { id: "side", label: "Món phụ" },
    { id: "snack", label: "Ăn vặt" },
];

export default function CookPage() {
    const inputRef = useRef(null);
    const { recipes, loading, error, addRecipe } = useRecipes();
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [draft, setDraft] = useState({ name: "", category: "main", image: "" });

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

    return (
        <Paper
            component="main"
            square
            elevation={0}
            sx={{ height: "100%", minHeight: 0, position: "relative", overflow: "hidden", bgcolor: colors.background }}
        >
            <Box sx={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
                <Box sx={{ flexShrink: 0, p: 1.5, textAlign: "center", bgcolor: colors.backgroundWarm }}>
                    <Typography
                        sx={{ fontSize: 23, fontFamily: fonts.display, fontWeight: 600, color: colors.primary }}
                    >
                        Mời Đại nhân ngự thiện
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
                        “Tiểu nhân sẽ hết mình phục vụ Đại nhân”
                    </Typography>
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
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
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
                                sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.25 }}
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
                                        sx={{
                                            overflow: "hidden",
                                            borderRadius: 2,
                                            bgcolor: colors.white,
                                            border: `1px solid ${colors.border}`,
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
                                                noWrap
                                                sx={{
                                                    fontFamily: fonts.display,
                                                    fontWeight: 700,
                                                    fontSize: 13,
                                                    color: colors.text,
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
                                                    sx={{ fontFamily: fonts.body, fontSize: 11, color: colors.accent }}
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
            <Fab
                variant="extended"
                onClick={() => setDialogOpen(true)}
                sx={{
                    position: "absolute",
                    right: 16,
                    bottom: 16,
                    bgcolor: colors.accent,
                    color: colors.primary,
                    fontFamily: fonts.display,
                    fontWeight: 800,
                    "&:hover": { bgcolor: colors.accent },
                }}
            >
                <AddRoundedIcon sx={{ mr: 0.75 }} /> Thêm món ăn
            </Fab>
            <Dialog
                open={dialogOpen}
                onClose={() => !saving && setDialogOpen(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 3, bgcolor: colors.background } }}
            >
                <DialogTitle sx={{ fontFamily: fonts.display, fontWeight: 800, color: colors.primary }}>
                    Thêm món ăn
                </DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: "12px !important" }}>
                    <input
                        ref={inputRef}
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(event) => setImageFromFile(event.target.files?.[0])}
                    />
                    <Box
                        onClick={chooseImage}
                        sx={{
                            aspectRatio: "1.6 / 1",
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                            borderRadius: 2.5,
                            bgcolor: colors.backgroundSoft,
                            border: `1px dashed ${colors.primary}`,
                            background: draft.image
                                ? `center / cover no-repeat url(${draft.image})`
                                : colors.backgroundSoft,
                        }}
                    >
                        {!draft.image && (
                            <IconButton>
                                <AddPhotoAlternateRoundedIcon sx={{ fontSize: 38, color: colors.primary }} />
                            </IconButton>
                        )}
                    </Box>
                    <TextField
                        autoFocus
                        label="Tên món ăn"
                        value={draft.name}
                        onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                    />
                    <TextField
                        select
                        label="Nhóm món"
                        value={draft.category}
                        onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                    >
                        {CATEGORIES.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                {category.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} disabled={saving}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={submit}
                        disabled={saving || !draft.name.trim()}
                        sx={{ bgcolor: colors.primary }}
                    >
                        {saving ? "Đang lưu..." : "Lưu món"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
