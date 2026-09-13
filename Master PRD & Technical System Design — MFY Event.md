# MASTER PRODUCT REQUIREMENTS DOCUMENT
# MFY EVENT

### Short Link & Microsite Platform by MFY Tech

**Produk:** MFY Event  
**Parent Brand:** MFY Tech  
**Website Utama:** `https://www.mfytech.my.id`  
**Aplikasi:** `https://event.mfytech.my.id`  
**Versi Dokumen:** 2.0  
**Status:** Product & Engineering Blueprint  
**Primary Stack:** Next.js + TypeScript + Firebase

---

# 1. PRODUCT VISION

MFY Event adalah platform **Short Link & Microsite Builder** dari MFY Tech yang memungkinkan pengguna membuat tautan singkat, QR Code, serta halaman microsite secara mudah tanpa perlu memahami coding.

Platform harus terasa:

**Simple. Fast. Beautiful. Reliable.**

MFY Event bukan sekadar pemendek URL, tetapi menjadi satu tempat untuk:

- membuat short link;
- membuat microsite;
- membagikan halaman profil;
- membuat halaman event;
- membagikan materi;
- membuat landing page sederhana;
- membuat QR Code;
- melihat statistik pengunjung;
- mengelola seluruh link dari satu dashboard.

---

# 2. BRAND ARCHITECTURE

MFY Event merupakan bagian dari ekosistem:

**MFY Tech**

Struktur brand:

```text
MFY TECH
www.mfytech.my.id
│
├── Website Utama
│
└── MFY EVENT
    event.mfytech.my.id
```

MFY Event tetap memiliki identitas visual sendiri tetapi selalu menunjukkan hubungan dengan MFY Tech.

Brand lockup:

```text
MFY Event
by MFY Tech
```

atau:

```text
MFY
EVENT

A product by MFY Tech
```

---

# 3. DOMAIN & URL CONTRACT

## 3.1 Main Application

```text
https://event.mfytech.my.id
```

---

## 3.2 Short Link

```text
https://event.mfytech.my.id/{slug}
```

Contoh:

```text
event.mfytech.my.id/kkg2026

event.mfytech.my.id/materi-ipas

event.mfytech.my.id/daftar
```

---

## 3.3 Microsite

```text
https://event.mfytech.my.id/@{slug}
```

Contoh:

```text
event.mfytech.my.id/@masalfy

event.mfytech.my.id/@sdn2palapi

event.mfytech.my.id/@kkg2026
```

---

# 4. NAMESPACE PRINCIPLE

Short link:

```text
/masalfy
```

Microsite:

```text
/@masalfy
```

Keduanya merupakan namespace berbeda.

Karena itu secara teknis:

```text
event.mfytech.my.id/masalfy
```

dan:

```text
event.mfytech.my.id/@masalfy
```

dapat dimiliki oleh user yang berbeda.

Namun sistem tetap harus memperingatkan jika penggunaan nama tersebut berpotensi membingungkan.

---

# 5. PRODUCT GOALS

## User Goals

Pengguna dapat:

- registrasi dengan mudah;
- membuat short link dalam beberapa detik;
- menentukan custom slug;
- mendapatkan QR Code otomatis;
- mengetahui jumlah klik;
- membuat microsite tanpa coding;
- mengatur desain microsite;
- menambah berbagai block;
- melihat preview secara real-time;
- publish/unpublish halaman;
- melihat analytics;
- mengelola semuanya dari satu dashboard.

## Business/System Goals

MFY Tech dapat:

- mengelola pengguna;
- mengelola platform;
- memoderasi konten;
- melihat pertumbuhan penggunaan;
- mendeteksi penyalahgunaan;
- mengembangkan fitur premium di masa depan.

---

# 6. NON-GOALS MVP

Pada MVP awal belum wajib menyediakan:

- website builder multi-page kompleks;
- ecommerce;
- payment gateway;
- advanced marketing automation;
- email marketing;
- custom JavaScript user;
- unrestricted custom CSS;
- full CRM;
- domain registrar.

Fitur tersebut dapat dipertimbangkan setelah core product stabil.

---

# 7. TARGET USER

MFY Event dirancang untuk:

### Individu

Guru, kreator, freelancer, profesional, mahasiswa.

### Organisasi

Sekolah, komunitas, UMKM, organisasi, lembaga pelatihan.

### Event Organizer

Seminar, pelatihan, workshop, kegiatan sekolah, webinar.

### Content Creator

Untuk menyatukan berbagai link dalam satu halaman.

---

# 8. CORE PRODUCT MODULE

MFY Event terdiri atas:

```text
1. Authentication & Account
2. Dashboard
3. Short Link Management
4. QR Code
5. Analytics
6. Microsite Builder
7. Public Microsite Renderer
8. Administration
9. Moderation & Abuse Report
10. Platform Settings
```

---

# 9. USER ROLES

Gunakan Role Based Access Control.

## USER

Dapat:

- mengelola account sendiri;
- membuat short link;
- membuat microsite;
- melihat analytics miliknya.

## MODERATOR

Mendapat akses moderasi terhadap:

- reported short links;
- reported microsites;
- abuse reports.

## ADMIN

Dapat:

- melihat pengguna;
- suspend pengguna;
- mengelola link;
- mengelola microsite;
- melihat platform analytics;
- menangani reports.

## SUPER_ADMIN

Memiliki hak penuh termasuk:

- role;
- system settings;
- administrator;
- reserved slugs;
- security settings;
- feature availability.

---

# 10. PRODUCT INFORMATION ARCHITECTURE

```text
event.mfytech.my.id
│
├── /
│
├── /login
├── /register
├── /forgot-password
│
├── /dashboard
│
├── /links
│   ├── /create
│   └── /{id}
│
├── /microsites
│   ├── /create
│   └── /{id}/edit
│
├── /analytics
│
├── /settings
│   ├── /profile
│   ├── /account
│   └── /security
│
├── /admin
│   ├── /users
│   ├── /links
│   ├── /microsites
│   ├── /reports
│   ├── /analytics
│   ├── /audit
│   └── /settings
│
├── /privacy
├── /terms
├── /help
│
├── /@{slug}       MICROSITE
│
└── /{slug}        SHORT LINK
```

---

# 11. UI/UX DESIGN DIRECTION

## Design Philosophy

MFY Event menggunakan konsep:

# MODERN NEO-MINIMAL SaaS

Ciri utama:

