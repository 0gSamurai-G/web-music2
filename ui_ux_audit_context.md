# VoidFrequencies UI/UX Audit Context Report

This document records the exact structure, layout, colors, typography, shapes, and interactive properties of all screens, components, and overlays of the **VoidFrequencies** web application. It serves as the official design handoff and consistency verification document.

---

## Brand Design System Tokens

### 1. Color Palette Custom Properties
*   **Void Black (Page Background)**: `#05050f` (Defined as `--void-black` / `--background`)
*   **Star White (Primary Text & Active Elements)**: `#e8eaff` (Defined as `--star-white` / `--foreground`)
*   **Ice Blue (Main Accent & Active Nav Borders)**: `#a8b4f8` (Defined as `--ice-blue` / `--primary`)
*   **Cosmos Purple (Secondary Details & Progress Elements)**: `#6b5fe4` (Defined as `--cosmos-purple` / `--secondary`)
*   **Galaxy Gold (Special Achievements & Highlights)**: `#c9a84c` (Defined as `--galaxy-gold` / `--accent`)
*   **Muted Foreground**: `rgba(232, 234, 255, 0.5)` (Defined as `--muted-foreground`)
*   **Border Gray**: `rgba(255, 255, 255, 0.12)` (Defined as `--border` / `--glass-border`)
*   **Card Background**: `rgba(255, 255, 255, 0.05)` (Defined as `--card`)

### 2. Typography Hierarchy
*   **Display Font**: Space Grotesk (`var(--font-space-grotesk)`)
*   **Sans Font**: DM Sans (`var(--font-dm-sans)`)

### 3. Corner Radius Standards
*   **Standard Radius**: `16px` (`--radius`)
*   **Small Radius**: `calc(var(--radius) - 4px)` (12px)
*   **Large Radius**: `calc(var(--radius) + 4px)` (20px)
*   **X-Large Radius**: `calc(var(--radius) + 8px)` (24px)

---

# Section-by-Section UI/UX Audit

## Section 1: Global Navigation Bar — Global

**Layout**
*   **Structure**: Row container (`flex justify-between items-center`). Left side: App Logo and brand title. Right side: Navigation links.
*   **Spacing**: Inset padding `px-6 py-5` (mobile) to `md:px-12` (desktop). Element gaps: `gap-3` (12px) in logo block, `gap-8` (32px) in nav links block.
*   **Alignment**: Fixed at `top-0 left-0 right-0 z-50` spanning edge-to-edge.

**Color**
*   **Background**: Scrolled state uses glassmorphic `rgba(5, 5, 15, 0.7)` background with `backdrop-filter: blur(20px)`. Default state is transparent (`none`).
*   **Text**: Logo and links use `#e8eaff`. Inactive links are `opacity-70`. Active states switch to `#a8b4f8`.
*   **Accent/CTA**: Active link is highlighted in ice-blue (`#a8b4f8` / `var(--ice-blue)`) and has active border underline.
*   **Breaks**: None.

**Typography**
*   **Font family**: Display font Space Grotesk (`font-display`).
*   **Sizes/Weights**: Brand title: `text-lg` (18px), `font-semibold` (600). Nav links: `text-xs` (12px), `uppercase`, `tracking-widest` (0.1em).

**Shape & Elevation**
*   **Corner radius**: Sharp container edges (0px). Logo has circular geometry.
*   **Elevation/Borders**: Scrolled bottom border is `1px solid rgba(255, 255, 255, 0.06)`. No shadows.

**Imagery/Iconography**
*   **Photo style**: None.
*   **Icon style**: `AppLogo` matches the active image asset `/assets/images/app_logo.png` (`size=32`).

**Interactive States**
*   **Buttons**: Hovering nav links increases opacity to 100% and changes color to `#a8b4f8`.
*   **CTA styling**: None.

**Inconsistency Flags**
*   Unscrolled state is transparent on `/` but static blurred on `/albums` and `/album-detail`.

---

## Section 2: Chapter 0: Intro (Hero Viewport) — Home Screen (`/`)

**Layout**
*   **Structure**: Single column viewport stack (`100vh`). Centered title block and bottom indicator.
*   **Spacing**: Centered absolutely via `translate(-50%, -50%)`. Subheading matches `mt-6` (24px). Scroll indicator is offset at `bottom-12` (48px).
*   **Alignment**: Horizontally and vertically centered.

**Color**
*   **Background**: Deep space void black (`#05050f`) with dynamic parallax background `/assets/images/cosmic_bg_landing.png`.
*   **Text**: Title uses `#e8eaff`. Subtitle uses `#a8b4f8`.
*   **Accent/CTA**: Subtitle has `opacity-70`. Scroll indicator matches `#a8b4f8` with linear gradient fade.
*   **Breaks**: None.

**Typography**
*   **Font family**: Display font Space Grotesk.
*   **Sizes/Weights**: Title: fluid `clamp(2.5rem, 7vw, 4.5rem)`, `font-bold` (700). Subtitle: fluid `clamp(0.7rem, 1.5vw, 0.875rem)` with tracking spacer `tracking-[0.5em]`.

