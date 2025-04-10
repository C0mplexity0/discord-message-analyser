import { useState } from "react";
import FileAttachment from "./components/home/FileAttachment";
import MessageStats, { Message } from "./components/home/MessageStats";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <main className="size-full">
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

      <MessageStats messages={messages} />
    </main>
  )
}
