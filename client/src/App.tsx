import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import ImagePage from "./pages/ImagePage";
import FontPage from "./pages/FontPage";
import FaviconPage from "./pages/FaviconPage";
import ToolsPage from "./pages/ToolsPage";

// The JSON page is lazy-loaded because CodeMirror is heavy.
const JsonTsPage = lazy(() => import("./pages/JsonTsPage"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ImagePage />} />
          <Route path="font" element={<FontPage />} />
          <Route path="favicon" element={<FaviconPage />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route
            path="json"
            element={
              <Suspense fallback={<p className="page-intro">…</p>}>
                <JsonTsPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
