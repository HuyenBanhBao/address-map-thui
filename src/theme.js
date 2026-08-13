import { createTheme } from "@mui/material/styles";

export const colors = {
    primary: "#0b4a3b",
    primaryDark: "#2f5a12",
    primaryLight: "#48801b",
    accent: "#fb8f2c",
    colorError: "#D64545",
    background: "#f6fbf2",
    backgroundSoft: "#e5f1db",
    backgroundWarm: "#eae7cb",
    sidebarStart: "#c9e3b0",
    sidebarEnd: "#f2f2f2",
    border: "#c9e3b0",
    text: "#315244",
    textMuted: "#587166",
    white: "#ffffff",
    online: "#61d895",
    headerOverlay: "#ffffff18",
    headerBorder: "#ffffff35",
    subtleBorder: "#0b4a3b16",
    markerShadow: "#0b4a3b65",
    avatarShadow: "#0b4a3b40",
};

export const fonts = {
    display: '"DynaPuff", system-ui, sans-serif',
    playful: '"Chewy", system-ui, sans-serif',
    handwriting: '"Updock", cursive',
    body: "Inter, system-ui, sans-serif",
};

export const gradients = {
    header: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
    workspace: `linear-gradient(135deg, ${colors.backgroundSoft}, ${colors.background} 52%, ${colors.backgroundWarm})`,
    sidebar: `linear-gradient(135deg, ${colors.sidebarStart}, ${colors.sidebarEnd})`,
};

export default createTheme({
    palette: {
        primary: { main: colors.primary, dark: colors.primaryDark, light: colors.primaryLight },
        secondary: { main: colors.accent },
        background: { default: colors.background, paper: colors.white },
        text: { primary: colors.text, secondary: colors.textMuted },
    },
    typography: {
        fontFamily: fonts.body,
        h1: { fontFamily: fonts.display },
        h2: { fontFamily: fonts.display },
        h3: { fontFamily: fonts.display },
        h4: { fontFamily: fonts.display },
        h5: { fontFamily: fonts.display },
        h6: { fontFamily: fonts.display },
    },
    shape: { borderRadius: 12 },
    trello: { colors, gradients, fonts },
});
