import React, { useState } from 'react';

interface BarData {
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
}

export const InteractiveBarChart: React.FC<{
  title: string;
  subtitle?: string;
  data: BarData[];
  height?: number;
  valueSuffix?: string;
  secondaryLabel?: string;
  primaryLabel?: string;
}> = ({
  title,
  subtitle,
  data,
  height = 240,
  valueSuffix = '%',
  primaryLabel = 'Capaian',
  secondaryLabel,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => Math.max(d.value, d.secondaryValue || 0)), 100);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
            <span>{primaryLabel}</span>
          </div>
          {secondaryLabel && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
              <span>{secondaryLabel}</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative pt-6" style={{ height: `${height}px` }}>
        {/* Horizontal grid lines */}
        <div className="absolute inset-x-0 inset-y-6 flex flex-col justify-between pointer-events-none opacity-40">
          {[100, 75, 50, 25, 0].map((v) => (
            <div key={v} className="border-b border-dashed border-slate-200 w-full flex items-center justify-end">
              <span className="text-[10px] text-slate-400 font-mono pr-1 -mt-3 tabular-nums">{v}{valueSuffix}</span>
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="relative h-full flex items-end justify-between gap-2 px-6">
          {data.map((item, idx) => {
            const heightPercent = Math.max(4, Math.round((item.value / maxValue) * 100));
            const secHeight = item.secondaryValue
              ? Math.max(4, Math.round((item.secondaryValue / maxValue) * 100))
              : null;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.label}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-10 z-20 bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded shadow-lg whitespace-nowrap pointer-events-none transition-all">
                    <span className="font-semibold">{item.label}</span>: <span className="tabular-nums font-mono">{item.value}{valueSuffix}</span>
                    {item.secondaryValue !== undefined && (
                      <span className="text-slate-300 ml-1">/ {item.secondaryValue}{valueSuffix}</span>
                    )}
                  </div>
                )}

                <div className="w-full flex items-end justify-center gap-1 max-w-[42px]">
                  {/* Primary Bar */}
                  <div
                    className="w-full rounded-t transition-all duration-200"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: item.color || (isHovered ? '#1d4ed8' : '#2563eb'),
                    }}
                  />
                  {/* Secondary Bar */}
                  {secHeight !== null && (
                    <div
                      className="w-full bg-slate-300 hover:bg-slate-400 rounded-t transition-all duration-200"
                      style={{ height: `${secHeight}%` }}
                    />
                  )}
                </div>

                <span className="text-[11px] font-medium text-slate-600 mt-2 truncate w-full text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const DonutChart: React.FC<{
  title: string;
  subtitle?: string;
  data: { label: string; value: number; color: string }[];
  centerLabel?: string;
  centerValue?: string | number;
}> = ({ title, subtitle, data, centerLabel = 'Total', centerValue }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const total = data.reduce((acc, cur) => acc + cur.value, 0);

  let cumulativeAngle = 0;
  const radius = 38;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center justify-center my-4 relative">
        <svg viewBox="0 0 100 100" className="w-36 h-36 -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {data.map((item, idx) => {
            if (item.value === 0) return null;
            const fraction = item.value / (total || 1);
            const strokeDasharray = `${fraction * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativeAngle * circumference;
            cumulativeAngle += fraction;
            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={item.label}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-bold text-slate-900 font-mono tabular-nums leading-none">
            {centerValue ?? total}
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mt-0.5">
            {centerLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        {data.map((item, idx) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div
              key={item.label}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                hoveredIdx === idx ? 'bg-slate-50 font-medium' : ''
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900 pl-4 mt-0.5">
                <span className="font-mono tabular-nums">{item.value}</span>
                <span className="text-[10px] text-slate-400 font-normal tabular-nums">{percent}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SparklineTrend: React.FC<{
  data: number[];
  color?: string;
  height?: number;
}> = ({ data, color = '#2563eb', height = 36 }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 100;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8 overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};
