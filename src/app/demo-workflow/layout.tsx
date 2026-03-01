import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Demo Workflow | Barpel AI",
  description: "Interactive demo of Barpel AI call workflows.",
  robots: {
    index: false,  // Internal demo pages should not be indexed
    follow: false,
  },
}

export default function DemoWorkflowLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
