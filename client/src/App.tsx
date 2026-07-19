import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { RequireAuth, RequireAdmin } from "./layouts/guards";
import ImagePage from "./pages/Image";
import FontPage from "./pages/Font";
import FaviconPage from "./pages/Favicon";
import QrPage from "./pages/Qr";
import ToolsPage from "./pages/Tools";
import LoginPage from "./pages/Login";
import ChangePasswordPage from "./pages/ChangePassword";
import AdminUsersPage from "./pages/AdminUsers";
import SecretPage from "./pages/Secret";
import SecretViewPage from "./pages/SecretView";
import TransferPage from "./pages/Transfer";
import TransferDownloadPage from "./pages/TransferDownload";

// The JSON page is lazy-loaded because CodeMirror is heavy.
const JsonTsPage = lazy(() => import("./pages/JsonTs"));
// The playground pulls in ws / socket.io / signalr clients — keep it out of
// the main bundle.
const PlaygroundPage = lazy(() => import("./pages/Playground"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public / pre-app routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        {/* One-time secret view link — public (per-secret login may still apply) */}
        <Route path="/s/:token" element={<SecretViewPage />} />
        {/* File-transfer download page — public (per-transfer login may still apply) */}
        <Route path="/t/:token" element={<TransferDownloadPage />} />

        {/* Everything below requires a logged-in, password-changed user */}
        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>
            <Route index element={<ImagePage />} />
            <Route path="font" element={<FontPage />} />
            <Route path="favicon" element={<FaviconPage />} />
            <Route path="qr" element={<QrPage />} />
            <Route path="tools/:tool" element={<ToolsPage />} />
            <Route path="tools" element={<Navigate to="/tools/base64" replace />} />
            <Route path="secret" element={<SecretPage />} />
            <Route path="transfer" element={<TransferPage />} />
            <Route
              path="playground"
              element={
                <Suspense fallback={<p className="page-intro">…</p>}>
                  <PlaygroundPage />
                </Suspense>
              }
            />
            <Route
              path="json"
              element={
                <Suspense fallback={<p className="page-intro">…</p>}>
                  <JsonTsPage />
                </Suspense>
              }
            />
            <Route element={<RequireAdmin />}>
              <Route path="admin/users" element={<AdminUsersPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
