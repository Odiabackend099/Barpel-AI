# Logo Package - Complete Web Branding Kit

## 📦 Package Contents

This logo package contains all the formats and sizes you need for professional web branding.

---

## 🎨 Logo Variations

### Full Color (Original Gradient)
| File | Size | Use Case |
|------|------|----------|
| `logo_master_transparent.png` | 280×333 | Master file with transparent background |
| `logo_square_master.png` | 333×333 | Square master for social media |
| `logo-64.png` | 64×64 | Small header logos |
| `logo-128.png` | 128×128 | Standard web logos |
| `logo-256.png` | 256×256 | Retina displays |
| `logo-512.png` | 512×512 | High-res needs |

### White Version (For Dark Backgrounds)
| File | Size | Use Case |
|------|------|----------|
| `logo_white.png` | 280×333 | Dark themed websites |
| `logo_square_white.png` | 333×333 | Dark mode social profiles |

### Dark Version (For Light Backgrounds - Monochrome)
| File | Size | Use Case |
|------|------|----------|
| `logo_dark.png` | 280×333 | Print materials, light themes |
| `logo_square_dark.png` | 333×333 | Monochrome social profiles |

---

## 🔖 Favicons & Touch Icons

| File | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 16×16, 32×32, 48×48 | Browser tab icon (multi-res) |
| `favicon-16.png` | 16×16 | Legacy favicon |
| `favicon-32.png` | 32×32 | Standard favicon |
| `apple-touch-icon.png` | 180×180 | iOS home screen icon |
| `mstile-150x150.png` | 150×150 | Windows 8/10 tiles |

---

## 📱 Social Media Sizes

| File | Size | Platform |
|------|------|----------|
| `square-180.png` | 180×180 | Facebook profile |
| `square-400.png` | 400×400 | Twitter/X profile |
| `square-512.png` | 512×512 | LinkedIn, general |
| `square-1080.png` | 1080×1080 | Instagram, high-res |
| `social-180.png` | 180×180 | Facebook share |
| `social-400.png` | 400×400 | Twitter/X share |
| `social-1080.png` | 1080×1080 | Instagram posts |

---

## 💻 HTML Implementation

### Basic Website Header Logo
```html
<!-- Standard logo in header -->
<img src="/logo-128.png" alt="Your Brand" width="128" height="auto">

<!-- For retina displays -->
<img src="/logo-256.png" alt="Your Brand" width="128" height="auto">
```

### Favicon Setup (Add to `<head>`)
```html
<!-- Standard favicon -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">

<!-- PNG favicons for modern browsers -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Microsoft Tiles -->
<meta name="msapplication-TileImage" content="/mstile-150x150.png">
<meta name="msapplication-TileColor" content="#008080">
```

### Dark Mode Support
```html
<!-- Use white logo on dark backgrounds -->
<img src="/logo_white.png" alt="Your Brand" class="logo-dark">

<!-- Or use CSS to switch -->
<picture>
  <source srcset="/logo_white.png" media="(prefers-color-scheme: dark)">
  <img src="/logo_master_transparent.png" alt="Your Brand">
</picture>
```

### Responsive Logo
```html
<picture>
  <!-- High-res for retina -->
  <source srcset="/logo-512.png" media="(min-width: 1920px)">
  <source srcset="/logo-256.png" media="(min-width: 1024px)">
  <source srcset="/logo-128.png" media="(min-width: 768px)">
  <!-- Fallback -->
  <img src="/logo-64.png" alt="Your Brand">
</picture>
```

---

## 🎨 Brand Colors

Extracted from your logo:

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Teal | `#1A4D5C` | Primary dark |
| Ocean Blue | `#2E8B8B` | Primary mid |
| Mint Green | `#7FFFD4` | Accent light |
| White | `#FFFFFF` | Light version |
| Dark Slate | `#2D3748` | Dark version |

---

## 📋 Best Practices

1. **Always use PNG with transparency** for web logos
2. **Use the ICO file** for favicon (supports multiple resolutions)
3. **Provide 2x resolution** for retina displays
4. **Use white version** on dark backgrounds for contrast
5. **Use dark version** when color printing is limited
6. **Keep square versions** for social media profiles

---

## 📁 File Organization Recommendation

```
/assets/
  /logo/
    logo-128.png
    logo-256.png
    logo_white.png
  /favicon/
    favicon.ico
    favicon-32.png
    apple-touch-icon.png
  /social/
    square-400.png
    square-1080.png
```

---

**Generated:** 2026-03-01  
**Format:** PNG (transparent), ICO  
**Quality:** Web-optimized, HD ready