**Shape & Elevation**
*   **Corner radius**: N/A.
*   **Elevation/Borders**: Title uses glowing text shadows: `textShadow: '0 0 40px rgba(168, 180, 248, 0.3), 0 0 80px rgba(168, 180, 248, 0.1)'`. Subtitle uses `0 0 20px rgba(168, 180, 248, 0.2)`.

**Imagery/Iconography**
*   **Photo style**: Moving celestial space background painting (`cosmic_bg_landing.png`).
*   **Icon style**: None.

**Interactive States**
*   **Buttons**: None.
*   **CTA styling**: None.

**Inconsistency Flags**
*   None.

---

## Section 3: Chapter 01: Free Fall (Second Viewport) — Home Screen (`/`)

**Layout**
*   **Structure**: Dual column layout positioning elements absolutely. Anime graphic is situated on the left; textual headline + caption column on the right.
*   **Spacing**: Image at `left: 10%`, text at `right: 6%` of the viewport. Headline gap is `mt-4` (16px), tag gap is `mt-8` (32px).
*   **Alignment**: Vertically centered (`translate-y[-50%]`). Left side: left-aligned image. Right side: right-aligned text column (`text-right`).

**Color**
*   **Background**: Void black (`#05050f`) with floating particle effect.
*   **Text**: Headline: `#e8eaff`. Caption: `rgba(232, 234, 255, 0.6)`. Chapter counter: `#a8b4f8`.
*   **Accent/CTA**: Counter tag uses `#a8b4f8` at `opacity-70`.
*   **Breaks**: None.

**Typography**
*   **Font family**: Headline uses Space Grotesk (utility `.chapter-headline`). Description uses DM Sans. Chapter number uses Space Grotesk.
*   **Sizes/Weights**: Headline: fluid `clamp(3rem, 10vw, 6.5rem)`, `weight: 700`. Caption: `clamp(0.875rem, 2vw, 1.125rem)`, `weight: 300`. Chapter Label: `text-xs` (12px), `uppercase`, `tracking-widest`.

**Shape & Elevation**
*   **Corner radius**: None.
*   **Elevation/Borders**: Headline draws glow shadow layers (`.chapter-headline::before` blurs offset at `top: 8px; left: 6px` at `opacity-15` and `blur(8px)`).

**Imagery/Iconography**
*   **Photo style**: Anime sketch illustration of a character falling, mix-blended (`mix-blend-mode: screen`).
*   **Icon style**: None.

**Interactive States**
*   **Buttons**: None.
*   **CTA styling**: None.

**Inconsistency Flags**
*   **Typography Deviation**: Description paragraph utilizes the sans-serif font (`DM Sans`) instead of the display font used for the corporate title headings.

---

## Section 4: Chapter 02: Descent / Sink (Third Viewport) — Home Screen (`/`)

**Layout**
*   **Structure**: Absolute split layout. Character overlay is placed centered-left, text column positioned on the left margin.
*   **Spacing**: Artwork boundaries map to `left: 50%`, `top: 45%` (centered). Text column is aligned `left: 6%`. Text margin is `mt-4` (16px), badge space is `mt-8` (32px).
*   **Alignment**: Image centered (rotated `-8deg`). Text column is left-aligned.

**Color**
*   **Background**: Void black background (`#05050f`) with dark blue starfield.
*   **Text**: Heading: `#e8eaff`. Subtitle: `rgba(232, 234, 255, 0.6)`. Badge: `#a8b4f8`.
*   **Accent/CTA**: "Chapter 02" uses `#a8b4f8`.
*   **Breaks**: None.

**Typography**
*   **Font family**: Headline/labels use Space Grotesk. Subtitle uses DM Sans.
*   **Sizes/Weights**: Headline: fluid `clamp(3rem, 10vw, 6.5rem)` (bold 700). Subtitle: `clamp(0.875rem, 2vw, 1.125rem)` (light 300). Badge: `text-xs` (12px).

**Shape & Elevation**
*   **Corner radius**: Under-water bubble elements are circles (`rounded-full`).
*   **Elevation/Borders**: Standard drop shadows.

**Imagery/Iconography**
*   **Photo style**: Sinking anime character drawing with hair floating, screen blended.
*   **Icon style**: None.

**Interactive States**: None.

**Inconsistency Flags**: None.

---

## Section 5: Chapter 03: Surface / Rise (Fourth Viewport) — Home Screen (`/`)

**Layout**
*   **Structure**: Absolute position split. Floating character artwork on the right-center, text blocks positioned on the left margin.
*   **Spacing**: Art positioned at `right: 12%`, text box placed at `left: 6%` of the viewport. Spacers: margins `mt-4` and `mt-8`.
*   **Alignment**: Left column is left-aligned. Right side image shifted up.

**Color**
*   **Background**: Void black background (`#05050f`) with twinkling blue stars.
*   **Text**: Heading: `#e8eaff`. Caption: `rgba(232, 234, 255, 0.6)`. Tag: `#a8b4f8`.
*   **Accent/CTA**: "Chapter 03" uses `#a8b4f8`.
*   **Breaks**: None.

