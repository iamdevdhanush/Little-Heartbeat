-- ============================================================
-- LITTLE HEARTBEAT — Complete Database Schema
-- Version: 2.0 (Redesigned)
-- Engine: PostgreSQL 16+ (with PostGIS)
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE auth_provider AS ENUM ('email', 'google', 'apple');
CREATE TYPE device_type AS ENUM ('web', 'ios', 'android');
CREATE TYPE trimester AS ENUM ('first', 'second', 'third');
CREATE TYPE fetal_sex AS ENUM ('male', 'female', 'unknown', 'multiple');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'missed');
CREATE TYPE reminder_status AS ENUM ('pending', 'taken', 'skipped', 'missed', 'snoozed');
CREATE TYPE medication_timing AS ENUM ('morning', 'afternoon', 'evening', 'night', 'as_needed');
CREATE TYPE symptom_severity AS ENUM ('mild', 'moderate', 'severe', 'emergency');
CREATE TYPE document_category AS ENUM ('prescription', 'lab_report', 'ultrasound', 'medical_record', 'insurance', 'other');
CREATE TYPE health_record_type AS ENUM ('lab_result', 'vaccination', 'allergy', 'condition', 'surgery', 'medication');
CREATE TYPE community_post_category AS ENUM ('general', 'symptoms', 'nutrition', 'exercise', 'mental_health', 'baby_prep', 'birth_story', 'postpartum', 'ask_community');
CREATE TYPE post_status AS ENUM ('published', 'hidden', 'removed', 'flagged');
CREATE TYPE report_reason AS ENUM ('spam', 'harassment', 'medical_misinformation', 'inappropriate', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'dismissed', 'actioned');
CREATE TYPE notification_channel AS ENUM ('push', 'email', 'sms', 'in_app');
CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'emergency');
CREATE TYPE partner_role AS ENUM ('partner', 'family', 'doula', 'friend');
CREATE TYPE partner_status AS ENUM ('pending', 'active', 'declined', 'revoked');
CREATE TYPE ai_message_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE sos_alert_type AS ENUM ('panic', 'fall', 'medical_emergency');
CREATE TYPE sos_status AS ENUM ('active', 'resolved', 'cancelled');

-- ============================================================
-- 1. USERS & AUTHENTICATION
-- ============================================================

-- Core user table (separate from auth.users for portability)
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    email_verified  TIMESTAMPTZ,
    phone           VARCHAR(20),
    phone_verified  TIMESTAMPTZ,
    password_hash   VARCHAR(255),
    auth_provider   auth_provider DEFAULT 'email',
    auth_provider_id VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    is_onboarded    BOOLEAN DEFAULT FALSE,
    is_admin        BOOLEAN DEFAULT FALSE,
    is_moderator    BOOLEAN DEFAULT FALSE,
    is_deleted      BOOLEAN DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email) WHERE is_deleted = FALSE;
CREATE INDEX idx_users_auth_provider ON users(auth_provider, auth_provider_id) WHERE is_deleted = FALSE;

-- Session management
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL,
    device_id       VARCHAR(255),
    device_name     VARCHAR(255),
    device_type     device_type DEFAULT 'web',
    ip_address      INET,
    user_agent      TEXT,
    expires_at      TIMESTAMPTZ NOT NULL,
    is_revoked      BOOLEAN DEFAULT FALSE,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id, is_revoked);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at) WHERE is_revoked = FALSE;

-- Login audit trail
CREATE TABLE login_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address      INET,
    user_agent      TEXT,
    device_info     JSONB,
    login_method    VARCHAR(20),
    success         BOOLEAN DEFAULT TRUE,
    failure_reason  VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_login_history_user ON login_history(user_id, created_at DESC);

-- ============================================================
-- 2. PROFILES
-- ============================================================

