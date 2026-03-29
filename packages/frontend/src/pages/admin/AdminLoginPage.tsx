import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { adminFetch } from "../../api/admin";

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      sessionStorage.setItem("admin-api-key", apiKey);
      await adminFetch("/products");
      sessionStorage.setItem("admin-api-key", apiKey);
      navigate("/admin");
    } catch (error) {
      sessionStorage.removeItem("admin-api-key");
      setErrorMessage(error instanceof Error ? error.message : "Sikertelen bejelentkezés");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        alignItems: "center",
        bgcolor: "background.default",
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        p: 2,
      }}
    >
      <Paper sx={{ maxWidth: 400, p: 4, width: "100%" }}>
        <Stack spacing={3} sx={{ alignItems: "center" }}>
          <LockOutlinedIcon sx={{ color: "primary.main", fontSize: 48 }} />
          <Typography component="h1" variant="h4">
            Admin belépés
          </Typography>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          <TextField
            autoFocus
            fullWidth
            label="API kulcs"
            onChange={(event) => setApiKey(event.target.value)}
            required
            type="password"
            value={apiKey}
          />
          <Button
            disabled={isSubmitting || apiKey.trim().length === 0}
            fullWidth
            onClick={handleLogin}
            size="large"
            variant="contained"
          >
            Belépés
          </Button>
          <Button component={Link} to="/" variant="text">
            Vissza a webshopba
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