- bersih;
- premium;
- modern;
- visual hierarchy kuat;
- rounded tetapi tidak berlebihan;
- whitespace luas;
- iconography minimal;
- subtle gradients;
- subtle shadow;
- micro-interaction;
- responsive;
- cepat dipahami.

Hindari:

- dashboard yang penuh kotak;
- terlalu banyak gradient;
- glassmorphism berlebihan;
- warna neon berlebihan;
- setiap bagian menggunakan card;
- border terlalu tebal;
- animasi berlebihan;
- sidebar penuh ikon tanpa label;
- desain seperti template admin generik.

---

# 12. VISUAL PERSONALITY

MFY Event harus terasa:

```text
MODERN
     +
FRIENDLY
     +
PREMIUM
     +
TRUSTWORTHY
     +
FAST
```

Bukan:

```text
Corporate kaku

atau

Startup terlalu playful
```

Posisinya berada di tengah.

---

# 13. COLOR SYSTEM

Baseline palette:

### Background

```text
Canvas
#F8FAFC

Surface
#FFFFFF
```

### Dark

```text
Primary Text
#0F172A

Secondary Text
#64748B
```

### Brand Primary

```text
Electric Indigo
#5B5BF7
```

### Secondary

```text
Modern Cyan
#06B6D4
```

### Accent Gradient

```text
#5B5BF7 → #06B6D4
```

Gradient digunakan terbatas pada:

- hero;
- CTA;
- active highlight;
- empty state tertentu.

Tidak digunakan pada seluruh dashboard.

---

# 14. SEMANTIC COLORS

Success:

```text
#10B981
```

Warning:

```text
#F59E0B
```

Error:

```text
#EF4444
```

Information:

```text
#3B82F6
```

---

# 15. TYPOGRAPHY

Direkomendasikan:

### Primary

**Geist**

Alternatif:

**Inter**

Typography system:

```text
Display       48–64px
H1            32px
H2            24px
H3            18–20px
Body          14–16px
Small         12–13px
```

Gunakan maksimal:

```text
Regular
Medium
Semi Bold
Bold
```

Hindari terlalu banyak weight.

---

# 16. DESIGN GRID

Gunakan basis:

```text
4px
```

dengan sistem spacing:

```text
4
8
12
16
20
24
32
40
48
64
```

Page container:

```text
max-width: 1440px
```

Dashboard content:

```text
max-width: 1280px
```

---

# 17. BORDER RADIUS

Recommended:

```text
Small       8px
Input      10px
Button     10px
Card       14px
Large      18px
Modal      20px
```

Jangan membuat setiap card berbentuk pill.

---

# 18. SHADOW

Gunakan shadow sangat subtle.

Default card:

```text
0 1px 2px rgba(...)
```

Floating panel:

```text
0 8px 30px rgba(...)
```

Jangan menggunakan shadow berat pada semua elemen.

---

# 19. ICONOGRAPHY

Gunakan satu icon family yang konsisten.

Gaya:

- outline;
- stroke medium;
- simple;
- modern.

Contoh icon:

```text
Link
BarChart
QrCode
Layout
Palette
Settings
Users
Shield
MoreHorizontal
ExternalLink
Copy
```

---

# 20. INTERACTION SYSTEM

Semua interactive element memberikan feedback.

Contoh:

Button hover:

```text
150–200 ms transition
```

Card hover:

- sedikit naik;
- border berubah halus.

Copy short link:

```text
Copy
↓
Copied!
✓
```

Slug availability:

```text
event.mfytech.my.id/kkg2026

✓ Available
```

atau:

```text
✕ Already taken
```

---

# 21. TOAST SYSTEM

Gunakan toast untuk action singkat.

Contoh:

```text
✓ Link copied

✓ Short link created

✓ Changes saved

✓ Microsite published
```

Error:

```text
Something went wrong.
Please try again.
```

---

# 22. SKELETON LOADING

Gunakan skeleton ketika:

- loading dashboard;
- mengambil analytics;
- loading microsites.

Hindari spinner besar di tengah halaman kecuali initial authentication state.

---

# 23. EMPTY STATE

Empty state harus membantu user melakukan next action.

Contoh:

```text
No links yet.

Create your first short link and start sharing.

[ Create Short Link ]
```

Jangan hanya menampilkan:

```text
No data.
```

---

# 24. APPLICATION SHELL

Desktop:

```text
┌────────────────────────────────────────────────────┐
│ SIDEBAR │ HEADER                                   │
│         ├──────────────────────────────────────────┤
│         │                                          │
│         │        PAGE CONTENT                      │
│         │                                          │
│         │                                          │
└─────────┴──────────────────────────────────────────┘
```

---

# 25. SIDEBAR

Sidebar desktop:

```text
MFY Event
by MFY Tech

Overview

CREATE
+ Short Link
+ Microsite

MANAGE
Links
Microsites
Analytics

ACCOUNT
Settings
Help

──────────────

[Avatar]
Mas Alfy
```

Admin memiliki sidebar terpisah.

---

# 26. COLLAPSIBLE SIDEBAR

Desktop:

```text
240px → 72px
```

User dapat collapse sidebar.

State disimpan di browser.

---

# 27. MOBILE NAVIGATION

Pada mobile gunakan:

- top header;
- bottom navigation untuk menu utama;
- drawer untuk menu tambahan.

Bottom nav:

```text
Home

Links

Create

Microsites

Profile
```

Tombol Create dapat sedikit lebih dominan.

---

# 28. LANDING PAGE

Root:

```text
event.mfytech.my.id
```

Jika visitor belum login, tampilkan landing page.

Hero:

```text
Short links.
Beautiful microsites.
One simple place.

Create, share and understand your links
with MFY Event.
```

CTA:

```text
[ Get Started ]

[ Sign In ]
```

Visual utama:

kombinasi preview:

```text
Short Link Card
+
Analytics Card
+
Mobile Microsite Preview
```

---

# 29. LANDING PAGE STRUCTURE

```text
Navbar

Hero

Trusted / Benefits

Short Link Feature

Microsite Feature

Analytics

How It Works

Use Cases

CTA

Footer
```

Tidak perlu landing page sangat panjang untuk MVP.

---

# 30. LOGIN EXPERIENCE

Desktop login menggunakan split layout:

```text
┌──────────────────────┬────────────────────────┐
│                      │                        │
│ MFY EVENT            │      Welcome back      │
│                      │                        │
│ Visual Branding      │      Email             │
│                      │      Password          │
│                      │                        │
│                      │      [ Sign In ]       │
│                      │                        │
└──────────────────────┴────────────────────────┘
```

