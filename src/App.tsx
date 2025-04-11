import { useEffect, useState } from "react";
import FileAttachment from "./components/home/FileAttachment";
import MessageStats, { Message, MessageStatsOptions, MessageStatsSettings } from "./components/home/MessageStats";
import { getDefaultMessageStatsSettings } from "./lib/message-stats-utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./components/ui/resizable";

function Settings({ setMessages, setSettings, settings }: { setMessages: (messages: Message[]) => void, setSettings: (settings: MessageStatsSettings) => void, settings: MessageStatsSettings }) {
  return (
    <>
      <FileAttachment
        onChange={async (files) => {
          const file = files[0];

          if (!file) {
            return;
          }

          const content = JSON.parse(await file.text());
          
          setMessages(content);
        }}
      />

      <MessageStatsOptions
        onUpdate={(key: keyof MessageStatsSettings, value) => {
          const newSettings = { ...settings, [key]: value };
          setSettings(newSettings);
        }}
      />
    </>
  );
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<MessageStatsSettings>(getDefaultMessageStatsSettings());
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const listener = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", listener);

    return () => {
      window.removeEventListener("resize", listener);
    };
  }, [screenWidth]);

  return screenWidth < 800 ?
  (
    <main className="size-full flex flex-col gap-5">
      <div className="p-5 pb-0 grow-0 shrink-0">
        <Settings setMessages={setMessages} setSettings={setSettings} settings={settings} />
      </div>

      <div className="overflow-auto p-5 pt-0">
        <MessageStats messages={messages} settings={settings} />
      </div>
    </main>
  )
  :
  (
    <ResizablePanelGroup direction="horizontal" className="size-full">
      <ResizablePanel minSize={25} className="p-5">
        <Settings setMessages={setMessages} setSettings={setSettings} settings={settings} />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel minSize={50}>
        <div className="overflow-auto h-full p-5">
          <MessageStats messages={messages} settings={settings} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
