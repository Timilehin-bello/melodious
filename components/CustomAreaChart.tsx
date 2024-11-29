"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const chartData = [
  { date: "2024-04-01", income: 222 },
  { date: "2024-04-02", income: 97 },
  { date: "2024-04-03", income: 167 },
  { date: "2024-04-04", income: 242 },
  { date: "2024-04-05", income: 373 },
  { date: "2024-04-06", income: 301 },
  { date: "2024-04-07", income: 245 },
  { date: "2024-04-08", income: 409 },
  { date: "2024-04-09", income: 59 },
  { date: "2024-04-10", income: 261 },
  { date: "2024-04-11", income: 327 },
  { date: "2024-04-12", income: 292 },
  { date: "2024-04-13", income: 342 },
  { date: "2024-04-14", income: 137 },
  { date: "2024-04-15", income: 120 },
  { date: "2024-04-16", income: 138 },
  { date: "2024-04-17", income: 446 },
  { date: "2024-04-18", income: 364 },
  { date: "2024-04-19", income: 243 },
  { date: "2024-04-20", income: 89 },
  { date: "2024-04-21", income: 137 },
  { date: "2024-04-22", income: 224 },
  { date: "2024-04-23", income: 138 },
  { date: "2024-04-24", income: 387 },
  { date: "2024-04-25", income: 215 },
  { date: "2024-04-26", income: 75 },
  { date: "2024-04-27", income: 383 },
  { date: "2024-04-28", income: 122 },
  { date: "2024-04-29", income: 315 },
  { date: "2024-04-30", income: 454 },
  { date: "2024-05-01", income: 165 },
  { date: "2024-05-02", income: 293 },
  { date: "2024-05-03", income: 247 },
  { date: "2024-05-04", income: 385 },
  { date: "2024-05-05", income: 481 },
  { date: "2024-05-06", income: 498 },
  { date: "2024-05-07", income: 388 },
  { date: "2024-05-08", income: 149 },
  { date: "2024-05-09", income: 227 },
  { date: "2024-05-10", income: 293 },
  { date: "2024-05-11", income: 335 },
  { date: "2024-05-12", income: 197 },
  { date: "2024-05-13", income: 197 },
  { date: "2024-05-14", income: 448 },
  { date: "2024-05-15", income: 473 },
  { date: "2024-05-16", income: 338 },
  { date: "2024-05-17", income: 499 },
  { date: "2024-05-18", income: 315 },
  { date: "2024-05-19", income: 235 },
  { date: "2024-05-20", income: 177 },
  { date: "2024-05-21", income: 82 },
  { date: "2024-05-22", income: 81 },
  { date: "2024-05-23", income: 252 },
  { date: "2024-05-24", income: 294 },
  { date: "2024-05-25", income: 201 },
  { date: "2024-05-26", income: 213 },
  { date: "2024-05-27", income: 420 },
  { date: "2024-05-28", income: 233 },
  { date: "2024-05-29", income: 78 },
  { date: "2024-05-30", income: 340 },
  { date: "2024-05-31", income: 178 },
  { date: "2024-06-01", income: 178 },
  { date: "2024-06-02", income: 470 },
  { date: "2024-06-03", income: 103 },
  { date: "2024-06-04", income: 439 },
  { date: "2024-06-05", income: 88 },
  { date: "2024-06-06", income: 294 },
  { date: "2024-06-07", income: 323 },
  { date: "2024-06-08", income: 385 },
  { date: "2024-06-09", income: 438 },
  { date: "2024-06-10", income: 155 },
  { date: "2024-06-11", income: 92 },
  { date: "2024-06-12", income: 492 },
  { date: "2024-06-13", income: 81 },
  { date: "2024-06-14", income: 426 },
  { date: "2024-06-15", income: 307 },
  { date: "2024-06-16", income: 371 },
  { date: "2024-06-17", income: 475 },
  { date: "2024-06-18", income: 107 },
  { date: "2024-06-19", income: 341 },
  { date: "2024-06-20", income: 408 },
  { date: "2024-06-21", income: 169 },
  { date: "2024-06-22", income: 317 },
  { date: "2024-06-23", income: 480 },
  { date: "2024-06-24", income: 132 },
  { date: "2024-06-25", income: 141 },
  { date: "2024-06-26", income: 434 },
  { date: "2024-06-27", income: 448 },
  { date: "2024-06-28", income: 149 },
  { date: "2024-06-29", income: 103 },
  { date: "2024-06-30", income: 446 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
  },
  //   desktop: {
  //     label: "Desktop",
  //     color: "hsl(var(--chart-1))",
  //   },
  mobile: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function CustomAreaChart() {
  const [timeRange, setTimeRange] = React.useState("90d");

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="bg-[#2A1A4B] border-none">
      <CardHeader className="flex items-center gap-2 space-y-0  py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle className="text-white"> Revenue</CardTitle>
          <CardDescription>
            Showing total revenue for the last 3 months
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[275px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            {/* <CartesianGrid vertical={false} /> */}
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="income"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
