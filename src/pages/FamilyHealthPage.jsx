import { useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useFamilyHealth } from "../hooks/useFamilyHealth";
import { colors, fonts } from "../theme";
import healthHeaderImage from "../assets/kham_benh.png";

const emptyMember = () => ({ name: "", relationship: "", allergies: [] });
const emptyMedicine = () => ({ name: "", usage: "" });
const emptyCondition = () => ({ name: "", medicines: [emptyMedicine()], notes: "" });
const FORM_FIELD_SX = {
    bgcolor: `${colors.white}dc`,
    borderRadius: 2.5,
    "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
};

function normalizeMedicines(medicines) {
    if (Array.isArray(medicines)) return medicines.filter((medicine) => medicine.name || medicine.usage);
    if (typeof medicines === "string" && medicines.trim()) return [{ name: medicines.trim(), usage: "" }];
    return [];
}

export default function FamilyHealthPage() {
    const { members, loading, error, addMember, updateMember, removeMember } = useFamilyHealth();
    const [selectedMemberId, setSelectedMemberId] = useState("all");
    const [memberOpen, setMemberOpen] = useState(false);
    const [conditionOpen, setConditionOpen] = useState(false);
    const [allergyOpen, setAllergyOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [editingConditionIndex, setEditingConditionIndex] = useState(null);
    const [memberDraft, setMemberDraft] = useState(emptyMember);
    const [conditionDraft, setConditionDraft] = useState(emptyCondition);
    const [allergyDraft, setAllergyDraft] = useState("");
    const [formError, setFormError] = useState("");
    const hasSelectedMember = members.some((member) => member.id === selectedMemberId);
    const visibleMembers =
        selectedMemberId === "all" || !hasSelectedMember
            ? members
            : members.filter((member) => member.id === selectedMemberId);

    const saveMember = async () => {
        if (!memberDraft.name.trim()) {
            setFormError("Hãy nhập tên thành viên.");
            return;
        }
        try {
            await addMember({
                name: memberDraft.name.trim(),
                relationship: memberDraft.relationship.trim(),
                allergies: memberDraft.allergies,
                conditions: [],
            });
            setMemberOpen(false);
            setMemberDraft(emptyMember());
        } catch (saveError) {
            setFormError(saveError.message || "Không thể thêm thành viên.");
        }
    };
    const saveCondition = async () => {
        if (!conditionDraft.name.trim() || !selectedMember) {
            setFormError("Hãy nhập tên bệnh hoặc tình trạng.");
            return;
        }
        try {
            const savedCondition = {
                ...conditionDraft,
                name: conditionDraft.name.trim(),
                medicines: conditionDraft.medicines
                    .map((medicine) => ({ name: medicine.name.trim(), usage: medicine.usage.trim() }))
                    .filter((medicine) => medicine.name || medicine.usage),
                notes: conditionDraft.notes.trim(),
            };
            const conditions = [...(selectedMember.conditions || [])];
            if (editingConditionIndex === null) conditions.push(savedCondition);
            else conditions[editingConditionIndex] = savedCondition;
            await updateMember(selectedMember.id, { conditions });
            setConditionOpen(false);
            setConditionDraft(emptyCondition());
            setEditingConditionIndex(null);
        } catch (saveError) {
            setFormError(saveError.message || "Không thể lưu hồ sơ.");
        }
    };
    const removeCondition = async (member, index) => {
        await updateMember(member.id, {
            conditions: member.conditions.filter((_, conditionIndex) => conditionIndex !== index),
        });
    };
    const updateMedicineDraft = (index, field, value) => {
        setConditionDraft((current) => ({
            ...current,
            medicines: current.medicines.map((medicine, medicineIndex) =>
                medicineIndex === index ? { ...medicine, [field]: value } : medicine,
            ),
        }));
    };
    const removeMedicineDraft = (index) => {
        setConditionDraft((current) => ({
            ...current,
            medicines:
                current.medicines.length > 1
                    ? current.medicines.filter((_, medicineIndex) => medicineIndex !== index)
                    : [emptyMedicine()],
        }));
    };
    const saveAllergy = async () => {
        if (!allergyDraft.trim() || !selectedMember) {
            setFormError("Hãy nhập thực phẩm gây dị ứng.");
            return;
        }
        try {
            const additions = allergyDraft
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
            const allergies = [...new Set([...(selectedMember.allergies || []), ...additions])];
            await updateMember(selectedMember.id, { allergies });
            setAllergyDraft("");
            setAllergyOpen(false);
        } catch (saveError) {
            setFormError(saveError.message || "Không thể lưu thực phẩm dị ứng.");
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
                    flexShrink: 0,
                    overflow: "hidden",
                    p: 1.5,
                    color: colors.white,
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                    isolation: "isolate",
                    "& > :not(.health-header-decoration)": { position: "relative", zIndex: 1 },
                }}
            >
                <Box
                    className="health-header-decoration"
                    sx={{
                        position: "absolute",
                        width: 170,
                        height: 170,
                        top: -95,
                        right: -35,
                        borderRadius: "50%",
                        bgcolor: `${colors.primaryLight}3c`,
                        pointerEvents: "none",
                    }}
                />
                <Box
                    className="health-header-decoration"
                    sx={{
                        position: "absolute",
                        width: 130,
                        height: 130,
                        bottom: -75,
                        left: -45,
                        borderRadius: "50%",
                        bgcolor: `${colors.accent}20`,
                        pointerEvents: "none",
                    }}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Box sx={{ minWidth: 0, pr: 1 }}>
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
                            <MedicationRoundedIcon sx={{ fontSize: 14, color: colors.accent }} />
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
                                Sổ sức khỏe gia đình
                            </Typography>
                        </Box>
                        <Typography
                            sx={{
                                fontFamily: fonts.display,
                                fontSize: { xs: 19, sm: 22 },
                                fontWeight: 800,
                                lineHeight: 1.2,
                                textShadow: `0 3px 12px ${colors.markerShadow}`,
                            }}
                        >
                            <Box component="span" sx={{ color: colors.accent }}>
                                BuBu&apos;s and DuDu&apos;s
                            </Box>
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            flex: 1,
                            width: 88,
                            height: 88,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            borderRadius: 10,
                            bgcolor: colors.headerOverlay,
                            border: `1px solid ${colors.headerBorder}`,
                        }}
                    >
                        <Box
                            component="img"
                            src={healthHeaderImage}
                            alt="Minh họa Truyền Thái Y"
                            sx={{
                                width: 130,
                                height: 130,
                                objectFit: "contain",
                                filter: `drop-shadow(0 4px 7px ${colors.avatarShadow})`,
                            }}
                        />
                    </Box>
                </Box>
            </Box>
            <Box
                sx={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    px: 1.25,
                    py: 1,
                    overflowX: "auto",
                    bgcolor: colors.backgroundWarm,
                    borderBottom: `1px solid ${colors.border}`,
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                }}
            >
                <Button
                    onClick={() => setSelectedMemberId("all")}
                    sx={{
                        flexShrink: 0,
                        minWidth: 0,
                        px: 1.35,
                        py: 0.75,
                        borderRadius: 99,
                        textTransform: "none",
                        fontFamily: fonts.display,
                        fontSize: 12,
                        color: selectedMemberId === "all" || !hasSelectedMember ? colors.white : colors.textMuted,
                        bgcolor: selectedMemberId === "all" || !hasSelectedMember ? colors.primary : colors.white,
                        border: `1px solid ${selectedMemberId === "all" || !hasSelectedMember ? colors.primary : colors.border}`,
                        boxShadow: selectedMemberId === "all" || !hasSelectedMember ? colors.boxShadowBtn : "none",
                        "&:hover": {
                            bgcolor: selectedMemberId === "all" || !hasSelectedMember ? colors.primary : colors.white,
                        },
                    }}
                >
                    Tất cả · {members.length}
                </Button>
                {members.map((member) => {
                    const selected = selectedMemberId === member.id;
                    const initial = member.name.trim().charAt(0).toUpperCase();
                    return (
                        <Button
                            key={member.id}
                            onClick={() => setSelectedMemberId(member.id)}
                            startIcon={
                                <Box
                                    sx={{
                                        width: 27,
                                        height: 27,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        borderRadius: "50%",
                                        bgcolor: selected ? colors.white : colors.backgroundSoft,
                                        color: colors.primary,
                                        fontFamily: fonts.display,
                                        fontSize: 12,
                                        fontWeight: 800,
                                    }}
                                >
                                    {initial}
                                </Box>
                            }
                            sx={{
                                flexShrink: 0,
                                minWidth: 0,
                                maxWidth: 180,
                                px: 1.1,
                                py: 0.45,
                                borderRadius: 99,
                                textTransform: "none",
                                fontFamily: fonts.display,
                                fontSize: 12,
                                color: selected ? colors.white : colors.text,
                                bgcolor: selected ? colors.primary : colors.white,
                                border: `1px solid ${selected ? colors.primary : colors.border}`,
                                boxShadow: selected ? colors.boxShadowBtn : "none",
                                "&:hover": { bgcolor: selected ? colors.primary : colors.white },
                                "& .MuiButton-startIcon": { mr: 0.75 },
                            }}
                        >
                            <Box
                                component="span"
                                sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            >
                                {member.name}
                            </Box>
                        </Button>
                    );
                })}
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
                    sx={{
                        position: "absolute",
                        zIndex: 0,
                        width: 220,
                        height: 220,
                        left: "42%",
                        top: "42%",
                        borderRadius: "50%",
                        bgcolor: `${colors.accent}2c`,
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
                    {loading && <Typography sx={{ color: colors.textMuted }}>Đang mở sổ Thái Y...</Typography>}
                    {error && <Typography sx={{ color: colors.colorError }}>Không thể tải hồ sơ: {error}</Typography>}
                    {!loading && !error && !members.length && (
                        <Typography sx={{ color: colors.textMuted }}>
                            Chưa có hồ sơ sức khỏe. Hãy thêm thành viên đầu tiên nhé.
                        </Typography>
                    )}
                    {visibleMembers.map((member) => (
                        <Paper
                            key={member.id}
                            elevation={0}
                            sx={{
                                overflow: "hidden",
                                borderRadius: 1,
                                bgcolor: colors.white,
                                border: `1px solid ${colors.border}`,
                            }}
                        >
                            <Box sx={{ p: 1.25, display: "flex", alignItems: "center", gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        display: "grid",
                                        placeItems: "center",
                                        borderRadius: "50%",
                                        bgcolor: colors.backgroundSoft,
                                        color: colors.primary,
                                    }}
                                >
                                    <FavoriteRoundedIcon />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        noWrap
                                        sx={{ fontFamily: fonts.display, fontWeight: 800, color: colors.text }}
                                    >
                                        {member.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: colors.textMuted }}>
                                        {member.relationship || "Thành viên gia đình"}
                                    </Typography>
                                </Box>
                                <IconButton
                                    onClick={() => removeMember(member.id).catch(() => {})}
                                    sx={{ color: colors.colorError }}
                                >
                                    <DeleteOutlineRoundedIcon />
                                </IconButton>
                            </Box>
                            <Box sx={{ px: 1.25, pb: 1.25 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        mb: 0.75,
                                    }}
                                >
                                    <Typography sx={{ fontFamily: fonts.display, fontSize: 13, color: colors.primary }}>
                                        Bệnh & lưu ý
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<AddRoundedIcon />}
                                        onClick={() => {
                                            setSelectedMember(member);
                                            setConditionDraft(emptyCondition());
                                            setEditingConditionIndex(null);
                                            setFormError("");
                                            setConditionOpen(true);
                                        }}
                                        sx={{ minWidth: 0, color: colors.primary }}
                                    >
                                        Thêm
                                    </Button>
                                </Box>
                                {(member.conditions || []).length ? (
                                    member.conditions.map((condition, index) => (
                                        <Box
                                            key={`${condition.name}-${index}`}
                                            onClick={() => {
                                                const medicines = normalizeMedicines(condition.medicines);
                                                setSelectedMember(member);
                                                setEditingConditionIndex(index);
                                                setConditionDraft({
                                                    name: condition.name || "",
                                                    medicines: medicines.length ? medicines : [emptyMedicine()],
                                                    notes: condition.notes || "",
                                                });
                                                setFormError("");
                                                setConditionOpen(true);
                                            }}
                                            sx={{
                                                position: "relative",
                                                p: 1,
                                                mb: 0.75,
                                                borderRadius: 1,
                                                bgcolor: colors.backgroundSoft,
                                                cursor: "pointer",
                                                transition: "transform 160ms ease",
                                                "&:active": { transform: "scale(0.99)" },
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    pr: 3,
                                                    fontFamily: fonts.display,
                                                    fontSize: 13,
                                                    color: colors.text,
                                                }}
                                            >
                                                {condition.name}
                                            </Typography>
                                            {normalizeMedicines(condition.medicines).length > 0 && (
                                                <Box sx={{ mt: 0.7, display: "grid", gap: 0.5 }}>
                                                    {normalizeMedicines(condition.medicines).map(
                                                        (medicine, medicineIndex) => (
                                                            <Box
                                                                key={`${medicine.name}-${medicineIndex}`}
                                                                sx={{
                                                                    display: "grid",
                                                                    gridTemplateColumns: "20px minmax(0, 1fr)",
                                                                    alignItems: "start",
                                                                    p: 0.7,
                                                                    borderRadius: 1.5,
                                                                    bgcolor: colors.white,
                                                                }}
                                                            >
                                                                <MedicationRoundedIcon
                                                                    sx={{
                                                                        mt: 0.1,
                                                                        fontSize: 15,
                                                                        color: colors.primary,
                                                                    }}
                                                                />
                                                                <Box>
                                                                    <Typography
                                                                        sx={{
                                                                            fontSize: 11,
                                                                            fontWeight: 800,
                                                                            color: colors.text,
                                                                        }}
                                                                    >
                                                                        {medicine.name || "Chưa ghi tên thuốc"}
                                                                    </Typography>
                                                                    {!!medicine.usage && (
                                                                        <Typography
                                                                            sx={{
                                                                                mt: 0.15,
                                                                                fontSize: 10.5,
                                                                                color: colors.textMuted,
                                                                            }}
                                                                        >
                                                                            Cách dùng: {medicine.usage}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        ),
                                                    )}
                                                </Box>
                                            )}
                                            {!!condition.notes && (
                                                <Box
                                                    sx={{ mt: 0.7, pt: 0.65, borderTop: `1px dashed ${colors.border}` }}
                                                >
                                                    <Typography
                                                        sx={{ fontSize: 10, fontWeight: 800, color: colors.textMuted }}
                                                    >
                                                        Lưu ý
                                                    </Typography>
                                                    <Typography sx={{ mt: 0.2, fontSize: 11, color: colors.textMuted }}>
                                                        {condition.notes}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <IconButton
                                                size="small"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    removeCondition(member, index).catch(() => {});
                                                }}
                                                sx={{
                                                    position: "absolute",
                                                    top: 3,
                                                    right: 3,
                                                    color: colors.colorError,
                                                }}
                                            >
                                                <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
                                            </IconButton>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography sx={{ fontSize: 12, color: colors.textMuted }}>
                                        Chưa ghi nhận bệnh hoặc lưu ý.
                                    </Typography>
                                )}
                                <Box sx={{ mt: 1.1, pt: 1, borderTop: `1px solid ${colors.border}` }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 1,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                fontFamily: fonts.display,
                                                fontSize: 12,
                                                color: colors.colorError,
                                            }}
                                        >
                                            <WarningAmberRoundedIcon sx={{ fontSize: 16 }} />
                                            Thực phẩm dị ứng
                                        </Typography>
                                        <Button
                                            size="small"
                                            startIcon={<AddRoundedIcon />}
                                            onClick={() => {
                                                setSelectedMember(member);
                                                setAllergyDraft("");
                                                setFormError("");
                                                setAllergyOpen(true);
                                            }}
                                            sx={{ minWidth: 0, color: colors.colorError }}
                                        >
                                            Thêm
                                        </Button>
                                    </Box>
                                    <Box sx={{ mt: 0.65, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                        {(member.allergies || []).length ? (
                                            member.allergies.map((allergy) => (
                                                <Chip
                                                    key={allergy}
                                                    label={allergy}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: `${colors.colorError}18`,
                                                        color: colors.colorError,
                                                        fontWeight: 700,
                                                        fontSize: 11,
                                                    }}
                                                />
                                            ))
                                        ) : (
                                            <Typography sx={{ fontSize: 12, color: colors.textMuted }}>
                                                Chưa ghi nhận
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </Box>
            <Box
                onClick={() => {
                    setMemberDraft(emptyMember());
                    setFormError("");
                    setMemberOpen(true);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    setMemberDraft(emptyMember());
                    setFormError("");
                    setMemberOpen(true);
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
                    <PersonAddAlt1RoundedIcon sx={{ fontSize: 19 }} />
                </Box>
                <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 12, lineHeight: 1.2 }}>
                    Thêm thành viên
                </Typography>
            </Box>
            <Dialog
                open={memberOpen}
                onClose={() => setMemberOpen(false)}
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
                        <PersonAddAlt1RoundedIcon />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 19 }}>
                            Thêm thành viên
                        </Typography>
                        <Typography sx={{ mt: 0.2, fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>
                            Tạo hồ sơ sức khỏe cho người thân
                        </Typography>
                    </Box>
                    <IconButton
                        aria-label="Đóng phần thêm thành viên"
                        onClick={() => setMemberOpen(false)}
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
                        label="Tên thành viên"
                        value={memberDraft.name}
                        error={!!formError}
                        helperText={formError}
                        onChange={(event) => setMemberDraft((current) => ({ ...current, name: event.target.value }))}
                        sx={FORM_FIELD_SX}
                    />
                    <TextField
                        label="Vai vế"
                        placeholder="Ví dụ: Nóc nhà, Nô tì"
                        value={memberDraft.relationship}
                        onChange={(event) =>
                            setMemberDraft((current) => ({ ...current, relationship: event.target.value }))
                        }
                        sx={FORM_FIELD_SX}
                    />
                    <TextField
                        label="Thực phẩm dị ứng"
                        placeholder="Ví dụ: tôm, đậu phộng"
                        onChange={(event) =>
                            setMemberDraft((current) => ({
                                ...current,
                                allergies: event.target.value
                                    .split(",")
                                    .map((item) => item.trim())
                                    .filter(Boolean),
                            }))
                        }
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
                    <Button onClick={() => setMemberOpen(false)} sx={{ color: colors.textMuted, fontWeight: 700 }}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={saveMember}
                        startIcon={<PersonAddAlt1RoundedIcon />}
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
                        Lưu hồ sơ
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={conditionOpen}
                onClose={() => {
                    setConditionOpen(false);
                    setEditingConditionIndex(null);
                }}
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
                        {editingConditionIndex === null ? <MedicationRoundedIcon /> : <EditRoundedIcon />}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 18 }}>
                            {editingConditionIndex === null ? "Thêm bệnh & thuốc" : "Chỉnh sửa bệnh & thuốc"}
                        </Typography>
                        <Typography sx={{ mt: 0.2, fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>
                            Hồ sơ của {selectedMember?.name || "thành viên"}
                        </Typography>
                    </Box>
                    <IconButton
                        aria-label="Đóng hồ sơ bệnh"
                        onClick={() => {
                            setConditionOpen(false);
                            setEditingConditionIndex(null);
                        }}
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
                        label="Bệnh hoặc tình trạng"
                        value={conditionDraft.name}
                        error={!!formError}
                        helperText={formError}
                        onChange={(event) => setConditionDraft((current) => ({ ...current, name: event.target.value }))}
                        sx={FORM_FIELD_SX}
                    />
                    <Paper
                        elevation={0}
                        sx={{
                            p: 1.25,
                            borderRadius: 3,
                            bgcolor: `${colors.white}dc`,
                            border: `1px solid ${colors.border}`,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
                            <Typography sx={{ fontFamily: fonts.display, fontSize: 13, color: colors.primary }}>
                                Danh sách thuốc
                            </Typography>
                            <Button
                                size="small"
                                startIcon={<AddRoundedIcon />}
                                onClick={() =>
                                    setConditionDraft((current) => ({
                                        ...current,
                                        medicines: [...current.medicines, emptyMedicine()],
                                    }))
                                }
                                sx={{
                                    minWidth: 0,
                                    px: 1,
                                    borderRadius: 2,
                                    color: colors.primary,
                                    bgcolor: colors.backgroundSoft,
                                    fontSize: 11,
                                    fontWeight: 700,
                                }}
                            >
                                Thêm thuốc
                            </Button>
                        </Box>
                        <Box sx={{ display: "grid", gap: 0.9 }}>
                            {conditionDraft.medicines.map((medicine, index) => (
                                <Paper
                                    key={index}
                                    elevation={0}
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "minmax(0, 1fr) 38px",
                                        gap: 0.75,
                                        p: 0.9,
                                        borderRadius: 2.5,
                                        bgcolor: colors.backgroundSoft,
                                        border: `1px solid ${colors.border}`,
                                    }}
                                >
                                    <Box sx={{ display: "grid", gap: 0.75 }}>
                                        <TextField
                                            size="small"
                                            label={`Tên thuốc ${index + 1}`}
                                            value={medicine.name}
                                            onChange={(event) => updateMedicineDraft(index, "name", event.target.value)}
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                        />
                                        <TextField
                                            size="small"
                                            label="Cách dùng thuốc"
                                            placeholder="Ví dụ: 1 viên sau ăn, ngày 2 lần"
                                            value={medicine.usage}
                                            onChange={(event) =>
                                                updateMedicineDraft(index, "usage", event.target.value)
                                            }
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                        />
                                    </Box>
                                    <IconButton
                                        aria-label={`Xóa thuốc ${index + 1}`}
                                        onClick={() => removeMedicineDraft(index)}
                                        sx={{ alignSelf: "center", color: colors.colorError }}
                                    >
                                        <DeleteOutlineRoundedIcon />
                                    </IconButton>
                                </Paper>
                            ))}
                        </Box>
                    </Paper>
                    <TextField
                        multiline
                        minRows={3}
                        label="Lưu ý chung"
                        placeholder="Ví dụ: uống sau ăn, tránh tự mua thuốc..."
                        value={conditionDraft.notes}
                        onChange={(event) =>
                            setConditionDraft((current) => ({ ...current, notes: event.target.value }))
                        }
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
                    <Button
                        onClick={() => {
                            setConditionOpen(false);
                            setEditingConditionIndex(null);
                        }}
                        sx={{ color: colors.textMuted, fontWeight: 700 }}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={saveCondition}
                        startIcon={editingConditionIndex === null ? <AddRoundedIcon /> : <EditRoundedIcon />}
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
                        {editingConditionIndex === null ? "Lưu hồ sơ bệnh" : "Lưu thay đổi"}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={allergyOpen}
                onClose={() => setAllergyOpen(false)}
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
                            bgcolor: colors.colorError,
                            color: colors.white,
                            boxShadow: `0 6px 16px ${colors.avatarShadow}`,
                        }}
                    >
                        <WarningAmberRoundedIcon />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 18 }}>
                            Thêm thực phẩm dị ứng
                        </Typography>
                        <Typography sx={{ mt: 0.2, fontFamily: fonts.body, fontSize: 11, color: colors.textMuted }}>
                            Hồ sơ của {selectedMember?.name || "thành viên"}
                        </Typography>
                    </Box>
                    <IconButton
                        aria-label="Đóng phần thêm dị ứng"
                        onClick={() => setAllergyOpen(false)}
                        sx={{ color: colors.textMuted }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        p: "16px !important",
                        bgcolor: "transparent",
                    }}
                >
                    <TextField
                        autoFocus
                        fullWidth
                        label="Thực phẩm gây dị ứng"
                        placeholder="Ví dụ: tôm, cua, đậu phộng"
                        value={allergyDraft}
                        error={Boolean(formError)}
                        helperText={formError || "Có thể nhập nhiều món, ngăn cách bằng dấu phẩy."}
                        onChange={(event) => setAllergyDraft(event.target.value)}
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
                    <Button onClick={() => setAllergyOpen(false)} sx={{ color: colors.textMuted, fontWeight: 700 }}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={saveAllergy}
                        startIcon={<WarningAmberRoundedIcon />}
                        sx={{
                            minHeight: 42,
                            flex: 1,
                            borderRadius: 2.5,
                            bgcolor: colors.colorError,
                            fontFamily: fonts.display,
                            fontSize: 12,
                            boxShadow: "none",
                            "&:hover": { bgcolor: colors.colorError, boxShadow: "none" },
                        }}
                    >
                        Lưu dị ứng
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
