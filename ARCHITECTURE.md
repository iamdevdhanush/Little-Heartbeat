# Little Heartbeat — MVP Architecture (v2.0 Redesign)

> **Philosophy:** Ship a compelling, differentiated product in 8 weeks.  
> **Target:** 0–5,000 users, $0–20/mo infra, college project / hackathon quality.  
> **Differentiator:** AI companion + timeline engine + emergency layer + partner support.

---

## 1. MVP Feature Selection

### WILL BUILD (max value, minimum effort)

| Feature | Why it survives |
|---------|----------------|
| **AI Pregnancy Companion** | Core differentiator. Not a chatbot — a companion that *knows* your week, symptoms, meds, and appointments. Generates personalized responses. |
| **Pregnancy Timeline Engine** | Central intelligence layer. Drives the home screen, AI context, weekly notifications, and partner view. Every feature reads from it. |
| **Week-by-Week Tracking** | Table stakes. But our version is AI-personalized: "Here's what's happening with *your* baby this week, with *your* symptoms in mind." |
| **Symptom Monitoring** | High-utility. Expectant mothers worry about every ache. AI triages: "Mild? Here's self-care. Severe? Here's your nearest hospital." |
| **Medication Reminders** | Prenatal vitamins are non-negotiable in pregnancy. A core daily driver that brings users back. |
| **Appointment Management** | Pregnant women have 10-15 appointments. Missing one is high-stakes. Simple CRUD + upcoming list. |
| **Emergency SOS** | Genuine life-saving feature. One tap → notify contacts → nearest hospital. No other pregnancy app does this well (or at all). |
| **Partner & Family Support** | A pregnant woman's support network is huge. Sharing the journey with her partner/mother = viral growth. One invite brings in 2+ users. |

### WON'T BUILD (MVP)

| Feature | Why cut |
|---------|---------|
| **Community / Social Feed** | Hardest to build (moderation, trust & safety, spam, toxic content). Zero revenue in MVP. Postpone to V2. |
| **Water / Nutrition Logging** | Requires food databases, serving sizes, meal photos. High effort, low unique value. The AI can *talk* about nutrition without a logging UI. |
| **Mood Tracking** | Low engagement (users log 2-3 times, then stop). Postpone to V2 as a simple emoji picker. |
| **Blood Pressure / Weight Charts** | Important, but complex charting UI. For MVP, log as vitals in the symptom flow. Charts = V2. |
| **Baby Growth Logs (user-entered)** | Reference data (baby = size of banana this week) is the value. Letting users enter ultrasound measurements adds complexity for marginal benefit. |
| **Health Records / Document Manager** | Building a medical document viewer is a project unto itself. MVP: store files, show them in a flat list. |
| **Prescription OCR Pipeline** | Tesseract is unreliable for medical text. Manual medication entry is faster and more accurate for MVP. |
| **Multiple Pregnancies** | 99% of users have one active pregnancy. Simplify to one at a time. |
| **Admin Panel** | You don't have an admin. You *are* the admin. Use `psql` for anything urgent. |
| **Push Notifications (FCM)** | Web Push API is free, built into browsers, zero setup. FCM requires Firebase project, billing, platform-specific setup. |
| **SMS Notifications** | $0.0075/message adds up. Use in-app + email + WhatsApp deep links for free. |
| **Full Audit Logging** | Compliance theater for a college project. Log critical actions to a file. Ship it. |
| **OAuth (Google/Apple)** | Email + password works. Google OAuth adds complexity. Add in V2. |
| **Refresh Token Rotation** | Simple long-expiry JWT (30 days) is fine. Rotation is enterprise paranoia. |
| **Rate Limiting / IP Blocking** | Render/Cloudflare handles DDoS. Don't build your own. |
| **Multi-language** | English only. Internationalization is a V2 concern. |
| **Offline Mode** | Service workers + localStorage. Complex to do well. Most users have connectivity. |
| **Wearable / Health Kit Sync** | Requires Apple/Google health API integrations. V3. |

---

## 2. Product Differentiator

### The four-pillar moat

