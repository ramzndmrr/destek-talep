"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import LockIcon from "@mui/icons-material/Lock";
import api from "@/lib/api";

type RequestItem = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  adminResponse: string | null;
  userId: number;
};

const statusLabels: Record<string, string> = {
  OPEN: "Açık",
  ANSWERED: "Yanıtlandı",
  CLOSED: "Kapalı",
};

const categoryLabels: Record<string, string> = {
  TECHNICAL_SUPPORT: "Teknik Destek",
  ACCOUNT: "Hesap",
  BILLING: "Ödeme",
  GENERAL: "Genel",
};

function AdminRequestDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [request, setRequest] = useState<RequestItem | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadRequest = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.get<RequestItem>(
        `/api/requests/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequest(response.data);
      setAdminResponse(response.data.adminResponse ?? "");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
        router.replace("/login");
        return;
      }

      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError("Bu talebi görüntüleme yetkiniz yok.");
      } else if (
        axios.isAxiosError(err) &&
        err.response?.status === 404
      ) {
        setError(
          "Talep bulunamadı. Admin detay endpoint'ini kontrol etmeliyiz."
        );
      } else {
        setError("Talep bilgileri yüklenirken bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("userData");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "ADMIN") {
        router.replace("/my-requests");
        return;
      }

      void loadRequest();
    } catch {
      router.replace("/login");
    }
    // Sayfa açıldığında oturum ve rol kontrolü yapılır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  const handleSendResponse = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token || !request) return;

    if (!adminResponse.trim()) {
      setError("Lütfen yanıt metnini gir.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put<RequestItem>(
        `/api/requests/admin/${id}/response`,
{ response: adminResponse.trim() },
{
    headers: {
        Authorization: `Bearer ${token}`,
    },
}
);

setRequest(response.data);
setAdminResponse(response.data.adminResponse ?? adminResponse.trim());
setSuccess("Yanıt başarıyla kaydedildi.");
} catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
        router.replace("/login");
        return;
    }

    setError(
        axios.isAxiosError(err) && err.response?.status === 403
            ? "Bu işlem için ADMIN yetkisi gerekiyor."
            : "Yanıt kaydedilemedi. Lütfen tekrar dene."
    );
} finally {
    setSubmitting(false);
}
};

const handleCloseRequest = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token || !request) return;

    if (request.status === "CLOSED") {
        setError("Bu talep zaten kapalı.");
        return;
    }

    const confirmed = window.confirm(
        "Bu talebi kapatmak istediğine emin misin?"
    );

    if (!confirmed) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
        const response = await api.put<RequestItem>(
            `/api/requests/admin/${id}/close`,
            { status: "CLOSED" },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setRequest(response.data);
        setSuccess("Talep başarıyla kapatıldı.");
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userData");
            router.replace("/login");
            return;
        }

        setError(
            axios.isAxiosError(err) && err.response?.status === 403
                ? "Bu işlem için ADMIN yetkisi gerekiyor."
                : "Talep kapatılamadı. Lütfen tekrar dene."
        );
    } finally {
        setSubmitting(false);
    }
};

if (loading) {
    return (
        <Box
            sx={{
                minHeight: "70vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
            }}
        >
            <CircularProgress />
            <Typography color="text.secondary">
                Talep bilgileri yükleniyor...
            </Typography>
        </Box>
    );
}

return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb", py: 5 }}>
        <Container maxWidth="md">
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push("/admin/requests")}
                sx={{ mb: 3 }}
            >
                Taleplere Dön
            </Button>

            <Typography
                variant="h4"
                color="#172033"
            >
                Talep Detayı
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 4 }}>
                Talep bilgilerini incele ve kullanıcıya yanıt ver.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>
            )}

            {!request ? (
                <Paper sx={{ p: 4, borderRadius: 3 }} elevation={0}>
                    <Typography>
                        Talep bilgileri gösterilemiyor.
                    </Typography>
                </Paper>
            ) : (
                <>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 4 },
                            border: "1px solid #e5e9f2",
                            borderRadius: 3,
                            mb: 3,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: 2,
                                flexWrap: "wrap",
                                mb: 3,
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="overline"
                                    color="text.secondary"
                                >
                                    Talep No: #{request.id}
                                </Typography>

                                <Typography variant="h5">
                                    {request.title}
                                </Typography>
                            </Box>

                            <Chip
                                label={
                                    statusLabels[request.status] ?? request.status
                                }
                                color={
                                    request.status === "OPEN"
                                        ? "warning"
                                        : request.status === "ANSWERED"
                                            ? "success"
                                            : "default"
                                }
                            />
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "1fr 1fr",
                                },
                                gap: 3,
                                mb: 3,
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 0.5 }}
                                >
                                    Kategori
                                </Typography>
                                <Typography>
                                    {categoryLabels[request.category] ??
                                        request.category}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 0.5 }}
                                >
                                    Kullanıcı ID
                                </Typography>
                                <Typography>
                                    {request.userId}
                                </Typography>
                            </Box>
                        </Box>

                        <Typography >
                            Kullanıcının Açıklaması
                        </Typography>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                bgcolor: "#fafbfe",
                                borderRadius: 2,
                                whiteSpace: "pre-wrap",
                                overflowWrap: "anywhere",
                            }}
                        >
                            <Typography>
                                {request.description || "Açıklama bulunmuyor."}
                            </Typography>
                        </Paper>

                        {request.adminResponse && (
                            <Box sx={{ mt: 3 }}>
                                <Typography>
                                    Mevcut Admin Yanıtı
                                </Typography>

                                <Alert severity="info" sx={{ whiteSpace: "pre-wrap" }}>
                                    {request.adminResponse}
                                </Alert>
                            </Box>
                        )}
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 4 },
                            border: "1px solid #e5e9f2",
                            borderRadius: 3,
                        }}
                    >
                        <Typography variant="h6" >
                            Admin Yanıtı
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 3 }}
                        >
                            Yanıtın kaydedildiğinde kullanıcı talep detayından
                            yanıtı görebilir.
                        </Typography>

                        <TextField
                            fullWidth
                            multiline
                            minRows={5}
                            maxRows={12}
                            label="Yanıtını yaz"
                            placeholder="Kullanıcıya iletmek istediğin yanıtı buraya yaz..."
                            value={adminResponse}
                            onChange={(event) =>
                                setAdminResponse(event.target.value)
                            }
                            disabled={
                                submitting || request.status === "CLOSED"
                            }
                            helperText={`${adminResponse.length}/5000 karakter`}
                        />

                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                                mt: 3,
                            }}
                        >
                            <Button
                                variant="contained"
                                startIcon={<SendIcon />}
                                onClick={handleSendResponse}
                                disabled={
                                    submitting ||
                                    request.status === "CLOSED" ||
                                    !adminResponse.trim()
                                }
                            >
                                {submitting ? "İşleniyor..." : "Yanıtı Kaydet"}
                            </Button>

                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<LockIcon />}
                                onClick={handleCloseRequest}
                                disabled={
                                    submitting || request.status === "CLOSED"
                                }
                            >
                                Talebi Kapat
                            </Button>
                        </Box>

                        {request.status === "CLOSED" && (
                            <Alert severity="info" sx={{ mt: 3 }}>
                                Bu talep kapatılmış. Yanıt ve kapatma işlemleri
                                devre dışı.
                            </Alert>
                        )}
                    </Paper>
                </>
            )}
        </Container>
    </Box>
);
}

export default function AdminRequestDetailPage() {
    return (
        <Suspense
            fallback={
                <Box
                    sx={{
                        minHeight: "70vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <CircularProgress />
                </Box>
            }
        >
            <AdminRequestDetailContent />
        </Suspense>
    );
}