CREATE TABLE profiles (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name            VARCHAR(100) NOT NULL,
    avatar_url              TEXT,
    date_of_birth           DATE,
    blood_type              VARCHAR(5),
    allergies               TEXT[] DEFAULT '{}',
    medical_conditions      TEXT[] DEFAULT '{}',
    previous_pregnancies    INTEGER DEFAULT 0,
    language                VARCHAR(10) DEFAULT 'en',
    timezone                VARCHAR(50) DEFAULT 'UTC',
    country                 VARCHAR(100),
    region                  VARCHAR(100),
    height_cm               NUMERIC(5,1),
    emergency_contact_name  VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    onboarding_completed    BOOLEAN DEFAULT FALSE,
    onboarding_step         VARCHAR(50) DEFAULT 'welcome',
    notification_settings   JSONB DEFAULT '{
        "push_enabled": true,
        "email_enabled": true,
        "sms_enabled": false,
        "quiet_hours_start": "22:00",
        "quiet_hours_end": "07:00",
        "categories": {
            "reminder": {"push": true, "email": false},
            "appointment": {"push": true, "email": true},
            "insight": {"push": true, "email": false},
            "community": {"push": true, "email": false},
            "emergency": {"push": true, "email": true, "sms": true}
        }
    }',
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. PREGNANCIES
-- ============================================================

CREATE TABLE pregnancies (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    due_date        DATE NOT NULL,
    conception_date DATE GENERATED ALWAYS AS (due_date - INTERVAL '280 days') STORED,
    current_week    INTEGER GENERATED ALWAYS AS (
        GREATEST(0, LEAST(42, EXTRACT(WEEK FROM AGE(due_date - INTERVAL '280 days', NOW()))::INTEGER))
    ) STORED,
    trimester       trimester GENERATED ALWAYS AS (
        CASE
            WHEN (GREATEST(0, LEAST(42, EXTRACT(WEEK FROM AGE(due_date - INTERVAL '280 days', NOW()))::INTEGER))) <= 12 THEN 'first'::trimester
            WHEN (GREATEST(0, LEAST(42, EXTRACT(WEEK FROM AGE(due_date - INTERVAL '280 days', NOW()))::INTEGER))) <= 27 THEN 'second'::trimester
            ELSE 'third'::trimester
        END
    ) STORED,
    baby_name       VARCHAR(100),
    fetal_sex       fetal_sex DEFAULT 'unknown',
    is_active       BOOLEAN DEFAULT TRUE,
    ended_at        TIMESTAMPTZ,
    end_reason      VARCHAR(50),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pregnancies_user_active ON pregnancies(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_pregnancies_due_date ON pregnancies(due_date);

-- ============================================================
-- 4. PREGNANCY MILESTONES
-- ============================================================

CREATE TABLE pregnancy_milestones (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id    UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    week            INTEGER NOT NULL CHECK (week BETWEEN 1 AND 42),
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    category        VARCHAR(50) NOT NULL,
    icon            VARCHAR(50),
    is_completed    BOOLEAN DEFAULT FALSE,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_milestones_pregnancy ON pregnancy_milestones(pregnancy_id, week);

-- ============================================================
-- 5. SYMPTOMS
-- ============================================================

CREATE TABLE symptoms (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id    UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symptom         VARCHAR(100) NOT NULL,
    severity        symptom_severity NOT NULL,
    severity_score  INTEGER CHECK (severity_score BETWEEN 1 AND 10),
    duration_minutes INTEGER,
    triggers        TEXT[],
    relief_methods  TEXT[],
    notes           TEXT,
    logged_at       TIMESTAMPTZ DEFAULT NOW(),
    date            DATE DEFAULT CURRENT_DATE
);

CREATE INDEX idx_symptoms_pregnancy ON symptoms(pregnancy_id, date DESC);
CREATE INDEX idx_symptoms_user_date ON symptoms(user_id, date DESC);
CREATE INDEX idx_symptoms_severity ON symptoms(severity) WHERE severity IN ('severe', 'emergency');

-- ============================================================
-- 6. WEIGHT TRACKING
-- ============================================================

CREATE TABLE weight_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id    UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight_kg       NUMERIC(5,2) NOT NULL,
    notes           TEXT,
    logged_at       TIMESTAMPTZ DEFAULT NOW(),
    date            DATE DEFAULT CURRENT_DATE
);

CREATE INDEX idx_weight_pregnancy ON weight_logs(pregnancy_id, date DESC);

-- ============================================================
-- 7. BLOOD PRESSURE TRACKING
-- ============================================================

CREATE TABLE blood_pressure_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id    UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    systolic        INTEGER NOT NULL CHECK (systolic BETWEEN 60 AND 300),
    diastolic       INTEGER NOT NULL CHECK (diastolic BETWEEN 30 AND 200),
    heart_rate      INTEGER CHECK (heart_rate BETWEEN 30 AND 250),
    is_manual       BOOLEAN DEFAULT TRUE,
    notes           TEXT,
    logged_at       TIMESTAMPTZ DEFAULT NOW(),
    date            DATE DEFAULT CURRENT_DATE
);

CREATE INDEX idx_bp_pregnancy ON blood_pressure_logs(pregnancy_id, date DESC);

-- ============================================================
-- 8. BABY GROWTH TRACKING
-- ============================================================

CREATE TABLE baby_growth_logs (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id         UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week                 INTEGER NOT NULL CHECK (week BETWEEN 1 AND 42),
    estimated_weight_g   INTEGER,
    estimated_length_cm  NUMERIC(5,1),
    head_circumference_cm NUMERIC(4,1),
    heart_rate_bpm       INTEGER,
    movement_level       VARCHAR(20),
    source               VARCHAR(20) DEFAULT 'manual',
    notes                TEXT,
    logged_at            TIMESTAMPTZ DEFAULT NOW(),
    date                 DATE DEFAULT CURRENT_DATE
);

CREATE INDEX idx_baby_growth_pregnancy ON baby_growth_logs(pregnancy_id, week);
CREATE INDEX idx_baby_growth_date ON baby_growth_logs(pregnancy_id, date DESC);

-- ============================================================
-- 9. MOOD TRACKING
-- ============================================================

CREATE TABLE mood_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id    UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood            VARCHAR(50) NOT NULL,
    emoji           VARCHAR(10),
    energy_level    INTEGER CHECK (energy_level BETWEEN 1 AND 5),
    sleep_hours     NUMERIC(3,1),
    notes           TEXT,
    logged_at       TIMESTAMPTZ DEFAULT NOW(),
    date            DATE DEFAULT CURRENT_DATE
);

