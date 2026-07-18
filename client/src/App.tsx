import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { RequireAuth, RequireAdmin } from "./layouts/guards";
import ImagePage from "./pages/ImagePage";
import FontPage from "./pages/FontPage";
import FaviconPage from "./pages/FaviconPage";
import QrPage from "./pages/QrPage";
import ToolsPage from "./pages/ToolsPage";
import LoginPage from "./pages/LoginPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import SecretPage from "./pages/SecretPage";
import SecretViewPage from "./pages/SecretViewPage";
import TransferPage from "./pages/TransferPage";
import TransferDownloadPage from "./pages/TransferDownloadPage";

// The JSON page is lazy-loaded because CodeMirror is heavy.
const JsonTsPage = lazy(() => import("./pages/JsonTsPage"));
// The playground pulls in ws / socket.io / signalr clients — keep it out of
// the main bundle.
const PlaygroundPage = lazy(() => import("./pages/PlaygroundPage"));

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
            <Route path="tools" element={<ToolsPage />} />
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