**Typography**
*   **Font family**: Headings Display (Space Grotesk), details Sans (DM Sans).
*   **Sizes/Weights**: Title: `clamp(3rem, 10vw, 6.5rem)` (bold 700). Details: `clamp(0.875rem, 2vw, 1.125rem)` (light 300).

**Shape & Elevation**
*   **Corner radius**: Bubble particles (3 item slots) are circular.
*   **Elevation/Borders**: Standard text shadows.

**Imagery/Iconography**
*   **Photo style**: Rising anime character painting, arms stretched upwards (blended screen overlay).
*   **Icon style**: None.

**Interactive States**: None.

**Inconsistency Flags**: None.

---

## Section 6: Chapter 04: Triumph (Fifth Viewport) — Home Screen (`/`)

**Layout**
*   **Structure**: Split absolute layout. Character vector on the left, stats stack + key headline on the right.
*   **Spacing**: Character placed at `left: 8%`. Text container is at `right: 6%` with `maxWidth: 440px`. Margin values: text `mt-1` and `mt-4`, divider spacer `my-6` (24px).
*   **Alignment**: Left image is left-aligned; right text column is right-aligned.

**Color**
*   **Background**: Void black. Radial gradient gold glow behind graphic (`radial-gradient(ellipse at 35% 50%, rgba(201,168,76,0.12) 0%, transparent 65%)`).
*   **Text**: Section indicators: `#a8b4f8`. Numbers & headings: `#e8eaff`. Captions: `rgba(232, 234, 255, 0.6)`. The chapter tag is gold (`#c9a84c` / `var(--galaxy-gold)`).
*   **Accent/CTA**: Gold particles float in background. Chapter label matches `#c9a84c`.
*   **Breaks**: Gold highlights are introduced here, breaking the standard ice-blue schema.

**Typography**
*   **Font family**: Badges/numbers use Space Grotesk. Subtitles use DM Sans.
*   **Sizes/Weights**: Eyebrow: `text-xs` (12px), `uppercase`, `tracking-widest`. Stats: `clamp(3rem, 8vw, 5rem)` (bold 700). Heading: `clamp(2.5rem, 8vw, 5.5rem)` (bold 700). Body: `clamp(0.875rem, 2vw, 1.125rem)` (light 300).

**Shape & Elevation**
*   **Corner radius**: Gold particles are circular.
*   **Elevation/Borders**: Horizontal divider line is `height: 1px`, `background: rgba(168,180,248,0.2)`.

**Imagery/Iconography**
*   **Photo style**: Anime character hold microphone triumphantly, screen blended.
*   **Icon style**: None.

**Interactive States**: None.

**Inconsistency Flags**
*   **Theme shift**: Switches design detailing from Ice Blue (`#a8b4f8`) to Galaxy Gold (`#c9a84c`).

---

## Section 7: Chapter 05: Albums Reveal Carousel — Home Screen (`/`)

**Layout**
*   **Structure**: Curved horizontal carousel. Active card centered; side cards are translated horizontally, scaled down, and blurred. Margin arrows on sides; navigation dots indicator below.
*   **Spacing**: Grid padding `px-6 md:px-12`. Slide gap scales by `offset * 235` pixels translation. Control buttons placed at `calc(50% - 730px / 2)`. Indicator gap is `mt-2` (8px).
*   **Alignment**: Center-aligned.

**Color**
*   **Background**: Void black background. Active card has glass border glow.
*   **Text**: Card title: `#e8eaff`. Metadata: `rgba(255,255,255,0.4)`. Inactive text lines: `rgba(255,255,255,0.5)`. Labels: `#a8b4f8`.
*   **Accent/CTA**: Slider dot is `#a8b4f8` for active indexes, and `rgba(255,255,255,0.2)` on inactive indexes.
*   **Breaks**: None.

**Typography**
*   **Font family**: Header display is Space Grotesk. Details/body use DM Sans.
*   **Sizes/Weights**: Category detail: `text-xs` (12px). Section subtitle: `clamp(2rem, 6vw, 4rem)`. Card header: `text-[1rem]` (16px), `font-semibold`. Description lines: `text-xs` (12px).

**Shape & Elevation**
*   **Corner radius**: Carousel album card uses hardcoded inline `borderRadius: '20px'`. Cover image: `borderRadius: '20px 20px 0 0'`. Carousel buttons use `borderRadius: '16px'` (mismatch).
*   **Elevation/Borders**: Active card uses `border: '1.5px solid rgba(168,180,248,0.35)'` and glowing shadow `box-shadow: 0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(107,95,228,0.15)`.

**Imagery/Iconography**
*   **Photo style**: Combined anime character and cosmic vector album art illustrations.
*   **Icon style**: Text arrows `❮` and `❯` inside buttons.

**Interactive States**
*   **Buttons**: Click indicators grow from width `6px` to `24px` when active. Hovering cards activates `Explore` cursor (`data-cursor="album"`). carousel buttons use `.glass-btn` transitions.
*   **CTA styling**: None.

**Inconsistency Flags**
*   **Border Radius mismatch**: Cards use `20px` border-radius instead of standard `16px` (`--radius`).
*   **Button corners**: Carousel buttons use `16px` corners instead of Circular/Pill standard.