Mobile hanya menggunakan form.

---

# 31. DASHBOARD HOME

Header:

```text
Good afternoon, Mas Alfy 👋

Here’s what’s happening with your links.
```

Primary metrics:

```text
12
Short Links

2,841
Total Clicks

3
Microsites

6,289
Page Views
```

---

# 32. DASHBOARD LAYOUT

```text
┌───────────────────────────────────────────────┐
│ Welcome                           [+ Create]   │
├───────────┬───────────┬───────────┬───────────┤
│ Links     │ Clicks    │ Sites     │ Views     │
├───────────────────────────────────────────────┤
│                                               │
│ Traffic Overview                              │
│                                               │
├────────────────────────┬──────────────────────┤
│ Top Links              │ Recent Activity      │
└────────────────────────┴──────────────────────┘
```

---

# 33. GLOBAL CREATE BUTTON

User memiliki global CTA:

```text
+ Create
```

Klik membuka:

```text
What would you like to create?

🔗 Short Link

▣ Microsite
```

Ini mempercepat UX dibanding harus masuk halaman berbeda terlebih dahulu.

---

# 34. CREATE SHORT LINK UX

Gunakan modal atau side panel.

```text
Create Short Link

Destination URL
[_______________________________]

Short URL
event.mfytech.my.id/
[ kkg2026                     ]

✓ kkg2026 is available

Title
[ Materi KKG Coding             ]

Optional Settings
▸ Expiration
▸ Analytics

[ Create Link ]
```

---

# 35. SHORT LINK SUCCESS

Setelah berhasil:

```text
Your short link is ready 🎉

event.mfytech.my.id/kkg2026

[ Copy Link ]

[ QR Code ]

[ View Analytics ]
```

Jangan langsung melempar user kembali ke tabel.

---

# 36. LINKS PAGE

Gunakan kombinasi:

- search;
- filter;
- clean list/table.

Toolbar:

```text
My Links

[ Search links... ]

Status ▼

Sort ▼

[ + New Link ]
```

---

# 37. LINK ITEM

```text
Materi KKG Coding

event.mfytech.my.id/kkg2026
→ docs.google.com/...

2,821 clicks

Active

[Copy] [QR] [Analytics] [...]
```

Destination URL panjang cukup ditampilkan truncated.

---

# 38. LINK DETAIL

Halaman detail:

```text
← Back to Links

Materi KKG Coding

event.mfytech.my.id/kkg2026

[ Copy ]

[ QR ]

[ Edit ]
```

Metrics:

```text
Total Clicks

Unique Visitors

Today

CTR / optional
```

Chart:

```text
7 Days
30 Days
90 Days
Custom
```

---

# 39. MICROSITE LIST

User melihat microsites dalam bentuk card.

```text
┌───────────────────────┐
│      Preview          │
│                       │
├───────────────────────┤
│ Mas Alfy              │
│ @masalfy              │
│                       │
│ Published             │
│ 2,481 views           │
│                       │
│ [ Edit ] [...]        │
└───────────────────────┘
```

---

# 40. MICROSITE BUILDER UX

Builder merupakan bagian terpenting dari pengalaman produk.

Gunakan layout:

```text
┌─────────────┬──────────────────┬─────────────────┐
│             │                  │                 │
│ Builder Nav │     EDITOR       │  LIVE PREVIEW   │
│             │                  │                 │
│ Content     │ Profile          │   ┌─────────┐   │
│ Design      │ Blocks           │   │ Phone   │   │
│ Settings    │                  │   │ Preview │   │
│ SEO         │                  │   └─────────┘   │
│             │                  │                 │
└─────────────┴──────────────────┴─────────────────┘
```

---

# 41. BUILDER NAVIGATION

Tabs:

```text
Content

Design

Settings

SEO
```

Content membuka block editor.

Design membuka theme editor.

Settings membuka microsite configuration.

SEO membuka metadata.

---

# 42. BLOCK EDITOR

Block item:

```text
☰

🔗 Materi Pembelajaran

Visible

[ Edit ]

[ ... ]
```

User dapat:

- drag;
- edit;
- duplicate;
- hide;
- delete.

---

# 43. ADD BLOCK

CTA:

```text
+ Add Block
```

Membuka block picker.

Categories:

```text
BASIC

Link
Heading
Text
Image
Divider

SOCIAL

Instagram
WhatsApp
YouTube
TikTok

MEDIA

Gallery
Video

EVENT

Event Information
Countdown

OTHER

FAQ
Contact
```

MVP dapat membatasi block sesuai roadmap.

---

# 44. LIVE PREVIEW

Preview harus dapat berpindah:

```text
Mobile

Tablet

Desktop
```

Default:

```text
Mobile
```

Karena mayoritas microsite dikunjungi melalui smartphone.

---

# 45. PREVIEW INTERACTION

Perubahan editor langsung tercermin di preview.

Contoh:

User mengubah:

```text
Button Radius
12 → 24
```

Preview langsung berubah.

Gunakan optimistic UI untuk membuat editor terasa cepat.

---

# 46. AUTOSAVE

Builder mendukung:

```text
Autosaved
```

State:

```text
Saving...

Saved

Unable to save
```

Untuk perubahan cepat, gunakan debounce.

Contoh:

```text
500–1000ms
```

Tidak perlu write Firestore setiap karakter tanpa debounce.

---

# 47. MICROSITE DESIGN PANEL

Design categories:

```text
Theme

Background

Typography

Buttons

Colors

Spacing
```

---

# 48. PREBUILT THEMES

MVP dapat menyediakan:

```text
Minimal Light

Midnight

Ocean

Lavender

Warm

Monochrome
```

Template hanya starting point.

User tetap bisa melakukan customization.

---

# 49. MICROSITE PUBLIC EXPERIENCE

Microsite harus:

- mobile-first;
- sangat ringan;
- fast;
- accessible;
- tidak terasa seperti dashboard.

Struktur:

```text
Avatar

Name

Bio

Social Icons

Blocks

Footer
```

---

# 50. PUBLIC MICROSITE FOOTER

Footer kecil:

```text
Powered by MFY Event
by MFY Tech
```

atau:

```text
Made with MFY Event · MFY Tech
```

Links:

```text
MFY Event
→ https://event.mfytech.my.id

MFY Tech
→ https://www.mfytech.my.id
```

