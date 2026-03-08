# Email Quarantine — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[RECIPIENT_UPN]` — the user who should have received the email
- `[SENDER_EMAIL]` — the sender's email address
- `[SUBJECT]` — approximate email subject
- `[DATE_RANGE]` — date or date range (e.g. "March 5-7, 2026")

---

## Portal Steps (Primary)

### 1. Check Quarantine in Microsoft Defender

1. Go to **https://security.microsoft.com**
2. **Email & collaboration → Review → Quarantine**
3. Use filters to find the message:
   - **Recipient:** `[RECIPIENT_UPN]`
   - **Sender:** `[SENDER_EMAIL]`
   - **Date range:** `[DATE_RANGE]`
   - Optionally filter by **Quarantine reason** (Spam, Phish, Malware, Bulk)
4. Click **Search** — find the message in the results

### 2. Review Why It Was Quarantined

1. Click the message in quarantine results
2. In the detail panel, look at **Quarantine reason** — note what policy flagged it:
   - **Spam** — scored as spam by content filters
   - **Bulk** — treated as bulk/marketing email
   - **Phish** — flagged as phishing attempt
   - **Malware** — attachment or link flagged
   - **Transport rule** — a mail flow rule sent it to quarantine
3. If it's **Phish or Malware** — do not release without confirming with the sender via phone/Teams

### 3. Release the Message

> ⚠️ Only release if you're confident it's a false positive. Never release confirmed phish/malware.

1. Check the box next to the message
2. Click **Release email** at the top
3. Choose:
   - **Release to all recipients** — sends to `[RECIPIENT_UPN]`
   - **Release and allow sender** — releases now and adds sender to allow list
4. Confirm release — message delivers to the recipient's inbox

### 4. Release as Admin (if user can't see it in their quarantine)

1. Still in **https://security.microsoft.com → Quarantine**
2. Find the message using admin search (you can see all quarantined mail)
3. Select the message → **Release email** → choose recipient → confirm

### 5. Prevent Future False Positives

**Option A: Allow the specific sender (safest)**
1. Go to **https://security.microsoft.com**
2. **Email & collaboration → Policies & rules → Threat policies → Anti-spam**
3. Open the default inbound anti-spam policy
4. Scroll to **Allowed senders** → **Edit** → add `[SENDER_EMAIL]`
5. Save — that sender will bypass spam filtering going forward

**Option B: Allow the sender's domain**
1. Same location as above → **Allowed domains** → add the sender's domain
2. Use this only if you trust the entire domain, not just one address

**Option C: Create a mail flow rule (for complex scenarios)**
1. Go to **https://admin.microsoft.com → Exchange → Mail flow → Rules**
2. **+ Add a rule → Create a new rule**
3. Condition: Sender address is `[SENDER_EMAIL]`
4. Action: **Set the spam confidence level (SCL) to -1** (bypass spam filtering)
5. Save and enable

### 6. Check Message Trace (if email isn't in quarantine)

1. Go to **https://admin.microsoft.com → Exchange → Mail flow → Message trace**
2. Set date range: `[DATE_RANGE]`
3. Sender: `[SENDER_EMAIL]`, Recipient: `[RECIPIENT_UPN]`
4. Run trace → look at **Status** column:
   - **Delivered** — it arrived, check the recipient's Junk folder
   - **Failed** — delivery error, check details
   - **Filtered as spam** — went to quarantine or junk
   - **Rule applied** — a transport rule affected it

---

## Quick Reference: Quarantine Reasons

| Reason | Safe to release? | Notes |
|---|---|---|
| Spam | Usually yes | Confirm it's expected mail |
| Bulk | Usually yes | Marketing, newsletters |
| Phish | Only if verified safe | Confirm with sender directly |
| Malware | No | Never release — report it |
| Transport rule | Check the rule | May be intentional policy |
