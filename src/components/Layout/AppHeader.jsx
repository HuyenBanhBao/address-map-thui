import { Avatar, Box, Paper, Typography } from "@mui/material";
import { colors, gradients } from "../../theme";

export default function AppHeader({ status }) {
    return (
        <Box
            component="header"
            sx={{
                display: "grid",
                gridTemplateColumns: "44px 1fr auto",
                alignItems: "center",
                gap: 2,
                px: { xs: 2, md: 4 },
                py: 1.75,
                color: colors.white,
                background: gradients.header,
                boxShadow: 3,
                zIndex: 2,
            }}
        >
            <Avatar sx={{ bgcolor: colors.white, color: colors.primary, fontWeight: 900, borderRadius: 2 }}>V</Avatar>
            <Box>
                <Typography
                    variant="overline"
                    sx={{ color: colors.sidebarStart, fontWeight: 800, letterSpacing: ".14em", lineHeight: 1 }}
                >
                    PHẦN MỀM GIÁM SÁT VÀ RA CHỈ THỊ CHO MẬP THÚI
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                    Vị trí hiện tại
                </Typography>
            </Box>
            <Paper
                elevation={0}
                sx={{
                    px: 1.5,
                    py: 1,
                    color: colors.white,
                    bgcolor: colors.headerOverlay,
                    border: `1px solid ${colors.headerBorder}`,
                    whiteSpace: "nowrap",
                }}
            >
                <Box
                    component="span"
                    sx={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        mr: 1,
                        borderRadius: "50%",
                        bgcolor: colors.online,
                    }}
                />
                {status}
            </Paper>
        </Box>
    );
}
