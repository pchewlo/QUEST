'use client'

import { Button } from "@/components/ui/button"
import { ChevronDown, Search, Bell, Plus, User } from "lucide-react"
import Link from "next/link"

export function TopBar() {
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

      <div className="flex items-center">
        <button className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] text-quest-ink-muted hover:bg-quest-surface-muted transition-colors">
          Last 7 days
          <ChevronDown size={14} strokeWidth={1.5} />
        </button>
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
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-quest-surface-muted text-quest-ink-faint">
          <User size={14} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}
