/**
 * @fileoverview Barpel AI Brand Colors Utility
 *
 * Centralized color palette management for the Barpel platform.
 * All colors are sourced from the official brand guidelines (9.png).
 *
 * Usage:
 * ```tsx
 * import { brandColors, createBrandGradient, createBrandGlow } from '@/lib/brand-colors';
 *
 * // Direct color access
 * const headerBg = brandColors.navyDark;
 *
 * // Gradient creation
 * const gradient = createBrandGradient('blueBright', 'blueLight');
 *
 * // Glow effect
 * const glow = createBrandGlow('blueBright', 0.5);
 * ```
 *
 * @module brand-colors
 */

/**
 * ✅ APPROVED Barpel AI Teal & White Palette
 *
 * Based on official Barpel brand guidelines (2026)
 * Updated: 2026-03-01
 *
 * The color palette communicates:
 * - **Trust** (Deep Slate for authority and professionalism)
 * - **Technology** (Barpel Teal for modern AI aesthetic)
 * - **Cleanliness** (White/Light backgrounds for clarity)
 * - **Professionalism** (Muted Gray for body text, clean borders)
 *
 * Design Philosophy: Teal primary on white, with neutral gray supporting colors
 *
 * @constant
 * @type {Record<string, string>}
 */
export const brandColors = {
  /** ✅ Barpel Teal (#37A195) - Primary CTA buttons, active states, highlights */
  barpelTeal: '#37A195',

  /** ✅ Barpel Teal Dark (#2F8E88) - Hover states, pressed states */
  barpelTealDark: '#2F8E88',

  /** ✅ Deep Slate (#102A33) - Headings, primary text, dark elements */
  deepSlate: '#102A33',

  /** ✅ Muted Gray (#6B7280) - Body text, subtitles, secondary text */
  mutedGray: '#6B7280',

  /** ✅ Border Gray (#E5E7EB) - Borders, dividers, subtle separation */
  borderGray: '#E5E7EB',

  /** ✅ Teal Light (#E8F5F2) - Accent backgrounds, selected states */
  tealLight: '#E8F5F2',

  /** ✅ Pure White (#FFFFFF) - Main backgrounds, surface color */
  pureWhite: '#FFFFFF',

  // ⚠️ DEPRECATED: Legacy colors kept for backwards compatibility
  /** @deprecated Use deepSlate instead */
  deepObsidian: '#102A33',
  /** @deprecated Use deepSlate instead */
  navyDark: '#102A33',
  /** @deprecated Use barpelTeal instead */
  surgicalBlue: '#37A195',
  /** @deprecated Use barpelTeal instead */
  blueBright: '#37A195',
  /** @deprecated Use barpelTealDark instead */
  clinicalBlue: '#2F8E88',
  /** @deprecated Use barpelTealDark instead */
  blueMedium: '#2F8E88',
  /** @deprecated Use tealLight instead */
  sterileWash: '#E8F5F2',
  /** @deprecated Use tealLight instead */
  blueLight: '#E8F5F2',
  /** @deprecated Use borderGray instead */
  skyMist: '#E5E7EB',
  /** @deprecated Use borderGray instead */
  blueSubtle: '#E5E7EB',
  /** @deprecated Use pureWhite instead */
  offWhite: '#FFFFFF',
  /** @deprecated Use tealLight instead */
  cream: '#E8F5F2',
  /** @deprecated Use borderGray instead */
  sage: '#E5E7EB',
} as const;

/** Type-safe brand color names */
export type BrandColorName = keyof typeof brandColors;

/** Type-safe gradient directions */
export type GradientDirection = 'to-r' | 'to-l' | 'to-b' | 'to-t' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl';