CREATE INDEX idx_mood_pregnancy ON mood_logs(pregnancy_id, date DESC);

-- ============================================================
-- 10. WATER & NUTRITION TRACKING
-- ============================================================

CREATE TABLE water_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id    UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    glasses_ml      INTEGER NOT NULL DEFAULT 250,
    logged_at       TIMESTAMPTZ DEFAULT NOW(),
    date            DATE DEFAULT CURRENT_DATE
);

CREATE INDEX idx_water_pregnancy ON water_logs(pregnancy_id, date DESC);

CREATE TABLE nutrition_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id    UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_type       VARCHAR(20) NOT NULL,
    food_items      TEXT[] NOT NULL,
    calories        INTEGER,
    notes           TEXT,
    logged_at       TIMESTAMPTZ DEFAULT NOW(),
    date            DATE DEFAULT CURRENT_DATE
);

CREATE INDEX idx_nutrition_pregnancy ON nutrition_logs(pregnancy_id, date DESC);

-- ============================================================
-- 11. DOCTORS & APPOINTMENTS
-- ============================================================

CREATE TABLE doctors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    specialty       VARCHAR(100),
    clinic_name     VARCHAR(200),
    phone           VARCHAR(20),
    email           VARCHAR(255),
    address         TEXT,
    notes           TEXT,
    is_primary      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_doctors_user ON doctors(user_id);

CREATE TABLE appointments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id        UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id           UUID REFERENCES doctors(id) ON DELETE SET NULL,
    title               VARCHAR(200) NOT NULL,
    appointment_type    VARCHAR(50),
    scheduled_at        TIMESTAMPTZ NOT NULL,
    duration_minutes    INTEGER DEFAULT 30,
    location            TEXT,
    location_coords     POINT,
    notes               TEXT,
    status              appointment_status DEFAULT 'scheduled',
    reminder_sent       BOOLEAN DEFAULT FALSE,
    reminder_sent_at    TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_pregnancy ON appointments(pregnancy_id, scheduled_at DESC);
CREATE INDEX idx_appointments_user_status ON appointments(user_id, status);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at)
    WHERE status IN ('scheduled', 'confirmed');

-- ============================================================
-- 12. MEDICATIONS & PRESCRIPTIONS
-- ============================================================

