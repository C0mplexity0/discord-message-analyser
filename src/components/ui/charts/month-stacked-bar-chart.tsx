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
import { setupUserColour } from "@/lib/message-stats-utils"

const chartConfig: { [x: string]: {
  label?: React.ReactNode;
  color?: string;
} } = {} satisfies ChartConfig

export interface MonthStackedBarChartData {
  month: string;
  [username: string]: number | string;
}

export function MonthStackedBarChart({ chartData, title }: { chartData: MonthStackedBarChartData[], title: string }) {
  const authors: string[] = [];
  
  for (let i=0;i<chartData.length;i++) {
    for (const key in chartData[i]) {
      if (key === "month") {
        continue;
      }

      if (!authors.includes(key)) {
        authors.push(key);
        setupUserColour(key);
      }

      if (!chartConfig[key]) {
        chartConfig[key] = {
          label: key === "Other" ? key : "@" + key,
          color: `var(--chart-user-${key})`
        }
      }
    }
  }
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
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
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {
              authors.map((val, i) => {
                return (
                  <Bar
                    key={i}
                    dataKey={val}
                    stackId="a"
                    fill={`var(--color-${val})`}
                    radius={[0, 0, 0, 0]}
                  />
                );
              })
            }
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
