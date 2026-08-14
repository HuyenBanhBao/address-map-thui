import { Box, Paper, Typography } from "@mui/material";
import { colors, fonts } from "../theme";

export default function CookPage() {
    return (
        <Paper component="main" square elevation={0} sx={{ height: "100%", p: 3, bgcolor: colors.background }}>
            <Box>
                <Typography sx={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 800, color: colors.primary }}>
                    Ngự trù
                </Typography>
            </Box>
        </Paper>
    );
}
