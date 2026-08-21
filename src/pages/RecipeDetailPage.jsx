import { useRef, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, TextField, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { useNavigate, useParams } from "react-router-dom";
import { useRecipeDetail } from "../hooks/useRecipeDetail";
import { colors, fonts } from "../theme";

const CATEGORIES = { main: "Món chính", soup: "Canh", side: "Món phụ", snack: "Ăn vặt" };

export default function RecipeDetailPage() {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const [ingredient, setIngredient] = useState({ name: "", quantity: "" });
    const [newStep, setNewStep] = useState("");
    const [message, setMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const detail = useRecipeDetail(recipeId);
    const notifyError = (error) => setMessage(error.message || "Không thể lưu thay đổi.");

    const changeImage = async () => {
        try {
            if (!Capacitor.isNativePlatform()) {
                inputRef.current?.click();
                return;
            }
            await Camera.requestPermissions({ permissions: ["camera", "photos"] });
            const photo = await Camera.getPhoto({
                quality: 85,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Prompt,
            });
            if (photo.dataUrl) await detail.replaceImage(photo.dataUrl);
        } catch (error) {
            notifyError(error);
        }
    };
    const addIngredient = async () => {
        if (!ingredient.name.trim()) return;
        try {
            await detail.addIngredient(ingredient.name.trim(), ingredient.quantity.trim());
            setIngredient({ name: "", quantity: "" });
        } catch (error) {
            notifyError(error);
        }
    };
    const addStep = async () => {
        if (!newStep.trim()) return;
        try {
            await detail.addStep(newStep.trim());
            setNewStep("");
        } catch (error) {
            notifyError(error);
        }
    };

    if (detail.loading) return <Box sx={{ p: 3 }}>Đang tải công thức...</Box>;
    if (detail.error || !detail.recipe)
        return <Box sx={{ p: 3, color: "error.main" }}>Không thể mở món ăn: {detail.error}</Box>;
    const { recipe, canEdit } = detail;
    const editing = canEdit && isEditing;

    return (
        <Paper
            component="main"
            square
            elevation={0}
            sx={{ height: "100%", overflowY: "auto", bgcolor: colors.background }}
        >
            <input
                ref={inputRef}
                hidden
                type="file"
                accept="image/*"
                onChange={(event) =>
                    event.target.files?.[0] && detail.replaceImage(event.target.files[0]).catch(notifyError)
                }
            />
            <Box sx={{ maxWidth: 720, mx: "auto", p: 1.5, pb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Button
                        startIcon={<ArrowBackRoundedIcon />}
                        onClick={() => navigate("/cook")}
                        sx={{ color: colors.primary, fontFamily: fonts.display, fontSize: 16 }}
                    >
                        Ngự trù
                    </Button>
                    {canEdit && (
                        <Box sx={{ display: "flex", gap: 0.75 }}>
                            <Button
                                variant={editing ? "contained" : "outlined"}
                                onClick={() => setIsEditing((current) => !current)}
                                sx={{ color: editing ? colors.white : colors.primary, borderColor: colors.primary, fontWeight: 600, bgcolor: editing ? colors.primary : "transparent", fontFamily: fonts.display }}
                            >
                                {editing ? "Xong" : "Sửa món"}
                            </Button>
                            {editing && <IconButton aria-label="Xóa món ăn" onClick={() => setDeleteOpen(true)} sx={{ color: colors.colorError, border: `1px solid ${colors.colorError}` }}><DeleteOutlineRoundedIcon /></IconButton>}
                        </Box>
                    )}
                </Box>
                <Box
                    sx={{
                        mt: 1.5,
                        borderRadius: 3,
                        overflow: "hidden",
                        bgcolor: colors.backgroundSoft,
                        position: "relative",
                        aspectRatio: "1.6 / 1",
                        background: recipe.image_url
                            ? `center / cover no-repeat url(${recipe.image_url})`
                            : colors.backgroundSoft,
                    }}
                >
                    {!recipe.image_url && (
                        <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
                            <AddPhotoAlternateRoundedIcon sx={{ fontSize: 52, color: colors.primary }} />
                        </Box>
                    )}
                    {editing && (
                        <Button
                            onClick={changeImage}
                            variant="contained"
                            sx={{
                                position: "absolute",
                                right: 12,
                                bottom: 12,
                                bgcolor: colors.accent,
                                color: colors.primary,
                            }}
                        >
                            Đổi ảnh
                        </Button>
                    )}
                </Box>
                <Box sx={{ mt: 2 }}>
                    {editing ? (
                        <TextField
                            fullWidth
                            value={recipe.name}
                            onChange={(event) => detail.updateRecipe({ name: event.target.value }).catch(notifyError)}
                            sx={{
                                "& input": {
                                    fontFamily: fonts.display,
                                    fontWeight: 800,
                                    fontSize: 24,
                                    color: colors.primary,
                                },
                            }}
                        />
                    ) : (
                        <Typography
                            sx={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 26, color: colors.primary }}
                        >
                            {recipe.name}
                        </Typography>
                    )}
                    <Typography sx={{ mt: 0.5, color: colors.textMuted, fontFamily: fonts.body }}>
                        {CATEGORIES[recipe.category]}
                    </Typography>
                    {message && <Typography sx={{ mt: 1, color: "error.main" }}>{message}</Typography>}
                </Box>

                <SectionTitle title="Nguyên liệu cần có" />
                {detail.ingredients.map((item) => (
                    <Box key={item.id} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                        {editing ? (
                            <>
                                <TextField
                                    size="small"
                                    value={item.name}
                                    onChange={(event) =>
                                        detail
                                            .updateIngredient(item.id, { name: event.target.value })
                                            .catch(notifyError)
                                    }
                                    sx={{ flex: 1 }}
                                />
                                <TextField
                                    size="small"
                                    value={item.quantity}
                                    onChange={(event) =>
                                        detail
                                            .updateIngredient(item.id, { quantity: event.target.value })
                                            .catch(notifyError)
                                    }
                                    sx={{ width: 110 }}
                                />
                                <IconButton
                                    onClick={() => detail.deleteIngredient(item.id).catch(notifyError)}
                                    color="error"
                                >
                                    <DeleteOutlineRoundedIcon />
                                </IconButton>
                            </>
                        ) : (
                            <Typography sx={{ color: colors.text }}>
                                • {item.name} {item.quantity && `— ${item.quantity}`}
                            </Typography>
                        )}
                    </Box>
                ))}
                {editing && (
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <TextField
                            size="small"
                            label="Nguyên liệu"
                            value={ingredient.name}
                            onChange={(event) => setIngredient((current) => ({ ...current, name: event.target.value }))}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            size="small"
                            label="Số lượng"
                            value={ingredient.quantity}
                            onChange={(event) =>
                                setIngredient((current) => ({ ...current, quantity: event.target.value }))
                            }
                            sx={{ width: 110 }}
                        />
                        <IconButton onClick={addIngredient} sx={{ bgcolor: colors.accent, color: colors.primary }}>
                            <AddRoundedIcon />
                        </IconButton>
                    </Box>
                )}

                <SectionTitle title="Cách nấu" />
                {detail.steps.map((step, index) => (
                    <Box key={step.id} sx={{ display: "flex", gap: 1, alignItems: "flex-start", mb: 1.25 }}>
                        <Box
                            sx={{
                                flexShrink: 0,
                                width: 28,
                                height: 28,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: "50%",
                                bgcolor: colors.accent,
                                color: colors.primary,
                                fontWeight: 800,
                            }}
                        >
                            {index + 1}
                        </Box>
                        {editing ? (
                            <>
                                <TextField
                                    multiline
                                    minRows={2}
                                    value={step.instruction}
                                    onChange={(event) =>
                                        detail.updateStep(step.id, event.target.value).catch(notifyError)
                                    }
                                    sx={{ flex: 1 }}
                                />
                                <IconButton onClick={() => detail.deleteStep(step.id).catch(notifyError)} color="error">
                                    <DeleteOutlineRoundedIcon />
                                </IconButton>
                            </>
                        ) : (
                            <Typography sx={{ pt: 0.5, color: colors.text }}>{step.instruction}</Typography>
                        )}
                    </Box>
                ))}
                {editing && (
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <TextField
                            multiline
                            minRows={2}
                            label="Thêm bước nấu"
                            value={newStep}
                            onChange={(event) => setNewStep(event.target.value)}
                            sx={{ flex: 1 }}
                        />
                        <IconButton
                            onClick={addStep}
                            sx={{ alignSelf: "flex-start", bgcolor: colors.accent, color: colors.primary }}
                        >
                            <AddRoundedIcon />
                        </IconButton>
                    </Box>
                )}
            </Box>
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontFamily: fonts.display, color: colors.colorError, fontWeight: 800 }}>Xóa món ăn?</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: colors.text }}>Bạn có chắc muốn xóa</Typography>
                    <Typography sx={{ mt: 0.7, fontFamily: fonts.display, fontSize: 17, fontWeight: 800, color: colors.primary }}>“{recipe.name}”</Typography>
                    <Typography sx={{ mt: 0.75, fontSize: 12, color: colors.textMuted }}>Công thức, nguyên liệu và các bước nấu của món này sẽ bị xóa.</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteOpen(false)} sx={{ color: colors.textMuted }}>Giữ lại</Button>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            try {
                                await detail.deleteRecipe();
                                navigate("/cook");
                            } catch (deleteError) {
                                notifyError(deleteError);
                                setDeleteOpen(false);
                            }
                        }}
                        sx={{ bgcolor: colors.colorError, fontFamily: fonts.display, "&:hover": { bgcolor: colors.colorError } }}
                    >
                        Xóa món
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}

function SectionTitle({ title }) {
    return (
        <Typography
            sx={{ mt: 3, mb: 1.25, fontFamily: fonts.display, fontSize: 19, fontWeight: 800, color: colors.primary }}
        >
            {title}
        </Typography>
    );
}
