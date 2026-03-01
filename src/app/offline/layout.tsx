import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Offline | Barpel AI",
  description: "You are currently offline. Barpel AI requires an internet connection.",
  robots: {
    index: false,  // Utility pages should not be indexed
    follow: false,
  },
}

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