---

## Section 8: Chapter 06: Top Songs Section — Home Screen (`/`)

**Layout**
*   **Structure**: Split screen view. Circular scrollable list card on the left; music player widget on the right.
*   **Spacing**: Column gap is `gap-8 lg:gap-16`. Inner rows use gap `gap-2` (8px). Outer row border padding is `px-4 py-2.5 md:px-6 md:py-3`. Player player details margins: `mt-5` (20px), volume slider `mt-4` (16px).
*   **Alignment**: Center-aligned layout; list left-aligned within the circular graphics frame.

**Color**
*   **Background**: List background is an image of the moon `/assets/images/moon.png` with glow shadow `0 0 80px rgba(168,180,248,0.2)`. Player music cover is a linear gradient: `linear-gradient(135deg, rgba(107,95,228,0.4) 0%, rgba(201,168,76,0.2) 50%, rgba(168,180,248,0.3) 100%)`.
*   **Text**: Active song details: `#e8eaff`. Active song rank badge: `#e8eaff`. Inactive song elements: `rgba(255,255,255,0.45)`.
*   **Accent/CTA**: active row badge background is `#6b5fe4` (`var(--cosmos-purple)`). Progress bar filling uses purple-to-blue gradient.
*   **Breaks**: None.

**Typography**
*   **Font family**: Song titles/ranks use Space Grotesk. Artist/durations use DM Sans.
*   **Sizes/Weights**: Rank numbers: `text-[0.65rem]` / active `text-[0.75rem]`. Song title: `text-[0.85rem]` (font-semibold). Center title: `clamp(1.25rem, 3vw, 1.5rem)`.

**Shape & Elevation**
*   **Corner radius**: list rows are fully rounded `rounded-full` (9999px). Playback card uses `rounded-2xl` (16px). Center play button: circle `rounded-full`.
*   **Elevation/Borders**: Active song row uses `border: '1px solid rgba(255,255,255,0.12)'` and shadow `0 4px 16px rgba(107,95,228,0.4)`. Play button uses shadow `0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(107,95,228,0.2)'`.

**Imagery/Iconography**
*   **Photo style**: Moon graphic painting wrapper; abstract music notes.
*   **Icon style**: Text Emojis: `⏮`, `⏸`, `▶`, `⏭`, `🔊`, `🔈`, `🎵`.

**Interactive States**
*   **Buttons**: Active row uses solid purple backgrounds; inactive rows show hover overlays (`bg-rgba(255,255,255,0.03)`). Play button scales on hover.
*   **CTA styling**: Play button uses a thin custom border styling.

**Inconsistency Flags**
*   **Icon System**: Emojis are used for controls instead of standard SVG vectors.
*   **Player styling controls**: Differ from the controls on `/album-detail` (different color, border size, and glows).

---

## Section 9: All Albums Grid — Albums Route (`/albums`)

**Layout**
*   **Structure**: Grid layout with auto-fitting responsive columns: `gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))'`.
*   **Spacing**: Outer margins `mb-20` (80px). Internal layout grid gap is `gap-6` (24px). Details block has padding `p-4` (16px).
*   **Alignment**: Center-aligned max-width container (`max-w-7xl mx-auto`).

**Color**
*   **Background**: Card background is transparent (`transparent`) with no backdrop filter on default load. Hovering dynamically renders glass background `rgba(255, 255, 255, 0.08)` and blur.
*   **Text**: Heading: `#e8eaff`. Subtitles: `rgba(255,255,255,0.5)`. Captions: `rgba(255,255,255,0.4)`.
*   **Accent/CTA**: Hover action highlights card borders with Ice-Blue (`rgba(168,180,248,0.3)`) and adds a purple shadow glow.
*   **Breaks**: None.

**Typography**
*   **Font family**: Card Heading uses Space Grotesk; details and descriptions use DM Sans.
*   **Sizes/Weights**: title: `text-[1rem]` (16px, font-semibold). Meta: `text-[0.75rem]` (12px). Description: `text-[0.8rem]`, `line-height: 1.5`.

**Shape & Elevation**
*   **Corner radius**: Card border-radius uses `glass-card` standard: `16px`.
*   **Elevation/Borders**: Default card border: `rgba(255,255,255,0.10)`. Hover shadow: `0 16px 48px rgba(0,0,0,0.8), 0 0 40px rgba(107,95,228,0.25)`.

**Imagery/Iconography**
*   **Photo style**: Dual cover reveals: Hovering follows coordinates to reveal alternate anime artist graphics (`cover_1_b.png`) over the default space nebula artwork (`cover_1_a.png`).
*   **Icon style**: None.

**Interactive States**
*   **Buttons**: Hovering shifts cards vertically (`translateY(-6px)`), changes background color opacity, adds backdrop-blur, and triggers detail exploration cursor (`data-cursor="album"`).
*   **CTA styling**: None.

**Inconsistency Flags**
*   **Radius Difference**: Grid cards use a 16px corner radius, while the identical carousel card uses 20px.

---

## Section 10: Page Stats Row — Albums Route (`/albums`)