```
┌────────────────────────────────────────────────────────────┐
│              LITTLE HEARTBEAT MVP                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────┐   ┌──────────────────┐               │
│  │                  │   │                  │               │
│  │  AI COMPANION    │   │  TIMELINE ENGINE │               │
│  │                  │   │                  │               │
│  │  Knows your week │   │  Central source   │               │
│  │  Knows your body │   │  of truth         │               │
│  │  Knows your meds │   │  Drives:          │               │
│  │  Never judges    │   │  - Home screen    │               │
│  │  Always there    │   │  - AI context     │               │
│  │                  │   │  - Notifications  │               │
│  └────────┬─────────┘   │  - Partner view   │               │
│           │             └────────┬─────────┘               │
│           │                      │                         │
│           └──────┬───────────────┘                         │
│                  │                                          │
│  ┌───────────────▼────────────┐  ┌──────────────────┐      │
│  │                            │  │                  │      │
│  │  EMERGENCY SAFETY LAYER   │  │  PARTNER SUPPORT  │      │
│  │                            │  │                  │      │
│  │  One-tap SOS               │  │  Invite support   │      │
│  │  AI detects emergencies   │  │  network          │      │
│  │  Notifies contacts         │  │  View-only access │      │
│  │  Finds nearest hospital   │  │  Shared journey   │      │
│  │                            │  │  Viral growth     │      │
│  └────────────────────────────┘  └──────────────────┘      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Why existing pregnancy apps are weak

| App | Gap |
|-----|-----|
| **What to Expect** | Content-heavy, no AI, no emergency layer |
| **Ovia Pregnancy** | Good tracking, no AI companion |
| **BabyCenter** | Community focus, no real personalization |
| **Pregnancy+** | Beautiful UI, no safety features |
| **Glow Nurture** | Generic tracking, no differentiator |

**Little Heartbeat difference:** Every feature feeds the AI companion. The AI knows *you*, not just pregnancy in general. The emergency layer is unique. The partner feature creates a two-sided network effect.

---

## 3. Pregnancy Timeline Engine

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     TIMELINE ENGINE                               │
│                                                                   │
│  ┌────────────────────┐    ┌────────────────────────────────┐    │
│  │  Reference Layer    │    │  Personal Layer                │    │
│  │  (static data)      │    │  (user's data)                 │    │
│  │                     │    │                                │    │
│  │  Weeks 1-42:        │    │  Symptoms[:week]              │    │
│  │  - Baby size         │    │  Appointments[:week]         │    │
│  │  - Development       │    │  Medications[:week]          │    │
│  │  - Mother changes    │    │  Vitals[:week]               │    │
│  │  - Nutrition         │    │  User milestones[:week]      │    │
│  │  - Exercise          │    │                                │    │
│  │  - Warning signs     │    └────────────────────────────────┘    │
│  │  - Goals              │                │                       │
│  └──────────┬───────────┘                │                        │
│             │                            │                        │
│             └──────────┬─────────────────┘                        │
│                        │                                          │
│              ┌─────────▼──────────┐                               │
│              │  AI Enhancement    │                               │
│              │                    │                               │
│              │  Merges reference  │                               │
│              │  + personal data   │                               │
│              │  + natural language│                               │
│              │  = personalized    │                               │
│              │  weekly insight    │                               │
│              └─────────┬──────────┘                               │
│                        │                                          │
│              ┌─────────▼──────────┐                               │
│              │  Cache             │                               │
│              │  (stored in        │                               │
│              │  PostgreSQL)       │                               │
│              │  Invalidated on    │                               │
│              │  new symptom/med/  │                               │
│              │  appointment       │                               │
│              └────────────────────┘                               │
└──────────────────────────────────────────────────────────────────┘
```

### Data flow for a single week request

```
1. GET /timeline/current-week
2. TimelineEngine.get_week(pregnancy, week_number)
   a. Fetch reference data for week (from memory / DB)
   b. Fetch user's symptoms for weeks <= current (filtered)
   c. Fetch user's upcoming appointments
   d. Fetch active medications
   e. Build context dict: { reference, symptoms, appointments, medications }
   f. Return merged response
3. Optional: POST /ai/personalize → AI adds "Here's what this means for you"
4. Cache result in timeline_events table with is_system_event=true
5. Return to client
```

### API responses

**GET /timeline/current-week**
```json
{
  "week": 20,
  "trimester": "second",
  "baby": {
    "size": "Banana",
    "emoji": "🍌",
    "length_cm": 16.5,
    "weight_g": 300,
    "development": "Your baby can hear your voice this week! The lanugo (fine hair) now covers their body to keep them warm."
  },
  "mother": {
    "changes": "Your uterus has expanded to about belly-button height. You may feel more energetic this trimester.",
    "common_symptoms": ["Round ligament pain", "Backache", "Leg cramps"]
  },
  "nutrition": [
    {"text": "Increase iron intake — your blood volume has doubled", "foods": ["spinach", "lean beef", "lentils"]},
    {"text": "Stay hydrated — aim for 8-10 glasses of water daily", "foods": null}
  ],
  "exercise": "Pelvic tilts and prenatal yoga are excellent this week. Avoid lying flat on your back.",
  "warning_signs": [
    {"text": "Vaginal bleeding or spotting", "action": "contact_doctor"},
    {"text": "Severe abdominal pain", "action": "emergency"}
  ],
  "goals": ["Schedule your anatomy scan (weeks 18-22)", "Start sleeping on your side"],
  "next_appointment": {
    "id": "uuid",
    "title": "Anatomy Scan",
    "scheduled_at": "2026-07-15T09:00:00Z",
    "doctor": "Dr. Smith"
  },
  "ai_personalized_insight": "At 20 weeks, you're right at the halfway point. Since you've been experiencing some back pain, try these prenatal stretches I can show you...",
  "ai_is_generated": true,
  "ai_generated_at": "2026-06-21T10:00:00Z"
}
```

### Cache invalidation rules

```
Timeline cache is invalidated when:
- New symptom logged (POST /symptoms)
- New appointment created (POST /appointments)
- Medication added/removed (POST/DELETE /medications)
- New vitals logged (POST /vitals)
- User manually requests refresh

Invalidation = DELETE timeline_events WHERE pregnancy_id=X AND week=current_week
Next request regenerates with fresh data
```

---

## 4. AI Pregnancy Companion

### Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                      AI COMPANION SERVICE                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐     │
│  │  Context        │   │  Retrieval     │   │  Memory        │     │
│  │  Builder        │──►│  Layer         │──►│  Manager       │     │
│  │                 │   │                │   │                │     │
│  │  Pregnancy data │   │  Timeline data │   │  Last N msgs   │     │
│  │  User profile   │   │  Past symptoms │   │  Summary (if   │     │
│  │  Current week   │   │  Medications   │   │  >20 msgs)     │     │
│  │  Recent logs    │   │  Appointments  │   │                │     │
│  │  Last N msgs    │   │  Health data   │   │                │     │
│  └────────┬───────┘   └────────┬───────┘   └────────┬───────┘     │
│           │                    │                     │             │
│           └──────────┬─────────┴──────────┬──────────┘             │
│                      │                    │                        │
│              ┌───────▼────────┐   ┌───────▼────────┐              │
│              │  Prompt        │   │  Safety        │              │
│              │  Builder       │   │  Filter        │              │
│              │                │   │                │              │
│              │  System prompt │   │  Emergency     │              │
│              │  + context     │   │  detection     │              │
│              │  + history     │   │  Toxicity      │              │
│              └───────┬────────┘   │  guardrails    │              │
│                      │            └────────┬───────┘              │
│                      │                     │                       │
│                      └─────────┬───────────┘                       │
│                                │                                   │
│                        ┌───────▼────────┐                         │
│                        │  Gemini API    │                         │
│                        │  (gemini-2.0-  │                         │
│                        │   flash)       │                         │
│                        └───────┬────────┘                         │
│                                │                                   │
│                        ┌───────▼────────┐                         │
│                        │  Response      │                         │
│                        │  Processor     │                         │
│                        │                │                         │
│                        │  Check for     │                         │
│                        │  emergency     │                         │
│                        │  Format markdown│                        │
│                        │  Store in DB   │                         │
│                        └────────────────┘                         │
└────────────────────────────────────────────────────────────────────┘
```

### Prompt Template

```
SYSTEM: You are Heartbeat, an AI pregnancy companion for {{user_name}}.
You are warm, knowledgeable, and reassuring. You never give medical
diagnoses — instead you provide evidence-based information and always
recommend consulting a doctor for concerns.

USER'S CONTEXT:
- Current pregnancy week: {{week}}
- Trimester: {{trimester}}
- Due date: {{due_date}}
- Baby's development this week: {{baby_dev}}
- Recent symptoms (last 7 days): {{recent_symptoms}}
- Active medications: {{active_medications}}
- Upcoming appointments: {{appointments}}
- Known conditions: {{medical_conditions}}
- Allergies: {{allergies}}

RULES:
1. NEVER prescribe medication or change dosages
2. If the user describes EMERGENCY symptoms (bleeding, severe pain,
   loss of movement, high BP symptoms), immediately include:
   "⚠️ Please contact your healthcare provider immediately or go to
   the nearest emergency room."
3. Tailor all advice to the user's specific week and symptoms
4. Use warm, conversational language. Be a friend who happens to
   know a lot about pregnancy.
5. If you don't know something, say so honestly.
```

### Memory System

```
IMPLEMENTATION: Store messages as JSONB array in ai_conversations table.

{
  "messages": [
    {"role": "user", "content": "...", "ts": "..."},
    {"role": "assistant", "content": "...", "ts": "..."},
    ...
  ],
  "summary": "User asked about back pain at 20 weeks...",
  "message_count": 12
}

SLIDING WINDOW:
- Keep last 10 messages in the prompt
- When conversation exceeds 20 messages:
  1. Call Gemini: "Summarize this conversation in 2-3 sentences"
  2. Store summary in conversation.metadata
  3. Replace oldest 10 messages with summary
  4. Continue with summary + recent 10 messages

COST OPTIMIZATION:
- Only include context snapshot when conversation starts
- Re-use cached weekly timeline instead of regenerating
- Batch context retrieval: single DB query for all user data
```

### Emergency Detection

```
The AI checks every user message for emergency keywords.
Detection happens at TWO levels:

Level 1 — Keyword/Pattern Match (fast, no API cost):
  Patterns like: "bleeding", "blood", "severe pain", "can't feel",
  "not moving", "high BP", "vision changes", "chest pain"

Level 2 — Semantic Detection (via Gemini response):
  Even if no keyword matches, Gemini may detect emergency context
  and include escalation language naturally.

When emergency is detected:
1. AI appends escalation box to response
2. Backend returns "emergency_detected": true in response
3. Frontend shows SOS card with "Call Emergency" + "Find Hospital" buttons
```

### Cost Control

```
Gemini 2.0 Flash pricing: $0.075/1M input tokens, $0.300/1M output tokens

Average conversation: ~500 input tokens, ~200 output tokens
Cost per conversation: ~$0.0001

10,000 conversations/month: ~$1.00

For MVP with 0-1000 users, AI costs are essentially zero.

