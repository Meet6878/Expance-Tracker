import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboard.api";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight,
  CalendarDays, Clock, Calendar, Filter, X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#84cc16"];

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Date range calculation
function getDateRange(key) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const fmt = (d) => d.toISOString().split("T")[0];

  switch (key) {
    case "today":
      return { startDate: fmt(today), endDate: fmt(now) };
    case "7days": {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      return { startDate: fmt(start), endDate: fmt(now) };
    }
    case "week": {
      const day = today.getDay();
      const start = new Date(today);
      start.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
      return { startDate: fmt(start), endDate: fmt(now) };
    }
    case "month":
      return { startDate: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), endDate: fmt(now) };
    case "year":
      return { startDate: fmt(new Date(now.getFullYear(), 0, 1)), endDate: fmt(now) };
    default:
      return {};
  }
}

// Custom tooltips
function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="font-semibold text-sm">{data.name}</p>
      <p className="text-sm text-primary font-bold">{formatCurrency(data.value)}</p>
      <p className="text-xs text-muted-foreground">{data.payload.percentage}% of total &middot; {data.payload.count} txns</p>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="font-medium text-sm mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-sm flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="capitalize">{p.dataKey}:</span>
          <span className="font-semibold">{formatCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

// Pie chart inner label
function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) {
  if (percentage < 8) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {percentage}%
    </text>
  );
}

