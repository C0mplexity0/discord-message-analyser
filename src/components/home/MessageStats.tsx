export interface Message {
  content: string;
}

interface BaseMessageStatsProps {
  messages: Message[];
}

export default function MessageStats({ messages }: BaseMessageStatsProps) {
  return (
    <div>
      <MessageCount messages={messages} />
    </div>
  );
}

function MessageCount({ messages }: BaseMessageStatsProps) {
  return (
    <div>
      <h1>Message count {messages.length}</h1>
    </div>
  )
}