/**
 * Creates a Tailwind CSS gradient class name
 *
 * Generates a gradient string compatible with Tailwind's bg-gradient-to-* utilities.
 * Automatically constructs the appropriate from/via/to color classes.
 *
 * @param from - Starting color name from brandColors
 * @param to - Ending color name from brandColors
 * @param direction - Gradient direction (default: 'to-br')
 * @returns CSS gradient class string compatible with Tailwind
 *
 * @example
 * // Returns: "bg-gradient-to-br from-[#0015ff] to-[#87ceeb]"
 * createBrandGradient('blueBright', 'blueLight', 'to-br')
 *
 * @example
 * // Use with React/JSX
 * <div className={createBrandGradient('navyDark', 'blueBright')}>
 *   Content with gradient background
 * </div>
 */
export function createBrandGradient(
  from: BrandColorName,
  to: BrandColorName,
  direction: GradientDirection = 'to-br'
): string {
  // Validate inputs
  if (!(from in brandColors)) {
    console.warn(`Invalid brand color name: ${from}`);
    return '';
  }

  if (!(to in brandColors)) {
    console.warn(`Invalid brand color name: ${to}`);
    return '';
  }

  const fromColor = brandColors[from];
  const toColor = brandColors[to];

  return `bg-gradient-${direction} from-[${fromColor}] to-[${toColor}]`;
}

/**
 * Glow intensity presets for consistent visual hierarchy
 *
 * @constant
 * @type {Record<string, number>}
 */
const GLOW_INTENSITY_MAP: Record<string, number> = {
  subtle: 0.15,
  default: 0.3,
  medium: 0.5,
  strong: 0.75,
  intense: 1.0,
} as const;

/**
 * Creates a CSS box-shadow glow effect using brand colors
 *
 * Generates a box-shadow value suitable for creating glowing effects around elements.
 * Useful for highlighting active states, hover effects, or drawing attention to CTAs.
 *
 * The glow spreads outward and is semi-transparent to avoid harsh visual artifacts.
 *
 * @param color - Brand color name to use for the glow
 * @param intensity - Glow intensity (0-1) or preset name (default: 0.3)
 *                    - Can be: 'subtle' (0.15), 'default' (0.3), 'medium' (0.5),
 *                    'strong' (0.75), 'intense' (1.0)
 * @returns CSS box-shadow value ready for inline styles or CSS
 *
 * @example
 * // Subtle glow on default intensity (0.3)
 * <button style={{ boxShadow: createBrandGlow('blueBright') }} />
 *
 * @example
 * // Named intensity preset
 * <div style={{ boxShadow: createBrandGlow('blueMedium', 'strong') }} />
 *
 * @example
 * // Custom numeric intensity
 * <a style={{ boxShadow: createBrandGlow('navyDark', 0.75) }} />
 *
 * @example
 * // Use in Tailwind with arbitrary values
 * <div className="[box-shadow:0_0_20px_rgba(0,21,255,0.3)]" />
 */
export function createBrandGlow(
  color: BrandColorName,
  intensity: number | keyof typeof GLOW_INTENSITY_MAP = 'default'
): string {
  // Validate color
  if (!(color in brandColors)) {
    console.warn(`Invalid brand color name: ${color}`);
    return '';
  }

  // Resolve intensity
  let resolvedIntensity: number;

  if (typeof intensity === 'string') {
    if (!(intensity in GLOW_INTENSITY_MAP)) {
      console.warn(`Invalid glow intensity preset: ${intensity}`);
      resolvedIntensity = 0.3;
    } else {
      resolvedIntensity = GLOW_INTENSITY_MAP[intensity];
    }
  } else {
    // Clamp numeric intensity to 0-1 range
    resolvedIntensity = Math.max(0, Math.min(1, intensity));
  }

  const hexColor = brandColors[color];

  // Convert hex to RGB for rgba format
  const rgb = hexToRgb(hexColor);

  if (!rgb) {
    console.error(`Failed to convert color ${hexColor} to RGB`);
    return '';
  }

  // Create multiple box-shadow layers for a smooth glow effect
  // Using multiple blur radii creates a more natural, diffused glow
  return [
    `0 0 10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${resolvedIntensity * 0.4})`,
    `0 0 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${resolvedIntensity * 0.3})`,
    `0 0 30px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${resolvedIntensity * 0.2})`,
  ].join(', ');
}

