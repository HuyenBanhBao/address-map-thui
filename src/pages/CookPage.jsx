import { useRef, useState } from "react";
import { Box, IconButton, Paper, Tab, Tabs, Typography } from "@mui/material";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { colors, fonts } from "../theme";

const RECIPES = [
    "Thịt kho trứng",
    "Bún chả",
    "Cơm tấm",
    "Mì Ý",
    "Bánh xèo",
    "Canh chua",
    "Gà chiên",
    "Bò lúc lắc",
    "Cá kho",
    "Cháo sườn",
    "Nem rán",
    "Phở bò",
    "Bánh mì",
    "Mì xào",
    "Sườn nướng",
    "Cơm chiên",
    "Lẩu thái",
    "Ốc xào",
    "Chè khúc bạch",
    "Bánh flan",
].map((name, index) => ({
    id: index + 1,
    name,
    category: index < 5 ? "main" : index < 9 ? "soup" : index < 14 ? "side" : "snack",
    time: `${10 + (index % 4) * 5} phút`,
    rating: (4.5 + (index % 5) / 10).toFixed(1),
}));

const CATEGORIES = [
    { id: "main", label: "Món chính" },
    { id: "soup", label: "Canh" },
    { id: "side", label: "Món phụ" },
    { id: "snack", label: "Ăn vặt" },
];

export default function CookPage() {
    const fileInputRef = useRef(null);
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);
    const [images, setImages] = useState({});
    const [selectedCategory, setSelectedCategory] = useState("all");

    const saveImage = (recipeId, source) => setImages((current) => ({ ...current, [recipeId]: source }));

    const chooseImage = async (recipeId) => {
        if (!Capacitor.isNativePlatform()) {
            setSelectedRecipeId(recipeId);
            fileInputRef.current?.click();
            return;
        }

        try {
            await Camera.requestPermissions({ permissions: ["camera", "photos"] });
            const photo = await Camera.getPhoto({
                quality: 85,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Prompt,
                promptLabelHeader: "Ảnh món ăn",
                promptLabelPhoto: "Chọn từ thư viện",
                promptLabelPicture: "Chụp ảnh",
            });
            if (photo.dataUrl) saveImage(recipeId, photo.dataUrl);
        } catch (error) {
            if (error?.message !== "User cancelled photos app") console.warn("Không thể chọn ảnh", error);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file || !selectedRecipeId) return;
        const reader = new FileReader();
        reader.onload = () => saveImage(selectedRecipeId, reader.result);
        reader.readAsDataURL(file);
        event.target.value = "";
    };

    return (
        <Paper
            component="main"
            square
            elevation={0}
            sx={{
                height: "100%",
                minHeight: 0,
                bgcolor: colors.background,
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    bgcolor: colors.background,
                    height: "100%",
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
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

                <input ref={fileInputRef} hidden type="file" accept="image/*" onChange={handleFileChange} />

                <Box sx={{ flexShrink: 0, bgcolor: colors.backgroundSoft, borderBottom: `1px solid ${colors.border}` }}>
                    <Tabs
                        value={selectedCategory}
                        onChange={(_, value) => setSelectedCategory(value)}
                        variant="scrollable"
                        scrollButtons={false}
                        aria-label="Chọn nhóm món ăn"
                        sx={{
                            minHeight: 44,
                            px: 0.5,
                            "& .MuiTabs-indicator": { display: "none" },
                            "& .MuiTabs-flexContainer": { gap: 0.25 },
                        }}
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
                                    py: 0,
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

                {/* List products */}
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        p: 1.25,
                        pt: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        gap: 1.25,
                        overflowY: "auto",
                    }}
                >
                    {CATEGORIES.filter(
                        (category) => selectedCategory === "all" || category.id === selectedCategory,
                    ).map((category) => (
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
                            {RECIPES.filter((recipe) => recipe.category === category.id).map((recipe) => {
                                const image = images[recipe.id];
                                return (
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
                                                position: "relative",
                                                aspectRatio: "1.2 / 1",
                                                display: "grid",
                                                placeItems: "center",
                                                overflow: "hidden",
                                                cursor: "pointer",
                                                bgcolor: colors.backgroundSoft,
                                                backgroundImage: image ? `url(${image})` : "none",
                                                backgroundPosition: "center",
                                                backgroundSize: "cover",
                                                "&:hover .add-image": {
                                                    transform: "scale(1.08)",
                                                    bgcolor: colors.accent,
                                                },
                                            }}
                                        >
                                            {!image && (
                                                <IconButton
                                                    onClick={() => chooseImage(recipe.id)}
                                                    className="add-image"
                                                    aria-label={`Thêm ảnh cho ${recipe.name}`}
                                                    sx={{
                                                        width: 46,
                                                        height: 46,
                                                        bgcolor: colors.white,
                                                        color: colors.primary,
                                                        boxShadow: `0 5px 14px ${colors.avatarShadow}`,
                                                        transition: "transform 180ms ease, background-color 180ms ease",
                                                        "&:hover": { bgcolor: colors.accent },
                                                    }}
                                                >
                                                    <AddPhotoAlternateRoundedIcon />
                                                </IconButton>
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
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                                                    <AccessTimeRoundedIcon sx={{ fontSize: 14 }} />
                                                    <Typography sx={{ fontFamily: fonts.body, fontSize: 11 }}>
                                                        {recipe.time}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 0.2,
                                                        color: colors.accent,
                                                    }}
                                                >
                                                    <StarRoundedIcon sx={{ fontSize: 14 }} />
                                                    <Typography sx={{ fontFamily: fonts.body, fontSize: 11 }}>
                                                        {recipe.rating}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                );
                            })}
                        </Box>
                    ))}
                </Box>
            </Box>
        </Paper>
    );
}
