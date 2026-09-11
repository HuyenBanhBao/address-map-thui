import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { useLocation } from "react-router-dom";
import { colors, fonts } from "../../theme";

function pageTitle(pathname) {
    if (pathname === "/") return "Thôn trang của BuBu's";
    if (pathname.startsWith("/map")) return "Mập xinh chốn đâu";
    if (pathname.startsWith("/cook/")) return "Bí kíp món ăn";
    if (pathname.startsWith("/cook")) return "Ngự trù";
    if (pathname.startsWith("/repair")) return "Nội Vụ Phủ";
    if (pathname.startsWith("/toshiba")) return "Quốc khố";
    if (pathname.startsWith("/health")) return "Truyền Thái Y";
    return "Thôn trang của BuBu's";
}

export default function AppHeader({ onMenuOpen }) {
    const { pathname } = useLocation();

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                color: colors.primary,
                background: `linear-gradient(135deg, ${colors.background}, ${colors.backgroundWarm})`,
                borderBottom: `1px solid ${colors.border}`,
            }}
        >
            <Toolbar sx={{ minHeight: { xs: 60, sm: 68 }, px: { xs: 1.5, sm: 2.25 } }}>
                <Typography
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontFamily: fonts.display,
                        fontSize: { xs: 22, sm: 26 },
                        fontWeight: 800,
                        color: colors.primary,
                    }}
                >
                    {pageTitle(pathname)}
                </Typography>
                <IconButton
                    aria-label="Mở danh sách chức năng"
                    onClick={onMenuOpen}
                    sx={{
                        ml: 1,
                        width: 42,
                        height: 42,
                        flexShrink: 0,
                        color: colors.primary,
                        bgcolor: colors.white,
                        border: `1px solid ${colors.border}`,
                        boxShadow: `0 5px 18px ${colors.avatarShadow}`,
                        "&:hover": { bgcolor: colors.white },
                    }}
                >
                    <MenuRoundedIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}
