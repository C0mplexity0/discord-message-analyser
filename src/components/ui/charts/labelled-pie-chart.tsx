"use client"

import { Pie, PieChart } from "recharts"

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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

const chartConfig: { [x: string]: {
  label?: React.ReactNode;
  icon?: React.ComponentType;
} } = {
  messages: {
    label: "Messages",
  },
} satisfies ChartConfig

export function LabelledPieChart({ chartData }: { chartData: { username: string, messages: number, fill?: string }[] }) {
  for (let i=0;i<chartData.length;i++) {
    if (!chartData[i].fill)
      chartData[i].fill = `var(--chart-${(i % 5) + 1})`;
    
    chartConfig[chartData[i].username] = {label: chartData[i].username};
  }
  
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Legend</CardTitle>
        <CardDescription>All time</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <Pie data={chartData} dataKey="messages" />
            <ChartLegend
              content={
                <ChartLegendContent 
                  nameKey="username"
                  
                />
              }
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