Optimization: Cache common questions (first 3 words hash → prewritten answer)
to avoid API calls for "What size is my baby this week?" type queries.
```

---

## 5. Emergency Safety Layer

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMERGENCY SAFETY LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TRIGGER PATHS:                                                  │
│                                                                  │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐              │
│  │  SOS Button │   │  AI detects│   │  Severe    │              │
│  │  (explicit) │   │  emergency │   │  symptom   │              │
│  │             │   │  in chat   │   │  logged    │              │
│  └──────┬──────┘   └──────┬─────┘   └──────┬─────┘              │
│         │                 │                │                    │
│         └─────────────────┼────────────────┘                    │
│                           │                                     │
│                    ┌──────▼──────┐                              │
│                    │  EMERGENCY  │                              │
│                    │  SERVICE    │                              │
│                    └──────┬──────┘                              │
│                           │                                     │
│              ┌────────────┼────────────┐                        │
│              │            │            │                        │
│              ▼            ▼            ▼                        │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Notify      │  │  Nearby  │  │  Create  │                  │
│  │  Contacts    │  │  Hospital│  │  SOS     │                  │
│  │              │  │  Lookup  │  │  Record  │                  │
│  │  - Push (web)│  │          │  │  (DB)    │                  │
│  │  - Email     │  │  OSM API │  │          │                  │
│  │  - WhatsApp  │  │  → Parse │  │  status:  │                 │
│  │    link      │  │  → Return│  │  active   │                 │
│  └──────┬───────┘  │  nearest │  └──────────┘                  │
│         │          └──────────┘                                │
│         ▼                                                      │
│  ┌──────────────┐                                              │
│  │  Response to │                                              │
│  │  User        │                                              │
│  │              │                                              │
│  │  - "SOS sent"│                                              │
│  │  - "Contacts │                                              │
│  │    notified" │                                              │
│  │  - "Nearest  │                                              │
│  │    hospital" │                                              │
│  └──────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Emergency Severity Matrix

| Level | Example | Action |
|-------|---------|--------|
| **INFO** | Mild headache, fatigue | Self-care tips via AI |
| **CAUTION** | Persistent headache, low-grade fever | Suggest calling doctor, provide info |
| **URGENT** | Bleeding, severe pain, high BP | SOS prompt, escalation box |
| **EMERGENCY** | Unconscious, heavy bleeding, seizures | Auto-trigger SOS, direct to 911 |

### SOS Flow (Detailed)

```
1. User taps SOS button (or AI detects emergency)
2. Frontend gets GPS location (navigator.geolocation)
3. POST /emergency/sos { type, lat, lng, message }
4. Backend:
   a. Creates sos_alert record
   b. Gets emergency contacts from DB
   c. For each contact:
      - If they have the app: create notification record (frontend polls)
      - Email: send via Resend/SMTP with Google Maps link
      - WhatsApp: deep link (wa.me/phone?text=...)
   d. Calls OSM Nominatim API: find nearest hospital
   e. Returns: { alert_id, contacts_notified, nearest_hospital }
5. Frontend shows:
   - "SOS sent to 3 contacts"
   - "Nearest: Mount Sinai Hospital (1.2 km)"
   - "Call 911" button
   - "Cancel SOS" button (PATCH /emergency/sos/{id}/cancel)
```

### OSM Hospital Lookup

```python
# No API key needed. Free. Rate limit: 1 req/sec.
url = "https://nominatim.openstreetmap.org/search"
params = {
    "q": "maternity hospital near 40.7128,-74.0060",
    "format": "json",
    "limit": 5,
    "addressdetails": 1
}
response = requests.get(url, params=params, headers={
    "User-Agent": "LittleHeartbeat/1.0 (college-project)"
})
```

### Web Push Notification for Emergency Contacts

```python
# Web Push API — free, built into browsers
# Uses VAPID keys (generate once, no service)
import pywebpush

def send_push(subscription, title, body):
    pywebpush.webpush(
        subscription_info=subscription,
        data=json.dumps({"title": title, "body": body}),
        vapid_private_key=VAPID_PRIVATE_KEY,
        vapid_claims={"sub": "mailto:admin@littleheartbeat.app"}
    )
```

---

## 6. Partner & Family Support

### Invitation Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Mother  │         │  Backend │         │  Partner │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │ POST /partner/invite│                    │
     │ {email, role}      │                    │
     │───────────────────►│                    │
     │                    │                    │
     │                    │ Create partner_link │
     │                    │ status: pending    │
     │                    │                    │
     │ 201 {link_id}      │                    │
     │◄───────────────────│                    │
     │                    │                    │
     │                    │ Send email to      │
     │                    │ partner:           │
     │                    │ "Join Jane's       │
     │                    │  pregnancy journey"│
     │                    │────────────────────│►
     │                    │                    │
     │                    │                    │ Partner clicks
     │                    │                    │ link, registers/
     │                    │                    │ logs in
     │                    │                    │
     │                    │ PATCH /partner/    │
     │                    │ links/{id}/respond │
     │                    │ {status: active}   │
     │                    │◄───────────────────│
     │                    │                    │
     │                    │ status: active     │
     │                    │ Send push to mother│
     │                    │ "Alex joined!"     │
     │                    │───────────────────►│
```

### Partner Permissions (MVP)

```json
{
  "role": "partner",       // "partner", "family", "friend"
  "permissions": {
    "view_timeline": true,        // See weekly updates
    "view_appointments": true,    // See upcoming appointments
    "view_medications": false,    // Medical privacy
    "view_symptoms": false,       // Medical privacy
    "receive_notifications": true // Get weekly updates
  }
}
```

The partner sees a curated "Partner View" in the app:
- Baby's current size + development
- Weekly highlights (not full medical data)
- Upcoming appointments (time only, no notes)
- Encouragement tips: "This week, she might need help with..."
- SOS notifications if triggered

### Retention impact

Partner features create a **two-sided network effect**:
- Mother invites partner → partner installs app
- Partner sees updates → engages with mother about pregnancy
- Mother sees partner engaged → opens app more
- Both users = double the DAU from one pregnancy

For a college project, this is your growth hack: one invite brings in a second user for free.

---

## 7. Database (Optimized for MVP — 13 tables)

### Schema

