import { Sidebar } from "@/components/Sidebar"
import { TopBar } from "@/components/TopBar"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-quest-bg p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
