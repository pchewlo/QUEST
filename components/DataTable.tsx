'use client'

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Search, ChevronUp, ChevronDown } from "lucide-react"

type Column<T> = {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'right'
}

type DataTableProps<T> = {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
  searchable?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  rowKey: (row: T) => string
}

type SortState = {
  key: string
  direction: 'asc' | 'desc'
} | null

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  searchable = false,
  searchPlaceholder = "Search\u2026",
  emptyMessage = "No data to display",
  rowKey,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortState>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key]
        if (val == null) return false
        return String(val).toLowerCase().includes(q)
      })
    )
  }, [data, search, columns])

  const sorted = useMemo(() => {
    if (!sort) return filtered
    const { key, direction } = sort
    return [...filtered].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal
      }
      const cmp = String(aVal).localeCompare(String(bVal))
      return direction === 'asc' ? cmp : -cmp
    })
  }, [filtered, sort])

  function handleSort(key: string) {
    setSort((prev) => {
      if (prev?.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' }
        return null
      }
      return { key, direction: 'asc' }
    })
  }

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card overflow-hidden">
      {searchable && (
        <div className="border-b border-border px-4 py-2.5">
          <div className="relative">
            <Search
              size={14}
              strokeWidth={1.5}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-quest-ink-faint"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 w-full rounded-md border border-border bg-quest-surface-muted pl-8 pr-3 text-[13px] text-quest-ink placeholder:text-quest-ink-faint outline-none focus:ring-1 focus:ring-quest-accent"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-2.5 text-[12px] font-medium uppercase tracking-wide text-quest-ink-faint",
                    col.align === 'right' ? "text-right" : "text-left",
                    col.sortable && "cursor-pointer select-none hover:text-quest-ink-muted",
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sort?.key === col.key && (
                      sort.direction === 'asc'
                        ? <ChevronUp size={12} strokeWidth={1.5} />
                        : <ChevronDown size={12} strokeWidth={1.5} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={rowKey(row)}
                className={cn(
                  "border-b border-border transition-colors",
                  onRowClick
                    ? "cursor-pointer hover:bg-quest-surface-muted"
                    : "hover:bg-quest-surface-muted/50",
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-2.5 text-[13px] text-quest-ink",
                      col.align === 'right' && "text-right tabular-nums",
                    )}
                  >
                    {col.render ? col.render(row) : (row[col.key] as React.ReactNode) ?? "\u2014"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <div className="flex items-center justify-center py-10 text-[13px] text-quest-ink-faint">
          {emptyMessage}
        </div>
      )}
    </div>
  )
}
