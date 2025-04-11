import { useState } from "react";
import FileAttachment from "./components/home/FileAttachment";
import MessageStats, { Message, MessageStatsOptions, MessageStatsSettings } from "./components/home/MessageStats";
import { getDefaultMessageStatsSettings } from "./lib/message-stats-utils";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<MessageStatsSettings>(getDefaultMessageStatsSettings());

  return (
    <main className="size-full flex flex-col md:flex-row gap-5">
      <div className="p-5 pb-0 md:pb-5 grow-0 shrink-0 md:basis-80 lg:basis-100 md:pr-0">
        <div className="border rounded-xl w-full md:h-full p-5">
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
        </div>
      </div>

      <div className="overflow-auto p-5 pt-0 md:pt-5 md:pl-0">
        <MessageStats messages={messages} settings={settings} />
      </div>
    </main>
  )
}
