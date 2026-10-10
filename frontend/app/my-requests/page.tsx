"use client";

import { useEffect, useState } from "react";
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
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LogoutIcon from "@mui/icons-material/Logout";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import { useRouter } from "next/navigation";
import axios from "axios";
import api from "../../lib/api";

type RequestItem = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: "OPEN" | "ANSWERED" | "CLOSED";
  adminResponse?: string | null;
    createdDate?: string;
};

export default function MyRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
    let cancelled = false;

    const fetchRequests = async () => {
      const token = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("userData");

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);

                if (!cancelled) {
                    setIsAdmin(user.role === "ADMIN");
                }
            } catch {
                if (!cancelled) {
                    setIsAdmin(false);
                }
            }
        }

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await api.get("/api/requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!cancelled) {
          setRequests(response.data);
        }
      } catch (err: unknown) {
        if (cancelled) return;

        if (axios.isAxiosError(err)) {
          console.error(
            "Talepler API hatası:",
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
        }

        setError("Talepler yüklenemedi. Lütfen tekrar deneyin.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRequests();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      if (token) {
        await api.post(
          "/api/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch {
      // Çıkış isteği başarısız olsa da yerel oturumu kapat.
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");

    router.replace("/login");
  };

  const statusConfig = {
    OPEN: { label: "Açık", color: "warning" as const },
    ANSWERED: { label: "Yanıtlandı", color: "success" as const },
    CLOSED: { label: "Kapalı", color: "default" as const },
  };

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleString("tr-TR", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4f7fb",
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          {/* Sayfa başlığı */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: "center" }}
            >
              <Avatar
                sx={{
                  width: 54,
                  height: 54,
                  bgcolor: "#2563eb",
                  borderRadius: 3,
                }}
              >
                <SupportAgentIcon sx={{ fontSize: 31 }} />
              </Avatar>

              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: "#172554",
                    lineHeight: 1.3,
                  }}
                >
                  Destek Taleplerim
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: "#64748b", mt: 0.5 }}
                >
                  Taleplerinizi görüntüleyin ve yanıtları takip edin.
                </Typography>
              </Box>
            </Stack>

              <Stack direction="row" >
                  {isAdmin && (
                      <Button
                          variant="contained"
                          onClick={() => router.push("/admin/requests")}
                          sx={{
                              bgcolor: "#2563eb",
                              color: "#fff",
                              borderRadius: 2,
                              px: 2,
                              py: 1,
                              textTransform: "none",
                              fontWeight: 700,
                              boxShadow: "none",
                              whiteSpace: "nowrap",
                              "&:hover": {
                                  bgcolor: "#1d4ed8",
                                  boxShadow: "none",
                              },
                          }}
                      >
                          Admin Paneli
                      </Button>
                  )}

                  <Button
                      startIcon={<LogoutIcon />}
                      onClick={handleLogout}
                      variant="outlined"
                      sx={{
                          borderColor: "#dbe3ef",
                          color: "#475569",
                          bgcolor: "#fff",
                          borderRadius: 2,
                          px: 2,
                          py: 1,
                          textTransform: "none",
                          whiteSpace: "nowrap",
                      }}
                  >
                      Çıkış Yap
                  </Button>
              </Stack>
          </Stack>

          {/* Talep merkezi */}
          <Card
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: 3,
              bgcolor: "#fff",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  justifyContent: "space-between",
                  alignItems: { xs: "stretch", sm: "center" },
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 750, color: "#172554" }}
                  >
                    Talep merkezi
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", mt: 0.5 }}
                  >
                    {loading
                      ? "Talepleriniz yükleniyor..."
                      : `Toplam ${requests.length} talebiniz bulunuyor.`}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push("/requests/create")}
                  sx={{
                    minHeight: 44,
                    px: 2.5,
                    borderRadius: 2,
                    bgcolor: "#2563eb",
                    boxShadow: "none",
                    textTransform: "none",
                    fontWeight: 700,
                    "&:hover": {
                      bgcolor: "#1d4ed8",
                      boxShadow: "none",
                    },
                  }}
                >
                  Yeni Talep Oluştur
                </Button>
              </Stack>
            </CardContent>
          </Card>

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

          {/* Boş liste */}
          {!loading && !error && requests.length === 0 && (
            <Card
              elevation={0}
              sx={{
                border: "1px dashed #cbd5e1",
                borderRadius: 3,
                textAlign: "center",
              }}
            >
              <CardContent sx={{ py: { xs: 5, sm: 7 } }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mx: "auto",
                    mb: 2,
                    bgcolor: "#eff6ff",
                    color: "#2563eb",
                  }}
                >
                  <SupportAgentIcon sx={{ fontSize: 32 }} />
                </Avatar>

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 750, color: "#172554" }}
                >
                  Henüz destek talebiniz yok
                </Typography>

                <Typography sx={{ mt: 1, mb: 3, color: "#64748b" }}>
                  İlk talebinizi oluşturarak destek ekibimizle iletişime
                  geçebilirsiniz.
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push("/requests/create")}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                >
                  İlk Talebini Oluştur
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Talepler tablosu */}
          {!loading && !error && requests.length > 0 && (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                overflowX: "auto",
              }}
            >
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 750, color: "#475569" }}>
                      Talep No
                    </TableCell>

                    <TableCell sx={{ fontWeight: 750, color: "#475569" }}>
                      Başlık
                    </TableCell>

                    <TableCell sx={{ fontWeight: 750, color: "#475569" }}>
                      Kategori
                    </TableCell>

                    <TableCell sx={{ fontWeight: 750, color: "#475569" }}>
                      Oluşturulma Tarihi
                    </TableCell>

                    <TableCell sx={{ fontWeight: 750, color: "#475569" }}>
                      Durum
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{ fontWeight: 750, color: "#475569" }}
                    >
                      İşlem
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {requests.map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{
                        "&:last-child td": { borderBottom: 0 },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>
                        #{item.id}
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 650,
                          color: "#172554",
                          maxWidth: 220,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {item.title}
                      </TableCell>

                      <TableCell sx={{ color: "#475569" }}>
                        {item.category.replaceAll("_", " ")}
                      </TableCell>

                      <TableCell
                        sx={{
                          color: "#64748b",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(item.createdDate)}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            statusConfig[item.status]?.label ?? item.status
                          }
                          color={
                            statusConfig[item.status]?.color ?? "default"
                          }
                          size="small"
                          sx={{ fontWeight: 700, minWidth: 90 }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VisibilityOutlinedIcon />}
                          onClick={() =>
                            router.push(`/my-requests/${item.id}`)
                          }
                          sx={{
                            borderRadius: 2,
                            bgcolor: "#2563eb",
                            boxShadow: "none",
                            textTransform: "none",
                            whiteSpace: "nowrap",
                            "&:hover": {
                              bgcolor: "#1d4ed8",
                              boxShadow: "none",
                            },
                          }}
                        >
                          Talep Detayı
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