**Layout**
*   **Structure**: Responsive 4-Column row layout (`grid grid-cols-2 md:grid-cols-4`).
*   **Spacing**: Separator border: top margin spacing, padding top `pt-12` (48px) and margin bottom `mb-20`. Gaps: `gap-4` (16px).
*   **Alignment**: Center-aligned.

**Color**
*   **Background**: Standard glass card background: `rgba(255, 255, 255, 0.05)`.
*   **Text**: Values: `#e8eaff`. Brand titles: `#a8b4f8`.
*   **Accent/CTA**: Label text details use `#a8b4f8` at `opacity-70`.
*   **Breaks**: None.

**Typography**
*   **Font family**: Display font Space Grotesk.
*   **Sizes/Weights**: Numbers: `clamp(1.5rem, 4vw, 2.5rem)` (bold 700). Indicator tags: `text-xs` (12px), `uppercase`, `tracking-widest`.

**Shape & Elevation**
*   **Corner radius**: Base glassmorphic tokens `16px`.
*   **Elevation/Borders**: Hairline borders `border-[1px]`. Flat drop shadows.

**Imagery/Iconography**: None.

**Interactive States**: Static display cards.

**Inconsistency Flags**: None.

---

## Section 11: Album Description Info Panel — Album Detail Route (`/album-detail` - Album Mode)

**Layout**
*   **Structure**: Multi-column responsive grid (`grid-cols-1 lg:grid-cols-12`). Left side (5 columns) runs the cover artwork. Right side (7 columns) displays metadata and description blocks.
*   **Spacing**: Grid spacing gap is `gap-8 lg:gap-14`. Description panel padding: `p-8` (32px). Tag margin: `mt-8` (32px).
*   **Alignment**: Left side graphics centered. Right side description left-aligned.

**Color**
*   **Background**: Card uses `rgba(255,255,255,0.08)` and explicit `backdrop-filter: blur(24px)`.
*   **Text**: Brand labels: `#a8b4f8`. Main title: `#e8eaff`. Description lines: `rgba(255,255,255,0.65)`. Sub-details: `rgba(255,255,255,0.5)`.
*   **Accent/CTA**: Categories use purple background highlights `rgba(107,95,228,0.15)` and thin borders.
*   **Breaks**: None.

**Typography**
*   **Font family**: Header titles/tags use Space Grotesk. Body paragraphs use DM Sans.
*   **Sizes/Weights**: Subtitle meta: `text-xs` (12px), `uppercase`, `tracking-widest`. Main title: fluid `clamp(2rem, 5vw, 3.5rem)` (bold 700). Details text: `text-[0.9375rem]` (15px) with line height 1.8.

**Shape & Elevation**
*   **Corner radius**: Album card uses standard `16px` border-radius. Highlights are pills.
*   **Elevation/Borders**: Double cover uses glass border custom overrides.

**Imagery/Iconography**
*   **Photo style**: Space nebula dual artwork cover.
*   **Icon style**: Left back button circle arrow indicator: `←`.

**Interactive States**
*   **Buttons**: Back Button has text underlines. Hovering back buttons dynamically adjusts border outline colors to `#a8b4f8` and applies purple glows.
*   **CTA styling**: None.

**Inconsistency Flags**
*   **Background opacity**: Card uses custom `0.08` background opacity and `24px` blurs instead of regular `.glass-card` (`0.05` and `18px` respectively).

---

## Section 12: Album Tracks List — Album Detail Route (`/album-detail` - Album Mode)

**Layout**
*   **Structure**: Single column list elements under the Description Info card.
*   **Spacing**: Padding: `p-4`. Inner tracks items use vertical paddings: `py-3 px-4`. Title offset is `min-width: 20px` under the track list numbers.
*   **Alignment**: Horizontally aligned (`justify-between`), elements left/right structured.

**Color**
*   **Background**: None (transparent). Track items show hover rows `rgba(168,180,248,0.06)`.
*   **Text**: active items: `#e8eaff`. Track indices: `rgba(255,255,255,0.3)`. Durations: `rgba(255,255,255,0.35)`. Hover indicators: `#a8b4f8`.
*   **Accent/CTA**: Left borders highlight `#a8b4f8` on hover.
*   **Breaks**: None.

**Typography**
*   **Font family**: Titles use Space Grotesk. Ranks and durations use DM Sans.
*   **Sizes/Weights**: Indices: `text-[0.75rem]`. Track name details: `text-[0.875rem]`, font weight 500 when active. Play indicators: `text-[0.7rem]`.

**Shape & Elevation**
*   **Corner radius**: Hover track items use `rounded-lg` (8px).
*   **Elevation/Borders**: Custom border left highlight `border-left: 2px solid var(--ice-blue)` when hovered.

**Imagery/Iconography**: None.

**Interactive States**
*   **Buttons**: Hover reveals "▶ Play" script, highlights left borders, and sets hover cursor properties.
*   **CTA styling**: None.

**Inconsistency Flags**: None.

---

## Section 13: Music Player Panel — Album Detail Route (`/album-detail` - Player Mode)

