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

    boxShadowPrimary:
        "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset",

    boxShadowBtn:
        "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset",
    boxShadowBtnHover:
        "rgba(0, 0, 0, 0.3) 0px 2px 4px, rgba(0, 0, 0, 0.2) 0px 5px 10px -2px, rgba(0, 0, 0, 0.15) 0px -2px 0px inset",
    boxShadowBulletin: "rgb(76 76 76) 3px 3px 6px 0px inset, rgb(255 255 255 / 50%) -3px -3px 6px 1px inset",
    boxShadowDots:
        "0 6px 12px rgba(0, 0, 0, 0.25), 0 -2px 4px rgba(255, 255, 255, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.3)",
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
