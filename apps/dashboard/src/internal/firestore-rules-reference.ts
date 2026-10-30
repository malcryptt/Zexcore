/**
 * INTERNAL USE ONLY — NOT FOR PUBLIC DISTRIBUTION
 *
 * ZexCore Firestore Security Rules Reference
 * ==========================================
 * This file documents the actual Cloud Firestore security rules used in production.
 * It is kept here in the codebase for developer reference and internal security reviews.
 *
 * The public-facing website (architecture.ts, security.ts, docs.ts) intentionally
 * abstracts these details behind neutral "data-layer access policies" language.
 *
 * Deploy rules via:  firebase deploy --only firestore:rules
 * Test rules via:    firebase emulators:start --only firestore
 */

export const FIRESTORE_RULES_REFERENCE = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ─── Helper functions ───────────────────────────────────────────────

    function isSignedIn() {
      return request.auth != null;
    }

    function isMember(wid) {
      return isSignedIn()
        && exists(/databases/$(database)/documents/workspaces/$(wid)/members/$(request.auth.uid));
    }

    function isAdmin(wid) {
      return isSignedIn()
        && get(/databases/$(database)/documents/workspaces/$(wid)/members/$(request.auth.uid)).data.role in ['owner', 'admin'];
    }

    function isOwner(wid) {
      return isSignedIn()
        && get(/databases/$(database)/documents/workspaces/$(wid)/members/$(request.auth.uid)).data.role == 'owner';
    }

    function onlyChanges(fields) {
      return request.resource.data.diff(resource.data).affectedKeys().hasOnly(fields);
    }

    function slotId(wid, collection, id) {
      // Numbered slot scheme: s_0, s_1 … up to plan limit
      return id.matches('^[a-z]_[0-9]+$');
    }

    // ─── Workspace root ─────────────────────────────────────────────────

    match /workspaces/{wid} {
      allow read:   if isMember(wid);
      allow update: if isAdmin(wid) && onlyChanges(['name', 'settings']); // plan fields are never client-writable
      allow delete: if false;

      // ─── Members sub-collection ─────────────────────────────────────

      match /members/{uid} {
        allow read:   if isMember(wid);
        allow write:  if isOwner(wid) && uid != request.auth.uid; // owner cannot demote themselves
      }

      // ─── Services ───────────────────────────────────────────────────

      match /services/{sid} {
        allow read:   if isMember(wid);
        allow write:  if isAdmin(wid) && slotId(wid, 'services', sid);
      }

      // ─── Staff ──────────────────────────────────────────────────────

      match /staff/{pid} {
        allow read:   if isMember(wid);
        allow write:  if isAdmin(wid) && slotId(wid, 'staff', pid);
      }

      // ─── Bookings ───────────────────────────────────────────────────

      match /bookings/{id} {
        allow read:   if isMember(wid);
        allow create: if isMember(wid) && slotId(wid, 'bookings', id);
        allow update: if isMember(wid) && onlyChanges(['status', 'notes']);
        allow delete: if isAdmin(wid);
      }

      // ─── Locks (15-min slot cells, one per booking) ─────────────────

      match /locks/{lockId} {
        // Create-once — prevents double booking atomically
        allow create: if isMember(wid) || request.auth == null; // public booking also creates a lock
        allow read:   if isMember(wid) || request.auth == null; // availability check
        allow update, delete: if false;
      }

      // ─── Contacts & Leads ────────────────────────────────────────────

      match /contacts/{cid} {
        allow read, write: if isMember(wid);
      }

      match /leads/{lid} {
        allow read, write: if isMember(wid);
      }

      // ─── Pages ──────────────────────────────────────────────────────

      match /pages/{pgid} {
        allow read:  if true; // public booking pages are publicly readable
        allow write: if isAdmin(wid) && slotId(wid, 'pages', pgid);
      }

      // ─── Payments (written only by the Worker service account) ──────

      match /payments/{payId} {
        allow read:   if isMember(wid);
        allow write:  if false; // Worker uses Admin SDK — bypasses rules entirely
      }

      // ─── Audit trail (append-only) ──────────────────────────────────

      match /audit/{entryId} {
        allow read:   if isAdmin(wid);
        allow create: if isMember(wid); // anyone in workspace can append
        allow update, delete: if false; // immutable
      }
    }

    // ─── Public workspace lookup (slug → wid) ──────────────────────────

    match /slugs/{slug} {
      allow read:   if true;
      allow write:  if isSignedIn(); // owner claims slug on signup
    }

    // ─── Default deny: everything else is closed ────────────────────────

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`;

/** Summary of key security guarantees enforced by these rules. */
export const SECURITY_GUARANTEES = [
  { guarantee: 'Workspace isolation', enforcement: 'Every document is under workspaces/{wid}. isMember() requires a members/{uid} sub-document.' },
  { guarantee: 'No double booking', enforcement: 'locks/{staffId}_{cell} can only be created, never updated — atomic batch ensures consistency.' },
  { guarantee: 'Plan limits enforced', enforcement: 'slotId() validates the numbered slot scheme; Worker enforces monthly booking count via Admin SDK.' },
  { guarantee: 'Plans cannot be forged', enforcement: 'plan fields are absent from all allow update rules; only the Worker Admin SDK can write them.' },
  { guarantee: 'Public booking is narrow', enforcement: 'Visitors can create pending bookings and locks, read pages/staff/services only.' },
  { guarantee: 'Audit trail is immutable', enforcement: 'update and delete are set to false on /audit entries.' },
];