CREATE TABLE prescriptions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id        UUID REFERENCES pregnancies(id) ON DELETE SET NULL,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id           UUID REFERENCES doctors(id) ON DELETE SET NULL,
    raw_text            TEXT,
    ocr_confidence      NUMERIC(4,3),
    doctor_info         JSONB,
    dates_info          JSONB,
    confidence_scores   JSONB,
    file_path           TEXT,
    status              VARCHAR(20) DEFAULT 'pending',
    reviewed            BOOLEAN DEFAULT FALSE,
    reviewed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_user ON prescriptions(user_id, created_at DESC);

CREATE TABLE medications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id        UUID REFERENCES pregnancies(id) ON DELETE SET NULL,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prescription_id     UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    name                VARCHAR(200) NOT NULL,
    generic_name        VARCHAR(200),
    dosage              VARCHAR(50),
    dosage_unit         VARCHAR(20),
    dosage_amount       NUMERIC(8,2),
    frequency           VARCHAR(50),
    frequency_numeric   INTEGER,
    frequency_per       VARCHAR(20) DEFAULT 'day',
    timing              medication_timing[],
    duration_days       INTEGER,
    instructions        TEXT,
    prescribed_by       VARCHAR(200),
    refill_date         DATE,
    refill_reminder     BOOLEAN DEFAULT FALSE,
    is_prescription     BOOLEAN DEFAULT TRUE,
    category            VARCHAR(50),
    safety_rating       VARCHAR(20),
    notes               TEXT,
    active              BOOLEAN DEFAULT TRUE,
    started_at          DATE,
    ended_at            DATE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medications_user_active ON medications(user_id, active);
CREATE INDEX idx_medications_prescription ON medications(prescription_id);

CREATE TABLE reminders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_id   UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_time  TIME NOT NULL,
    days_of_week    INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
    status          reminder_status DEFAULT 'pending',
    taken_at        TIMESTAMPTZ,
    skipped_at      TIMESTAMPTZ,
    snoozed_until   TIMESTAMPTZ,
    skipped_reason  VARCHAR(100),
    notify_count    INTEGER DEFAULT 0,
    date            DATE DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminders_medication ON reminders(medication_id, date);
CREATE INDEX idx_reminders_user_date ON reminders(user_id, date, status);
CREATE INDEX idx_reminders_pending ON reminders(status, scheduled_time)
    WHERE status = 'pending';

-- ============================================================
-- 13. EMERGENCY & SAFETY
-- ============================================================

CREATE TABLE emergency_contacts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    relation        VARCHAR(50),
    is_primary      BOOLEAN DEFAULT FALSE,
    can_share_location BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_emergency_contacts_user ON emergency_contacts(user_id);

CREATE TABLE sos_alerts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type      sos_alert_type NOT NULL,
    latitude        NUMERIC(10,7),
    longitude       NUMERIC(10,7),
    location_name   TEXT,
    message         TEXT,
    contacted_contacts UUID[],
    status          sos_status DEFAULT 'active',
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sos_active ON sos_alerts(user_id, status) WHERE status = 'active';

