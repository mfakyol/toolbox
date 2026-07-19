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
