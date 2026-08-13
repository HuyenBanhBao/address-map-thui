import {
    Avatar,
    Box,
    Button,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography,
} from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import { TEAM_MEMBERS } from "../../hooks/useSharedLocations";
import { colors, gradients, fonts } from "../../theme";

export default function TeamSidebar({ name, onNameChange, people, sharing, onShare, onStop, onFocus, onClose }) {
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
                p: 2,
                color: colors.text,
                background: gradients.sidebar,
            }}
        >
            {/* ---------------- TIÊU ĐỀ ---------------- */}
            <Typography
                variant="span"
                color="primary.main"
                sx={{
                    display: "block",
                    fontSize: 18,
                    color: colors.primary,
                    fontWeight: 800,
                    letterSpacing: ".11em",
                    lineHeight: 1,
                    fontFamily: fonts.playful,
                }}
            >
                CHỨC NĂNG
            </Typography>
            {/* ---------------- LIST ---------------- */}
            <List disablePadding sx={{ mt: 2 }}>
                <ListItemButton
                    selected
                    sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        "&.Mui-selected": {
                            bgcolor: colors.accent,
                            color: colors.primary,
                            "&:hover": { bgcolor: colors.accent },
                        },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 36, color: colors.backgroundSoft }}>
                        <MapOutlinedIcon />
                    </ListItemIcon>
                    <Typography
                        variant="span"
                        sx={{
                            //
                            fontWeight: 400,
                            fontFamily: fonts.display,
                            color: colors.backgroundSoft,
                        }}
                    >
                        Mập xinh chốn đâu
                    </Typography>
                </ListItemButton>
                <ListItemButton disabled sx={{ borderRadius: 2 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                        <TimelineOutlinedIcon />
                    </ListItemIcon>
                    <Typography
                        variant="span"
                        sx={{
                            //
                            fontWeight: 400,
                            fontFamily: fonts.display,
                        }}
                    >
                        Dấu vết để lại
                    </Typography>
                </ListItemButton>
            </List>

            {/* ---------------- GROUPS ---------------- */}
            <Divider sx={{ my: 1, borderColor: colors.subtleBorder }} />
            <Typography
                variant="span"
                sx={{
                    //
                    mt: 1,
                    fontWeight: 400,
                    fontSize: 14,
                    fontFamily: fonts.display,
                    color: colors.textMuted,
                }}
            >
                Nô tì mau báo họ tên?
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
                {TEAM_MEMBERS.map((member) => (
                    <Button
                        key={member}
                        variant={name === member ? "contained" : "outlined"}
                        onClick={() => onNameChange(member)}
                        sx={{
                            flex: 1,
                            textTransform: "none",
                            fontWeight: 800,
                            fontFamily: fonts.display,
                            fontSize: 14,
                            boxShadow: 3,
                            color: name === member ? colors.white : colors.primary,
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
                    minHeight: 46,
                    color: sharing ? colors.white : colors.primary,
                    fontWeight: 500,
                    fontSize: 16,
                    textTransform: "none",
                    boxShadow: 3,
                    fontFamily: fonts.display,
                }}
            >
                {sharing ? "Lẩn trốn" : "Báo cáo vị trí"}
            </Button>

            {/* ---------------- PEOPLE ---------------- */}
            <Box sx={{ mt: 3 }}>
                <Typography
                    variant="span"
                    sx={{
                        //
                        mt: 1,
                        fontWeight: 400,
                        fontSize: 14,
                        fontFamily: fonts.display,
                        color: colors.textMuted,
                    }}
                >
                    Đối tượng xuất hiện ({people.length})
                </Typography>
                <List disablePadding>
                    {people.map((person) => (
                        <ListItemButton
                            key={person.user_id}
                            onClick={() => focus(person)}
                            sx={{ px: 0, borderBottom: `1px solid ${colors.subtleBorder}` }}
                        >
                            <ListItemIcon sx={{ minWidth: 42 }}>
                                <Avatar sx={avatarSx(person.display_name)} />
                            </ListItemIcon>
                            <Typography
                                variant="span"
                                sx={{
                                    display: "block",
                                    mr: "auto",
                                    fontWeight: 300,
                                    fontSize: 16,
                                    fontFamily: fonts.display,
                                    color: colors.text,
                                }}
                            >
                                {person.display_name}
                            </Typography>
                            <Typography
                                variant="span"
                                sx={{
                                    color: colors.textMuted,
                                    fontFamily: fonts.display,
                                    fontSize: 18,
                                    fontWeight: 800,
                                }}
                            >
                                ›
                            </Typography>
                        </ListItemButton>
                    ))}
                </List>
            </Box>
        </Box>
    );
}
