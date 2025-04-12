import { useEffect, useState } from "react";
import FileAttachment from "./components/home/FileAttachment";
import MessageStats, { Message, MessageStatsOptions, MessageStatsSettings } from "./components/home/MessageStats";
import { getDefaultMessageStatsSettings, getFilteredMessages } from "./lib/message-stats-utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./components/ui/resizable";

function Settings({ setFilteredMessages }: { setFilteredMessages: (messages: Message[]) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<MessageStatsSettings>(getDefaultMessageStatsSettings());

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
          setFilteredMessages(getFilteredMessages(content, settings.textFilter, settings.textFilterCaseSensitive));
        }}
      />

      <MessageStatsOptions settings={settings} setSettings={setSettings} setFilteredMessages={setFilteredMessages} messages={messages} />
    </>
  );
}

export default function App() {
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
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
        <Settings setFilteredMessages={setFilteredMessages} />
      </div>

      <div className="overflow-auto p-5 pt-0">
        <MessageStats filteredMessages={filteredMessages} />
      </div>
    </main>
  )
  :
  (
    <ResizablePanelGroup direction="horizontal" className="size-full">
      <ResizablePanel minSize={15} className="p-5">
        <Settings setFilteredMessages={setFilteredMessages} />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel minSize={50} defaultSize={75}>
        <div className="overflow-auto h-full p-5">
          <MessageStats filteredMessages={filteredMessages} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
