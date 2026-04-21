'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts"

type SeriesConfig = {
  key: string
  label: string
  color: string
  type?: 'area' | 'line'
}

type ReferenceLineConfig = {
  value: number
  label: string
  color: string
  yAxisId: string
}

type AreaChartProps = {
  data: Array<Record<string, unknown>>
  xKey: string
  series: SeriesConfig[]
  height?: number
  yAxisLeft?: string
  yAxisRight?: string
  referenceLine?: ReferenceLineConfig
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-sm">
      <p className="mb-1 text-[11px] text-quest-ink-faint">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-[12px]">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-quest-ink-muted">{entry.name}</span>
          <span className="ml-auto tabular-nums font-medium text-quest-ink">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function AreaChartComponent({
  data,
  xKey,
  series,
  height = 280,
  yAxisLeft,
  yAxisRight,
  referenceLine,
}: AreaChartProps) {
  const hasRightAxis = !!yAxisRight

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: hasRightAxis ? 16 : 8, bottom: 0, left: 0 }}>
        <CartesianGrid
          stroke="rgba(0,0,0,0.04)"
          strokeDasharray="none"
          vertical={false}
        />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: "var(--quest-ink-faint)" }}
          tickLine={false}
          axisLine={false}
          dy={8}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11, fill: "var(--quest-ink-faint)" }}
          tickLine={false}
          axisLine={false}
          width={48}
          label={
            yAxisLeft
              ? { value: yAxisLeft, angle: -90, position: "insideLeft", fontSize: 11, fill: "var(--quest-ink-faint)", dx: -4 }
              : undefined
          }
        />
        {hasRightAxis && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: "var(--quest-ink-faint)" }}
            tickLine={false}
            axisLine={false}
            width={48}
            label={
              yAxisRight
                ? { value: yAxisRight, angle: 90, position: "insideRight", fontSize: 11, fill: "var(--quest-ink-faint)", dx: 4 }
                : undefined
            }
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        {series.map((s) => {
          const yAxisId = hasRightAxis && series.indexOf(s) > 0 ? "right" : "left"

          if (s.type === 'line') {
            return (
              <Line
                key={s.key}
                yAxisId={yAxisId}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            )
          }

          return (
            <Area
              key={s.key}
              yAxisId={yAxisId}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={s.color}
              fillOpacity={0.1}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          )
        })}
        {referenceLine && (
          <ReferenceLine
            yAxisId={referenceLine.yAxisId}
            y={referenceLine.value}
            stroke={referenceLine.color}
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: referenceLine.label,
              position: "right",
              fontSize: 11,
              fill: referenceLine.color,
            }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