CREATE TABLE location_shares (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id        UUID REFERENCES sos_alerts(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_id      UUID REFERENCES emergency_contacts(id) ON DELETE CASCADE,
    latitude        NUMERIC(10,7) NOT NULL,
    longitude       NUMERIC(10,7) NOT NULL,
    accuracy_meters INTEGER,
    shared_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. HOSPITALS
-- ============================================================

CREATE TABLE hospitals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200) NOT NULL,
    address         TEXT,
    latitude        NUMERIC(10,7),
    longitude       NUMERIC(10,7),
    location        GEOMETRY(POINT, 4326),
    phone           VARCHAR(20),
    emergency_phone VARCHAR(20),
    website         VARCHAR(255),
    rating          NUMERIC(2,1),
    has_emergency   BOOLEAN DEFAULT TRUE,
    has_maternity   BOOLEAN DEFAULT TRUE,
    has_nicu        BOOLEAN DEFAULT FALSE,
    specialties     TEXT[],
    open_hours      JSONB,
    source          VARCHAR(20) DEFAULT 'osm',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hospitals_location ON hospitals USING GIST(location);
CREATE INDEX idx_hospitals_maternity ON hospitals(has_maternity) WHERE has_maternity = TRUE;
CREATE INDEX idx_hospitals_emergency ON hospitals(has_emergency) WHERE has_emergency = TRUE;

-- ============================================================
-- 15. COMMUNITY
-- ============================================================

CREATE TABLE community_posts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    is_anonymous        BOOLEAN DEFAULT FALSE,
    anonymous_name      VARCHAR(50),
    title               VARCHAR(200),
    content             TEXT NOT NULL,
    category            community_post_category NOT NULL,
    tags                TEXT[] DEFAULT '{}',
    is_pinned           BOOLEAN DEFAULT FALSE,
    status              post_status DEFAULT 'published',
    moderation_note     TEXT,
    moderated_by        UUID REFERENCES users(id),
    moderated_at        TIMESTAMPTZ,
    view_count          INTEGER DEFAULT 0,
    like_count          INTEGER DEFAULT 0,
    comment_count       INTEGER DEFAULT 0,
    report_count        INTEGER DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_status ON community_posts(status, created_at DESC)
    WHERE status = 'published';
CREATE INDEX idx_posts_category ON community_posts(category, created_at DESC)
    WHERE status = 'published';
CREATE INDEX idx_posts_user ON community_posts(user_id) WHERE user_id IS NOT NULL;

CREATE TABLE community_comments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id         UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES community_comments(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    is_anonymous    BOOLEAN DEFAULT FALSE,
    content         TEXT NOT NULL,
    status          post_status DEFAULT 'published',
    like_count      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON community_comments(post_id, created_at);
CREATE INDEX idx_comments_parent ON community_comments(parent_id) WHERE parent_id IS NOT NULL;

CREATE TABLE community_likes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id         UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    comment_id      UUID REFERENCES community_comments(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_like_target CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    ),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id)
);

CREATE INDEX idx_likes_post ON community_likes(post_id);
CREATE INDEX idx_likes_comment ON community_likes(comment_id);

CREATE TABLE community_bookmarks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id         UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

CREATE INDEX idx_bookmarks_user ON community_bookmarks(user_id);

CREATE TABLE community_reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id         UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    comment_id      UUID REFERENCES community_comments(id) ON DELETE CASCADE,
    reason          report_reason NOT NULL,
    description     TEXT,
    status          report_status DEFAULT 'pending',
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    action_taken    VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_report_target CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

CREATE INDEX idx_reports_status ON community_reports(status) WHERE status = 'pending';

CREATE TABLE community_moderation_actions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moderator_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type     VARCHAR(50) NOT NULL,
    target_user_id  UUID REFERENCES users(id),
    target_post_id  UUID REFERENCES community_posts(id),
    reason          TEXT NOT NULL,
    duration_days   INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mod_actions_moderator ON community_moderation_actions(moderator_id);

-- ============================================================
-- 16. NOTIFICATIONS
-- ============================================================

CREATE TABLE notification_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           TEXT NOT NULL,
    platform        device_type NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(token)
);

CREATE INDEX idx_notif_tokens_user ON notification_tokens(user_id, is_active)
    WHERE is_active = TRUE;

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    body            TEXT,
    channel         notification_channel NOT NULL,
    priority        notification_priority DEFAULT 'normal',
    category        VARCHAR(50),
    reference_type  VARCHAR(50),
    reference_id    UUID,
    action_url      TEXT,
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    is_delivered    BOOLEAN DEFAULT FALSE,
    delivered_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read)
    WHERE is_read = FALSE;

-- ============================================================
-- 17. AI CONVERSATIONS
-- ============================================================

CREATE TABLE ai_conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id    UUID REFERENCES pregnancies(id) ON DELETE SET NULL,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200),
    context_snapshot JSONB,
    message_count   INTEGER DEFAULT 0,
    is_archived     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conv_user ON ai_conversations(user_id, created_at DESC);

CREATE TABLE ai_messages (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id     UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role                ai_message_role NOT NULL,
    content             TEXT NOT NULL,
    content_html        TEXT,
    metadata            JSONB,
    context_used        JSONB,
    is_helpful          BOOLEAN,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conv ON ai_messages(conversation_id, created_at);

-- ============================================================
-- 18. DOCUMENTS & HEALTH RECORDS
-- ============================================================

CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id    UUID REFERENCES pregnancies(id) ON DELETE SET NULL,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200),
    category        document_category NOT NULL,
    file_type       VARCHAR(50),
    file_size       INTEGER,
    file_path       TEXT NOT NULL,
    file_url        TEXT,
    thumbnail_url   TEXT,
    ocr_text        TEXT,
    ai_summary      JSONB,
    tags            TEXT[] DEFAULT '{}',
    uploaded_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_pregnancy ON documents(pregnancy_id);