```sql
-- ============================================================
-- LITTLE HEARTBEAT — MVP Database Schema (13 tables)
-- ============================================================

-- 1. USERS (merged with profiles)
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),
    display_name    VARCHAR(100),
    avatar_url      TEXT DEFAULT '/avatars/default.png',
    date_of_birth   DATE,
    blood_type      VARCHAR(5),
    height_cm       NUMERIC(5,1),
    medical_conditions TEXT[] DEFAULT '{}',
    allergies       TEXT[] DEFAULT '{}',
    timezone        VARCHAR(50) DEFAULT 'UTC',
    language        VARCHAR(10) DEFAULT 'en',
    onboarding_step VARCHAR(50) DEFAULT 'welcome',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PREGNANCIES (one active)
CREATE TABLE pregnancies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    due_date        DATE NOT NULL,
    baby_name       VARCHAR(100),
    fetal_sex       VARCHAR(10) DEFAULT 'unknown',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_preg_user_active ON pregnancies(user_id) WHERE is_active = TRUE;

-- 3. SYMPTOMS (core health tracking)
CREATE TABLE symptoms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pregnancy_id    UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symptom         VARCHAR(100) NOT NULL,
    severity        VARCHAR(20) NOT NULL DEFAULT 'mild',  -- mild, moderate, severe
    severity_score  INTEGER CHECK (severity_score BETWEEN 1 AND 10),
    duration        VARCHAR(50),                           -- "2 hours", "3 days"
    notes           TEXT,
    logged_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_symptoms_preg ON symptoms(pregnancy_id, logged_at DESC);

-- 4. VITALS (unified: weight, BP, heart rate)
CREATE TABLE vitals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pregnancy_id    UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL,                  -- 'weight', 'blood_pressure', 'heart_rate'
    value           JSONB NOT NULL,                        -- {"weight_kg": 65.5} or {"systolic": 120, "diastolic": 80}
    notes           TEXT,
    logged_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vitals_preg ON vitals(pregnancy_id, type, logged_at DESC);

-- 5. APPOINTMENTS
CREATE TABLE appointments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pregnancy_id    UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    doctor_name     VARCHAR(200),
    clinic_name     VARCHAR(200),
    location        TEXT,
    scheduled_at    TIMESTAMPTZ NOT NULL,
    duration_min    INTEGER DEFAULT 30,
    notes           TEXT,
    status          VARCHAR(20) DEFAULT 'scheduled',  -- scheduled, completed, cancelled
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_appts_preg ON appointments(pregnancy_id, scheduled_at);

-- 6. MEDICATIONS (with JSONB reminder schedules)
CREATE TABLE medications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pregnancy_id    UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    dosage          VARCHAR(50),
    frequency       VARCHAR(50),                      -- "3 times daily", "once daily"
    timing          JSONB DEFAULT '[]',               -- [{"time": "08:00", "day": 0}, ...]
    instructions    TEXT,
    prescribed_by   VARCHAR(200),
    is_active       BOOLEAN DEFAULT TRUE,
    started_at      DATE,
    ended_at        DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_meds_active ON medications(pregnancy_id, is_active);

-- 7. EMERGENCY CONTACTS
CREATE TABLE emergency_contacts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    email           VARCHAR(255),
    relation        VARCHAR(50),
    is_primary      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_emerg_contacts ON emergency_contacts(user_id);

-- 8. SOS ALERTS
CREATE TABLE sos_alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type      VARCHAR(50) NOT NULL DEFAULT 'manual', -- manual, ai_detected, symptom_triggered
    latitude        NUMERIC(10,7),
    longitude       NUMERIC(10,7),
    message         TEXT,
    status          VARCHAR(20) DEFAULT 'active',     -- active, resolved, cancelled, expired
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ
);
CREATE INDEX idx_sos_active ON sos_alerts(user_id) WHERE status = 'active';

-- 9. PARTNER LINKS
CREATE TABLE partner_links (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pregnancy_id    UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    inviting_user   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invited_email   VARCHAR(255) NOT NULL,
    invited_user_id UUID REFERENCES users(id),       -- NULL until they register
    role            VARCHAR(20) DEFAULT 'partner',    -- partner, family, friend
    status          VARCHAR(20) DEFAULT 'pending',    -- pending, active, declined
    permissions     JSONB DEFAULT '{
        "view_timeline": true,
        "view_appointments": true,
        "receive_notifications": true
    }',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_partner_invited ON partner_links(invited_email);

-- 10. AI CONVERSATIONS (with JSONB messages array)
CREATE TABLE ai_conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pregnancy_id    UUID REFERENCES pregnancies(id),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200) DEFAULT 'New Conversation',
    messages        JSONB DEFAULT '[]',
    message_count   INTEGER DEFAULT 0,
    summary         TEXT,
    is_archived     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ai_conv ON ai_conversations(user_id, created_at DESC);

-- 11. DOCUMENTS (uploaded files — prescriptions, reports, scans)
CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pregnancy_id    UUID REFERENCES pregnancies(id),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200),
    category        VARCHAR(50) DEFAULT 'other',  -- prescription, lab_report, ultrasound, other
    file_url        TEXT NOT NULL,
    file_type       VARCHAR(20),
    file_size       INTEGER,
    uploaded_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_docs_preg ON documents(pregnancy_id);

-- 12. TIMELINE REFERENCE DATA (seeded, never changed)
CREATE TABLE timeline_reference (
    week            INTEGER PRIMARY KEY CHECK (week BETWEEN 1 AND 42),
    baby_size       VARCHAR(100),
    baby_emoji      VARCHAR(10),
    baby_length_cm  NUMERIC(5,2),
    baby_weight_g   INTEGER,
    development     TEXT,
    mother_changes  TEXT,
    nutrition_tips  JSONB,       -- [{ "text": "...", "foods": [...] }]
    exercise_tips   TEXT,
    warning_signs   JSONB,       -- [{ "text": "...", "action": "..." }]
    goals           TEXT[],
    common_symptoms TEXT[]
);

-- 13. USER TIMELINE EVENTS (milestones, weekly content cache)
CREATE TABLE timeline_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pregnancy_id    UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    week            INTEGER NOT NULL CHECK (week BETWEEN 1 AND 42),
    event_type      VARCHAR(30) NOT NULL,  -- 'weekly_insight', 'milestone', 'ai_insight', 'user_note'
    title           VARCHAR(200),
    content         JSONB,                 -- Flexible content per type
    is_system_event BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_timeline_preg ON timeline_events(pregnancy_id, week);
```

