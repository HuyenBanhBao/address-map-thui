import { useMemo, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
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
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import HomeRepairServiceRoundedIcon from "@mui/icons-material/HomeRepairServiceRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useHouseholdTasks } from "../hooks/useHouseholdTasks";
import { colors, fonts } from "../theme";

const GROUPS = [
    { id: "all", label: "Tất cả" },
    { id: "house", label: "Việc nhà" },
    { id: "repair", label: "Sửa chữa" },
    { id: "plan", label: "Kế hoạch" },
];
const GROUP_ICONS = {
    house: <AssignmentTurnedInRoundedIcon />,
    repair: <BuildRoundedIcon />,
    plan: <CalendarMonthRoundedIcon />,
};
const PRIORITIES = ["Bạn", "Nhẹ nhàng", "Cần làm", "Gấp"];
const PRIORITY_COLORS = {
    Bạn: colors.primaryLight,
    "Nhẹ nhàng": "#69b5e6",
    "Cần làm": colors.accent,
    Gấp: colors.colorError,
};
const initialDraft = () => ({
    title: "",
    detail: "",
    task_group: "house",
    priority: "Cần làm",
    assigned_to: "Mập xinh",
    due_date: new Date().toISOString().slice(0, 10),
});

function dueInfo(dateString, done) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const difference = Math.round((new Date(`${dateString}T00:00:00`) - today) / 86400000);
    if (difference === 0) return { label: "Hôm nay", overdue: false };
    if (difference < 0 && !done) return { label: `Quá hạn ${Math.abs(difference)} ngày`, overdue: true };
    return {
        label: new Date(`${dateString}T00:00:00`).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
        overdue: false,
    };
}

