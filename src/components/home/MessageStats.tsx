import { getFilteredMessages, getMonthId, getMonthNameFromId } from "@/lib/message-stats-utils";
import { Input } from "../ui/input";
import { ReactNode, useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { Card } from "../ui/card";
import { LabelledPieChart } from "../ui/charts/labelled-pie-chart";
import { MonthStackedBarChart } from "../ui/charts/month-stacked-bar-chart";
import { Link, Tag } from "lucide-react";
import { Button } from "../ui/button";
import styles from "./MessageStats.module.css";

export interface Message {
  content: string;
  timestamp: string;
  author: { id: string, username: string, "global_name": string };
  attachments: string[];
}

interface BaseMessageStatsProps {
  messages: Message[];
}

export interface MessageStatsSettings {
  textFilter: string;
  textFilterCaseSensitive: boolean;
  autoUpdate: boolean;
}

function MessageStatContainer({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.messageStatContainer} aspect-[4/3]`}>
      {children}
    </div>
  )
}

export function MessageStatsOptions({ setFilteredMessages, messages, settings, setSettings, setFilter }: { setFilteredMessages: (messages: Message[]) => void, messages: Message[], settings: MessageStatsSettings, setSettings: (settings: MessageStatsSettings) => void, setFilter: (filter: string) => void }) {

  useEffect(() => {
    if (settings.autoUpdate) {
      setFilter(settings.textFilter);
      setFilteredMessages(getFilteredMessages(messages, settings.textFilter, settings.textFilterCaseSensitive));
    }
  }, [messages, setFilteredMessages, settings, setFilter]);

  return (
    <>
      <Label htmlFor="textFilter">Text filter</Label>
      <Input
        id="textFilter"
        name="textFilter"
        type="text"
        onChange={(event) => {
          const settingsCopy = { ...settings };
          settingsCopy["textFilter"] = event.target.value;
          setSettings(settingsCopy);
        }}
      />

      <Label htmlFor="textFilterCaseSensitive">Text filter case sensitive</Label>
      <Input
        id="textFilterCaseSensitive"
        name="textFilterCaseSensitive"
        type="checkbox"
        defaultChecked={false}
        onChange={(event) => {
          const settingsCopy = { ...settings };
          settingsCopy["textFilterCaseSensitive"] = event.target.checked;
          setSettings(settingsCopy);
        }}
      />

      <Label htmlFor="autoUpdate">Auto update</Label>
      <Input
        id="autoUpdate"
        name="autoUpdate"
        type="checkbox"
        defaultChecked={false}
        onChange={(event) => {
          const settingsCopy = { ...settings };
          settingsCopy["autoUpdate"] = event.target.checked;
          setSettings(settingsCopy);
        }}
      />


      <Button
        disabled={settings.autoUpdate}
        onClick={() => {
          if (!settings.autoUpdate) {
            setFilter(settings.textFilter);
            setFilteredMessages(getFilteredMessages(messages, settings.textFilter, settings.textFilterCaseSensitive));
          }
        }}
      >Search Messages</Button>
    </>
  )
}

export default function MessageStats({ filteredMessages, filter }: { filteredMessages: Message[], filter: string }) {
  return (
    <div>
      <div className="flex flex-grid flex-wrap gap-5">
        <MessageStatContainer>
          <MessageDisplay messages={filteredMessages} filter={filter} />
        </MessageStatContainer>
        <MessageStatContainer>
          <MessageCountAgainstTime messages={filteredMessages} />
        </MessageStatContainer>
        <MessageStatContainer>
          <UserPieChart messages={filteredMessages} />
        </MessageStatContainer>
      </div>
    </div>
  );
}

function getMessageCountAgainstTimeData(messages: Message[]) {
  const authors: { [id: string]: string } = {};
  const data: { [id: string]: number }[] = [];
  let startMonth;
  let endMonth;
  
  for (let i=0;i<messages.length;i++) {
    const authorId = messages[i].author.id;
    authors[authorId] = messages[i].author.username;
    const date = new Date(messages[i].timestamp);
    const month = getMonthId(date.getMonth(), date.getFullYear());
    if (data[month] === undefined) {
      data[month] = {};
    }
    if (data[month][authorId] === undefined) {
      data[month][authorId] = 0;
    }

    data[month][authorId] += 1;

    if (!startMonth || month < startMonth) {
      startMonth = month;
    }
    if (!endMonth || month > endMonth) {
      endMonth = month;
    }
  }

  if (startMonth === undefined || endMonth === undefined) {
    return [];
  }

  const chartData = [];

  for (let i = startMonth; i <= endMonth; i++) {
    const currentData: { month: string, [id: string]: number | string } = { month: getMonthNameFromId(i) };

    if (!data[i]) {
      chartData.push(currentData);
      continue;
    }

    let total = 0;

    for (const userId in data[i]) {
      total += data[i][userId];
    }

    let otherTotal = 0;
    
    for (const userId in data[i]) {
      if (data[i][userId] / total < 0.05) {
        otherTotal += data[i][userId];
        continue;
      }

      currentData[authors[userId]] = data[i][userId];
    }

    if (otherTotal > 0) {
      currentData["Other"] = otherTotal;
    }

    chartData.push(currentData);
  }

  chartData.sort((a, b) => {
    if (a < b) {
      return -1;
    }

    if (a > b) {
      return 1;
    }

    return 0;
  });

  return chartData;
}

function MessageCountAgainstTime({ messages }: BaseMessageStatsProps) {
  return (
    <MonthStackedBarChart title="Message Frequency" chartData={getMessageCountAgainstTimeData(messages)} />
  );
}

function MessageDisplayMessageText({ message, filter }: { message: Message, filter: string }) {
  const locations: number[] = [];

  const messageContentLowerCase = message.content.toLowerCase();
  let searchStart = 0;

  while (messageContentLowerCase.indexOf(filter.toLowerCase(), searchStart) > -1 && filter !== "") {
    const index = messageContentLowerCase.indexOf(filter.toLowerCase(), searchStart);
    locations.push(index);
    searchStart = index + filter.length;
  }

  let currentLocation = 0;
  const currentText: { type: number, content: string }[] = [];

  for (let i=0;i<locations.length;i++) {
    if (currentLocation !== locations[i]) {
      currentText.push({ type: 0, content: message.content.substring(currentLocation - 1, locations[i]) });
    }
    currentText.push({ type: 1, content: message.content.substring(locations[i], locations[i] + filter.length) });
    currentLocation = locations[i] + filter.length + 1;
  }

  console.log(message.content);
  console.log(locations);
  console.log(currentText);
  
  return (
    <span className="text-secondary-foreground max-w-full wrap-break-word">
      {
        currentText.map((val, i) => {
          if (val.type === 0) {
            console.log(val.content);
            return <span key={i}>{val.content}</span>;
          } else {
            return <span key={i} className="bg-amber-400/20">{val.content}</span>;
          }
        })
      }
    </span>
  );
}

function MessageDisplayMessage({ message, filter }: { message: Message, filter: string }) {
  const linkRegex = /https:\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])/;
  const foundLinks = message.content.match(linkRegex);
  let isTenorGif = false;
  if (foundLinks && foundLinks[1] && foundLinks[1] === "tenor.com") {
    isTenorGif = foundLinks[0] === message.content;
  }

  return (
    <div className="flex flex-col p-2 pt-1.5 pb-1.5 bg-secondary/90 rounded-md">
      <span className="font-semibold">{message.author["global_name"]}</span>
      {!isTenorGif ? <MessageDisplayMessageText message={message} filter={filter} /> : ""}
      {
        message.attachments.length > 0 ? 
        <div className="rounded-sm bg-accent flex flex-row p-1 pl-1.5 pr-2 gap-1 w-fit mt-1">
          <Tag className="w-5 h-5 p-0.5" />
          <span className="text-sm w-fit inline-block">{`${message.attachments.length} attachments`}</span>
        </div>
        : ""
      }
      {
        isTenorGif ?
        <div className="rounded-sm bg-accent flex flex-row p-1 pl-1.5 pr-2 gap-1 w-fit mt-1">
          <Link className="w-5 h-5 p-0.5" />
          <a href={foundLinks ? foundLinks[0] : ""} target="_blank" className="text-sm w-fit inline-block">Gif</a>
        </div>
        : ""
      }
    </div>
  );
}

function MessageDisplay({ messages, filter }: BaseMessageStatsProps & { filter: string }) {
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
      <div className="overflow-auto flex flex-col gap-2">
        {selectedMessages.map((value, i) => {
          return <MessageDisplayMessage filter={filter} message={value} key={i} />;
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
                <PaginationItem key={i}>
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
    chartData.push({ username: "Other", messages: otherMessages});
  }

  return (
    <LabelledPieChart chartData={chartData} title="Message Distribution" />
  );
}