Branding tidak boleh mendominasi microsite user.

---

# 51. APPLICATION FOOTER

Dashboard/application footer:

```text
MFY Event
Short Link & Microsite Platform by MFY Tech

© {currentYear} MFY Tech. All rights reserved.

MFY Tech · Privacy · Terms · Help
```

MFY Tech:

```text
https://www.mfytech.my.id
```

---

# 52. ADMIN UX

Admin menggunakan design system yang sama tetapi lebih data-oriented.

Sidebar:

```text
MFY Event Admin

Overview

MANAGEMENT
Users
Links
Microsites
Reports

INSIGHTS
Analytics

SYSTEM
Audit Logs
Roles
Settings

──────────
Back to MFY Event
```

---

# 53. ADMIN DASHBOARD

Top metrics:

```text
Users

New Users

Short Links

Microsites

Clicks

Views

Open Reports
```

Secondary section:

```text
User Growth

Traffic

Recent Registrations

Open Reports

System Activity
```

---

# 54. USER MANAGEMENT UX

Table:

```text
User

Email

Role

Links

Microsites

Status

Joined

...
```

Filters:

```text
Role

Status

Join Date
```

Search:

```text
Name / Email / Username
```

---

# 55. USER DETAIL DRAWER

Klik user membuka side panel atau detail page.

```text
Mas Alfy

masalfy@email.com

ACTIVE
USER

Registered
07 Sep 2026

Last Active
07 Sep 2026

──────────────

Short Links
18

Microsites
3

Clicks
4,821

──────────────

[ View Links ]

[ View Microsites ]

[ Suspend User ]
```

---

# 56. DANGEROUS ACTION UX

Action:

```text
Suspend Account
Delete Link
Delete Microsite
Change Role
```

harus menggunakan confirmation modal.

Contoh:

```text
Suspend this user?

The user will lose access to their account
until it is reactivated.

Reason
[________________________]

Cancel     Suspend
```

---

# 57. ACCESSIBILITY

Minimum target:

**WCAG AA**

Requirements:

- visible focus indicator;
- keyboard navigation;
- contrast memadai;
- semantic HTML;
- aria label untuk icon-only buttons;
- error tidak hanya dibedakan berdasarkan warna;
- minimum touch target sekitar 44px;
- tidak bergantung pada hover.

---

# 58. RESPONSIVE BREAKPOINT

Baseline:

```text
Mobile
< 640px

Tablet
640–1024px

Desktop
> 1024px
```

Desktop dashboard sidebar berubah menjadi mobile navigation di layar kecil.

---

# 59. TECHNICAL STACK

## Framework

```text
Next.js
TypeScript
React
```

Gunakan:

```text
Next.js App Router
```

---

# 60. FRONTEND

Recommended:

```text
Next.js

TypeScript

Tailwind CSS

React Hook Form

Zod

TanStack Query
jika dibutuhkan untuk interactive client fetching
```

Untuk state builder dapat menggunakan lightweight state management.

Contoh:

```text
Zustand
```

---

# 61. DRAG AND DROP

Gunakan library yang mendukung accessible drag/drop.

Builder membutuhkan:

- vertical sorting;
- keyboard accessible sorting;
- touch support.

---

# 62. FIREBASE ARCHITECTURE

Firebase menjadi backend/data infrastructure.

Gunakan:

```text
Firebase Authentication

Cloud Firestore

Firebase Storage

Firebase Admin SDK

Firebase App Check

Cloud Functions
```

Optional:

```text
Firebase Remote Config
```

untuk feature flag tertentu.

---

# 63. HIGH LEVEL SYSTEM ARCHITECTURE

```text
                    VISITOR / USER
                          │
                          ▼
                event.mfytech.my.id
                          │
                          ▼
                       NEXT.JS
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
     APPLICATION      SHORT LINK       MICROSITE
          │               │                │
          └───────────────┼────────────────┘
                          │
                          ▼
                SERVER SERVICES
                          │
                Firebase Admin SDK
                          │
       ┌──────────────────┼─────────────────┐
       ▼                  ▼                 ▼
 Firebase Auth       Cloud Firestore   Firebase Storage
       │                  │
       │                  ▼
       │            Cloud Functions
       │
       ▼
 User Identity
```

---

# 64. IMPORTANT ROUTING DESIGN

Middleware **tidak perlu mengambil data dari Firestore**.

Middleware hanya menangani routing/rewrite.

Request:

```text
/@masalfy
```

direwrite secara internal ke:

```text
/_microsite/masalfy
```

Sedangkan:

```text
/kkg2026
```

dapat ditangani oleh dynamic route:

```text
/[slug]
```

Next.js static routes seperti:

```text
/dashboard
/login
/admin
```

memiliki route sendiri.

---

# 65. MICROSITE INTERNAL ROUTE

Karena simbol `@` memiliki penggunaan khusus pada struktur App Router tertentu, jangan membuat filesystem route literal menggunakan folder `@masalfy`.

Gunakan middleware.

Public:

```text
/@masalfy
```

Internal:

```text
/_microsite/masalfy
```

Browser tetap menampilkan:

```text
/@masalfy
```

---

# 66. NEXT.JS ROUTE STRUCTURE

```text
src/
├── app/
│
│   ├── (marketing)/
│   │   └── page.tsx
│
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── links/
│   │   ├── microsites/
│   │   ├── analytics/
│   │   └── settings/
│
│   ├── admin/
│
│   ├── _microsite/
│   │   └── [slug]/
│
│   ├── [slug]/
│
│   └── api/
│
├── components/
│
├── features/
│   ├── auth/
│   ├── links/
│   ├── microsites/
│   ├── analytics/
│   └── admin/
│
├── lib/
│   ├── firebase/
│   ├── auth/
│   ├── validation/
│   ├── analytics/
│   └── security/
│
├── hooks/
├── types/
└── middleware.ts
```

---

# 67. FIREBASE CLIENT

Client SDK hanya digunakan untuk operasi yang memang perlu dilakukan di browser.

Contoh:

- sign in;
- realtime editor jika diperlukan;
- upload dengan authorization rules.

---

# 68. FIREBASE ADMIN SDK

Admin SDK hanya digunakan server-side.

Digunakan untuk:

- verify session;
- privileged database access;
- role management;
- admin operations;
- audit logs;
- moderation;
- server redirects;
- analytics processing.

Admin credentials tidak pernah dikirim ke client.

---