### Merge decisions from 30+ tables down to 13

| Previous table | Decision | Reason |
|----------------|----------|--------|
| `profiles` | **Merged into users** | 1:1 relationship, extra JOIN for no benefit |
| `weight_logs` | **Merged into vitals** | Same CRUD pattern, just different value type |
| `blood_pressure_logs` | **Merged into vitals** | Same as above |
| `mood_logs` | **Removed** | Low MVP value. Log in symptoms as "mood" type |
| `water_logs` | **Removed** | Low MVP value. AI can recommend hydration |
| `nutrition_logs` | **Removed** | Too complex. AI provides guidance, user doesn't log |
| `baby_growth_logs` | **Removed** | Reference data is the value. User measurements are edge case |
| `pregnancy_milestones` | **Merged into timeline_events** | Same thing, different name |
| `doctors` | **Merged into appointments** | Doctor is context of an appointment. name + phone is enough |
| `prescriptions` | **Removed** | Manual medication entry is faster than OCR debugging |
| `reminders` | **Merged into medications** | Timing schedules as JSONB on medications table |
| `refresh_tokens` | **Removed** | Simple JWT with 30-day expiry. No refresh token |
| `login_history` | **Removed** | Nice-to-have audit, not MVP |
| `community_*` (6 tables) | **Removed entirely** | V2 feature. Adds massive complexity for zero MVP value |
| `hospitals` | **Removed** | Query OSM directly per request. Caching is premature optimization |
| `notification_tokens` | **Merged into users** | Single JSONB column for web push subscriptions |
| `notifications` | **Removed** | In-app notifications via polling. Push via Web Push API directly |
| `health_records` | **Removed** | Documents handle file storage. Structured health records are V2 |
| `partner_links.permissions` | **Simplified** | Fixed permissions JSONB. No permission editing UI in MVP |
| `audit_logs` | **Removed** | Log to stdout. Don't need a table |
| `admin_actions` | **Removed** | No admin panel in MVP |
| `ai_messages` | **Merged into ai_conversations** | Messages as JSONB array. No need for separate table |

---

## 8. API Design (MVP Only)

```
Base: /api/v1
Auth: Bearer <JWT> (except register/login)
```

### Auth

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/auth/register` | `{ email, password, display_name }` | `{ user, token }` |
| POST | `/auth/login` | `{ email, password }` | `{ user, token }` |
| GET | `/auth/me` | — | `{ user, pregnancy }` |
| PATCH | `/auth/me` | `{ display_name, timezone, ... }` | `{ user }` |

### Pregnancy

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/pregnancies` | `{ due_date, baby_name?, fetal_sex? }` | `{ pregnancy }` |
| GET | `/pregnancies/current` | — | `{ pregnancy, week, trimester }` |
| PATCH | `/pregnancies/current` | `{ baby_name?, fetal_sex? }` | `{ pregnancy }` |
| DELETE | `/pregnancies/current` | — | `204` |

### Timeline (Core differentiator)

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/timeline/current-week` | — | Full week data (reference + personal + optional AI) |
| GET | `/timeline/week/{week}` | — | Specific week data |
| GET | `/timeline/overview` | — | All 40 weeks summary `[{week, baby_emoji, baby_size}]` |
| POST | `/timeline/events` | `{ week, title, content }` | Custom milestone |
| GET | `/timeline/events` | `?week=` | User's timeline events |

### Symptoms

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/symptoms` | `?days=7&severity=` | Symptom list |
| POST | `/symptoms` | `{ symptom, severity, duration?, notes? }` | `{ symptom }` |
| DELETE | `/symptoms/{id}` | — | `204` |
| POST | `/symptoms/analyze` | `{ symptom, severity, duration }` | AI analysis + triage |

### Vitals

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/vitals` | `?type=weight&days=30` | Vitals list |
| POST | `/vitals` | `{ type, value, notes? }` | `{ vitals }` |
| GET | `/vitals/latest` | `?type=weight` | Latest of each type |

### Appointments

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/appointments` | `?status=upcoming` | Appointment list |
| POST | `/appointments` | `{ title, doctor_name?, scheduled_at, ... }` | `{ appointment }` |
| PATCH | `/appointments/{id}` | `{ status, notes }` | `{ appointment }` |
| DELETE | `/appointments/{id}` | — | `204` |

### Medications

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/medications` | — | Active medications |
| POST | `/medications` | `{ name, dosage, frequency, timing }` | `{ medication }` |
| PATCH | `/medications/{id}` | `{ is_active, ... }` | `{ medication }` |
| DELETE | `/medications/{id}` | — | `204` |
| POST | `/medications/{id}/take` | `{ taken_at? }` | `{ status: "taken" }` |
| POST | `/medications/{id}/skip` | `{ reason? }` | `{ status: "skipped" }` |

### AI Companion

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/ai/chat` | `{ message, conversation_id? }` | `{ reply, conversation_id, emergency_detected }` |
| GET | `/ai/conversations` | — | Conversation list |
| GET | `/ai/conversations/{id}` | — | Messages |
| DELETE | `/ai/conversations/{id}` | — | `204` |