**Layout**
*   **Structure**: Multi-column split grid (`grid-cols-1 lg:grid-cols-12`). Left side (5 columns) runs the double artist visual and playback controls. Right side (7 columns) displays track details, tracklists queue, and lyrics panel.
*   **Spacing**: Art bounds: `aspect-square`, `maxWidth: 380px`. Playback controls are offset `mt-8`. Progress bars are set `mb-3`. Volume row is spaced `mt-6`.
*   **Alignment**: Left side column is center-aligned. Right side details are left-aligned.

**Color**
*   **Background**: Progress bar: `rgba(255,255,255,0.1)`. Active filled section uses `var(--ice-blue)`. Center play button background is solid ice-blue in paused state; changes to `rgba(168,180,248,0.15)` when playing.
*   **Text**: Title text: `#e8eaff`. Inactive tracks: `rgba(255,255,255,0.55)`. Time stamps: `rgba(255,255,255,0.4)`. Active lyric: `#e8eaff`. Side lyrics lines: `rgba(255,255,255,0.3)`.
*   **Accent/CTA**: Pause buttons display solid `#a8b4f8` fillers and dark text, active queue borders use `#a8b4f8`.
*   **Breaks**: none.

**Typography**
*   **Font family**: Song titles, queue lists, and lyrics cards use Space Grotesk headings. Metadata labels use DM Sans.
*   **Sizes/Weights**: Song Title: `clamp(2rem, 5vw, 3.2rem)`. Queue row: title `text-[0.8rem]`, timestamp `text-[0.7rem]`. Lyrics: `text-[0.95rem]` (bold 600 when active, 400 when inactive).

**Shape & Elevation**
*   **Corner radius**: Cover container: `rounded-2xl` (16px). Center play button: circular (`rounded-full`). Side controls capsules: `.glass-btn` (9999px). Queue items: `rounded-lg` (8px). Progress containers: fully rounded.
*   **Elevation/Borders**: Center play button uses standard glass borders. Active queue track uses left highlight border. Queue cards use standard glass drop shadow overlays.

**Imagery/Iconography**
*   **Photo style**: Anime space artwork cover.
*   **Icon style**: Text Emojis: `⏮`, `⏸`, `▶`, `⏭`, `🔈`, `🔊`, `✦`.

**Interactive States**
*   **Buttons**: Play/Pause button switches colors. Volume bar adjusts coordinates. Lyric toggles adjust card indicators.
*   **CTA styling**: Play buttons use solid fills.

**Inconsistency Flags**
*   **Inconsistent icons**: Emojis are used for controls instead of standard SVG icons.
*   **Button styling**: Solid play button paused color breaks the outline aesthetic used on other controls.

---

## Section 14: In-Player Track Queue List — Album Detail Route (`/album-detail` - Player Mode)

**Layout**
*   **Structure**: Scrollable list container nested inside a layout slot in the right-column of the player view.
*   **Spacing**: Grid layout max-height: `maxHeight: 260px` with vertical overflow auto. Inside padding: `p-4` (16px). Gaps under queue row items: standard vertical separators.
*   **Alignment**: Left-aligned details, metadata details right-aligned.

**Color**
*   **Background**: Container matches `rgba(255,255,255,0.08)`. Active row highlight utilizes `rgba(168,180,248,0.10)`.
*   **Text**: Heading labels: `var(--ice-blue)` at 70% opacity. Inactive track descriptions: `rgba(255,255,255,0.55)`. Active song layout title: `var(--star-white)`. Timestamps: `rgba(255,255,255,0.3)`.
*   **Accent/CTA**: Active border utilizes `var(--ice-blue)`. Active index tag indicators: `var(--ice-blue)`.
*   **Breaks**: None.

**Typography**
*   **Font family**: Song titles / structural labels use Space Grotesk. Metadata lines use DM Sans.
*   **Sizes/Weights**: Heading labels: `text-xs` uppercase tracking. Active row details: `text-[0.8rem]` with font weight 500. Timestamps: `text-[0.7rem]`.

**Shape & Elevation**
*   **Corner radius**: Container corner radius is `16px` (`glass-card`). Inside rows use `rounded-lg` (8px) borders.
*   **Elevation/Borders**: Active item border: `border-left: 2px solid var(--ice-blue)`. Container has light border: `1px solid rgba(255,255,255,0.15)`.

**Imagery/Iconography**
*   **Photo style**: None.
*   **Icon style**: Active track icon matches symbol: `♫`.

**Interactive States**
*   **Buttons**: Click triggers playback of selection, resets timelines, and moves active indicators.
*   **CTA styling**: None.

**Inconsistency Flags**: None.

---

## Section 15: In-Player Lyrics Drawer Display — Album Detail Route (`/album-detail` - Player Mode)

**Layout**
*   **Structure**: Centered single column drawer container, toggled conditionally below the tracklist queue.
*   **Spacing**: Card padding: `p-6` (24px). Text rows spacing utilizes vertical line spacing `line-height: 1.9`.
*   **Alignment**: Center-aligned.

**Color**
*   **Background**: Standard glass card: `rgba(255,255,255,0.08)`.
*   **Text**: Active index lyric: `var(--star-white)`. Inactive index lyrics: `rgba(255,255,255,0.3)`.
*   **Accent/CTA**: Gold star icon: `#c9a84c` / `var(--galaxy-gold)`.
*   **Breaks**: None.

