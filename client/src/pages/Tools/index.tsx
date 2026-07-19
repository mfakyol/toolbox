import { Navigate, useParams } from "react-router-dom";
import {
  JsonTool,
  DiffTool,
  Base64Tool,
  UrlTool,
  JwtTool,
  HashTool,
  UuidTool,
} from "@/components/devtools/DevTools";
import { Panel } from "@/components/ui";

// Each dev tool is its own route (/tools/<id>); this thin page renders the one
// named by the URL param. The sidebar links to each individually.
const TOOLS = {
  base64: Base64Tool,
  url: UrlTool,
  jwt: JwtTool,
  hash: HashTool,
  uuid: UuidTool,
  diff: DiffTool,
  json: JsonTool,
} as const;

export default function ToolPage() {
  const { tool = "" } = useParams();
  const Tool = (TOOLS as Record<string, (typeof TOOLS)[keyof typeof TOOLS]>)[tool];
  if (!Tool) return <Navigate to="/tools/base64" replace />;
  return (
    <Panel>
      <Tool />
    </Panel>
  );
}
