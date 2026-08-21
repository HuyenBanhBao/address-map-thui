import { useMemo, useState } from "react";
import {
    Box,
    Button,
    Chip,
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
import AcUnitRoundedIcon from "@mui/icons-material/AcUnitRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LocalLaundryServiceRoundedIcon from "@mui/icons-material/LocalLaundryServiceRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { keyframes } from "@mui/system";
import { useInventoryItems } from "../hooks/useInventoryItems";
import { colors, fonts } from "../theme";

const CATEGORIES = [
    { id: "all", label: "Tất cả" },
    { id: "fridge", label: "Tủ lạnh" },
    { id: "dry", label: "Đồ khô" },
    { id: "spice", label: "Gia vị" },
    { id: "laundry", label: "Giặt xả" },
];
const CATEGORY_META = {
    fridge: { label: "Tủ lạnh", icon: <AcUnitRoundedIcon />, color: "#4a9ed6" },
    dry: { label: "Đồ khô", icon: <Inventory2RoundedIcon />, color: "#ba8b4c" },
    spice: { label: "Gia vị", icon: <RestaurantRoundedIcon />, color: "#d66c4a" },
    laundry: { label: "Giặt xả", icon: <LocalLaundryServiceRoundedIcon />, color: "#8c70c7" },
};
const STOCK_STATUSES = [
    { id: "low", label: "Báo động", percent: 10, color: colors.colorError },
    { id: "medium", label: "Đủ dùng", percent: 50, color: colors.accent },
    { id: "full", label: "Mới nạp đầy", percent: 100, color: colors.primary },
];
const initialDraft = () => ({ name: "", category: "fridge", amount: "", status: "medium" });
const alertBellShake = keyframes`
    0%, 100% { transform: rotate(0deg); }
    20% { transform: rotate(-14deg); }
    40% { transform: rotate(12deg); }
    60% { transform: rotate(-8deg); }
    80% { transform: rotate(6deg); }
`;

function getStatus(percent) {
    if (percent <= 20) return STOCK_STATUSES[0];
    if (percent >= 80) return STOCK_STATUSES[2];
    return STOCK_STATUSES[1];
}

export default function ToshibaPage() {
    const [category, setCategory] = useState("all");
    const [formOpen, setFormOpen] = useState(false);
    const [draft, setDraft] = useState(initialDraft);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const [lowStockOpen, setLowStockOpen] = useState(false);
    const [formError, setFormError] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const { items, loading, error, addItem, updateItem, removeItem } = useInventoryItems();
    const visibleItems = useMemo(
        () => items.filter((item) => category === "all" || item.category === category),
        [category, items],
    );
    const lowItems = useMemo(() => items.filter((item) => item.stock_percent <= 20), [items]);

    const closeForm = () => {
        setFormOpen(false);
        setEditingItem(null);
        setFormError("");
    };
    const openAddForm = () => {
        setDraft(initialDraft());
        setEditingItem(null);
        setFormError("");
        setFormOpen(true);
    };
    const openEditForm = (item) => {
        setDraft({
            name: item.name,
            category: item.category,
            amount: item.amount || "",
            status: getStatus(item.stock_percent).id,
        });
        setEditingItem(item);
        setFormError("");
        setFormOpen(true);
    };
    const submitItem = async () => {
        if (!draft.name.trim()) {
            setFormError("Hãy nhập tên món đồ.");
            return;
        }
        try {
            setFormError("");
            const status = STOCK_STATUSES.find((item) => item.id === draft.status);
            const values = {
                name: draft.name.trim(),
                category: draft.category,
                amount: draft.amount.trim(),
                stock_percent: status.percent,
            };
            if (editingItem) await updateItem(editingItem.id, values);
            else await addItem(values);
            closeForm();
        } catch (requestError) {
            setFormError(requestError.message || "Không thể lưu món đồ.");
        }
    };
    const confirmDelete = async () => {
        if (!deletingItem) return;
        try {
            setDeleteError("");
            await removeItem(deletingItem.id);
            setDeletingItem(null);
        } catch (requestError) {
            setDeleteError(requestError.message || "Không thể xóa món đồ.");
        }
    };

    return (
        <Paper
            component="main"
            square
            elevation={0}
            sx={{
                position: "relative",
                height: "100%",
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                bgcolor: colors.background,
            }}
        >
            <Box
                sx={{
                    flexShrink: 0,
                    p: 1.5,
                    color: colors.white,
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                        <Typography sx={{ fontFamily: fonts.display, fontSize: 23, fontWeight: 800 }}>
                            Quốc khố
                        </Typography>
                        <Typography sx={{ mt: 0.25, fontFamily: fonts.body, fontSize: 12, opacity: 0.82 }}>
                            Kho lương của Đại nhân
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "50%",
                            bgcolor: colors.headerOverlay,
                            border: `1px solid ${colors.headerBorder}`,
                        }}
                    >
                        <Inventory2RoundedIcon />
                    </Box>
                </Box>
                <Box
                    onClick={() => lowItems.length && setLowStockOpen(true)}
                    sx={{
                        mt: 1.5,
                        px: 1.1,
                        py: 0.8,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        borderRadius: 2.5,
                        bgcolor: colors.headerOverlay,
                        cursor: lowItems.length ? "pointer" : "default",
                    }}
                >
                    <NotificationsActiveIcon
                        sx={{
                            color: lowItems.length ? colors.accent : colors.white,
                            fontSize: 20,
                            transformOrigin: "top center",
                            animation: lowItems.length ? `${alertBellShake} 1.2s ease-in-out infinite` : "none",
                        }}
                    />
                    <Typography sx={{ flex: 1, fontFamily: fonts.body, fontSize: 12 }}>
                        {lowItems.length
                            ? `${lowItems.length} món đồ sắp hết`
                            : "Quốc khố đang đầy đủ, Đại nhân yên tâm."}
                    </Typography>
                    {lowItems.length > 0 && (
                        <Typography sx={{ fontFamily: fonts.display, fontSize: 11 }}>Xem ›</Typography>
                    )}
                </Box>
            </Box>
            <Box sx={{ flexShrink: 0, bgcolor: colors.backgroundWarm, borderBottom: `1px solid ${colors.border}` }}>
                <Tabs
                    value={category}
                    onChange={(_, value) => setCategory(value)}
                    variant="scrollable"
                    scrollButtons={false}
                    sx={{ minHeight: 44, px: 0.5, "& .MuiTabs-indicator": { display: "none" } }}
                >
                    {CATEGORIES.map((item) => (
                        <Tab
                            key={item.id}
                            value={item.id}
                            label={item.label}
                            sx={{
                                minWidth: "auto",
                                minHeight: 44,
                                px: 1.2,
                                textTransform: "none",
                                color: colors.textMuted,
                                fontFamily: fonts.body,
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
                    pb: 10,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                    gridAutoRows: "max-content",
                    alignContent: "start",
                    gap: 1.25,
                }}
            >
                {loading && <Typography sx={{ color: colors.textMuted }}>Đang kiểm kê Quốc khố...</Typography>}
                {error && <Typography sx={{ color: colors.colorError }}>Không thể tải Quốc khố: {error}</Typography>}
                {!loading && !error && !visibleItems.length && (
                    <Typography sx={{ color: colors.textMuted }}>
                        Chưa có món đồ nào. Hãy nhập món đầu tiên nhé.
                    </Typography>
                )}
                {visibleItems.map((item) => {
                    const meta = CATEGORY_META[item.category];
                    const status = getStatus(item.stock_percent);
                    return (
                        <Paper
                            key={item.id}
                            elevation={0}
                            sx={{
                                p: 1.25,
                                borderRadius: 2,
                                bgcolor: colors.white,
                                border: `1px solid ${colors.border}`,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.1 }}>
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        display: "grid",
                                        placeItems: "center",
                                        borderRadius: 2.5,
                                        color: meta.color,
                                        bgcolor: `${meta.color}1f`,
                                    }}
                                >
                                    {meta.icon}
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography
                                        noWrap
                                        sx={{
                                            fontFamily: fonts.display,
                                            fontSize: 15,
                                            fontWeight: 800,
                                            color: colors.text,
                                        }}
                                    >
                                        {item.name}
                                    </Typography>
                                    <Typography sx={{ mt: 0.15, fontSize: 12, color: colors.textMuted }}>
                                        {item.amount || "Chưa ghi số lượng"}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignSelf: "flex-start", mt: -0.5, mr: -0.5 }}>
                                    <IconButton
                                        size="small"
                                        aria-label="Sửa món đồ"
                                        onClick={() => openEditForm(item)}
                                        sx={{ color: colors.textMuted }}
                                    >
                                        <EditRoundedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        aria-label="Xóa món đồ"
                                        onClick={() => {
                                            setDeleteError("");
                                            setDeletingItem(item);
                                        }}
                                        sx={{ color: colors.colorError }}
                                    >
                                        <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Box>
                            </Box>
                            <Box sx={{ mt: 1.15, display: "flex", gap: 0.75 }}>
                                {/* <Chip
                                    label={meta.label}
                                    size="small"
                                    sx={{
                                        height: 24,
                                        bgcolor: `${meta.color}1f`,
                                        color: meta.color,
                                        fontSize: 11,
                                        fontWeight: 800,
                                    }}
                                /> */}
                                <Chip
                                    label={status.label}
                                    size="small"
                                    sx={{
                                        height: 24,
                                        bgcolor: `${status.color}1e`,
                                        color: status.color,
                                        fontSize: 11,
                                        fontWeight: 800,
                                    }}
                                />
                            </Box>
                        </Paper>
                    );
                })}
            </Box>

            <Box
                onClick={openAddForm}
                sx={{
                    position: "absolute",
                    right: 16,
                    bottom: 16,
                    bgcolor: colors.accent,
                    color: colors.primary,
                    fontFamily: fonts.display,
                    fontWeight: 600,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2.5,
                    cursor: "pointer",
                    "&:hover": { bgcolor: colors.accent },
                }}
            >
                <AddRoundedIcon sx={{ mr: 0.75, fontSize: 18 }} />
                <Typography variant="span"> Nhập kho</Typography>
            </Box>
            <Dialog
                open={formOpen}
                onClose={closeForm}
                fullWidth
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontFamily: fonts.display, color: colors.primary, fontWeight: 800 }}>
                    {editingItem ? "Sửa món trong Quốc khố" : "Nhập món vào Quốc khố"}
                </DialogTitle>
                <DialogContent sx={{ display: "grid", gap: 1.25, pt: "12px !important" }}>
                    <TextField
                        autoFocus
                        required
                        label="Tên món đồ"
                        value={draft.name}
                        onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                        error={Boolean(formError)}
                        helperText={formError}
                    />
                    <TextField
                        select
                        label="Nhóm"
                        value={draft.category}
                        onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                    >
                        {CATEGORIES.filter((item) => item.id !== "all").map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Số lượng còn lại"
                        placeholder="Ví dụ: 2 chai, 500 g"
                        value={draft.amount}
                        onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))}
                    />
                    <TextField
                        select
                        label="Tình trạng"
                        value={draft.status}
                        onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
                    >
                        {STOCK_STATUSES.map((status) => (
                            <MenuItem key={status.id} value={status.id}>
                                {status.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={closeForm} sx={{ color: colors.textMuted }}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={submitItem}
                        sx={{
                            bgcolor: colors.primary,
                            fontFamily: fonts.display,
                            "&:hover": { bgcolor: colors.primaryDark },
                        }}
                    >
                        {editingItem ? "Lưu thay đổi" : "Nhập kho"}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={Boolean(deletingItem)}
                onClose={() => setDeletingItem(null)}
                fullWidth
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontFamily: fonts.display, color: colors.colorError, fontWeight: 800 }}>
                    Xóa món đồ?
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: colors.text }}>Bạn có chắc muốn xóa</Typography>
                    <Typography
                        sx={{
                            mt: 0.7,
                            fontFamily: fonts.display,
                            fontSize: 17,
                            fontWeight: 800,
                            color: colors.primary,
                        }}
                    >
                        “{deletingItem?.name}”
                    </Typography>
                    <Typography sx={{ mt: 0.75, fontSize: 12, color: colors.textMuted }}>
                        Món đồ này sẽ bị xóa khỏi Quốc khố của cả hai người.
                    </Typography>
                    {!!deleteError && (
                        <Typography sx={{ mt: 1, fontSize: 12, color: colors.colorError }}>{deleteError}</Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeletingItem(null)} sx={{ color: colors.textMuted }}>
                        Giữ lại
                    </Button>
                    <Button
                        variant="contained"
                        onClick={confirmDelete}
                        sx={{
                            bgcolor: colors.colorError,
                            fontFamily: fonts.display,
                            "&:hover": { bgcolor: colors.colorError },
                        }}
                    >
                        Xóa món đồ
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={lowStockOpen}
                onClose={() => setLowStockOpen(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 4, bgcolor: colors.background } }}
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontFamily: fonts.display,
                        color: colors.colorError,
                        fontWeight: 800,
                    }}
                >
                    <NotificationsActiveIcon
                        sx={{ transformOrigin: "top center", animation: `${alertBellShake} 1.2s ease-in-out infinite` }}
                    />
                    Đồ sắp hết
                </DialogTitle>
                <DialogContent>
                    {lowItems.map((item) => {
                        const meta = CATEGORY_META[item.category];
                        return (
                            <Paper
                                key={item.id}
                                elevation={0}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    p: 1,
                                    mb: 1,
                                    borderRadius: 2.5,
                                    bgcolor: colors.white,
                                    border: `1px solid ${colors.border}`,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 34,
                                        height: 34,
                                        display: "grid",
                                        placeItems: "center",
                                        borderRadius: 2,
                                        color: meta.color,
                                        bgcolor: `${meta.color}1f`,
                                    }}
                                >
                                    {meta.icon}
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography
                                        noWrap
                                        sx={{
                                            fontFamily: fonts.display,
                                            fontSize: 14,
                                            fontWeight: 800,
                                            color: colors.text,
                                        }}
                                    >
                                        {item.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: colors.textMuted }}>
                                        {item.amount || "Chưa ghi số lượng"} · {meta.label}
                                    </Typography>
                                </Box>
                                <Chip
                                    label="Sắp hết"
                                    size="small"
                                    sx={{
                                        bgcolor: `${colors.colorError}1e`,
                                        color: colors.colorError,
                                        fontSize: 10,
                                        fontWeight: 800,
                                    }}
                                />
                            </Paper>
                        );
                    })}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setLowStockOpen(false)}
                        sx={{ color: colors.textMuted, fontFamily: fonts.display }}
                    >
                        Tiểu nhân đã rõ
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
