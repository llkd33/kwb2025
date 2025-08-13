import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  color: "blue" | "green" | "red" | "orange" | "purple";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorVariants = {
  blue: {
    bg: "from-blue-400 to-blue-600",
    text: "text-blue-600",
    bgLight: "bg-blue-50",
  },
  green: {
    bg: "from-green-400 to-green-600",
    text: "text-green-600",
    bgLight: "bg-green-50",
  },
  red: {
    bg: "from-red-400 to-red-600",
    text: "text-red-600",
    bgLight: "bg-red-50",
  },
  orange: {
    bg: "from-orange-400 to-orange-600",
    text: "text-orange-600",
    bgLight: "bg-orange-50",
  },
  purple: {
    bg: "from-purple-400 to-purple-600",
    text: "text-purple-600",
    bgLight: "bg-purple-50",
  },
};

export const AdminStatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  color,
  trend,
}: AdminStatsCardProps) => {
  const colors = colorVariants[color];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className={cn("text-3xl font-bold", colors.text)}>
                {value.toLocaleString()}
              </div>
              {trend && (
                <div className={cn(
                  "text-sm font-medium px-2 py-1 rounded-full",
                  trend.isPositive 
                    ? "text-green-700 bg-green-100" 
                    : "text-red-700 bg-red-100"
                )}>
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </div>
              )}
            </div>
            <div className="text-slate-600 font-medium mb-1">{title}</div>
            <div className="text-xs text-slate-500">{description}</div>
          </div>
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center ml-4",
            `bg-gradient-to-br ${colors.bg}`
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};