# 69. AUTHENTICATION FLOW

```text
User
 │
 ▼
Firebase Authentication
 │
 ▼
Firebase ID Token
 │
 ▼
POST /api/auth/session
 │
 ▼
Firebase Admin SDK
 │
 ▼
Create Secure Session Cookie
 │
 ▼
Browser
 │
 ▼
Protected Next.js Pages
```

---

# 70. SESSION COOKIE

Cookie:

```text
HttpOnly

Secure

SameSite=Lax

Path=/
```

Server memverifikasi session menggunakan Firebase Admin SDK.

Jangan menjadikan localStorage sebagai sumber authorization utama.

---

# 71. REGISTRATION FLOW

```text
Register
  ↓
Validate
  ↓
Firebase Auth
  ↓
Create User
  ↓
Firestore users/{uid}
  ↓
Send Email Verification
  ↓
Dashboard
```

---

# 72. USERS DATA MODEL

```text
users/{uid}
```

Fields:

```text
uid
email
emailVerified
displayName
username
photoURL

role
status

createdAt
updatedAt
lastLoginAt

preferences
```

Role:

```text
USER
MODERATOR
ADMIN
SUPER_ADMIN
```

---

# 73. CUSTOM CLAIMS

Role administratif disimpan juga melalui Firebase Custom Claims.

Contoh:

```json
{
  "role": "ADMIN"
}
```

User tidak dapat mengubah claims sendiri.

---

# 74. SHORT LINK DATA MODEL

```text
shortLinks/{slug}
```

Document ID:

```text
lowercase normalized slug
```

Fields:

```text
slug

ownerId

title

destinationUrl

status

createdAt

updatedAt

expiresAt

settings
```

Optional cached stats:

```text
metrics.totalClicks

metrics.totalVisitors
```

Angka ini dianggap derived data.

---

# 75. SLUG NORMALIZATION

Input:

```text
KKG-2026
```

menjadi:

```text
kkg-2026
```

Valid characters:

```text
a-z

0-9

-

_
```

Recommended minimum:

```text
3
```

Recommended maksimum:

```text
50
```

---

# 76. RESERVED SLUG

Hard protected:

```text
admin

api

login

logout

register

dashboard

links

microsites

analytics

settings

privacy

terms

help

support

assets

robots

sitemap

favicon
```

Selain itu tersedia collection:

```text
reservedSlugs
```

untuk custom reserved slug.

---

# 77. CREATE SHORT LINK

Flow:

```text
User
  ↓
Destination URL
  ↓
Custom Slug
  ↓
Normalize
  ↓
Validate Format
  ↓
Check Reserved
  ↓
Check Firestore
  ↓
Validate Destination
  ↓
Firestore Transaction
  ↓
Create
```

Gunakan transaction agar dua user tidak berhasil mengambil slug yang sama secara bersamaan.

---

# 78. DESTINATION SECURITY

Allowed protocols:

```text
https://

http://
```

Tolak:

```text
javascript:

data:

file:

ftp:
```

Jika di masa depan sistem mengambil metadata destination, cegah request ke:

```text
localhost

private IP

internal services

cloud metadata endpoint
```

untuk mengurangi risiko SSRF.

---

# 79. REDIRECT ENGINE

Request:

```text
event.mfytech.my.id/kkg2026
```

Server:

```text
Lookup shortLinks/kkg2026
        ↓
Validate status
        ↓
Validate expiry
        ↓
Record analytics asynchronously
        ↓
HTTP Redirect
```

Jangan menunggu seluruh analytics selesai sebelum redirect jika dapat dihindari.

Prioritas visitor:

# FAST REDIRECT

---

# 80. REDIRECT RUNTIME

Route redirect yang menggunakan Firebase Admin SDK sebaiknya berjalan pada **Node.js server runtime**, bukan bergantung pada middleware edge untuk akses database.

Middleware:

```text
routing only
```

Route handler/server:

```text
database lookup
analytics
redirect
```

---

# 81. REDIRECT STATUS

Support:

```text
ACTIVE

DISABLED

EXPIRED

SUSPENDED
```

---

# 82. MICROSITE DATA MODEL

```text
microsites/{micrositeId}
```

Direkomendasikan menggunakan generated ID untuk entity utama.

Fields:

```text
ownerId

slug

slugNormalized

title

status

profile

theme

seo

createdAt

updatedAt

publishedAt
```

---

# 83. WHY MICROSITE ID ≠ SLUG

Untuk microsite, sebaiknya jangan menjadikan slug sebagai ID permanen.

Alasannya:

user kemungkinan sering mengganti:

```text
@masalfy
```

menjadi:

```text
@alfynoor
```

Dengan generated microsite ID, perubahan slug tidak memerlukan pemindahan seluruh subcollection blocks.

---

# 84. MICROSITE SLUG INDEX

Gunakan collection:

```text
micrositeSlugs/{slug}
```

Fields:

```text
micrositeId
ownerId
status
```

Lookup:

```text
/@masalfy
        ↓
micrositeSlugs/masalfy
        ↓
micrositeId
        ↓
microsites/{micrositeId}
```

---

# 85. MICROSITE BLOCK MODEL

```text
microsites/{micrositeId}/blocks/{blockId}
```

Fields:

```text
type

order

visible

content

style

createdAt

updatedAt
```

---

# 86. BLOCK TYPE

MVP:

```text
PROFILE

HEADING

TEXT

LINK

IMAGE

DIVIDER

SOCIAL
```

Phase 2:

```text
GALLERY

VIDEO

YOUTUBE

MAP

PDF

EVENT

COUNTDOWN

FAQ

CONTACT

WHATSAPP
```

---

# 87. BLOCK ORDERING

Gunakan fractional/flexible sorting.

Contoh:

```text
1000
2000
3000
```

Saat insert antara 1000 dan 2000:

```text
1500
```

Lakukan rebalance hanya bila diperlukan.

---

# 88. EDITOR STATE

Builder menggunakan local UI state terlebih dahulu.

Flow:

```text
User edits
    ↓
Local State
    ↓
Live Preview
    ↓
Debounce
    ↓
Firestore Save
```

Ini membuat builder terasa responsif.

---

# 89. AUTOSAVE STRATEGY

Text editing:

```text
debounce
```

Structure action:

```text
Add Block
Delete Block
Reorder

→ save immediately
```

Status UI:

```text
Saving...

Saved

Offline

Save failed
```

---

# 90. MICROSITE THEME MODEL

