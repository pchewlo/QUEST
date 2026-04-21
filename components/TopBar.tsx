'use client'

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Search, Bell, Plus, User, Settings, HelpCircle, LogOut } from "lucide-react"
import Link from "next/link"

const DATE_RANGE_OPTIONS = [
  "Today",
  "Yesterday",
  "Last 7 days",
  "Last 30 days",
  "Lifetime",
]

const STORAGE_KEY = "quest-date-range"

export function TopBar() {
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const [dateRange, setDateRange] = useState("Last 7 days")

  const avatarRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)

  // Read persisted date range on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && DATE_RANGE_OPTIONS.includes(stored)) {
      setDateRange(stored)
    }
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setDateOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function selectDateRange(option: string) {
    setDateRange(option)
    localStorage.setItem(STORAGE_KEY, option)
    setDateOpen(false)
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-5">
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1.5 text-[13px] text-quest-ink hover:text-quest-ink-muted transition-colors">
          <span className="font-medium">Parlour</span>
          <span className="text-quest-ink-faint">·</span>
          <span className="text-quest-ink-muted">All properties</span>
          <ChevronDown size={14} strokeWidth={1.5} className="text-quest-ink-faint" />
        </button>
      </div>

      {/* Date range selector */}
      <div className="flex items-center">
        <div ref={dateRef} className="relative">
          <button
            onClick={() => setDateOpen(!dateOpen)}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] text-quest-ink-muted hover:bg-quest-surface-muted transition-colors"
          >
            {dateRange}
            <ChevronDown size={14} strokeWidth={1.5} />
          </button>
          {dateOpen && (
            <div className="absolute top-full right-0 z-50 mt-1 w-[180px] rounded-lg border border-border bg-card py-1 shadow-sm">
              {DATE_RANGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => selectDateRange(option)}
                  className={`flex w-full items-center px-3 py-1.5 text-[13px] transition-colors hover:bg-quest-surface-muted ${
                    option === dateRange
                      ? "font-medium text-quest-ink"
                      : "text-quest-ink-muted"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/plans/new">
          <Button
            size="sm"
            className="h-8 gap-1.5 bg-quest-accent text-white hover:bg-quest-accent/90 text-[13px]"
          >
            <Plus size={14} strokeWidth={2} />
            Create plan
          </Button>
        </Link>
        <button className="flex h-8 w-8 items-center justify-center rounded-md text-quest-ink-muted hover:bg-quest-surface-muted transition-colors">
          <Search size={16} strokeWidth={1.5} />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-md text-quest-ink-muted hover:bg-quest-surface-muted transition-colors">
          <Bell size={16} strokeWidth={1.5} />
        </button>

        {/* Avatar dropdown */}
        <div ref={avatarRef} className="relative">
          <button
            onClick={() => setAvatarOpen(!avatarOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-quest-surface-muted text-quest-ink-faint"
          >
            <User size={14} strokeWidth={1.5} />
          </button>
          {avatarOpen && (
            <div className="absolute top-full right-0 z-50 mt-1 w-[200px] rounded-lg border border-border bg-card py-1 shadow-sm">
              <div className="px-3 py-2">
                <span className="text-[13px] font-bold text-quest-ink">Parlour</span>
              </div>
              <div className="mx-2 border-t border-border" />
              <Link
                href="/settings"
                onClick={() => setAvatarOpen(false)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-quest-ink-muted hover:bg-quest-surface-muted transition-colors"
              >
                <Settings size={14} strokeWidth={1.5} />
                Settings
              </Link>
              <button
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-quest-ink-muted hover:bg-quest-surface-muted transition-colors"
              >
                <HelpCircle size={14} strokeWidth={1.5} />
                Help & support
              </button>
              <button
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-quest-ink-muted hover:bg-quest-surface-muted transition-colors"
              >
                <LogOut size={14} strokeWidth={1.5} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
