import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import App from "./App.jsx";
import theme from "./theme.js";

const routerBase = import.meta.env.BASE_URL.startsWith(".") ? undefined : import.meta.env.BASE_URL;

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter basename={routerBase}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <App />
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>,
);