### Emergency

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/emergency/contacts` | — | Contact list |
| POST | `/emergency/contacts` | `{ name, phone, relation }` | `{ contact }` |
| DELETE | `/emergency/contacts/{id}` | — | `204` |
| POST | `/emergency/sos` | `{ type, lat, lng, message? }` | `{ alert_id, contacts_notified, nearest_hospital }` |
| PATCH | `/emergency/sos/{id}` | `{ status }` | Resolve or cancel |
| GET | `/emergency/hospitals/nearby` | `?lat=&lng=&radius=5` | Hospitals list from OSM |

### Partner

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/partner/invite` | `{ email, role }` | `{ link }` |
| GET | `/partner/links` | — | Partner links list |
| PATCH | `/partner/links/{id}/respond` | `{ status }` | `{ link }` |
| DELETE | `/partner/links/{id}` | — | `204` |
| GET | `/partner/timeline` | — | Curated partner view of timeline |
| PUT | `/partner/push-subscription` | Web push subscription | `204` |

---

## 9. Folder Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app, CORS, router includes
│   ├── config.py                # Settings via pydantic-settings
│   ├── database.py              # AsyncSession, engine, get_db
│   ├── models.py                # All SQLAlchemy models (13 tables)
│   ├── schemas.py               # All Pydantic schemas
│   ├── auth.py                  # register(), login(), get_current_user(), hash/verify
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── pregnancies.py       # Pregnancy CRUD
│   │   ├── timeline.py          # Timeline engine (reference + personal + AI)
│   │   ├── symptoms.py          # Symptom CRUD + analyze
│   │   ├── vitals.py            # Vitals CRUD (weight, BP)
│   │   ├── appointments.py      # Appointment CRUD
│   │   ├── medications.py       # Medication CRUD + take/skip
│   │   ├── ai.py                # AI companion chat
│   │   ├── emergency.py         # SOS + contacts + hospitals
│   │   └── partner.py           # Partner invitation + view
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai_service.py        # Gemini client, prompt building, context
│   │   ├── timeline.py          # TimelineEngine class (reference + merge + cache)
│   │   ├── emergency.py         # Emergency detection, contact notify, hospital lookup
│   │   └── notification.py      # Web Push helper, email helper
│   └── utils/
│       ├── __init__.py
│       ├── week_calc.py         # due_date → current_week, trimester
│       └── location.py          # OSM Nominatim client
├── timeline_data/               # Static reference data
│   └── weekly.py                # dict of weeks 1-42 data
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_timeline.py
│   └── test_emergency.py
├── requirements.txt
├── .env.example
└── README.md
```

---

## 10. Deployment

### Development (one command startup)

```bash
# Terminal 1: PostgreSQL (Docker)
docker run --name little-pg -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:16-alpine

# Terminal 2: Backend
cd backend
cp .env.example .env
# Edit DATABASE_URL=postgresql://postgres:dev@localhost:5432/little_heartbeat
python -m venv .venv
.venv\Scripts\activate    # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Terminal 3: Frontend
npm install
npm run dev
```

### Production (MVP — $0-20/month)

```
┌──────────────────────────────────────────────┐
│  Vercel (Free)                                │
│  React SPA + PWA                              │
│  ┌──────────────┐  ┌──────────────┐          │
│  │  little-hb.   │  │  api.little- │          │
│  │  vercel.app   │  │  hb.com      │          │
│  └──────┬───────┘  │  (proxy to   │          │
│         │          │   Render)    │          │
│         │          └──────┬───────┘          │
│         └─────────┬──────┘                    │
│                   │                           │
└───────────────────┼───────────────────────────┘
                    │
┌───────────────────┼───────────────────────────┐
│  Render (Free Web Service)  $0-7/mo           │
│  ┌────────────────┴────────────────┐          │
│  │  FastAPI (Gunicorn + Uvicorn)   │          │
│  │  1 instance, 512MB RAM          │          │
│  └────────────────┬────────────────┘          │
└───────────────────┼───────────────────────────┘
                    │
┌───────────────────┼───────────────────────────┐
│  Neon (Free PostgreSQL)     $0/mo             │
│  ┌────────────────┴────────────────┐          │
│  │  500MB storage, always-on       │          │
│  │  Auto-pause after 5 min idle   │          │
│  │  (wakes in <1s on request)      │          │
│  └────────────────┬────────────────┘          │
└───────────────────┼───────────────────────────┘
                    │
┌───────────────────┼───────────────────────────┐
│  External (All Free or $0 tier)               │
│  ┌────────┐ ┌────────┐ ┌────────┐            │
│  │ Gemini │ │ OSM    │ │ Resend │            │
│  │  (Free │ │ (Free) │ │ (Free  │            │
│  │  tier) │ │        │ │ 3k/mo) │            │
│  └────────┘ └────────┘ └────────┘            │
└──────────────────────────────────────────────┘

