import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            spacing: {
                'safe-top': 'env(safe-area-inset-top)',
                'safe-bottom': 'env(safe-area-inset-bottom)',
                'safe-left': 'env(safe-area-inset-left)',
                'safe-right': 'env(safe-area-inset-right)',
            },
            colors: {
                // Legacy token: obsidian — remapped to dark slate for text visibility on white backgrounds
                obsidian: {
                    DEFAULT: "#102A33", // Dark text color (barpel-slate) — used by text-obsidian, bg-obsidian
                },
                // Neutral gray scale (remapped from old surgical blues)
                surgical: {
                    50:  '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827',
                },
                // Legacy clinical tokens — remapped to light theme values
                "clinical-bg": "#FFFFFF",      // White background
                "clinical-surface": "#F9FAFB", // Light surface
                "clinical-border": "#E5E7EB",  // Light border (matches barpel-border)
                // Deprecated dark theme tokens (kept for backwards compat, values neutralized)
                "barpel-brandy": { DEFAULT: "#6B7280", light: "#9CA3AF", dark: "#4B5563" },
                "barpel-dim": { bg: "#FFFFFF", surface: "#F9FAFB", border: "#E5E7EB", text: "#102A33", muted: "#6B7280" },

                // NEW Barpel Design System Colors (Teal & White, 2026)
                // Primary brand color - use for buttons, highlights, active states
                "barpel-teal": {
                    DEFAULT: "#37A195",
                    dark: "#2F8E88",
                    darker: "#267F78",
                    light: "#E8F5F2",
                },
                // Deep slate for headings and primary text
                "barpel-slate": "#102A33",
                // Muted gray for body text, subtitles, helper text
                "barpel-gray": "#6B7280",
                // Light gray for borders, dividers, subtle separation
                "barpel-border": "#E5E7EB",
                // Fix orphan color references (474 broken classes)
                "sterile-wash": "#F0F9FF",
                "deep-obsidian": "#020412",
                "surgical-blue": "#1D4ED8",
                "clinical-blue": "#3B82F6",
                "sky-mist": "#BFDBFE",
                "pure-white": "#FFFFFF",
                "cream": "#F0F9FF",
                "warm-gray": "#F7F8FA",
                navy: {
                    800: "#0A1628",
                    900: "#020412",
                },
                // Shadcn/UI color system
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                chart: {
                    "1": "hsl(var(--chart-1))",
                    "2": "hsl(var(--chart-2))",
                    "3": "hsl(var(--chart-3))",
                    "4": "hsl(var(--chart-4))",
                    "5": "hsl(var(--chart-5))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                full: "9999px", // Pill-shaped buttons
            },
            fontFamily: {
                sans: ["var(--font-sans)", "system-ui", "sans-serif"],
            },
            fontSize: {
                xs: ["0.75rem", { lineHeight: "1rem" }],
                sm: ["0.875rem", { lineHeight: "1.25rem" }],
                base: ["1rem", { lineHeight: "1.5rem" }],
                lg: ["1.125rem", { lineHeight: "1.75rem" }],
                xl: ["1.25rem", { lineHeight: "1.75rem" }],
                "2xl": ["1.5rem", { lineHeight: "2rem" }],
                "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
                "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
                "5xl": ["3rem", { lineHeight: "1.1" }],
                "6xl": ["3.75rem", { lineHeight: "1.1" }],
                "7xl": ["4.5rem", { lineHeight: "1.1" }],
                "8xl": ["6rem", { lineHeight: "1" }],
            },
            letterSpacing: {
                tighter: "-0.05em",
                tight: "-0.025em",
                normal: "0em",
                wide: "0.025em",
                wider: "0.05em",
                widest: "0.1em",
            },
            keyframes: {
                "gradient-x": {
                    "0%, 100%": {
                        "background-size": "200% 200%",
                        "background-position": "left center",
                    },
                    "50%": {
                        "background-size": "200% 200%",
                        "background-position": "right center",
                    },
                },
                "shimmer": {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                },
                typing: {
                    "0%": { width: "0" },
                    "100%": { width: "100%" },
                },
                blink: {
                    "50%": { borderColor: "transparent" },
                },
                marquee: {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" },
                },
            },
            animation: {
                "gradient-x": "gradient-x 3s ease infinite",
                "shimmer": "shimmer 2s infinite",
                typing: "typing 2s steps(40, end)",
                blink: "blink .75s step-end infinite",
                marquee: "marquee 30s linear infinite",
            },
        },
    },
    plugins: [],
};
export default config;
