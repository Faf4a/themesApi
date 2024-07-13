import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/router";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";

export default function LoginContainer() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [openSnackbar, setOpenSnackbar] = React.useState(false);
    const router = useRouter();

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleLogin();
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/dashboard/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                router.push("/dashboard");
            } else {
                setOpenSnackbar(true);
            }
        } catch {
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <>
            <CssBaseline />
            <Container maxWidth="sm" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", color: "text.primary" }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    ThemeLibrary Dashboard
                </Typography>
                <Typography variant="h6" component="h2" gutterBottom align="center">
                    This is an <b>admin dashboard</b>, if you are trying to find the ThemeLibrary API or settings, visit{" "}
                    <Link href="https://github.com/faf4a/themesApi" color="inherit" underline="always">
                        the github repository
                    </Link>{" "}
                    or the plugin settings within Vencord.
                </Typography>
                <Box mt={4} sx={{ width: "100%" }}>
                    <TextField label="Username" variant="outlined" fullWidth margin="normal" value={username} onKeyPress={handleKeyPress} onChange={(e) => setUsername(e.target.value)} />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onKeyPress={handleKeyPress}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Box mt={2} sx={{ width: "100%" }}>
                        <Button variant="contained" color="secondary" onClick={handleLogin} fullWidth>
                            Log in
                        </Button>
                    </Box>
                </Box>
            </Container>
            <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <Snackbar open={openSnackbar} autoHideDuration={3500} onClose={handleCloseSnackbar} message="Login failed. Please try again." />
        </>
    );
}
