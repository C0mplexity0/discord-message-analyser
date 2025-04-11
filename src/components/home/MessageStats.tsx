import { getFilteredMessages, getMonthIdFromName, getMonthName, getMonthNameFromId } from "@/lib/message-stats-utils";
import { MonthBarChart } from "../ui/charts/month-bar-chart";
import { Input } from "../ui/input";
import { ReactNode, useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { Card } from "../ui/card";
import { LabelledPieChart } from "../ui/charts/labelled-pie-chart";

export interface Message {
  content: string;
  timestamp: string;
  author: { id: string, username: string };
}

interface BaseMessageStatsProps {
  messages: Message[];
}

function MessageStatContainer({ children }: { children: ReactNode }) {
  return (
    <div style={{width: "calc(50% - (2.5 * var(--spacing)))"}} className="aspect-video">
      {children}
    </div>
  )
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

      <div className="flex flex-grid flex-wrap gap-5">
        <MessageStatContainer>
          <MessageCountAgainstTime messages={filteredMessages} />
        </MessageStatContainer>
        <MessageStatContainer>
          <MessageDisplay messages={filteredMessages} />
        </MessageStatContainer>
        <MessageStatContainer>
          <UserPieChart messages={filteredMessages} />
        </MessageStatContainer>
      </div>
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
    <Card className="p-4 h-full flex flex-col gap-4 overflow-hidden">
      <div className="overflow-auto">
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
    </Card>
  );
}

function UserPieChart({ messages }: BaseMessageStatsProps) {
  const authors: { [id: string]: string } = {};
  const messagesByAuthor: { [id: string]: number } = {};

  for (let i=0;i<messages.length;i++) {
    const authorId = messages[i].author.id;
    
    if (messagesByAuthor[authorId] === undefined) {
      messagesByAuthor[authorId] = 0;
    }

    messagesByAuthor[authorId] += 1;
    authors[authorId] = "@" + messages[i].author.username;
  }

  let otherMessages = 0;

  const chartData = [];

  for (const author in messagesByAuthor) {
    if (messagesByAuthor[author] / messages.length < 0.05) {
      otherMessages += messagesByAuthor[author];
      continue;
    }

    chartData.push({ username: authors[author], messages: messagesByAuthor[author] });
  }

  if (otherMessages > 0) {
    chartData.push({ username: "Other", messages: otherMessages, fill: "var(--chart-gray)" });
  }

  return (
    <LabelledPieChart chartData={chartData} />
  );
}
