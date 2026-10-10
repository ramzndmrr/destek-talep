"use client";

import { useState } from "react";
import axios from "axios";
import { Alert, Box, Button, Container, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", { email: email.trim(), password });
      const data = response.data;
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userData", JSON.stringify(data.user));
      router.push("/my-requests");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Giriş başarısız. E-posta ve şifrenizi kontrol edin.");
      } else {
        setError("Giriş sırasında beklenmeyen bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #eef4ff 0%, #f8fafc 55%, #ffffff 100%)", display: "flex", alignItems: "center", py: 5 }}>
      <Container maxWidth="sm">
        <Stack spacing={3} >
          <IconButton aria-label="Ana sayfaya dön" onClick={() => router.push("/")} sx={{ alignSelf: "flex-start", color: "#475569", bgcolor: "#fff", border: "1px solid #e2e8f0", "&:hover": { bgcolor: "#f1f5f9" } }}><ArrowBackIcon /></IconButton>
          <Box sx={{ width: 76, height: 76, borderRadius: 4, bgcolor: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "center", boxShadow: "0 12px 30px rgba(37,99,235,0.25)" }}><SupportAgentIcon sx={{ fontSize: 42 }} /></Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#172554" }}>Tekrar Hoş Geldiniz</Typography>
            <Typography sx={{ mt: 1, color: "#64748b" }}>Destek taleplerinize devam etmek için giriş yapın.</Typography>
          </Box>
          <Paper elevation={0} sx={{ width: "100%", p: { xs: 3, sm: 4 }, border: "1px solid #e2e8f0", borderRadius: 4, bgcolor: "rgba(255,255,255,0.95)", boxShadow: "0 16px 40px rgba(15,23,42,0.05)" }}>
            <Box component="form" onSubmit={handleLogin}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#172554" }}>Hesabınıza giriş yapın</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: "#64748b" }}>E-posta adresinizi ve şifrenizi girin.</Typography>
                </Box>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField label="E-posta adresi" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required fullWidth autoComplete="email" placeholder="ornek@firma.com" slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: "#64748b" }} /></InputAdornment> } }} />
                <TextField label="Şifre" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required fullWidth autoComplete="current-password" slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: "#64748b" }} /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"} onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}</IconButton></InputAdornment> } }} />
                <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 1.5, borderRadius: 2, textTransform: "none", fontSize: "1rem", fontWeight: 700, bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" } }}>{loading ? "Giriş yapılıyor..." : "Giriş Yap"}</Button>
              </Stack>
            </Box>
          </Paper>
          <Typography variant="body2" sx={{ color: "#94a3b8", textAlign: "center" }}>Destek Talepleri Yönetim Sistemi</Typography>
        </Stack>
      </Container>
    </Box>
  );
}