Total monthly cost: $0-7/mo
```

### Upgrade Path

| Tier | Users | Backend | Database | Cost/mo |
|------|-------|---------|----------|---------|
| **MVP** | 0-500 | Render Free | Neon Free | $0-7 |
| **Growth** | 500-5000 | Render $7 | Neon $19 | $26 |
| **Scale** | 5000+ | Fly.io 2x$19 | Crunchy Bridge $30 | $68+ |

---

## 11. 8-Week Development Roadmap

### Week 1: Foundation
```
☐ Project setup: FastAPI, SQLAlchemy, Alembic, Neon DB
☐ Models: users, pregnancies (2 of 13 tables)
☐ Auth: register, login, JWT, get_current_user dependency
☐ Deploy: Render + Neon connected, health check passing
```

### Week 2: Pregnancy + Timeline
```
☐ Models: timeline_reference, timeline_events
☐ Reference data: load all 40 weeks of baby growth data
☐ Timeline engine: get_week(pregnancy, week) → merged data
☐ APIs: POST pregnancies, GET timeline/current-week
☐ Week calculator: due_date → week, trimester utilities
```

### Week 3: Tracking
```
☐ Models: symptoms, vitals
☐ APIs: symptoms CRUD, vitals CRUD
☐ Symptom severity scoring + basic triage (rule-based)
☐ Wire up frontend to real backend endpoints
```

### Week 4: Medications + Appointments
```
☐ Models: medications, appointments
☐ APIs: medication CRUD, appointment CRUD, take/skip
☐ Web Push notification setup (VAPID keys + push endpoint)
☐ Appointment reminders (simple polling: check every 5 min)
```

### Week 5: AI Companion v1
```
☐ Gemini API integration (google-generativeai library)
☐ Context builder: fetch pregnancy + symptoms + meds + appts
☐ Prompt template with user context injection
☐ POST /ai/chat with conversation storage (JSONB messages)
☐ Safety filter: keyword matching for emergency symptoms
```

### Week 6: Emergency Safety Layer
```
☐ Models: emergency_contacts, sos_alerts
☐ SOS trigger flow: create alert, notify contacts, find hospital
☐ OSM Nominatim integration for hospital lookup
☐ Web Push notification for emergency contacts
☐ POST /emergency/sos + PATCH /sos/{id}/cancel
```

### Week 7: Partner Support
```
☐ Model: partner_links
☐ Partner invitation: email → register → link accounts
☐ Partner view: curated timeline (non-medical)
☐ Push notification on partner invite + partner joins
☐ Invitation email via Resend (free tier)
```

### Week 8: Polish + Launch
```
☐ Seed database with all 40 weeks of reference data
☐ Error handling: proper HTTP codes, error responses
☐ CORS configuration for production domains
☐ Frontend: connect all screens to real backend
☐ Load test: 50 concurrent users (locust or simple script)
☐ Launch on Vercel + Render!
```

---

## 12. V2 Roadmap

### Weeks 9-16

```
HIGH PRIORITY (user-facing value):
☐ Google OAuth login
☐ Community posts (anonymous, text-only, no images)
☐ Basic moderation (flag → hide → delete)
☐ Blood pressure chart (use vitals data + chart.js)
☐ Weight gain chart (use vitals data + reference range)
☐ Push notification reminders (FCM for mobile)
☐ Multi-language support (i18n)
☐ Dark mode

LOW PRIORITY (infrastructure polish):
☐ Rate limiting (slowapi)
☐ Refresh token rotation
☐ Prometheus metrics
☐ Structured logging (loguru)
☐ CI/CD pipeline (GitHub Actions)
☐ Automated tests (pytest >80% coverage)
```

## 13. Startup Scale (3-6 months)

```
COMMUNITY:
☐ Full community module with categories, tags
☐ Image upload for posts
☐ Upvote/downvote system
☐ Moderation dashboard
☐ Expert AMA (Ask Me Anything) sessions

MONETIZATION:
☐ Premium tier: advanced analytics, unlimited AI
☐ Telemedicine integration (book through app)
☐ Affiliate: pregnancy products (vitamins, books, gear)
☐ Hospital partnerships (listing fees)

MOBILE:
☐ React Native app (iOS + Android)
☐ Push notifications (FCM + APNs)
☐ Apple Health / Google Fit sync
☐ Wearable device integration

ENTERPRISE:
☐ Provider dashboard (doctors see patient timeline)
☐ FHIR API for EHR integration
☐ HIPAA compliance audit
☐ Admin panel (user management, analytics)
```

---

## Architecture Decisions — Rationale

### Why FastAPI + Neon + Vercel?

| Choice | Why | Alternative rejected |
|--------|-----|---------------------|
| **FastAPI** | You already have it. Python AI/ML ecosystem is mature. Async = high throughput. | Supabase-only (loses custom AI logic), Express (worse AI libs) |
| **Neon PostgreSQL** | Free tier is generous (500MB), serverless (pays for usage), branching for dev. | Render Postgres (resets weekly on free), Supabase (overkill for backend auth) |
| **Vercel** | Best free tier for React SPAs, global CDN. | Netlify (equivalent, just different UX) |
| **Gemini** | Free 60 req/min, 1M token context, single provider. | OpenAI (no free tier), Claude (rate-limited free) |
| **OSM** | Free, no API key. | Google Maps ($200+ at scale), Mapbox (complex pricing) |

### Why JSONB for messages, timing, and vitals?

Three reasons:
1. **No migrations needed** — Adding fields is schema-less. If we want to add a `side_effects` field to medications mid-MVP, we just add to the JSONB. No migration.
2. **Fewer tables** — Removes 3 tables from the schema (ai_messages, reminders, separate vital tables).
3. **Good enough performance** — PostgreSQL JSONB is indexed and fast. We're not querying individual messages across users (that's V2 admin panel).

### Why no Redis?

Redis adds a deployment dependency. For <5,000 users, PostgreSQL can handle the load. The timeline cache is just a row in `timeline_events`. If it becomes a bottleneck (it won't at this scale), add Redis in V2.

### Why no Celery?

Celery requires a separate worker process (more infrastructure, more failure modes). For MVP, background tasks run:
- Synchronously in the request (fast enough for <100ms AI calls)
- Via `asyncio.create_task` for fire-and-forget (email sending, push notifications)

If async tasks need retries, add Celery in V2.

### Why limit to one active pregnancy?

99% of users have one pregnancy at a time. Supporting multiple adds UI complexity (pregnancy switcher), query complexity (which pregnancy is this symptom for?), and data complexity. The 1% can manually end the previous pregnancy. Ship it.

---

*This is your MVP architecture. Build this, launch, learn, iterate. Everything else is noise.*
