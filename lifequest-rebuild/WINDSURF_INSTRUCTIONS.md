# LifeQuest Dashboard — Full Rebuild Instructions for Windsurf

## TUJUAN
Rebuild layout dashboard agar **100% persis** dengan mockup (file `ChatGPT_Image_25_Mei_2026__18_30_58.png`).
Ini bukan perubahan kecil — ini perubahan layout fundamental dari tab-based menjadi sidebar + grid layout.

---

## ARSITEKTUR BARU (sesuai mockup)

```
┌─────────────────────────────────────────────────────────────────┐
│  TOPBAR: Logo | Coins 2,450 | Gems 1,280 | Energy 5/5 | + | 🔔 Avatar │
├──────────────┬──────────────────────────────────────────────────┤
│              │  Welcome back, / Adventurer! ⚔️                  │
│  SIDEBAR     │  Level up your habits. Level up your life.       │
│  (220px)     ├──────────────────────────────────────────────────┤
│              │  ROW 1: [Character Card] [Daily Quests] [Boss]   │
│  • Dashboard │                                                  │
│  • Habits    ├──────────────────────────────────────────────────┤
│  • Quests    │  ROW 2: [Habit Calendar] [Weekly Challenge]      │
│  • Boss      │          [Stats Overview + Recent Achievements]  │
│  • Inventory │                                                  │
│  • Shop      │                                                  │
│  • Achieve   │                                                  │
│  • Stats     │                                                  │
│  ──────────  │                                                  │
│  Weekly Rank │                                                  │
│  #24         │                                                  │
│  ──────────  │                                                  │
│  Player Card │                                                  │
│  (Sung JW)   │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

---

## FILE YANG HARUS DIUBAH

### 1. `components/layout/dashboard-sidebar.tsx` — FILE BARU (BUAT)
### 2. `components/layout/dashboard-topbar.tsx` — REPLACE TOTAL
### 3. `components/layout/dashboard-tabs.tsx` — REPLACE TOTAL (jadi grid layout, bukan tabs)
### 4. `components/sections/daily-quests-panel.tsx` — FILE BARU (BUAT)
### 5. `components/sections/boss-battle-preview.tsx` — FILE BARU (BUAT, versi mini untuk dashboard)
### 6. `components/sections/habit-calendar-panel.tsx` — FILE BARU (BUAT)
### 7. `components/sections/stats-overview-panel.tsx` — FILE BARU (BUAT)
### 8. `components/sections/recent-achievements-panel.tsx` — FILE BARU (BUAT)
### 9. `app/dashboard/page.tsx` — REPLACE TOTAL
### 10. `app/globals.css` — TAMBAH CSS variables baru

---

## SPESIFIKASI DETAIL SETIAP KOMPONEN

### TOPBAR (sesuai mockup pixel-perfect)
- Background: `#0a0e17` dengan border-bottom `rgba(255,255,255,0.07)`
- Kiri: Logo icon (gradient biru-purple) + "LifeQuest" bold + "RPG YOUR LIFE" uppercase kecil
- Tengah: 3 stat pills (Coins 🪙2,450 | Gems 💎1,280 | Energy ⚡5/5) + tombol "+"
- Kanan: Bell icon dengan badge "3" merah + Avatar bulat (SVG character)
- Height: 52px sticky