CREATE INDEX idx_documents_user ON documents(user_id, category);
CREATE INDEX idx_documents_fts ON documents USING GIN(to_tsvector('english', COALESCE(ocr_text, '')));

CREATE TABLE health_records (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id    UUID REFERENCES pregnancies(id) ON DELETE SET NULL,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    record_type     health_record_type NOT NULL,
    title           VARCHAR(200),
    value           TEXT,
    value_json      JSONB,
    recorded_date   DATE NOT NULL,
    source          VARCHAR(50) DEFAULT 'manual',
    document_id     UUID REFERENCES documents(id) ON DELETE SET NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_records_user ON health_records(user_id, record_type);
CREATE INDEX idx_health_records_pregnancy ON health_records(pregnancy_id, recorded_date DESC);

-- ============================================================
-- 19. PARTNER / FAMILY SUPPORT
-- ============================================================

CREATE TABLE partner_links (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id    UUID NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    inviting_user   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invited_user    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            partner_role DEFAULT 'partner',
    status          partner_status DEFAULT 'pending',
    permissions     TEXT[] DEFAULT '{"view_timeline", "view_appointments"}',
    invited_at      TIMESTAMPTZ DEFAULT NOW(),
    responded_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(pregnancy_id, invited_user)
);

CREATE INDEX idx_partner_inviting ON partner_links(inviting_user);
CREATE INDEX idx_partner_invited ON partner_links(invited_user);

-- ============================================================
-- 20. TIMELINE EVENTS
-- ============================================================

CREATE TABLE timeline_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id    UUID REFERENCES pregnancies(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week            INTEGER CHECK (week BETWEEN 1 AND 42),
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    emoji           VARCHAR(10),
    category        VARCHAR(50) NOT NULL,
    is_system_event BOOLEAN DEFAULT FALSE,
    event_date      DATE,
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_pregnancy ON timeline_events(pregnancy_id, week);
CREATE INDEX idx_timeline_user ON timeline_events(user_id, created_at DESC);

-- ============================================================
-- 21. AUDIT & ADMIN
-- ============================================================

CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(100) NOT NULL,
    resource_type   VARCHAR(50),
    resource_id     UUID,
    details         JSONB,
    ip_address      INET,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);

CREATE TABLE admin_actions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type     VARCHAR(100) NOT NULL,
    target_user_id  UUID REFERENCES users(id),
    reason          TEXT,
    details         JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id, created_at DESC);

-- ============================================================
-- REFERENCE DATA TABLES
-- ============================================================

CREATE TABLE reference_baby_growth (
    id              SERIAL PRIMARY KEY,
    week            INTEGER NOT NULL UNIQUE CHECK (week BETWEEN 1 AND 42),
    size_emoji      VARCHAR(10),
    size_label      VARCHAR(100),
    length_cm       NUMERIC(5,2),
    weight_g        INTEGER,
    description     TEXT,
    development     TEXT[]
);

CREATE TABLE reference_diet_recommendations (
    id              SERIAL PRIMARY KEY,
    trimester       trimester NOT NULL,
    category        VARCHAR(20) NOT NULL,     -- 'to_eat', 'to_avoid'
    food_item       VARCHAR(200) NOT NULL,
    reason          TEXT,
    daily_serving   VARCHAR(100)
);

