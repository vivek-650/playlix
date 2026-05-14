"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SettingsIcon, Bell, Zap, Palette, LogOut, AlertTriangle, CheckCircle2 } from "lucide-react"
import type { LearningStats } from "@/lib/types"

interface UserSettings {
  playbackSpeed: number
  autoAdvance: boolean
  theme: "light" | "dark" | "system"
  notifications: boolean
}

export default function SettingsPage() {
  const { user, signOut } = useUser()
  const router = useRouter()
  const { theme: activeTheme, setTheme } = useTheme()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [stats, setStats] = useState<LearningStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      const [settingsRes, statsRes] = await Promise.all([fetch("/api/settings"), fetch("/api/stats")])

      const settingsData = await settingsRes.json()
      const statsData = await statsRes.json()

      const storedTheme = typeof window !== "undefined" ? localStorage.getItem("playlix_theme") : null
      const storedNotifications = typeof window !== "undefined" ? localStorage.getItem("playlix_notifications") : null
      const themeValue = (storedTheme || activeTheme || "system") as UserSettings["theme"]
      const notificationsValue = storedNotifications ? storedNotifications === "true" : true

      if (settingsData.success && settingsData.data) {
        setSettings({
          playbackSpeed: Number(settingsData.data.playbackSpeed) || 1,
          autoAdvance: Boolean(settingsData.data.autoAdvance),
          theme: themeValue,
          notifications: notificationsValue,
        })
      } else {
        // Default settings
        setSettings({
          playbackSpeed: 1,
          autoAdvance: true,
          theme: themeValue,
          notifications: notificationsValue,
        })
      }

      setTheme(themeValue)

      if (statsData.success) {
        setStats(statsData.data)
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSettingChange(key: keyof UserSettings, value: any) {
    if (!settings) return

    const updated = { ...settings, [key]: value }
    setSettings(updated)

    if (key === "theme") {
      setTheme(value)
      if (typeof window !== "undefined") {
        localStorage.setItem("playlix_theme", value)
      }
      return
    }

    if (key === "notifications") {
      if (typeof window !== "undefined") {
        localStorage.setItem("playlix_notifications", value ? "true" : "false")
      }
      return
    }

    // Save to server
    try {
      setSaving(true)
      setSaveStatus("idle")

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })

      const data = await response.json()

      if (data.success) {
        setSaveStatus("success")
        setTimeout(() => setSaveStatus("idle"), 2000)
      } else {
        setSaveStatus("error")
        // Revert change
        setSettings({ ...settings, [key]: settings[key] })
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      setSaveStatus("error")
      // Revert change
      setSettings({ ...settings, [key]: settings[key] })
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const initials = user.firstName?.charAt(0) || user.username?.charAt(0) || "U"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 max-w-3xl">
        {/* User Profile Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details and public profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{user.fullName || "User"}</h3>
                <p className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Statistics */}
        {stats && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Learning Statistics</CardTitle>
              <CardDescription>Your progress at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{stats.totalPlaylists}</p>
                  <p className="text-xs text-muted-foreground mt-1">Enrolled</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{stats.completedVideos}</p>
                  <p className="text-xs text-muted-foreground mt-1">Completed</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{stats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground mt-1">Day Streak</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{stats.completionRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Completion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Playback Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Playback Settings
            </CardTitle>
            <CardDescription>Control how videos play</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading || !settings ? (
              <>
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </>
            ) : (
              <>
                {/* Playback Speed */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Default Playback Speed</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Set your preferred playback speed for new videos
                    </p>
                  </div>
                  <Select
                    value={settings.playbackSpeed.toString()}
                    onValueChange={(value) => handleSettingChange("playbackSpeed", parseFloat(value))}
                    disabled={saving}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1">1x (Normal)</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                      <SelectItem value="1.75">1.75x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Auto Advance */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto Advance</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Automatically play the next video when current completes
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoAdvance}
                    onCheckedChange={(value) => handleSettingChange("autoAdvance", value)}
                    disabled={saving}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Display Settings
            </CardTitle>
            <CardDescription>Customize your interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading || !settings ? (
              <Skeleton className="h-12" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground mt-1">Choose your preferred color scheme</p>
                </div>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => handleSettingChange("theme", value)}
                  disabled={saving}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Control how we keep you updated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading || !settings ? (
              <Skeleton className="h-12" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive updates about your learning progress and new courses
                  </p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(value) => handleSettingChange("notifications", value)}
                  disabled={saving}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => signOut(() => router.push("/"))}
            >
              <span>Sign Out</span>
              <LogOut className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Save Status */}
        {saveStatus !== "idle" && (
          <div className="fixed bottom-4 right-4">
            {saveStatus === "success" && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>Settings saved</AlertTitle>
                <AlertDescription>Your settings have been updated successfully</AlertDescription>
              </Alert>
            )}
            {saveStatus === "error" && (
              <Alert className="border-destructive/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error saving settings</AlertTitle>
                <AlertDescription>Failed to save your settings. Please try again.</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