// Skeleton loaders
function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader><Skeleton className="h-5 w-40" /><Skeleton className="h-3 w-56" /></CardHeader>
      <CardContent><Skeleton className="h-[300px] w-full rounded-lg" /></CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [activePreset, setActivePreset] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Only send custom filter when BOTH from and to dates are selected
  const dateFilters = useMemo(() => {
    if (activePreset === "custom") {
      if (customStart && customEnd) {
        return { startDate: customStart, endDate: customEnd };
      }
      return {}; // treat as "all" until both dates are picked
    }
    return getDateRange(activePreset);
  }, [activePreset, customStart, customEnd]);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", dateFilters],
    queryFn: () => dashboardApi.getStats(dateFilters),
  });

  const stats = data?.data;

  // Pie chart data
  const pieData = useMemo(() => {
    const breakdown = stats?.categoryBreakdown || [];
    const total = breakdown.reduce((sum, c) => sum + c.amount, 0);
    return breakdown.map((c, i) => ({
      name: `${c.icon || ""} ${c.category}`.trim(),
      value: c.amount,
      count: c.count,
      percentage: total > 0 ? Math.round((c.amount / total) * 100) : 0,
      fill: COLORS[i % COLORS.length],
    }));
  }, [stats]);

  // Daily trend
  const dailyTrend = useMemo(() => {
    return (stats?.dailySpendingTrend || []).slice(-30).map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      income: d.income || 0,
      expense: d.expense || 0,
    }));
  }, [stats]);

  // Monthly comparison
  const monthlySavings = useMemo(() => {
    const current = stats?.monthlySavings?.current || {};
    const last = stats?.monthlySavings?.last || {};
    return [
      { name: "Last Month", income: last.income || 0, expense: last.expense || 0, savings: last.savings || 0 },
      { name: "This Month", income: current.income || 0, expense: current.expense || 0, savings: current.savings || 0 },
    ];
  }, [stats]);

  // Skeleton loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-64" /></div>
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}</div>
        <div className="grid gap-4 lg:grid-cols-7"><div className="lg:col-span-4"><ChartSkeleton /></div><div className="lg:col-span-3"><ChartSkeleton /></div></div>
        <ChartSkeleton />
      </div>
    );
  }

  // Active date range label
  const dateLabel = (() => {
    if (activePreset === "all") return "All time";
    if (activePreset === "custom") {
      if (customStart && customEnd) return `${formatDate(customStart)} — ${formatDate(customEnd)}`;
      if (customStart) return `From ${formatDate(customStart)}`;
      if (customEnd) return `Until ${formatDate(customEnd)}`;
      return "Select dates";
    }
    const range = getDateRange(activePreset);
    return `${formatDate(range.startDate)} — ${formatDate(range.endDate)}`;
  })();

  const statCards = [
    {
      title: "Total Income",
      value: formatCurrency(stats?.totalIncome || 0),
      count: `${stats?.incomeCount || 0} transactions`,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(stats?.totalExpenses || 0),
      count: `${stats?.expenseCount || 0} transactions`,
      icon: TrendingDown,
      gradient: "from-rose-500 to-rose-600",
      bgLight: "bg-rose-50",
      textColor: "text-rose-600",
    },
    {
      title: "Net Savings",
      value: formatCurrency(stats?.totalSavings || 0),
      count: stats?.totalSavings >= 0 ? "You're saving!" : "Spending more than earning",
      icon: PiggyBank,
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      textColor: stats?.totalSavings >= 0 ? "text-blue-600" : "text-rose-600",
    },
    {
      title: "Avg per Expense",
      value: formatCurrency(stats?.averageExpense || 0),
      count: `${stats?.transactions || 0} total transactions`,
      icon: Wallet,
      gradient: "from-violet-500 to-violet-600",
      bgLight: "bg-violet-50",
      textColor: "text-violet-600",
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your income, expenses and savings</p>
        </div>
        <Badge variant="outline" className="gap-1.5 py-1.5 px-3 text-xs font-normal">
          <CalendarDays className="h-3.5 w-3.5" />
          {dateLabel}
        </Badge>
      </motion.div>

      {/* Advanced Date Filter */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              {/* Row 1: Preset tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
                  <Filter className="h-4 w-4" />
                  <span>Period:</span>
                </div>
                <Tabs value={activePreset} onValueChange={(v) => setActivePreset(v)} className="w-full">
                  <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex sm:flex-wrap gap-0">
                    <TabsTrigger value="all" className="text-xs">All Time</TabsTrigger>
                    <TabsTrigger value="today" className="text-xs">Today</TabsTrigger>
                    <TabsTrigger value="7days" className="text-xs">Last 7 Days</TabsTrigger>
                    <TabsTrigger value="week" className="text-xs">This Week</TabsTrigger>
                    <TabsTrigger value="month" className="text-xs">This Month</TabsTrigger>
                    <TabsTrigger value="year" className="text-xs">This Year</TabsTrigger>
                    <TabsTrigger value="custom" className="text-xs gap-1">
                      <Calendar className="h-3 w-3" />
                      Custom
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Row 2: Custom date inputs (show only when custom is selected) */}
              {activePreset === "custom" && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                    <CalendarDays className="h-4 w-4" />
                    <span>From:</span>
                  </div>
                  <Input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="h-9 w-full sm:w-44"
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="h-9 w-full sm:w-44"
                  />
                  {(customStart || customEnd) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setCustomStart(""); setCustomEnd(""); }}
                      className="gap-1 text-muted-foreground"
                    >
                      <X className="h-3 w-3" /> Clear
                    </Button>
                  )}
                  {customStart && !customEnd && (
                    <span className="text-xs text-amber-600">Select end date to filter</span>
                  )}
                  {!customStart && customEnd && (
                    <span className="text-xs text-amber-600">Select start date to filter</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.title} variants={fadeUp}>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                      <div className={cn("rounded-xl p-2.5", card.bgLight)}>
                        <Icon className={cn("h-5 w-5", card.textColor)} />
                      </div>
                    </div>
                    <p className={cn("text-2xl font-bold", card.textColor)}>{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.count}</p>
                  </div>
                  <div className={cn("h-1 w-full bg-gradient-to-r", card.gradient)} />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row 1: Pie + Category List | Monthly Bar */}
      <div className="grid gap-4 lg:grid-cols-7">
        <motion.div variants={fadeUp} className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>How your money is distributed across categories</CardDescription>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        label={renderPieLabel}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} stroke="none" />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Category breakdown list */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Category Details</p>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {pieData.map((cat, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.fill }} />
                            <div>
                              <p className="text-sm font-medium leading-none">{cat.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{cat.count} transactions</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{formatCurrency(cat.value)}</p>
                            <p className="text-xs text-muted-foreground">{cat.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-[260px] items-center justify-center text-muted-foreground">
                  No expense data to show
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Income vs Expense */}
        <motion.div variants={fadeUp} className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Monthly Comparison</CardTitle>
              <CardDescription>Income vs expense this month and last</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlySavings} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="income" name="Income" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={32} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
              <Separator className="my-3" />
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Last Month Savings</p>
                  <p className={cn("text-sm font-bold", (monthlySavings[0]?.savings || 0) >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    {formatCurrency(monthlySavings[0]?.savings || 0)}
                  </p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div>
                  <p className="text-xs text-muted-foreground">This Month Savings</p>
                  <p className={cn("text-sm font-bold", (monthlySavings[1]?.savings || 0) >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    {formatCurrency(monthlySavings[1]?.savings || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2: Spending Trend + Recent Transactions */}
      <div className="grid gap-4 lg:grid-cols-7">
        <motion.div variants={fadeUp} className="lg:col-span-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Spending Trend</CardTitle>
                <CardDescription>Daily income &amp; expense flow</CardDescription>
              </div>
              {dailyTrend.length > 0 && (
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="h-[3px] w-4 rounded-full bg-[#6366f1]" /> Expense</span>
                  <span className="flex items-center gap-1.5"><span className="h-[3px] w-4 rounded-full bg-[#22c55e]" /> Income</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {dailyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={dailyTrend}>
                    <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" className="stroke-muted/40" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      interval={dailyTrend.length > 15 ? Math.floor(dailyTrend.length / 7) : 0}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickFormatter={(v) => `₹${v}`}
                      axisLine={false}
                      tickLine={false}
                      width={50}
                    />
                    <RechartsTooltip content={<ChartTooltip />} cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }} />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      name="Expense"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: "#6366f1" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: "#22c55e" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[280px] items-center justify-center text-muted-foreground">
                  No data to display for this period
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={fadeUp} className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your last 5 transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {(stats?.recentTransactions || []).length > 0 ? (
                <div className="space-y-3">
                  {stats.recentTransactions.map((tx) => (
                    <div key={tx._id} className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full",
                          tx.type === "income" ? "bg-emerald-100" : "bg-rose-100"
                        )}>
                          {tx.type === "income" ?
                            <ArrowUpRight className="h-4 w-4 text-emerald-600" /> :
                            <ArrowDownRight className="h-4 w-4 text-rose-600" />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{tx.category || "Uncategorized"}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                          </div>
                        </div>
                      </div>
                      <span className={cn("text-sm font-bold", tx.type === "income" ? "text-emerald-600" : "text-rose-600")}>
                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
                  <Clock className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No recent transactions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