/**
 * Converts hex color string to RGB object
 *
 * Internal utility for createBrandGlow. Handles both 3-digit and 6-digit hex formats.
 *
 * @param hex - Hex color string (e.g., "#0015ff" or "#fff")
 * @returns Object with r, g, b properties, or null if invalid
 *
 * @internal
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');

  // Handle 3-digit hex (#rgb)
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }

  // Handle 6-digit hex (#rrggbb)
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    // Validate parsed values
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
      return null;
    }

    return { r, g, b };
  }

  return null;
}

/**
 * Gets the contrast color pair for accessibility
 *
 * Provides recommended text color (dark or light) for a given background color
 * to ensure sufficient contrast ratio (WCAG AA standard).
 *
 * @param bgColor - Background color name
 * @returns Object with recommended light and dark text colors
 *
 * @example
 * const { light, dark } = getContrastPair('blueBright');
 * // Use: color: dark on blueBright
 */
export function getContrastPair(bgColor: BrandColorName): {
  light: string;
  dark: string;
} {
  // Dark background colors need light text
  const darkBgs = ['deepSlate', 'barpelTeal', 'barpelTealDark', 'navyDark', 'blueBright', 'blueMedium'];

  if (darkBgs.includes(bgColor)) {
    return {
      light: brandColors.pureWhite,
      dark: brandColors.deepSlate,
    };
  }

  // Light background colors need dark text
  return {
    light: brandColors.pureWhite,
    dark: brandColors.deepSlate,
  };
}

/**
 * Creates a complete color scheme for a component
 *
 * Generates a cohesive set of colors for a component including background,
 * text, border, and hover states.
 *
 * @param primary - Primary color to base the scheme around
 * @param variant - Optional variant (default: 'primary')
 * @returns Object with semantic color names
 *
 * @example
 * const colors = createColorScheme('blueBright');
 * // Returns: { bg: '...', text: '...', border: '...', hover: '...' }
 */
export function createColorScheme(
  primary: BrandColorName,
  variant: 'primary' | 'secondary' | 'subtle' = 'primary'
) {
  const contrastColors = getContrastPair(primary);

  return {
    bg: brandColors[primary],
    text: contrastColors.dark,
    border: brandColors[primary],
    hover: `${brandColors[primary]}dd`, // Add transparency for hover
  };
}

/**
 * Exports all brand colors as CSS variables for use in stylesheets
 *
 * @returns String of CSS variable declarations
 *
 * @example
 * // Add to your global CSS file:
 * // :root { getCSSVariables() }
 */
export function getCSSVariables(): string {
  return Object.entries(brandColors)
    .map(([name, value]) => `--color-${name}: ${value};`)
    .join('\n');
}

/**
 * Type-safe color picker utility for runtime color selection
 *
 * Prevents runtime errors when selecting colors dynamically.
 *
 * @param colorName - Color name to retrieve
 * @param fallback - Fallback color if name is invalid
 * @returns Valid hex color string
 *
 * @example
 * const color = getColor('blueBright', brandColors.blueLight);
 */
export function getColor(
  colorName: string,
  fallback: string = brandColors.barpelTeal
): string {
  if (colorName in brandColors) {
    return brandColors[colorName as BrandColorName];
  }

  console.warn(`Color "${colorName}" not found in brand palette, using fallback`);
  return fallback;
}

/**
 * Animation color utilities for smooth transitions
 *
 * Helpful when animating between brand colors
 */
export const animationColors = {
  /** Smooth transition between slate and teal */
  slateToBarpelTeal: [brandColors.deepSlate, brandColors.barpelTeal],

  /** Gradient sweep for loading states */
  gradientSweep: [
    brandColors.barpelTeal,
    brandColors.barpelTealDark,
    brandColors.tealLight,
  ],

  /** Accessibility-focused status colors */
  status: {
    success: '#10b981', // Emerald for success
    warning: '#f59e0b', // Amber for warning
    error: '#ef4444', // Red for errors
    info: brandColors.barpelTeal,
  },
} as const;

// Export type for convenience
export type BrandColorValue = (typeof brandColors)[BrandColorName];
