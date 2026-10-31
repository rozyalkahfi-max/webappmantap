import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: string; // e.g. "blue", "emerald", "amber", "rose"
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'blue',
}) => {
  const getIconColor = () => {
    switch (accentColor) {
      case 'emerald':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'amber':
        return 'text-amber-700 bg-amber-50 border-amber-100';
      case 'rose':
        return 'text-rose-700 bg-rose-50 border-rose-100';
      case 'purple':
        return 'text-purple-700 bg-purple-50 border-purple-100';
      default:
        return 'text-blue-700 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
              {value}
            </span>
            {trend && (
              <span
                className={`text-xs font-medium tabular-nums ${
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg border ${getIconColor()}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
          <span>{subtitle}</span>
        </p>
      )}
    </div>
  );
};