**Typography**
*   **Font family**: Display font Space Grotesk.
*   **Sizes/Weights**: Text rows size uses `text-[0.95rem]`. Active lyric uses `font-weight: 600`. Inactive lyrics use `font-weight: 400`.

**Shape & Elevation**
*   **Corner radius**: Standard `16px`.
*   **Elevation/Borders**: Standard glass boundaries.

**Imagery/Iconography**
*   **Photo style**: None.
*   **Icon style**: Gold star emoji highlight: `✦`.

**Interactive States**
*   **Buttons**: Toggle trigger button: capsule pill button uses `.glass-btn` styling to show/hide lyrics card.
*   **CTA styling**: None.

**Inconsistency Flags**: None.

---

## Section 16: Admin Login Flow — Modal Overlay (appears on Copyright triple-click)

**Layout**
*   **Structure**: Fixed screen overlay container (`fixed inset-0 z-[100]`). Card details flex inside the panel (`maxWidth: 420px`).
*   **Spacing**: Card padding `p-8` (32px). Heading margin is `mb-8`. Google buttons have outline margins: `mb-8`. Error banner margins: `mt-4`. Edit mode card: `p-6`.
*   **Alignment**: Center-aligned.

**Color**
*   **Background**: Screen background is void black `#05050f`. Card uses standard glass background `rgba(255,255,255,0.05)` with `box-shadow` and `backdrop-filter`. Error banners: `rgba(255,0,0,0.1)` with red border `rgba(255,0,0,0.2)`. Edit mode preview details: background container `rgba(255,255,255,0.05)`.
*   **Text**: Branding labels: `#e8eaff`. Sub-labels: opacity percentages. Errors: `text-red-400`. Edit mode headings: `#a8b4f8`.
*   **Accent/CTA**: Google button uses `.glass-btn` styling details.
*   **Breaks**: Red outlines/colors are introduced.

**Typography**
*   **Font family**: Headings & lock draw actions use Space Grotesk. Subtexts use DM Sans.
*   **Sizes/Weights**: title: `text-2xl` (24px, font-bold). Close text: `text-xs uppercase tracking-widest`. Guide notes: `text-xs` (12px).

**Shape & Elevation**
*   **Corner radius**: Card uses standard `16px`. Google capsule: circular (`rounded-full`). Errors: `rounded-md` (6px). Edit frame: `rounded-lg` (8px). Line locks use thickness value 3px.
*   **Elevation/Borders**: Standard glass shadows. Pattern dots use custom points size 15px.

**Imagery/Iconography**
*   **Photo style**: Canvas stars animation overlay.
*   **Icon style**: Drawing vector points.

**Interactive States**
*   **Buttons**: Close text increases opacity to 100% on hover. Google button transitions backdrops.
*   **CTA styling**: None.

**Inconsistency Flags**
*   **Lock style**: react-pattern-lock widget features generic canvas vectors that mismatch standard designs.
*   **Close button**: Small flat text button layout with no boundary panel (differs from standard back buttons).

---

## Section 17: 404 Error Screen — `/not-found`

**Layout**
*   **Structure**: Centered single column layout. Elements stack above two action buttons aligned in a row on desktop (`flex-col sm:flex-row gap-4`).
*   **Spacing**: Padding: `p-4` (16px). Icon container: margin `mb-6` (24px). Title margin: `mb-2` (8px), body paragraph margin: `mb-8` (32px). Buttons are padded by `px-6 py-3`.
*   **Alignment**: Center-aligned.

**Color**
*   **Background**: Deep `#05050f` (via class `bg-background`).
*   **Text**: 404 text uses `#a8b4f8` (ice-blue) at `opacity-20`. Title and body text use class `text-onBackground` (which is unmapped, defaulting to default browser styles).
*   **Accent/CTA**: "Go Back" uses solid ice-blue fill (`bg-primary text-primary-foreground`). "Back to Home" uses outline styling; hover adds a gold highlight (`hover:bg-accent hover:text-accent-foreground`).
*   **Breaks**: Unmapped text color utility causes system display differences.

**Typography**
*   **Font family**: Lacks display classes and defaults to the base font: `font-sans` (DM Sans).
*   **Sizes/Weights**: 404 title: `text-9xl` (128px, font-bold). Main caption: `text-2xl` (24px, font-medium). Paragraph: standard body text size. Buttons: `font-medium` (500).

