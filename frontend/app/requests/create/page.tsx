"use client";

import { useState } from "react";
import { Alert, Box, Button, Container, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "../../../lib/api";

export default function NewRequestPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("GENERAL");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        const token = localStorage.getItem("accessToken");
        if (!token) {
            router.replace("/login");
            return;
        }

        setLoading(true);
        try {
            await api.post(
                "/api/requests",
                { title: title.trim(), description: description.trim(), category },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            router.push("/my-requests");
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                console.error("Talep oluşturma hatası:", err.response?.status, err.response?.data || err.message);
                setError(err.response?.data?.message || `Talep oluşturulamadı. HTTP: ${err.response?.status ?? "Bağlantı hatası"}`);
            } else {
                setError("Beklenmeyen bir hata oluştu.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 5 }}>
            <Container maxWidth="md">
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/my-requests")} sx={{ mb: 3, textTransform: "none" }}>
                    Taleplerime Dön
                </Button>

                <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                    <Box sx={{ width: 54, height: 54, borderRadius: 3, bgcolor: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <SupportAgentIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: "#172554" }}>Yeni Destek Talebi</Typography>
                        <Typography color="text.secondary">Sorununuzu açıklayın, destek ekibimiz size yardımcı olsun.</Typography>
                    </Box>
                </Stack>

                <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, border: "1px solid #e2e8f0", borderRadius: 4 }}>
                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            {error && <Alert severity="error">{error}</Alert>}

                            <TextField
                                label="Talep başlığı"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required fullWidth
                                helperText={`${title.length}/150 karakter`}
                                placeholder="Örn. Hesabıma giriş yapamıyorum"
                            />

                            <TextField
                                select label="Kategori" value={category}
                                onChange={(e) => setCategory(e.target.value)} required fullWidth
                            >
                                <MenuItem value="TECHNICAL_SUPPORT">Teknik Destek</MenuItem>
                                <MenuItem value="ACCOUNT">Hesap İşlemleri</MenuItem>
                                <MenuItem value="BILLING">Ödeme ve Faturalandırma</MenuItem>
                                <MenuItem value="GENERAL">Genel</MenuItem>
                            </TextField>

                            <TextField
                                label="Sorunun açıklaması"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required fullWidth multiline minRows={6}
                                helperText={`${description.length}/5000 karakter`}
                                placeholder="Karşılaştığınız sorunu mümkün olduğunca ayrıntılı açıklayın..."
                            />

                            <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={2}>
                                <Button variant="outlined" onClick={() => router.push("/my-requests")} sx={{ textTransform: "none", borderRadius: 2 }}>
                                    İptal
                                </Button>
                                <Button type="submit" variant="contained" disabled={loading} startIcon={<SendIcon />} sx={{ bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" }, textTransform: "none", borderRadius: 2, px: 3 }}>
                                    {loading ? "Gönderiliyor..." : "Talebi Gönder"}
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}