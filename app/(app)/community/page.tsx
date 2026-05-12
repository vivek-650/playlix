import { CommunitySection } from "@/components/community-section"

export default function CommunityPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Community</h2>
          <p className="text-muted-foreground">
            Discover and learn from playlists shared by our community
          </p>
        </div>
      </div>

      <CommunitySection />
    </div>
  )
}
