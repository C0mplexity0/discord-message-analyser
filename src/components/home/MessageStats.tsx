import { getFilteredMessages, getMonthIdFromName, getMonthName, getMonthNameFromId } from "@/lib/message-stats-utils";
import { MonthBarChart } from "../ui/charts/month-bar-chart";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";

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

  const filteredMessages = getFilteredMessages(messages, filter, filterCaseSensitive);
  
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

      <MessageCountAgainstTime messages={filteredMessages} />

      <MessageDisplay messages={filteredMessages} />
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
    if (data[month] === undefined) {
      data[month] = 0;
    }

    data[month] += 1;

    const monthId = getMonthIdFromName(month);

    if (!startMonth || (monthId && monthId < startMonth)) {
      startMonth = monthId;
    }
    if (!endMonth || (monthId && monthId > endMonth)) {
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

function MessageDisplay({ messages }: BaseMessageStatsProps) {
  const [page, setPage] = useState(1);
  const DISPLAYED_AT_ONCE = 50;
  
  const selectedMessages = [];
  for (let i=(DISPLAYED_AT_ONCE * (page-1));i<Math.min(messages.length, DISPLAYED_AT_ONCE * page);i++) {
    selectedMessages.push(messages[i]);
  }

  useEffect(() => {
    setPage(1);
  }, [messages]);

  let pageLinks = [
    page - 1,
    page,
    page + 1
  ];

  if (page === 1) {
    pageLinks = [
      page,
      page + 1,
      page + 2
    ]
  }

  const newPageLinks = [];

  for (let i=0;i<pageLinks.length;i++) {
    if (pageLinks[i] <= Math.ceil(messages.length / DISPLAYED_AT_ONCE))
      newPageLinks.push(pageLinks[i]);
  }

  pageLinks = newPageLinks;

  return (
    <div className="p-4 bg-card border rounded-lg flex flex-col gap-4">
      <div className="h-60 overflow-auto">
        {selectedMessages.map((value, i) => {
          return <p key={i} className={`${i % 2 === 0 ? "bg-secondary/40" : ""} p-2 rounded-lg`}>{value.content}</p>;
        })}
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              disabled={page <= 1}
              onClick={() => {
                if (page > 1)
                  setPage(page - 1);
              }} 
            />
          </PaginationItem>

          {
            pageLinks.map((val, i) => {
              return (
                <PaginationItem>
                  <PaginationLink 
                    key={i}
                    onClick={() => {
                      setPage(val);
                    }}
                    isActive={page === val}
                  >{val}</PaginationLink>
                </PaginationItem>
              )
            })
          }

          <PaginationItem>
            <PaginationNext 
              disabled={page >= Math.ceil(messages.length / DISPLAYED_AT_ONCE)}
              onClick={() => {
                if (page < (messages.length / DISPLAYED_AT_ONCE))
                  setPage(page + 1);
              }} 
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
