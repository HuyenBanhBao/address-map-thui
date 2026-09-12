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
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useHouseholdTasks } from "../hooks/useHouseholdTasks";
import { colors, fonts } from "../theme";
import allTasksImage from "../assets/viec_nha_all.png";
import houseTasksImage from "../assets/viec_nha.png";
import repairTasksImage from "../assets/dudu_sua_chua.png";
import planTasksImage from "../assets/ke_hoach.png";

const GROUPS = [
    { id: "all", label: "Tất cả" },
    { id: "house", label: "Việc nhà" },
    { id: "repair", label: "Sửa chữa" },
    { id: "plan", label: "Kế hoạch" },
];
const GROUP_IMAGES = {
    all: allTasksImage,
    house: houseTasksImage,
    repair: repairTasksImage,
    plan: planTasksImage,
};
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
const FORM_FIELD_SX = {
    bgcolor: `${colors.white}dc`,
    borderRadius: 2.5,
    "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
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
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    flexShrink: 0,
                    p: 1.5,
                    color: colors.white,
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
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
                        bgcolor: `${colors.primaryLight}3c`,
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
                        bgcolor: `${colors.primaryLight}2c`,
                    }}
                />
                <Box sx={{ flex: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                            <Box
                                sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 0.55,
                                    px: 0.85,
                                    py: 0.35,
                                    mb: 1.25,
                                    borderRadius: 99,
                                    bgcolor: colors.headerOverlay,
                                    border: `1px solid ${colors.headerBorder}`,
                                }}
                            >
                                <AssignmentTurnedInRoundedIcon sx={{ fontSize: 14, color: colors.accent }} />
                                <Typography
                                    sx={{
                                        fontFamily: fonts.body,
                                        fontSize: 9.5,
                                        fontWeight: 700,
                                        lineHeight: 1,
                                        letterSpacing: ".12em",
                                        opacity: 0.9,
                                    }}
                                >
                                    NHẬT TRÌNH GIA ĐÌNH
                                </Typography>
                            </Box>
                            <Typography
                                sx={{
                                    fontFamily: fonts.display,
                                    fontSize: { xs: 21, sm: 23 },
                                    fontWeight: 800,
                                    lineHeight: 1.15,
                                    textShadow: `0 3px 12px ${colors.markerShadow}`,
                                }}
                            >
                                Sổ tay việc nhà
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
                        <Box
                            sx={{
                                flex: 1,
                                height: 7,
                                overflow: "hidden",
                                borderRadius: 99,
                                bgcolor: colors.headerOverlay,
                            }}
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
                <Box
                    sx={{
                        flex: 1,
                        width: 60,
                        height: 60,
                        placeItems: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        borderRadius: 3,
                    }}
                >
                    <Box
                        key={group}
                        component="img"
                        src={GROUP_IMAGES[group]}
                        alt={`Minh họa ${GROUPS.find((item) => item.id === group)?.label || "việc nhà"}`}
                        sx={{
                            width: 120,
                            height: 120,
                            objectFit: "contain",
                            filter: `drop-shadow(0 3px 5px ${colors.avatarShadow})`,
                            animation: "taskImageChange 420ms ease both",
                            "@keyframes taskImageChange": {
                                from: { opacity: 0, transform: "translateY(8px) scale(0.92)" },
                                to: { opacity: 1, transform: "translateY(0) scale(1)" },
                            },
                        }}
                    />
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
                        pb: 10,
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                        gridAutoRows: "max-content",
                        alignContent: "start",
                        gap: 1.25,
                    }}
                >
                    {loading && <Typography sx={{ color: colors.textMuted }}>Đang tải công việc...</Typography>}
                    {error && (
                        <Typography sx={{ color: colors.colorError }}>Không thể tải công việc: {error}</Typography>
                    )}
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
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        bottom: 0,
                                        left: 0,
                                        width: 6,
                                        bgcolor: taskColor,
                                    }}
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
            </Box>

            <Box
                onClick={() => {
                    setSubmitError("");
                    setEditingTask(null);
                    setDraft(initialDraft());
                    setAddOpen(true);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    setSubmitError("");
                    setEditingTask(null);
                    setDraft(initialDraft());
                    setAddOpen(true);
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
                    Giao nhiệm vụ
                </Typography>
            </Box>
            <Dialog
                open={addOpen}
                onClose={() => setAddOpen(false)}
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
                        {editingTask ? <EditRoundedIcon /> : <AssignmentTurnedInRoundedIcon />}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 19 }}>
                            {editingTask ? "Sửa nhiệm vụ" : "Giao nhiệm vụ mới"}
                        </Typography>
                        <Typography sx={{ mt: 0.2, fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>
                            {editingTask ? "Cập nhật lại nội dung công việc" : "Phân công rõ việc, đúng người, đúng hạn"}
                        </Typography>
                    </Box>
                    <IconButton
                        aria-label="Đóng phần giao nhiệm vụ"
                        onClick={() => setAddOpen(false)}
                        sx={{ color: colors.textMuted }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        display: "grid",
                        gap: 1.25,
                        p: "16px !important",
                        bgcolor: "transparent",
                    }}
                >
                    <TextField
                        autoFocus
                        required
                        label="Tên công việc"
                        value={draft.title}
                        onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                        error={Boolean(submitError)}
                        helperText={submitError}
                        sx={FORM_FIELD_SX}
                    />
                    <TextField
                        label="Ghi chú"
                        multiline
                        minRows={2}
                        value={draft.detail}
                        onChange={(event) => setDraft((current) => ({ ...current, detail: event.target.value }))}
                        sx={FORM_FIELD_SX}
                    />
                    <TextField
                        select
                        label="Nhóm công việc"
                        value={draft.task_group}
                        onChange={(event) => setDraft((current) => ({ ...current, task_group: event.target.value }))}
                        sx={FORM_FIELD_SX}
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
                        sx={FORM_FIELD_SX}
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
                        sx={FORM_FIELD_SX}
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
                        sx={FORM_FIELD_SX}
                    />
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
                    <Button onClick={() => setAddOpen(false)} sx={{ color: colors.textMuted, fontWeight: 700 }}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={submitTask}
                        startIcon={editingTask ? <EditRoundedIcon /> : <AddRoundedIcon />}
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
