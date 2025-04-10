"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getTotalMessagesFromChartData } from "@/lib/message-stats-utils"

const chartConfig = {
  messages: {
    label: "Messages",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export interface MonthBarChartData {
  month: string;
  messages: number;
}

export function MonthBarChart({ chartData, title }: { chartData: MonthBarChartData[], title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{chartData[0] ? (chartData[0].month + " - " + chartData[chartData.length-1].month + " (" + getTotalMessagesFromChartData(chartData) + " results)") : "No data"}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="messages" fill="var(--color-messages)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}