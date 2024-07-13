import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Head from "next/head";

// fonts used by material ui
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

function App({ Component, pageProps }) {
    const darkTheme = createTheme({
        palette: {
            mode: "dark"
        }
    });
    
    return (
        <ThemeProvider theme={darkTheme}>
            <Head>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
            </Head>
            <Component {...pageProps} />
        </ThemeProvider>
    );
}

export default App;