CREATE TABLE reference_body_changes (
    id              SERIAL PRIMARY KEY,
    symptom         VARCHAR(100) NOT NULL,
    explanation     TEXT,
    self_care_tips  TEXT[],
    weeks_common    INTEGER[]                  -- Weeks when this is most common
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO reference_baby_growth (week, size_emoji, size_label, length_cm, weight_g, description, development) VALUES
(1, '🌸', 'Poppy Seed', 0.1, 0, 'Your baby is the size of a poppy seed', ARRAY['Fertilization has occurred', 'Cells are rapidly dividing']),
(2, '🌱', 'Tiny Seed', 0.2, 0, 'Your baby is the size of a tiny seed', ARRAY['Embryo implants in uterus', 'Amniotic sac forms']),
(3, '💧', 'Water Drop', 0.5, 0, 'Your baby is the size of a water drop', ARRAY['Nervous system begins forming', 'Heart starts beating']),
(4, '🌾', 'Poppy Seed', 0.1, 0, 'Your baby is the size of a poppy seed', ARRAY['Heart begins to beat', 'Arm and leg buds appear']),
(5, '🍊', 'Orange Seed', 0.2, 0, 'Your baby is the size of an orange seed', ARRAY['Brain and spinal cord form', 'Umbilical cord develops']),
(6, '🍚', 'Grain of Rice', 0.3, 0, 'Your baby is the size of a grain of rice', ARRAY['Heartbeat visible on ultrasound', 'Facial features begin forming']),
(7, '🫐', 'Blueberry', 1.0, 0, 'Your baby is the size of a blueberry', ARRAY['Hands and feet forming', 'Brain hemispheres develop']),
(8, '🫘', 'Kidney Bean', 1.6, 0, 'Your baby is the size of a kidney bean', ARRAY['All major organs forming', 'Eyelids begin to form']),
(9, '🍇', 'Grape', 2.3, 2, 'Your baby is the size of a grape', ARRAY['First movements (too small to feel)', 'Fingers and toes appear']),
(10, '🍓', 'Strawberry', 3.1, 5, 'Your baby is the size of a strawberry', ARRAY['Vital organs fully formed', 'Fingernails begin growing']),
(11, '🌰', 'Fig', 4.1, 8, 'Your baby is the size of a fig', ARRAY['Genitals begin developing', 'Baby can open and close fists']),
(12, '🍋', 'Lime', 5.4, 14, 'Your baby is the size of a lime', ARRAY['Reflexes begin', 'Intestines move into abdomen']),
(13, '🍑', 'Peach', 7.4, 23, 'Your baby is the size of a peach', ARRAY['Vocal cords form', 'Baby can make sucking motions']),
(14, '🍋', 'Lemon', 8.7, 43, 'Your baby is the size of a lemon', ARRAY['Sex organs identifiable', 'Baby\'s neck is more defined']),
(15, '🍎', 'Apple', 10.1, 70, 'Your baby is the size of an apple', ARRAY['Baby can hiccup', 'Bones are becoming harder']),
(16, '🥑', 'Avocado', 11.6, 100, 'Your baby is the size of an avocado', ARRAY['Eyes can move slowly', 'Baby\'s heart pumps about 25L of blood/day']),
(17, '🥕', 'Carrot', 13.0, 140, 'Your baby is the size of a carrot', ARRAY['Fat stores begin developing', 'Baby can hear sounds']),
(18, '🍠', 'Sweet Potato', 14.2, 190, 'Your baby is the size of a sweet potato', ARRAY['Baby can yawn and stretch', 'Vernix caseosa covers skin']),
(19, '🥭', 'Mango', 15.3, 240, 'Your baby is the size of a mango', ARRAY['Senses are developing', 'Baby can swallow amniotic fluid']),
(20, '🍌', 'Banana', 16.5, 300, 'Your baby is the size of a banana', ARRAY['Baby can hear your voice', 'Lanugo covers baby\'s body']),
(21, '🥕', 'Carrot', 26.7, 360, 'Your baby is the size of a carrot', ARRAY['Baby can swallow', 'Bone marrow starts making blood cells']),
(22, '🥥', 'Coconut', 27.8, 430, 'Your baby is the size of a coconut', ARRAY['Eyebrows and eyelashes visible', 'Baby has sleep-wake cycles']),
(23, '🍑', 'Peach', 28.9, 500, 'Your baby is the size of a large peach', ARRAY['Fingerprints are forming', 'Baby can sense light']),
(24, '🌽', 'Corn', 30.0, 600, 'Your baby is the size of an ear of corn', ARRAY['Lungs are developing', 'Baby\'s face is fully formed']),
(25, '🍈', 'Honeydew', 31.0, 685, 'Your baby is the size of a honeydew melon', ARRAY['Hair is growing', 'Baby can make grasping motions']),
(26, '🥬', 'Kale', 32.0, 760, 'Your baby is the size of a bunch of kale', ARRAY['Eyes are forming', 'Baby responds to touch']),
(27, '🥦', 'Broccoli', 33.0, 875, 'Your baby is the size of a head of broccoli', ARRAY['Brain is developing rapidly', 'Baby can open and close eyes']),
(28, '🍆', 'Eggplant', 34.0, 1000, 'Your baby is the size of an eggplant', ARRAY['Lungs can breathe (with help)', 'Baby has regular sleep cycles']),
(29, '🍄', 'Butternut Squash', 35.0, 1150, 'Your baby is the size of a butternut squash', ARRAY['Baby can kick and stretch', 'Bones are fully developed']),
(30, '🥒', 'Cucumber', 36.0, 1300, 'Your baby is the size of a cucumber', ARRAY['Baby can recognize your voice', 'Hair is growing thicker']),
(31, '🥗', 'Lettuce', 37.0, 1500, 'Your baby is the size of a head of lettuce', ARRAY['Baby can turn head', 'All senses are working']),
(32, '🍠', 'Sweet Potato', 38.0, 1700, 'Your baby is the size of a jicama', ARRAY['Fingernails reach fingertips', 'Baby is in head-down position']),
(33, '🍍', 'Pineapple', 39.0, 1900, 'Your baby is the size of a pineapple', ARRAY['Pupils react to light', 'Baby\'s bones are hardening']),
(34, '🥬', 'Cantaloupe', 40.0, 2100, 'Your baby is the size of a cantaloupe', ARRAY['Central nervous system maturing', 'Baby is gaining immune protection']),
(35, '🍈', 'Honeydew', 41.0, 2300, 'Your baby is the size of a honeydew', ARRAY['Lungs are nearly mature', 'Baby is running out of room']),
(36, '🥬', 'Romaine Lettuce', 42.0, 2500, 'Your baby is the size of romaine lettuce', ARRAY['Baby is shedding lanugo', 'Baby is practicing breathing']),
(37, '🍉', 'Watermelon Slice', 43.0, 2700, 'Your baby is the size of a watermelon slice', ARRAY['Baby is full term', 'Baby is gaining weight rapidly']),
(38, '🎃', 'Pumpkin', 44.0, 2900, 'Your baby is the size of a small pumpkin', ARRAY['Baby\'s organs are ready', 'Baby is in birth position']),
(39, '🥬', 'Leek', 45.0, 3100, 'Your baby is the size of a leek', ARRAY['Baby\'s skin is pink and smooth', 'Baby is ready for birth']),
(40, '🍉', 'Mini Watermelon', 46.0, 3300, 'Your baby is the size of a mini watermelon', ARRAY['Baby is full term', 'Labor could begin any day']),
(41, '🎃', 'Small Pumpkin', 47.0, 3400, 'Your baby is the size of a small pumpkin', ARRAY['Baby is fully mature', 'Placenta is aging']),
(42, '🍈', 'Small Melon', 48.0, 3500, 'Your baby is the size of a small melon', ARRAY['Baby is ready for the world', 'Expectant wait continues']);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_pregnancies_updated_at BEFORE UPDATE ON pregnancies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_medications_updated_at BEFORE UPDATE ON medications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_health_records_updated_at BEFORE UPDATE ON health_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_hospitals_updated_at BEFORE UPDATE ON hospitals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_community_posts_updated_at BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_community_comments_updated_at BEFORE UPDATE ON community_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_partner_links_updated_at BEFORE UPDATE ON partner_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_notification_tokens_updated_at BEFORE UPDATE ON notification_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW-LEVEL SECURITY (for multi-tenant isolation)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_pressure_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_growth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY user_isolation ON profiles
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON pregnancies
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON symptoms
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON weight_logs
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON blood_pressure_logs
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON baby_growth_logs
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON mood_logs
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON water_logs
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON nutrition_logs
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON appointments
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON doctors
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON medications
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON prescriptions
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON reminders
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON emergency_contacts
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON sos_alerts
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON documents
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON health_records
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON ai_conversations
    USING (user_id = auth.uid());
CREATE POLICY user_isolation ON notifications
    USING (user_id = auth.uid());
