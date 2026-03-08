# Email Whitelist / Allow Sender — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[SENDER_EMAIL]` — sender's full email address (e.g. vendor@contoso.com)
- `[SENDER_DOMAIN]` — sender's domain only (e.g. contoso.com)
- `[RECIPIENT_UPN]` — the user(s) who need to receive from this sender

---

## Choosing the Right Approach

| Method | Scope | Best for |
|---|---|---|
| Allowed senders list (anti-spam policy) | Tenant-wide | Trusted senders for all users |
| Safe senders in OWA | Per-user inbox | One user's personal allow list |
| Mail flow rule (SCL -1) | Flexible | Specific sender/recipient combos, complex logic |
| Tenant Allow/Block List | Tenant-wide | Overriding Microsoft's filters specifically |

> ⚠️ Allowing entire domains is risky — attackers sometimes spoof from trusted domains. Prefer specific sender addresses when possible.

---

## Portal Steps (Primary)

### Option A: Add to Anti-Spam Allowed Senders (Tenant-Wide — Recommended)

1. Go to **https://security.microsoft.com**
2. **Email & collaboration → Policies & rules → Threat policies → Anti-spam**
3. Open **Anti-spam inbound policy (Default)**
4. Scroll to the **Allowed and blocked senders and domains** section → click **Edit allowed and blocked senders and domains**
5. Under **Allowed senders** → click **+ Add senders**
6. Enter `[SENDER_EMAIL]` → click **Add**
7. Click **Save**
8. Effect: That sender bypasses spam filtering for all users in the org

### Option B: Allow Full Domain (use carefully)

1. Same location as Option A
2. Under **Allowed domains** → click **+ Add domains**
3. Enter `[SENDER_DOMAIN]` → **Add → Save**
4. Effect: All email from `[SENDER_DOMAIN]` bypasses spam filtering org-wide

### Option C: Tenant Allow/Block List (for Microsoft-level overrides)

> Use this when emails are being blocked by Microsoft's threat intelligence, not just your spam filter.

1. Go to **https://security.microsoft.com**
2. **Email & collaboration → Policies & rules → Threat policies → Tenant Allow/Block Lists**
3. Click **Senders** tab → **+ Add**
4. Enter `[SENDER_EMAIL]` → set action to **Allow**
5. Set expiration (30 days max, can renew) → **Add**
6. Effect: Microsoft's filters will allow this sender even if they'd normally flag it

### Option D: Mail Flow Rule — Bypass Spam for Specific Sender → Recipient

> Use this when you want to allow a sender only for a specific user, not the whole org.

1. Go to **https://admin.microsoft.com**
2. **Exchange → Mail flow → Rules → + Add a rule → Create a new rule**
3. Name the rule: `Allow [SENDER_EMAIL] to [RECIPIENT_UPN]`
4. **Apply this rule if:** Sender → address matches `[SENDER_EMAIL]`
5. **AND:** Recipient → is `[RECIPIENT_UPN]`
6. **Do the following:** Modify the message properties → Set the spam confidence level (SCL) to **-1**
7. Set **Priority** appropriately (lower number = higher priority)
8. **Save** and confirm it's **Enabled**
9. Effect: Only that sender-recipient combo bypasses spam; everyone else is unaffected

### Option E: Per-User Safe Sender (OWA — for the user to do themselves)

1. Have `[RECIPIENT_UPN]` go to **https://outlook.office.com**
2. **Settings (gear) → Mail → Junk email**
3. Under **Safe senders and domains** → click **+ Add**
4. Enter `[SENDER_EMAIL]` → press **Enter** → **Save**
5. Effect: Only applies to that user's mailbox — doesn't affect org-wide filtering

---

## Verify It's Working

1. Ask the sender to resend a test email to `[RECIPIENT_UPN]`
2. Confirm it lands in **Inbox**, not Junk
3. If still going to Junk, check if the **Junk email rule** on the mailbox is overriding — you may need the mail flow rule (Option D) to force delivery to inbox:
   - Add action: **Deliver the message to** → Inbox

---

## Security Notes

- Allowed senders/domains bypass spam filtering but **not malware or phish filters** — those still apply
- If a legitimate sender keeps getting blocked as phish, investigate their email authentication (SPF, DKIM, DMARC) — the long-term fix is fixing their sending config, not permanently whitelisting them
- Document every allow rule you create and review them quarterly
