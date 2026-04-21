'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Target,
  Bot,
  Lightbulb,
  FileText,
  Shield,
} from "lucide-react"

const navItems = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Plans", href: "/plans", icon: Target },
  { label: "Agents", href: "/agents", icon: Bot },
  { label: "Insights", href: "/insights", icon: Lightbulb },
  { label: "Templates", href: "/templates", icon: FileText },
  { label: "Safety", href: "/safety", icon: Shield },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center px-5">
        <span
          className="text-[15px] font-medium tracking-[0.2em] text-quest-accent"
        >
          QUEST
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors ${
                active
                  ? "bg-quest-surface-muted text-quest-ink font-medium"
                  : "text-quest-ink-muted hover:bg-quest-surface-muted hover:text-quest-ink"
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