Contoh:

```json
{
  "backgroundType": "solid",
  "background": "#FFFFFF",
  "textColor": "#0F172A",
  "accentColor": "#5B5BF7",
  "fontFamily": "Geist",
  "buttonVariant": "soft",
  "buttonRadius": 14,
  "contentWidth": "medium"
}
```

---

# 91. STORAGE

Firebase Storage:

```text
users/
  {uid}/
    avatar/

microsites/
  {uid}/
    {micrositeId}/
      images/
      backgrounds/
      og/
```

---

# 92. UPLOAD VALIDATION

MVP:

```text
JPEG

PNG

WEBP
```

Batasi:

- ukuran;
- MIME;
- ownership;
- jumlah file.

SVG user upload sebaiknya tidak langsung didukung pada MVP.

---

# 93. SHORT LINK ANALYTICS

Data:

```text
Total Clicks

Unique Visitors

Daily Clicks

Referrers

Devices

Browsers

Countries
```

---

# 94. MICROSITE ANALYTICS

Data:

```text
Page Views

Unique Visitors

Block Clicks

CTR

Referrer

Device

Browser

Country
```

---

# 95. ANALYTICS EVENT

Contoh:

```text
analyticsEvents/{eventId}
```

Fields:

```text
eventType

resourceType

resourceId

ownerId

timestamp

visitorHash

referrer

country

device

browser
```

---

# 96. UNIQUE VISITOR

Jangan menyimpan raw IP secara permanen.

Gunakan server-side hash:

```text
IP
+
User Agent
+
Daily Secret/Salt
      ↓
Hash
```

Hash dapat berubah setelah periode tertentu sehingga tracking tidak menjadi persistent fingerprint.

---

# 97. ANALYTICS WRITE SCALING

Hindari mengupdate satu document:

```text
totalClicks += 1
```

untuk setiap request bertrafik tinggi.

Gunakan salah satu:

```text
Raw events
+
scheduled aggregation
```

atau:

```text
Sharded counters
```

---

# 98. DAILY STATISTICS

Contoh:

```text
shortLinkStats/
  {linkId}/
     days/
       2026-09-07/
          shards/
```

Setiap shard menerima sebagian write.

Cloud Function menggabungkan statistik.

---

# 99. FIREBASE CLOUD FUNCTIONS

Gunakan untuk:

- analytics aggregation;
- cleanup analytics;
- maintenance;
- scheduled tasks;
- account cleanup;
- image processing jika diperlukan;
- security automation.

---

# 100. ANALYTICS RETENTION

Contoh strategi:

Raw analytics:

```text
30–90 hari
```

Aggregated analytics:

```text
lebih lama
```

Retention dapat dikonfigurasi admin.

---

# 101. QR CODE

QR dibuat dari:

```text
https://event.mfytech.my.id/{slug}
```

Jangan mengarah langsung ke destination URL.

Keuntungan:

destination dapat diubah tanpa mengganti QR.

---

# 102. QR FEATURES

MVP:

```text
Preview

Download PNG

Download SVG

Copy Link
```

Phase 2:

```text
Color

Logo

Frame

Error Correction Level

Label
```

---

# 103. REPORT SYSTEM

Public visitor dapat report.

Reason:

```text
Phishing

Malware

Spam

Scam

Impersonation

Inappropriate Content

Other
```

---

# 104. REPORT DATA MODEL

```text
reports/{reportId}
```

Fields:

```text
targetType

targetId

targetSlug

reason

description

status

reporterHash

createdAt

reviewedBy

reviewedAt
```

Status:

```text
OPEN

REVIEWING

RESOLVED

REJECTED
```

---

# 105. AUDIT LOG

Semua administrative sensitive action harus tercatat.

Contoh:

```text
Admin A

SUSPENDED_USER

User B

07 Sep 2026 15:42

Reason:
Repeated phishing links
```

---

# 106. AUDIT LOG DATA

```text
auditLogs/{id}
```

Fields:

```text
actorId

actorRole

action

targetType

targetId

reason

metadata

createdAt
```

Admin biasa tidak dapat menghapus audit log.

---

# 107. ADMIN USER ACTION

Admin:

- view;
- suspend;
- reactivate;
- revoke session;
- change role jika authorized.

Admin tidak pernah bisa:

```text
View User Password
```

---

# 108. FIRESTORE SECURITY

Default philosophy:

# DENY BY DEFAULT

User hanya dapat mengakses data yang menjadi miliknya.

Contoh conceptual rule:

```text
resource.data.ownerId == request.auth.uid
```

Admin privileges tidak mengandalkan input dari browser.

---

# 109. STORAGE SECURITY

User hanya dapat upload ke:

```text
users/{ownUid}
```

dan:

```text
microsites/{ownUid}
```

Batasi:

- size;
- MIME;
- authentication.

---

# 110. APP CHECK

Gunakan Firebase App Check untuk membantu mengurangi request dari aplikasi tidak resmi.

App Check bukan pengganti:

- authorization;
- rate limiting;
- security rules.

---

# 111. RATE LIMITING

Minimum:

```text
Login

Registration

Password Reset

Slug Availability

Create Link

Create Microsite

Report

Admin actions tertentu
```

Redirect endpoint memiliki aturan tersendiri agar trafik legitimate tidak mudah diblokir.

---

# 112. VALIDATION

Gunakan schema validation.

Recommended:

```text
Zod
```

Validation dilakukan:

```text
Client
+
Server
```

Server tetap menjadi sumber validasi akhir.

---

# 113. SEO

Application:

```text
MFY Event — Short Link & Microsite
```

Description:

```text
Create short links, QR codes and beautiful microsites with MFY Event by MFY Tech.
```

---

# 114. MICROSITE SEO

Per microsite:

```text
Title

Description

OG Image

Social Preview

Robots preference
```

---

# 115. OPEN GRAPH

Contoh share WhatsApp:

```text
Mas Alfy

Guru & Fasilitator Digitalisasi

event.mfytech.my.id/@masalfy
```

Microsite dapat memiliki OG image sendiri.

---

# 116. APPLICATION PERFORMANCE

Target:

```text
LCP < 2.5s

CLS < 0.1

INP good range
```

Gunakan:

- optimized fonts;
- image optimization;
- dynamic imports;
- minimal client JavaScript;
- server components.

---

# 117. MICROSITE PERFORMANCE

Public microsite tidak boleh memuat:

- dashboard dependencies;
- admin library;
- builder state;
- unnecessary analytics libraries.

