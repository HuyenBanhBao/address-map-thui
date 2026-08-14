import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { colors, gradients, fonts } from "../../theme";

export default function AppHeader({ status, onMenuOpen }) {
    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{ background: gradients.header, borderBottom: `1px solid ${colors.headerBorder}` }}
        >
            <Toolbar sx={{ minHeight: { xs: 64, sm: 72 }, gap: 1.75, px: { xs: 1.25, sm: 2 } }}>
                <IconButton
                    aria-label="Mở chức năng"
                    onClick={onMenuOpen}
                    sx={{ color: colors.white, bgcolor: colors.headerOverlay }}
                >
                    <MenuRoundedIcon />
                </IconButton>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                        variant="span"
                        sx={{
                            // display: { xs: "none", sm: "block" },
                            display: "block",
                            fontSize: 18,
                            color: colors.sidebarStart,
                            fontWeight: 800,
                            letterSpacing: ".11em",
                            lineHeight: 1,
                            fontFamily: fonts.display,
                        }}
                    >
                        HOME ĐUÝT'S THÚI
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
