import { lazy, Suspense, useState } from "react";
import { useI18n } from "@/i18n";
import { HttpTester, WsTester } from "@/components/playground/Playground";
import { Panel, PageIntro, SubNav } from "@/components/ui";

// Socket.IO and SignalR pull in heavy client libraries, so their testers are
// code-split and only downloaded when their tab is opened.
const SocketIoTester = lazy(() => import("../components/playground/SocketIoTester"));
const SignalRTester = lazy(() => import("../components/playground/SignalRTester"));

const TABS = [
  { id: "http", label: "HTTP", El: HttpTester },
  { id: "ws", label: "WebSocket", El: WsTester },
  { id: "socketio", label: "Socket.IO", El: SocketIoTester },
  { id: "signalr", label: "SignalR", El: SignalRTester },
] as const;

export default function PlaygroundPage() {
  const { t } = useI18n();
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("http");
  const Active = TABS.find((tab) => tab.id === active)!.El;

  return (
    <>
      <PageIntro>{t("play.intro")}</PageIntro>

      <SubNav tabs={TABS} active={active} onChange={setActive} />

      <Panel>
        <Suspense fallback={<PageIntro>…</PageIntro>}>
          <Active />
        </Suspense>
      </Panel>
    </>
  );
}
