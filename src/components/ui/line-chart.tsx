"use client";

interface LineChartDataPoint {
  x: string | number | Date;
  y: number;
}

interface LineChartProps {
  title: string;
  data: LineChartDataPoint[];
  className?: string;
  height?: number;
  strokeColor?: string;
  formatValue?: (value: number) => string;
}

export function LineChart({
  title,
  data,
  className = "",
  height = 300,
  strokeColor = "#3B82F6",
  formatValue = (value) => value.toLocaleString(),
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const padding = { top: 40, right: 30, bottom: 40, left: 60 };
  const chartWidth = 600;
  const chartHeight = height;

  const maxY = Math.max(...data.map(d => d.y));
  const scaleY = (value: number) => chartHeight - padding.bottom - (value / maxY) * (chartHeight - padding.top - padding.bottom);
  const scaleX = (index: number) => padding.left + (index / (data.length - 1)) * (chartWidth - padding.left - padding.right);

  const pathData = data.map((point, i) => {
    const x = scaleX(i);
    const y = scaleY(point.y);
    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
  }).join(' ');

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="relative">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
          {/* Y-axis labels and grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(tick => (
            <g key={tick} className="text-gray-500">
              <line
                x1={padding.left}
                x2={chartWidth - padding.right}
                y1={scaleY(maxY * tick)}
                y2={scaleY(maxY * tick)}
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="2,5"
              />
              <text
                x={padding.left - 10}
                y={scaleY(maxY * tick)}
                dy="0.32em"
                textAnchor="end"
                className="text-xs fill-current"
              >
                {formatValue(maxY * tick)}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {data.map((point, i) => {
            if (i % Math.ceil(data.length / 6) !== 0) return null;
            return (
              <text
                key={i}
                x={scaleX(i)}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                className="text-xs fill-current text-gray-400"
              >
                {point.x instanceof Date ? point.x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : point.x}
              </text>
            );
          })}

          {/* Line Path */}
          <path d={pathData} fill="none" stroke={strokeColor} strokeWidth="2" />
          
          {/* Data Points */}
          {data.map((point, i) => (
            <circle
              key={i}
              cx={scaleX(i)}
              cy={scaleY(point.y)}
              r="3"
              fill={strokeColor}
              className="transition-transform duration-200 hover:scale-150"
            >
              <title>{`${point.x instanceof Date ? point.x.toLocaleDateString() : point.x}: ${formatValue(point.y)}`}</title>
            </circle>
          ))}
        </svg>
      </div>
    </div>
  );
}