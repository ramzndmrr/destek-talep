"use client";

import { Suspense, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";

import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import api from "../../../lib/api";

type RequestItem = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: "OPEN" | "ANSWERED" | "CLOSED";
  adminResponse?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function RequestDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<RequestItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchRequest = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await api.get(`/api/requests/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!cancelled) {
            console.log("TALep DETAY API:", response.data);
            console.log("ADMIN YANITI:", response.data.adminResponse);
          setItem(response.data);
        }
      } catch (err: unknown) {
        if (cancelled) return;

        if (axios.isAxiosError(err)) {
          console.error(
            "Talep detay hatası:",
            err.response?.status,
            err.response?.data || err.message
          );

          if (err.response?.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userData");
            router.replace("/login");
            return;
          }

          setError(
            err.response?.status === 404
              ? "Talep bulunamadı veya bu talebi görüntüleme yetkiniz yok."
              : `Talep yüklenemedi. HTTP: ${
    err.response?.status ?? "Bağlantı hatası"
}`
          );
        } else {
          setError("Beklenmeyen bir hata oluştu.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchRequest();
    }

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  const statuses = {
    OPEN: { label: "Açık", color: "warning" as const },
    ANSWERED: { label: "Yanıtlandı", color: "success" as const },
    CLOSED: { label: "Kapalı", color: "default" as const },
  };

  const dateText = (value?: string) =>
    value
      ? new Date(value).toLocaleString("tr-TR", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Belirtilmemiş";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4f7fb",
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/my-requests")}
          sx={{ mb: 3, textTransform: "none" }}
        >
          Taleplerime Dön
        </Button>

        <Stack
          direction="row"
          spacing={2}
          sx={{ mb: 4, alignItems: "center" }}
        >
          <Avatar
            sx={{
              width: 54,
              height: 54,
              bgcolor: "#2563eb",
              borderRadius: 3,
            }}
          >
            <ConfirmationNumberOutlinedIcon sx={{ fontSize: 30 }} />
          </Avatar>

          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: "#172554" }}
            >
              Talep Detayı
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Talebinizin durumunu ve destek yanıtlarını görüntüleyin.
            </Typography>
          </Box>
        </Stack>

        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && !item && (
          <Alert severity="info">Talep bilgisi bulunamadı.</Alert>
        )}

        {!loading && item && (
          <Stack spacing={3}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                <Stack spacing={2.5}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        color: "#172554",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Chip
                      label={statuses[item.status]?.label ?? item.status}
                      color={statuses[item.status]?.color ?? "default"}
                    />
                  </Stack>

                  <Divider />

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Talep numarası
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      #{item.id}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Kategori
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {item.category.replaceAll("_", " ")}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Oluşturulma tarihi
                    </Typography>
                    <Typography>{dateText(item.createdAt)}</Typography>
                  </Box>

                  {item.updatedAt && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Son güncelleme
                      </Typography>
                      <Typography>{dateText(item.updatedAt)}</Typography>
                    </Box>
                  )}

                  <Divider />

                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 750, mb: 1 }}
                    >
                      Talep açıklaması
                    </Typography>

                    <Typography
                      sx={{
                        color: "#334155",
                        lineHeight: 1.9,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ mb: 2, alignItems: "center" }}
                >
                  <Avatar sx={{ bgcolor: "#eff6ff", color: "#2563eb" }}>
                    <SupportAgentIcon />
                  </Avatar>

                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 750, color: "#172554" }}
                  >
                    Destek ekibinin yanıtı
                  </Typography>
                </Stack>

                {item.adminResponse ? (
                  <Alert
                    severity="success"
                    sx={{
                      alignItems: "flex-start",
                      "& .MuiAlert-message": {
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                        lineHeight: 1.8,
                      },
                    }}
                  >
                    {item.adminResponse}
                  </Alert>
                ) : (
                  <Alert
                    severity={item.status === "CLOSED" ? "info" : "warning"}
                  >
                    {item.status === "CLOSED"
                      ? "Bu talep kapatılmış. Kayıtlı bir destek yanıtı bulunmuyor."
                      : "Destek ekibimiz henüz yanıt vermedi."}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Stack>
        )}
      </Container>
    </Box>
  );
}

export default function RequestDetailPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <RequestDetailContent />
    </Suspense>
  );
}