Microsite renderer harus menjadi bundle yang ringan.

---

# 118. REDIRECT PERFORMANCE

Redirect adalah salah satu fitur paling sensitif terhadap latency.

Prioritas:

```text
Request
→ lookup
→ redirect
```

Tidak perlu render UI.

Target server processing MVP:

```text
sekitar <300 ms pada kondisi normal
```

Dengan caching dapat ditingkatkan lebih jauh.

---

# 119. CACHING STRATEGY

MVP dapat menggunakan Firestore langsung.

Setelah traffic meningkat:

```text
Short Link
     ↓
Cache
     ↓ miss
Firestore
```

Caching tidak boleh membuat disabled/suspended link tetap aktif terlalu lama.

Gunakan short TTL atau cache invalidation.

---

# 120. ERROR EXPERIENCE

404:

```text
This link doesn't exist.

It may have been removed or the URL may be incorrect.

[ Go to MFY Event ]
```

Expired:

```text
This link has expired.
```

Disabled:

```text
This link is currently unavailable.
```

Suspended:

```text
This page is unavailable.
```

---

# 121. ERROR PAGE BRANDING

Footer:

```text
MFY Event

A service by MFY Tech

www.mfytech.my.id
```

---

# 122. SYSTEM SETTINGS

Super Admin:

### General

```text
Platform Name

Logo

Favicon

Support Email
```

### Accounts

```text
Registration Enabled

Email Verification

Default Role
```

### Short Links

```text
Min Slug Length

Max Slug Length

Maximum Links/User
```

### Microsite

```text
Microsites/User

Upload Limit

Available Blocks
```

### Analytics

```text
Retention

Tracking Settings
```

---

# 123. FEATURE FLAGS

Siapkan sistem untuk:

```text
Google Login

Custom QR

Advanced Analytics

Custom Domains

Premium Themes
```

agar fitur dapat diaktifkan tanpa deploy besar.

---

# 124. PRIVACY

User harus mengetahui data analytics apa yang dikumpulkan.

Hindari:

- precise GPS;
- persistent fingerprinting;
- penyimpanan raw IP jangka panjang.

Sediakan halaman:

```text
/privacy
```

---

# 125. TERMS

Sediakan:

```text
/terms
```

Terms harus melarang:

- phishing;
- malware;
- scam;
- illegal content;
- abuse;
- impersonation.

---

# 126. ACCOUNT DELETION

User dapat meminta delete account.

Sistem perlu:

```text
Confirm Password

Confirmation Modal

Delete / anonymize owned data

Revoke sessions
```

Deletion dapat menggunakan queued processing apabila data sangat besar.

---

# 127. ADMIN SECURITY

Untuk account administrator:

Recommended:

```text
Mandatory Email Verification

2FA di fase lanjut

Shorter Session Lifetime

Audit Logging

Re-authentication for sensitive actions
```

---

# 128. API / SERVER ENDPOINT PLAN

Contoh:

```text
POST   /api/auth/session
DELETE /api/auth/session

POST   /api/links
PATCH  /api/links/{id}
DELETE /api/links/{id}

POST   /api/microsites
PATCH  /api/microsites/{id}
DELETE /api/microsites/{id}

POST   /api/reports

POST   /api/admin/users/{id}/suspend
POST   /api/admin/users/{id}/activate
```

Tidak semua operasi wajib menggunakan REST.

Sebagian dashboard operation dapat menggunakan Next.js Server Actions.

---

# 129. SERVER ACTION VS API

Gunakan Server Actions untuk:

- authenticated dashboard form;
- internal mutation;
- settings.

Gunakan Route Handler/API untuk:

- auth session endpoint;
- public report endpoint;
- endpoints yang digunakan client luar;
- future public API.

---

# 130. TYPES

Gunakan shared TypeScript types:

```text
User

ShortLink

Microsite

MicrositeBlock

AnalyticsEvent

Report

AuditLog

SystemSetting
```

Hindari bentuk data berbeda di banyak tempat.

---

# 131. ENVIRONMENT VARIABLES

Public:

```text
NEXT_PUBLIC_FIREBASE_API_KEY

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

NEXT_PUBLIC_FIREBASE_PROJECT_ID

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```

Server:

```text
FIREBASE_ADMIN_PROJECT_ID

FIREBASE_ADMIN_CLIENT_EMAIL

FIREBASE_ADMIN_PRIVATE_KEY

SESSION_SECRET

ANALYTICS_HASH_SECRET

APP_URL
```

Server secret tidak menggunakan prefix:

```text
NEXT_PUBLIC_
```

---

# 132. FIREBASE PROJECT ENVIRONMENTS

Disarankan:

```text
mfy-event-dev

mfy-event-staging

mfy-event-prod
```

Database production tidak digunakan untuk development.

---

# 133. DEPLOYMENT

Recommended architecture:

```text
Git Repository

        ↓

CI/CD

        ↓

Next.js Hosting

        ↓

event.mfytech.my.id

        ↓

Firebase Services
```

Hosting dapat menggunakan platform yang mendukung Next.js server rendering.

Firebase tetap menjadi database/backend.

---

# 134. DNS

```text
www.mfytech.my.id
```

tetap website utama.

Sedangkan:

```text
event.mfytech.my.id
```

diarahkan ke deployment MFY Event.

---

# 135. OBSERVABILITY

Production harus memiliki:

- server error logging;
- function error logging;
- redirect error monitoring;
- authentication errors;
- frontend exception tracking.

Sediakan correlation/request ID bila dibutuhkan.

---

# 136. BACKUP

Firestore production perlu strategi:

- scheduled export;
- backup;
- disaster recovery.

System settings, users, links dan microsites merupakan critical data.

---

# 137. DEVELOPMENT PHASE

## PHASE 1 — FOUNDATION

Build:

```text
Next.js Project

Firebase

Authentication

Session

Design System

Application Shell

User Profile

Role System
```

---

# 138. PHASE 2 — SHORT LINK

Build:

```text
Create

Custom Slug

Edit

Disable

Delete

Redirect

QR Code

Basic Analytics
```

---

# 139. PHASE 3 — MICROSITE

Build:

```text
Create

Block System

Drag and Drop

Theme Editor

Live Preview

Autosave

Publish

Public Rendering
```

---

# 140. PHASE 4 — ADMIN

Build:

```text
Admin Dashboard

User Management

Link Management

Microsite Management

Reports

Audit Log

Settings
```

