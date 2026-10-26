/** DDL for the bookings module. Runs on the admin connection during the boot system phase. */
export const BOOKINGS_DDL = `
CREATE TABLE IF NOT EXISTS bk_settings (
  tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  business_type VARCHAR(32) NOT NULL DEFAULT 'other',
  public_name VARCHAR(255),
  phone VARCHAR(32),
  address TEXT,
  currency CHAR(3) NOT NULL DEFAULT 'NGN',
  deposit_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  deposit_minor BIGINT NOT NULL DEFAULT 0 CHECK (deposit_minor >= 0),
  open_minutes INTEGER NOT NULL DEFAULT 540 CHECK (open_minutes BETWEEN 0 AND 1439),
  close_minutes INTEGER NOT NULL DEFAULT 1020 CHECK (close_minutes BETWEEN 1 AND 1440),
  slot_minutes INTEGER NOT NULL DEFAULT 30 CHECK (slot_minutes BETWEEN 5 AND 240),
  days_open SMALLINT[] NOT NULL DEFAULT '{1,2,3,4,5,6}',
  utc_offset_minutes INTEGER NOT NULL DEFAULT 60 CHECK (utc_offset_minutes BETWEEN -720 AND 840),
  lead_minutes INTEGER NOT NULL DEFAULT 60 CHECK (lead_minutes >= 0),
  max_days_ahead INTEGER NOT NULL DEFAULT 60 CHECK (max_days_ahead BETWEEN 1 AND 365),
  onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (close_minutes > open_minutes)
);

CREATE TABLE IF NOT EXISTS bk_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  duration_min INTEGER NOT NULL CHECK (duration_min BETWEEN 5 AND 480),
  price_minor BIGINT NOT NULL DEFAULT 0 CHECK (price_minor >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bk_services_tenant_id_unique UNIQUE (tenant_id, id)
);
CREATE INDEX IF NOT EXISTS bk_services_tenant_idx ON bk_services (tenant_id, position);

CREATE TABLE IF NOT EXISTS bk_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  title VARCHAR(120),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bk_staff_tenant_id_unique UNIQUE (tenant_id, id)
);
CREATE INDEX IF NOT EXISTS bk_staff_tenant_idx ON bk_staff (tenant_id);

CREATE TABLE IF NOT EXISTS bk_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ref VARCHAR(16) NOT NULL,
  service_id UUID NOT NULL,
  staff_id UUID,
  customer_name VARCHAR(160) NOT NULL,
  customer_phone VARCHAR(32) NOT NULL,
  customer_email VARCHAR(255),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','completed','cancelled','no_show')),
  currency CHAR(3) NOT NULL DEFAULT 'NGN',
  price_minor BIGINT NOT NULL DEFAULT 0,
  deposit_minor BIGINT NOT NULL DEFAULT 0 CHECK (deposit_minor >= 0),
  deposit_status VARCHAR(8) NOT NULL DEFAULT 'none' CHECK (deposit_status IN ('none','unpaid','paid','mismatch')),
  payment_reference VARCHAR(128) UNIQUE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  source VARCHAR(12) NOT NULL DEFAULT 'dashboard' CHECK (source IN ('public','dashboard')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bk_bookings_ref_unique UNIQUE (tenant_id, ref),
  CONSTRAINT bk_bookings_service_fk FOREIGN KEY (tenant_id, service_id) REFERENCES bk_services (tenant_id, id),
  CONSTRAINT bk_bookings_staff_fk FOREIGN KEY (tenant_id, staff_id) REFERENCES bk_staff (tenant_id, id),
  CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS bk_bookings_tenant_start_idx ON bk_bookings (tenant_id, starts_at);
CREATE INDEX IF NOT EXISTS bk_bookings_tenant_phone_idx ON bk_bookings (tenant_id, customer_phone);

CREATE TABLE IF NOT EXISTS bk_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  booking_id UUID,
  customer_name VARCHAR(160) NOT NULL,
  customer_phone VARCHAR(32) NOT NULL,
  direction VARCHAR(3) NOT NULL CHECK (direction IN ('in','out')),
  kind VARCHAR(8) NOT NULL DEFAULT 'text' CHECK (kind IN ('text','system','payment')),
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS bk_messages_tenant_phone_idx ON bk_messages (tenant_id, customer_phone, created_at);
CREATE INDEX IF NOT EXISTS bk_messages_unread_idx ON bk_messages (tenant_id) WHERE direction = 'in' AND read_at IS NULL;
`;

/** Tables the SECURITY DEFINER deposit-settlement function must reach as owner (see core security SQL). */
export const BOOKINGS_OWNER_BYPASS_TABLES = ['bk_bookings', 'bk_messages'];
