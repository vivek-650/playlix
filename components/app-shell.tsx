'use client'

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AddPlaylistDialog } from "@/components/add-playlist-dialog"
import { invalidateCachePattern } from "@/hooks/use-data-cache"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Flame,
  LayoutDashboard,
  Library,
  StickyNote,
  Globe,
  Settings,
  Menu,
} from "lucide-react"

const NAV_LINKS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/library", label: "My Enrollments", icon: Library },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/community", label: "Community", icon: Globe },
  { href: "/settings", label: "Settings", icon: Settings },
]

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const { user } = useUser()
  const [showAddDialog, setShowAddDialog] = useState(false)

  const initials = useMemo(() => {
    if (!user) return "U"
    return user.firstName?.charAt(0) || user.username?.charAt(0) || "U"
  }, [user])

  function handleAdded() {
    invalidateCachePattern("playlists:")
    invalidateCachePattern("stats:")
    setShowAddDialog(false)
  }

  const dateLabel = useMemo(() => new Date().toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }), [])

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          C
        </div>
        <span className="text-lg font-semibold">Coursa</span>
      </div>
      <nav className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href
            return (
              <Link key={link.href} href={link.href} className="block">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 rounded-lg",
                    active && "bg-accent text-accent-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>
      <div className="px-4 py-4 text-xs text-muted-foreground">
        Learn distraction-free.
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 border-r bg-background/95 lg:flex">
        {SidebarContent}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  {SidebarContent}
                </SheetContent>
              </Sheet>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{dateLabel}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs sm:flex">
                <Flame className="h-4 w-4 text-primary" />
                <span>0 days</span>
              </div>
              <Button
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setShowAddDialog(true)}
              >
                Create
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        <main className="flex-1 min-h-0">{children}</main>
      </div>

      <AddPlaylistDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdded={handleAdded}
        showTrigger={false}
      />
    </div>
  )
}
