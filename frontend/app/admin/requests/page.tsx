"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import LogoutIcon from "@mui/icons-material/Logout";
import api from "@/lib/api";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type RequestItem = {
  id: number;
  title: string;
  description?: string;
  category?: string;
  status?: string;
  createdDate?: string;
  response?: string | null;
  userName?: string;
  userEmail?: string;
  [key: string]: unknown;
};

type UserData = {
  id?: number;
  name?: string;
  userName?: string;
  role?: string;
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

function getStatusColor(
  status?: string
): "warning" | "success" | "default" {
  if (status === "OPEN") return "warning";
  if (status === "ANSWERED") return "success";
  return "default";
}

export default function AdminRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = async (status = selectedStatus) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.get<RequestItem[]>("/api/requests/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: status === "ALL" ? {} : { status },
      });

      setRequests(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
        router.replace("/login");
        return;
      }

      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError("Bu sayfayı görüntülemek için ADMIN yetkisi gerekiyor.");
        return;
      }

      setError("Destek talepleri yüklenirken bir hata oluştu.");
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
      const user: UserData = JSON.parse(storedUser);

      if (user.role !== "ADMIN") {
        router.replace("/my-requests");
        return;
      }

      void loadRequests("ALL");
    } catch {
      router.replace("/login");
    }
    // Sayfa ilk açıldığında oturum ve rol kontrolü yapılır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    void loadRequests(status);
  };

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
      // Çıkış isteği başarısız olsa bile yerel oturum temizlenir.
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
      router.replace("/login");
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("tr-TR");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fb",
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" color="#172033">
              Admin Paneli
            </Typography>

            <Typography color="text.secondary">
              Destek taleplerini görüntüle ve durumlarını takip et.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push("/my-requests")}
                disabled={loading}
            >
              Taleplerim Sayfasına Dön
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => void loadRequests()}
              disabled={loading}
            >
              Yenile
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Çıkış Yap
            </Button>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: "1px solid #e5e9f2",
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" >
                Destek Talepleri
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {loading
                  ? "Talepler yükleniyor..."
                  : `Toplam ${requests.length} talep`}
              </Typography>
            </Box>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="request-status-label">
                Talep Durumu
              </InputLabel>

              <Select
                labelId="request-status-label"
                value={selectedStatus}
                label="Talep Durumu"
                onChange={(event) =>
                  handleStatusChange(event.target.value)
                }
              >
                <MenuItem value="ALL">Tüm Talepler</MenuItem>
                <MenuItem value="OPEN">Açık</MenuItem>
                <MenuItem value="ANSWERED">Yanıtlandı</MenuItem>
                <MenuItem value="CLOSED">Kapalı</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "1px solid #e5e9f2",
            borderRadius: 3,
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8faff" }}>
                <TableCell>
                  <strong>Talep No</strong>
                </TableCell>
                <TableCell>
                  <strong>Başlık</strong>
                </TableCell>
                <TableCell>
                  <strong>Kategori</strong>
                </TableCell>
                <TableCell>
                  <strong>Oluşturulma Tarihi</strong>
                </TableCell>
                <TableCell>
                  <strong>Durum</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>İşlem</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                    <CircularProgress />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 2 }}
                    >
                      Talepler yükleniyor...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                    <Typography>
                      Bu filtreye uygun talep bulunamadı.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{ "&:last-child td": { borderBottom: 0 } }}
                  >
                    <TableCell>#{item.id}</TableCell>

                    <TableCell>
                      <Typography>
                        {item.title || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {categoryLabels[item.category ?? ""] ??
                        item.category ??
                        "-"}
                    </TableCell>

                    <TableCell>
                      {formatDate(item.createdDate)}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        color={getStatusColor(item.status)}
                        label={
                          statusLabels[item.status ?? ""] ??
                          item.status ??
                          "Bilinmiyor"
                        }
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          router.push(`/admin/requests/${item.id}`)
                        }
                      >
                        Talebi Aç
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
