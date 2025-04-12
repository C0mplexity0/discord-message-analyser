import { Message, MessageStatsSettings } from "@/components/home/MessageStats";
import { MonthBarChartData } from "@/components/ui/charts/month-bar-chart";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

export function getFilteredMessages(messages: Message[], filter: string, filterCaseSensitive: boolean = true) {
  const newMessages = [];
  const newFilter = filterCaseSensitive ? filter : filter.toLowerCase();

  for (let i=0;i<messages.length;i++) {
    const content = filterCaseSensitive ? messages[i].content : messages[i].content.toLowerCase();
    if (content.includes(newFilter)) {
      newMessages.push(messages[i]);
    }
  }

  return newMessages;
}

export function getTotalMessagesFromChartData(chartData: MonthBarChartData[]) {
  let total = 0;
  
  for (const month in chartData) {
    total += chartData[month].messages;
  }

  return total;
}

export function getMonthId(month: number, year: number) {
  return (year * 12) + month;
}

export function getMonthName(month: number, year: number) {
  return MONTH_NAMES[month] + " " + year;
}

export function getMonthIdFromName(monthName: string) {
  const sections = monthName.split(" ");

  if (sections.length < 2) {
    return;
  }

  const year = parseInt(sections[1]);
  const month = MONTH_NAMES.indexOf(sections[0]);

  return getMonthId(month, year);
}

export function getMonthNameFromId(id: number) {
  const month = id % 12;
  const year = (id - month) / 12;

  return getMonthName(month, year);
}

let userColourCount = 0;

export function setupUserColour(username: string) {
  if (document.body.style.getPropertyValue("--chart-user-" + username.replace("@", "")))
    return;

  if (username === "Other") {
    document.body.style.setProperty("--chart-user-Other", "var(--chart-gray)");
    return;
  }

  document.body.style.setProperty("--chart-user-" + username.replace("@", ""), `var(--chart-${(userColourCount % 8) + 1})`);
  userColourCount++;
}

export function getDefaultMessageStatsSettings(): MessageStatsSettings {
  return {
    textFilter: "",
    textFilterCaseSensitive: false,
    autoUpdate: false
  };
}