export default function RepairPage() {
    const [group, setGroup] = useState("all");
    const [addOpen, setAddOpen] = useState(false);
    const [draft, setDraft] = useState(initialDraft);
    const [submitError, setSubmitError] = useState("");
    const [editingTask, setEditingTask] = useState(null);
    const [deletingTask, setDeletingTask] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const { tasks, loading, error, addTask, toggleTask, updateTask, removeTask } = useHouseholdTasks();
    const visibleTasks = useMemo(() => tasks.filter((task) => group === "all" || task.group === group), [group, tasks]);
    const completed = tasks.filter((task) => task.done).length;
    const progress = tasks.length ? (completed / tasks.length) * 100 : 0;

    const submitTask = async () => {
        if (!draft.title.trim()) {
            setSubmitError("Hãy nhập tên công việc.");
            return;
        }
        try {
            setSubmitError("");
            const values = { ...draft, title: draft.title.trim(), detail: draft.detail.trim() };
            if (editingTask) await updateTask(editingTask.id, values);
            else await addTask(values);
            setDraft(initialDraft());
            setEditingTask(null);
            setAddOpen(false);
        } catch (requestError) {
            setSubmitError(requestError.message || "Không thể lưu công việc.");
        }
    };

    const confirmDeleteTask = async () => {
        if (!deletingTask) return;
        try {
            setDeleteError("");
            await removeTask(deletingTask.id);
            setDeletingTask(null);
        } catch (requestError) {
            setDeleteError(requestError.message || "Không thể xóa công việc.");
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
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                        <Typography sx={{ fontFamily: fonts.display, fontSize: 23, fontWeight: 800 }}>
                            Nội Vụ Phủ
                        </Typography>
                        <Typography sx={{ mt: 0.25, fontFamily: fonts.body, fontSize: 12, opacity: 0.82 }}>
                            Sổ tay việc nhà của Đại nhân
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
                        <HomeRepairServiceRoundedIcon />
                    </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
                    <Box
                        sx={{ flex: 1, height: 7, overflow: "hidden", borderRadius: 99, bgcolor: colors.headerOverlay }}
                    >
                        <Box
                            sx={{
                                width: `${progress}%`,
                                height: "100%",
                                borderRadius: 99,
                                bgcolor: colors.accent,
                                transition: "width 250ms ease",
                            }}
                        />
                    </Box>
                    <Typography sx={{ fontFamily: fonts.display, fontSize: 12 }}>
                        {completed}/{tasks.length} xong
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ flexShrink: 0, bgcolor: colors.backgroundWarm, borderBottom: `1px solid ${colors.border}` }}>
                <Tabs
                    value={group}
                    onChange={(_, value) => setGroup(value)}
                    variant="scrollable"
                    scrollButtons={false}
                    sx={{ minHeight: 44, px: 0.5, "& .MuiTabs-indicator": { display: "none" } }}
                >
                    {GROUPS.map((item) => (
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
                {loading && <Typography sx={{ color: colors.textMuted }}>Đang tải công việc...</Typography>}
                {error && <Typography sx={{ color: colors.colorError }}>Không thể tải công việc: {error}</Typography>}
                {!loading && !error && !visibleTasks.length && (
                    <Typography sx={{ color: colors.textMuted }}>
                        Chưa có công việc nào. Hãy thêm việc đầu tiên nhé.
                    </Typography>
                )}
                {visibleTasks.map((task) => {
                    const due = dueInfo(task.due, task.done);
                    const taskColor = PRIORITY_COLORS[task.priority] || colors.primaryLight;
                    return (
                        <Paper
                            key={task.id}
                            elevation={0}
                            sx={{
                                position: "relative",
                                overflow: "hidden",
                                border: `1px solid ${due.overdue ? colors.colorError : colors.border}`,
                                borderRadius: 3,
                                bgcolor: task.done ? colors.backgroundSoft : colors.white,
                                opacity: task.done ? 0.72 : 1,
                            }}
                        >
                            <Box
                                sx={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 6, bgcolor: taskColor }}
                            />
                            <Box sx={{ p: 1.25, pl: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.25 }}>
                                    <Checkbox
                                        checked={task.done}
                                        onChange={() => toggleTask(task).catch(() => {})}
                                        sx={{
                                            mt: -0.9,
                                            ml: -1,
                                            color: taskColor,
                                            "&.Mui-checked": { color: colors.primary },
                                        }}
                                    />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            sx={{
                                                fontFamily: fonts.display,
                                                fontSize: 15,
                                                fontWeight: 800,
                                                color: colors.text,
                                                textDecoration: task.done ? "line-through" : "none",
                                            }}
                                        >
                                            {task.title}
                                        </Typography>
                                        {!!task.detail && (
                                            <Typography
                                                sx={{
                                                    mt: 0.4,
                                                    fontSize: 12,
                                                    lineHeight: 1.45,
                                                    color: colors.textMuted,
                                                }}
                                            >
                                                {task.detail}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box sx={{ display: "flex", mt: -0.75, mr: -0.75 }}>
                                        <IconButton
                                            size="small"
                                            aria-label="Sửa công việc"
                                            onClick={() => {
                                                setEditingTask(task);
                                                setDraft({
                                                    title: task.title,
                                                    detail: task.detail || "",
                                                    task_group: task.group,
                                                    priority: task.priority,
                                                    assigned_to: task.owner,
                                                    due_date: task.due,
                                                });
                                                setSubmitError("");
                                                setAddOpen(true);
                                            }}
                                            sx={{ color: colors.textMuted }}
                                        >
                                            <EditRoundedIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            aria-label="Xóa công việc"
                                            onClick={() => {
                                                setDeleteError("");
                                                setDeletingTask(task);
                                            }}
                                            sx={{ color: colors.colorError }}
                                        >
                                            <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1,
                                        mt: 1.25,
                                    }}
                                >
                                    <Box>
                                        <Chip
                                            icon={GROUP_ICONS[task.group]}
                                            label={task.priority}
                                            size="small"
                                            sx={{
                                                height: 26,
                                                bgcolor: due.overdue ? `${colors.colorError}22` : `${taskColor}22`,
                                                color: due.overdue ? colors.colorError : colors.text,
                                                "& .MuiChip-icon": {
                                                    color: due.overdue ? colors.colorError : taskColor,
                                                    fontSize: 16,
                                                },
                                            }}
                                        />
                                        {group === "all" && (
                                            <Typography sx={{ mt: 0.4, fontSize: 10, color: colors.textMuted }}>
                                                Nhóm: {GROUPS.find((item) => item.id === task.group)?.label}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box sx={{ textAlign: "right" }}>
                                        <Typography
                                            sx={{
                                                fontSize: 11,
                                                color: due.overdue ? colors.colorError : colors.textMuted,
                                                fontWeight: due.overdue ? 800 : 400,
                                            }}
                                        >
                                            {due.label}
                                        </Typography>
                                        <Typography sx={{ mt: 0.15, fontSize: 11, color: colors.textMuted }}>
                                            Nô tì: {task.owner}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    );
                })}
            </Box>

            <Box
                onClick={() => {
                    setSubmitError("");
                    setEditingTask(null);
                    setDraft(initialDraft());
                    setAddOpen(true);
                }}
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
                <Typography variant="span">Giao nhiệm vụ</Typography>
            </Box>
            <Dialog
                open={addOpen}
                onClose={() => setAddOpen(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontFamily: fonts.display, color: colors.primary, fontWeight: 800 }}>
                    {editingTask ? "Sửa công việc" : "Thêm công việc mới"}
                </DialogTitle>
                <DialogContent sx={{ display: "grid", gap: 1.25, pt: "12px !important" }}>
                    <TextField
                        autoFocus
                        required
                        label="Tên công việc"
                        value={draft.title}
                        onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                        error={Boolean(submitError)}
                        helperText={submitError}
                    />
                    <TextField
                        label="Ghi chú"
                        multiline
                        minRows={2}
                        value={draft.detail}
                        onChange={(event) => setDraft((current) => ({ ...current, detail: event.target.value }))}
                    />
                    <TextField
                        select
                        label="Nhóm công việc"
                        value={draft.task_group}
                        onChange={(event) => setDraft((current) => ({ ...current, task_group: event.target.value }))}
                    >
                        {GROUPS.filter((item) => item.id !== "all").map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Mức độ"
                        value={draft.priority}
                        onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value }))}
                    >
                        {PRIORITIES.map((priority) => (
                            <MenuItem key={priority} value={priority}>
                                {priority}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Nô tì phụ trách"
                        value={draft.assigned_to}
                        onChange={(event) => setDraft((current) => ({ ...current, assigned_to: event.target.value }))}
                    >
                        {["Mập xinh", "Vợ thúi", "Cả hai"].map((owner) => (
                            <MenuItem key={owner} value={owner}>
                                {owner}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Hạn hoàn thành"
                        type="date"
                        value={draft.due_date}
                        onChange={(event) => setDraft((current) => ({ ...current, due_date: event.target.value }))}
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setAddOpen(false)} sx={{ color: colors.textMuted }}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={submitTask}
                        sx={{
                            bgcolor: colors.primary,
                            fontFamily: fonts.display,
                            "&:hover": { bgcolor: colors.primaryDark },
                        }}
                    >
                        {editingTask ? "Lưu thay đổi" : "Lưu công việc"}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={Boolean(deletingTask)}
                onClose={() => setDeletingTask(null)}
                fullWidth
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontFamily: fonts.display, color: colors.colorError, fontWeight: 800 }}>
                    Muốn lươn sao? Nhà ngươi làm xong chưa?
                </DialogTitle>

                <DialogContent>
                    <Typography
                        sx={{
                            mt: 0.7,
                            fontFamily: fonts.display,
                            fontSize: 17,
                            fontWeight: 800,
                            color: colors.primary,
                            lineHeight: 1.45,
                        }}
                    >
                        “{deletingTask?.title}”
                    </Typography>
                    {!!deleteError && (
                        <Typography sx={{ mt: 1, fontSize: 12, color: colors.colorError }}>{deleteError}</Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setDeletingTask(null)}
                        sx={{ color: colors.textMuted, fontFamily: fonts.display }}
                    >
                        {"Nô tì k dám >_<"}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={confirmDeleteTask}
                        sx={{
                            bgcolor: colors.colorError,
                            fontFamily: fonts.display,
                            "&:hover": { bgcolor: colors.colorError },
                        }}
                    >
                        Biết j đâu!!!
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