### SIDEBAR (sesuai mockup)
- Width: 220px fixed, background `#090d14`, border-right
- Nav items: Dashboard (active=purple bg), Habits, Quests, Boss Battle, Inventory, Shop, Achievements, Stats
- Icon emoji di kiri setiap item
- Active state: background `rgba(139,92,246,0.18)`, border `rgba(139,92,246,0.3)`
- Bottom: Weekly Rank card (#24, trophy, "Top 8% this week") + Player mini card (Sung Jing-Woo, LV23, EXP bar 70%)

### CHARACTER CARD (kolom 1, row 1)
- Background gradient: `#1a0f3a → #0e0a1f → #080b15`
- "LEVEL 23" badge putih di atas tengah
- SVG character Shadowwalker (rambut spiky hitam, mata purple glowing)
- Nama: "Shadowwalker", class: "Discipline Hunter"  
- EXP bar: 2,450/3,500 = 70%, gradient purple
- Stats row: ❤️ 90/100 HP | ⚡ 5/5 Energy | 🪙 2,450 Coins

### DAILY QUESTS PANEL (kolom 2, row 1)
- Badge "TODAY'S QUEST" putih di atas tengah (absolute positioned)
- Header: 🚩 Daily Quests
- Banner: "Complete all for bonus!" | 🎁 +150 XP 🪙 +50 Coins
- 5 quest items dengan checkbox (4 done ✓ purple, 1 pending):
  1. 🧘 Meditate 10 minutes | +20 XP 🪙+10 | Streak 7🔥 | ✓
  2. 📚 Study 1 hour | +40 XP 🪙+20 | Streak 5🔥 | ✓
  3. 💪 Workout | +40 XP 🪙+20 | Streak 3🔥 | ✓
  4. 📖 Read 20 pages | +20 XP 🪙+10 | Streak 6🔥 | ✓
  5. 🚫 No Doomscrolling | +30 XP 🪙+15 | Streak 2🔥 | pending
- Progress bar hijau: "Daily Progress" 4/5 + chest icon

### BOSS BATTLE PREVIEW (kolom 3, row 1)
- Background gradient dark red: `#1a0610 → #0e0a14`
- Header: ⚔️ Boss Battle + "?" button
- Boss name: "Procrastination Demon" (merah) + "Level 25 Boss"
- Boss sprite SVG (ProkrastinasiAbyssalSprite dari lib/boss-sprites.tsx yang sudah ada)
- HP bar merah: 7,450/10,000 = 74%
- Stats: Your attacks this week / Damage Dealt 2,550 | Rewards +500 XP 🪙+200
- Tombol merah: "⚔️ View Battle" → navigate ke battle tab/page

### HABIT CALENDAR (kolom 1, row 2)
- Header: 🔥 Habit Calendar + nav ‹ May 2025 › + "This Month ▾"
- Grid 7 kolom (Mon-Sun) dengan warna intensity:
  - Empty/grayed: hari di luar bulan
  - Light green: done 1 habit
  - Medium green: done 2-3 habits  
  - Dark green: done 4-5 habits
  - Cyan border: today (23)
- Legend: Less [dots] More
- Footer: "🔥 Best Streak: 21 days" (angka orange)
- Data heatmap sesuai mockup: hijau dari tanggal 1-22, gaps di weekend beberapa

### WEEKLY CHALLENGE (kolom 2, row 2)
- Header: 🏆 Weekly Challenge | "Resets in 3d 12h 45m" (cyan)
- 3 challenges dengan progress bar:
  1. "Complete 25 habits this week" — 18/25 (72%) — purple bar — 🎁+300 XP 🪙+150 — badge "In Progress"
  2. "Workout 4x this week" — 3/4 (75%) — amber bar — +200 XP 🪙50
  3. "Study total 10 hours" — 7.2/10 (72%) — cyan bar — +250 XP 🪙50
- Tombol "View All Challenges →"

### STATS OVERVIEW (kolom 3, row 2 — bagian atas)
- Header: 📊 Stats Overview | "This Week ▾"
- 4 metric cards (2x2 grid):
  - Habits Completed: **16** | ▲ 23% vs last week
  - Total EXP: **1,280** | ▲ 18% vs last week
  - Coins Earned: **680** | ▲ 15% vs last week (amber)
  - 🔥 Streak: **12** | ▲ 2 days vs last week

### RECENT ACHIEVEMENTS (kolom 3, row 2 — bagian bawah)
- Header: Recent Achievements | "View All" (cyan)
- 1 achievement item:
  - Icon: 🛡️ purple bg
  - Name: "Discipline Streak"
  - Desc: "Maintain a 7-day streak"
  - Time: "Unlocked 2h ago"
  - XP: +100 XP (purple)

### BOTTOM NAV (mobile only, hidden on desktop)
- Home | Habits | Quests | Battle | Inventory | Shop

---

## DATA FLOW

Dashboard page server component fetch semua data seperti sebelumnya, tapi pass ke komponen baru:
- `character` props → CharacterCard
- `tasks` + `completions` → DailyQuestsPanel  
- `bossState` → BossBattlePreview
- `challenges` → WeeklyChallengesPanel (sudah ada, reuse)
- `profile` → StatsOverview, RecentAchievements, Sidebar

Data yang sebelumnya di-fetch di `DashboardTopbar` dan `DashboardTabs` sekarang di-fetch di `app/dashboard/page.tsx` dan di-pass sebagai props.

---

## WARNA & DESIGN TOKENS (sesuai globals.css yang sudah ada)

```css
--bg-base: #080b12   /* body background */
--bg1: #0c1018       /* card background */
--bg2: #111520       /* secondary card, pill */
--bg3: #161c2a       /* tertiary, input */
--cyan: #22d3ee      /* accent primary */
--gold: #f59e0b      /* coins, reward */
--purple: #8b5cf6    /* character class, XP */
--rose: #e05a6a      /* HP, enemy */
--jade: #3aaa7a      /* success, streak */
--border: rgba(255,255,255,0.07)
--t1: #eef0f5        /* text primary */
--t2: #8890a8        /* text secondary */
--t3: #454e65        /* text tertiary */
```

Font sudah ada: Space Grotesk (body) + Space Mono (labels/mono)

---

## ROUTING CHANGES

Sidebar nav items mapping:
- Dashboard → `/dashboard` (active)
- Habits → `/dashboard#status` (habits tab)
- Quests → `/dashboard#mission`
- Boss Battle → `/dashboard#battle`
- Inventory → `/dashboard#vault`
- Shop → `/dashboard#vault`
- Achievements → `/dashboard#vault`
- Stats → `/dashboard#oracle`

Atau bisa pakai state `activePage` di sidebar untuk show/hide sections.

---

## PENTING: Yang TIDAK BOLEH diubah

1. Semua API routes (`app/api/...`) — jangan sentuh
2. Prisma schema dan migrations
3. Auth logic (`lib/auth.ts`, `lib/session.ts`)
4. `lib/character-sprites.tsx` — sudah bagus, reuse
5. `lib/boss-sprites.tsx` — sudah bagus, reuse `ProkrastinasiAbyssalSprite`
6. Semua existing section panels (boss-battle.tsx, weekly-challenges-panel.tsx, dll) — tetap ada untuk detail pages
7. `app/layout.tsx` — jangan sentuh
8. Onboarding dan auth pages

---

## URUTAN IMPLEMENTASI

1. Tambah CSS baru ke `globals.css`
2. Buat `dashboard-sidebar.tsx`
3. Update `dashboard-topbar.tsx`
4. Update `dashboard-tabs.tsx` → jadikan `dashboard-main-layout.tsx`
5. Buat semua panel baru (daily-quests, boss-preview, habit-calendar, stats-overview, recent-achievements)
6. Update `app/dashboard/page.tsx`
7. Test di localhost

Semua kode lengkap ada di file-file `.tsx` di folder ini.