**Shape & Elevation**
*   **Corner radius**: Action buttons use standard Tailwind container shape `rounded-lg` (8px). This is an inconsistency compared to the circular/pill shapes of buttons elsewhere (e.g., `.glass-btn`'s `rounded-full` / 9999px).
*   **Elevation/Borders**: Standard flat styling.

**Imagery/Iconography**
*   **Photo style**: None.
*   **Icon style**: Vector outline icons from `@heroicons/react/24/outline` (`ArrowLeftIcon`, `HomeIcon`) size 16px.

**Interactive States**
*   **Buttons**: Hovering transitions background and text colors.
*   **CTA styling**: Inconsistent solid values.

**Inconsistency Flags**
*   **Typography deviation**: Headings use `DM Sans` instead of the display font `Space Grotesk` which is used everywhere else for titles.
*   **Shape inconsistency**: Button radius is `rounded-lg` (8px) instead of the standard pill `.glass-btn` (9999px / `rounded-full`).
*   **Palette alignment**: Uses unmapped tailwind class `text-onBackground` resulting in broken color styling.

---

## Section 18: Global Footer — Global

**Layout**
*   **Structure**: Responsive row container layout, responsive wrapper aligning children vertically (`flex-col`) on small windows, and horizontally (`sm:flex-row`) on desktops.
*   **Spacing**: Dynamic layout height: `min-height: 100vh` on the Home scroll. Padding is `60px 24px`. Link gap is `gap-8` (32px).
*   **Alignment**: Justified spacing (`justify-between`) centering logo left-side and page links center/right.

**Color**
*   **Background**: Transparent.
*   **Text**: Logo title: `#e8eaff`. Nav links: `rgba(232, 234, 255, 0.5)`. Copyright line: `rgba(232, 234, 255, 0.3)`.
*   **Accent/CTA**: Hover link items transition colors to white.
*   **Breaks**: None.

**Typography**
*   **Font family**: Logo/links use Space Grotesk. Copyright lines use DM Sans.
*   **Sizes/Weights**: Logo: `text-sm font-semibold`. Nav links: `text-sm font-medium`. Copyright: `text-sm`.

**Shape & Elevation**
*   **Corner radius**: AppLogo uses 28px box circle.
*   **Elevation/Borders**: Flat element.

**Imagery/Iconography**
*   **Photo style**: Logo renders pixel art logo asset.
*   **Icon style**: Sparkle icon rendered as logotype graphics.

**Interactive States**
*   **Buttons**: Hovering nav links increases opacity. Copyright highlights on hover (listening for admin clicks).
*   **CTA styling**: None.

**Inconsistency Flags**
*   **Height**: Tall `100vh` footer works for Home page snap scroll, but creates vast empty spacer columns on mobile, `/albums`, and `/album-detail`.

---

## Cross-Screen Consistency Summary

This summary highlights the key variances in styling across elements of the same type:

### 1. Inconsistent Card Corner Radii
*   **Carousel album cards** (`AlbumsReveal.tsx`) use a hardcoded inline corner radius of **`20px`**.
*   **Grid views and stats cards** (`/albums` and `/album-detail`) use `glass-card` styling classes, which compile to a corner radius of **`16px`** (`var(--radius)`).
*   **Track rows** in both player cards use fully rounded pill capsule wrappers (**`9999px`**).
*   **Queue track rows** use a smaller corner radius of **`8px`** (`rounded-lg`).

### 2. Inconsistent Play/Pause CTA Buttons
*   **Under Top Songs player** (`TopSongsSection.tsx`): The main play/pause button is styled with `background: rgba(255,255,255,0.08)`, `border: 1px solid rgba(255,255,255,0.12)`, and uses star-white `#e8eaff` text.
*   **Under Album Detail player** (`/album-detail`): The main play/pause button has a solid Ice-Blue fill (`bg-ice-blue`) with black text when paused, and switches to a translucent outline state when playing.

### 3. Typography Deviations in Headings
*   All headings across `/`, `/albums`, and `/album-detail` utilize the display typeface **`Space Grotesk`** (`font-display`).
*   On the **404 page** (`not-found.tsx`), the page header ("Page Not Found") and status numbers lack display classes and default to the body's sans-serif font **`DM Sans`**.

### 4. Interactive Navigation Buttons
*   **Carousel arrow buttons** (`AlbumsReveal.tsx`): Square rounded blocks using a **`16px`** radius.
*   **Back navigation buttons** (`/album-detail`): Custom circle arrows with custom inline Javascript hover handlers changing shadows and border glows.
*   **404 page buttons** (`not-found.tsx`): Rectangle blocks with a **`8px`** (`rounded-lg`) radius, styled using Solid Indigo `bg-primary` or light grey highlights.
*   **Lyrics toggle button** (`/album-detail`): Uses the standard capsule pill style (`rounded-full`).

### 5. Inconsistent Iconography Systems
*   Core application components use raw text symbols (e.g. `❮`, `❯`, `←`) or **Text Emojis** (e.g. `⏮`, `▶`, `⏸`, `⏭`, `🔊`, `🔈`, `🎵`) in headers and player controls.
*   The **404 page** (`not-found.tsx`) and the global logo component (`AppIcon.tsx`) display React SVG vector graphics from `@heroicons/react/24/outline`.

### 6. Broken Color Tokens
*   The **404 page** uses class elements `text-onBackground` and `text-onBackground/70`. Since `onBackground` is not defined in the CSS custom properties or theme configuration, it resolves to default browser styles and lacks design system protection.
*   The **Dual Cover component** defaults to a red-orange (`rgb(255, 90, 50)`) ring stroke internally, requiring manual overrides (`ringRgb="168,180,248"`) on every screen to map it to the active Ice-Blue theme.
