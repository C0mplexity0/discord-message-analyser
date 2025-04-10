import { getFilteredMessages, getMonthIdFromName, getMonthName, getMonthNameFromId } from "@/lib/message-stats-utils";
import { MonthBarChart } from "../ui/charts/month-bar-chart";
import { Input } from "../ui/input";
import { useState } from "react";
import { Label } from "../ui/label";

export interface Message {
  content: string;
  timestamp: string;
}

interface BaseMessageStatsProps {
  messages: Message[];
}

export default function MessageStats({ messages }: BaseMessageStatsProps) {
  const [filter, setFilter] = useState("");
  const [filterCaseSensitive, setFilterCaseSensitive] = useState(true);
  
  return (
    <div>
      <Label htmlFor="textFilter">Text filter</Label>
      <Input
        id="textFilter"
        name="textFilter"
        type="text"
        onChange={(event) => {
          setFilter(event.target.value);
        }}
      />

      <Label htmlFor="textFilterCaseSensitive">Text filter case sensitive</Label>
      <Input
        id="textFilterCaseSensitive"
        name="textFilterCaseSensitive"
        type="checkbox"
        defaultChecked
        onChange={(event) => {
          setFilterCaseSensitive(event.target.checked);
        }}
      />

      <MessageCountAgainstTime messages={getFilteredMessages(messages, filter, filterCaseSensitive)} />
    </div>
  );
}

function getMessageCountAgainstTimeData(messages: Message[]) {
  const data: { [month: string]: number } = {};
  let startMonth;
  let endMonth;
  
  for (let i=0;i<messages.length;i++) {
    const date = new Date(messages[i].timestamp);
    const month = getMonthName(date.getMonth(), date.getFullYear());
    if (!data[month]) {
      data[month] = 0;
    }

    data[month] += 1;

    const monthId = getMonthIdFromName(month);

    if (!startMonth || (monthId && monthId < startMonth)) {
      startMonth = monthId;
    } else if (!endMonth || (monthId && monthId > endMonth)) {
      endMonth = monthId;
    }
  }

  if (startMonth === undefined || endMonth === undefined) {
    return [];
  }

  const chartData = [];

  for (let i = startMonth; i <= endMonth; i++) {
    const month = getMonthNameFromId(i);
    chartData.push({ month: month, messages: data[month] ? data[month] : 0 });
  }

  chartData.sort((a, b) => {
    const aId = getMonthIdFromName(a.month);
    const bId = getMonthIdFromName(b.month);

    if (!aId || !bId) {
      return 0;
    }

    if (aId < bId) {
      return -1;
    }

    if (aId > bId) {
      return 1;
    }

    return 0;
  });

  return chartData;
}

function MessageCountAgainstTime({ messages }: BaseMessageStatsProps) {
  return (
    <div>
      <MonthBarChart title="Message Frequency" chartData={getMessageCountAgainstTimeData(messages)} />
    </div>
  )
}