---

# 141. PHASE 5 — HARDENING

Build:

```text
Rate Limiting

App Check

Improved Security Rules

Analytics Aggregation

Accessibility

SEO

Performance

Monitoring

Backups
```

---

# 142. POST-MVP ROADMAP

Potential:

```text
Custom Domains

Password Protected Links

Scheduled Links

Expiring Links

Click Limits

Advanced QR

Advanced Analytics

Microsite Templates

Custom Fonts

Teams

Workspace

API

Webhook

Subscription

Premium Account
```

---

# 143. CUSTOM DOMAIN FUTURE

Future user dapat memiliki:

```text
link.domainuser.com/slug
```

tanpa mengubah core model short link.

Karena entity link dipisahkan dari hostname.

---

# 144. PLAN / SUBSCRIPTION READY

Walaupun MVP gratis, data model sebaiknya siap memiliki:

```text
plan

limits

usage
```

Contoh:

```text
FREE

PRO

TEAM
```

Tidak harus ditampilkan pada MVP.

---

# 145. MVP ACCEPTANCE CRITERIA

## Authentication

User dapat:

- register;
- login;
- logout;
- verify email;
- reset password.

---

## Short Link

User dapat membuat:

```text
event.mfytech.my.id/test
```

dan link melakukan redirect.

---

## Microsite

User dapat membuat:

```text
event.mfytech.my.id/@test
```

dan membuka halaman tanpa login.

---

## Builder

User dapat:

- add block;
- edit;
- delete;
- reorder;
- hide;
- design;
- preview;
- publish.

---

## Analytics

User dapat melihat:

```text
clicks

views

daily traffic
```

---

## Admin

Admin dapat:

- melihat user;
- suspend user;
- inspect link;
- disable link;
- inspect microsite;
- suspend microsite;
- menangani reports.

---

## Security

User A tidak dapat mengakses atau mengubah data milik User B.

---

# 146. UX SUCCESS CRITERIA

Short link baru idealnya dapat dibuat dengan:

```text
≤ 3 primary interaction steps
```

Microsite pertama:

```text
Create
→ Choose/Start
→ Edit
→ Publish
```

User tidak perlu memahami istilah teknis seperti:

```text
Firestore

DNS

HTTP redirect

SSR
```

---

# 147. PRODUCT MICROCOPY

Gunakan bahasa yang pendek dan manusiawi.

Lebih baik:

```text
Your link is ready.
```

daripada:

```text
URL creation operation completed successfully.
```

Lebih baik:

```text
This slug is available.
```

daripada:

```text
Slug validation success.
```

---

# 148. UI COPY PRINCIPLE

Dashboard dapat menggunakan Bahasa Indonesia atau bilingual di masa depan.

Semua copy harus:

- sederhana;
- singkat;
- friendly;
- tidak terlalu teknis.

---

# 149. RECOMMENDED FIRST-RUN EXPERIENCE

Setelah registrasi:

```text
Welcome to MFY Event 👋

What do you want to create first?

[ 🔗 Short Link ]

[ ▣ Microsite ]
```

Ini lebih baik daripada langsung membawa user ke dashboard kosong.

---

# 150. ONBOARDING

Gunakan contextual onboarding.

Contoh pertama kali membuka builder:

```text
Add your first block
```

Bukan tutorial modal 10 langkah.

---

# 151. COMMAND / QUICK ACTION FUTURE

Future UX:

```text
Ctrl / Cmd + K
```

Command palette:

```text
Create Short Link

Create Microsite

Search Links

Open Settings
```

Memberikan pengalaman aplikasi yang lebih premium.

---

# 152. KEYBOARD SHORTCUTS

Builder future:

```text
Ctrl/Cmd + S
Save

Ctrl/Cmd + Z
Undo

Ctrl/Cmd + Shift + Z
Redo
```

---

# 153. UNDO / REDO

Microsite builder sebaiknya pada fase lanjutan menyediakan:

```text
Undo

Redo
```

karena meningkatkan rasa aman saat editing.

---

# 154. FINAL DESIGN PRINCIPLE

UI MFY Event harus terasa seperti:

```text
Modern SaaS

+

Premium creator tool

+

Simple utility
```

Bukan:

```text
Admin dashboard template.
```

Elemen visual digunakan untuk membantu user memahami produk, bukan sekadar dekorasi.

---

# 155. FINAL TECHNICAL STACK

```text
FRAMEWORK
Next.js

LANGUAGE
TypeScript

UI
React
Tailwind CSS

VALIDATION
Zod

AUTHENTICATION
Firebase Authentication

DATABASE
Cloud Firestore

FILE STORAGE
Firebase Storage

PRIVILEGED SERVER ACCESS
Firebase Admin SDK

BACKGROUND PROCESS
Firebase Cloud Functions

ANTI-ABUSE
Firebase App Check + Rate Limiting

PRIMARY DOMAIN
event.mfytech.my.id

PARENT BRAND
MFY Tech

PARENT WEBSITE
www.mfytech.my.id
```

---

# 156. FINAL APPLICATION ARCHITECTURE

```text
                         MFY TECH
                   www.mfytech.my.id
                          │
                          │
                    MFY EVENT
              event.mfytech.my.id
                          │
           ┌──────────────┼───────────────┐
           │              │               │
           ▼              ▼               ▼
       DASHBOARD      SHORT LINK      MICROSITE
           │            /slug           /@slug
           │              │               │
           └──────────────┼───────────────┘
                          │
                          ▼
                       NEXT.JS
                          │
                 SERVER APPLICATION
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
             AUTH      FIRESTORE    STORAGE
              │           │
              └───── FIREBASE ───────┘
                          │
                          ▼
                   CLOUD FUNCTIONS
```

---

# 157. PRODUCT DESIGN STATEMENT

**MFY Event harus memberikan pengalaman bahwa membuat dan membagikan sebuah link atau halaman tidak seharusnya terasa teknis.**

User datang dengan sebuah tujuan:

> “Saya ingin membagikan sesuatu.”

MFY Event menangani kompleksitas di belakangnya.

Dari:

```text
URL panjang
```

menjadi:

```text
event.mfytech.my.id/kkg2026
```

atau dari kumpulan berbagai link menjadi:

```text
event.mfytech.my.id/@masalfy
```

Semua dilakukan melalui pengalaman yang sederhana, modern, cepat dan tetap membawa identitas:

**MFY Event — by MFY Tech.**