# Email Going to Spam — Troubleshooting Guide — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[AFFECTED_UPN]` — the user affected (sender or recipient)
- `[SENDER_EMAIL]` — email address of the sender
- `[RECIPIENT_EMAIL]` — email address of the recipient
- `[SAMPLE_SUBJECT]` — subject line of an affected email
- `[DATE_RANGE]` — date range to search (e.g. "last 7 days")

---

## Step 1: Identify the Direction

**Inbound (emails sent TO us going to junk):**
→ Go to Step 2

**Outbound (our emails going to recipients' spam):**
→ Skip to Step 6

---

## Step 2: Run a Message Trace (Inbound)

1. Go to **https://admin.microsoft.com**
2. **Exchange → Mail flow → Message trace**
3. Set:
   - Sender: `[SENDER_EMAIL]`
   - Recipient: `[AFFECTED_UPN]`
   - Date range: `[DATE_RANGE]`
4. Click **Search**
5. Click the message result → **More details**
6. Look at the **Event** column — find where the message was routed
7. Look for **SCL (Spam Confidence Level)** in the message details:
   - SCL 1-4: Not spam
   - SCL 5-6: Bulk/soft spam → may go to Junk
   - SCL 7-9: Spam → quarantine or Junk
8. Note the **routing events** — did a transport rule or policy redirect it?

---

## Step 3: Check Anti-Spam Policies (Inbound)

1. Go to **https://security.microsoft.com**
2. **Email & collaboration → Policies & rules → Threat policies → Anti-spam**
3. Open the **Default inbound policy**
4. Check the **Bulk email threshold** — lower number = more aggressive (e.g. 4 is strict, 7 is lenient)
5. Check **Spam actions** — what happens at SCL 5, 6, 7+
6. Check if `[SENDER_EMAIL]` or their domain is in the **Blocked senders** list accidentally
7. If `[SENDER_EMAIL]` is legitimate, add to **Allowed senders** (see email-whitelist.md)

---

## Step 4: Check the User's Junk Settings in OWA

1. Go to **https://outlook.office.com** or ask `[AFFECTED_UPN]` to check
2. **Settings → Mail → Junk email**
3. Check:
   - Is the sender in **Blocked senders**? Remove if it's a mistake
   - Is **"Trust email from my contacts"** checked?
4. Check if their **Focused Inbox** is routing the email away — it's not spam, just de-prioritized

---

## Step 5: Check Mail Flow Rules for Inbound Issues

1. Go to **https://admin.microsoft.com → Exchange → Mail flow → Rules**
2. Scan all enabled rules — look for any that:
   - Set SCL to 5, 6, 7, 8, or 9 (marks as spam)
   - Move messages to Junk or quarantine
   - Match sender domain or keywords in `[SAMPLE_SUBJECT]`
3. If a rule is incorrectly catching the message, **disable** it temporarily to test, then modify the conditions

---

## Step 6: Outbound — Our Emails Going to Recipients' Spam

### Check Email Authentication Records (SPF, DKIM, DMARC)

> This is the most common cause of outbound emails landing in spam.

1. Go to **https://mxtoolbox.com** (external tool)
2. Run:
   - **SPF Lookup** for `familybridges.org` — confirm Microsoft's servers are listed
   - **DKIM Lookup** — confirm DKIM is set up for `familybridges.org`
   - **DMARC Lookup** — confirm DMARC record exists with policy set

**Check SPF in Entra/Exchange:**
1. Go to **https://admin.microsoft.com → Exchange → Mail flow → Connectors**
2. Confirm outbound connector is configured correctly

**Enable DKIM (if not already):**
1. Go to **https://security.microsoft.com**
2. **Email & collaboration → Policies & rules → Threat policies → Email authentication settings**
3. Click **DKIM** tab → select `familybridges.org` → Enable DKIM
4. Copy the CNAME records shown → add them to your DNS provider

### Check If Your IP Is Blacklisted

1. Go to **https://mxtoolbox.com → Blacklist Check**
2. Enter your outbound IP (find it in the message header of a sent email)
3. If listed, follow the delisting process for each blacklist

### Check Message Headers for Spam Scoring

1. Get a copy of an email that went to spam — have the recipient forward it as an attachment
2. In Outlook: Open the email → **File → Properties** → copy the **Internet headers**
3. Paste into **https://mxtoolbox.com/EmailHeaders.aspx** or **https://mha.azurewebsites.net**
4. Look for:
   - `X-Microsoft-Antispam` — Microsoft's spam score
   - `Authentication-Results` — SPF/DKIM/DMARC pass or fail
   - `X-Spam-Status` — recipient server's scoring

### Check If It's Content-Based Filtering

Common content triggers that cause legitimate email to be flagged:
- All-caps subject lines
- Lots of links or images
- Words like "free," "urgent," "click here," "act now"
- Attachments with macros

Rewrite the email content and retest if content appears to be the issue.

---

## Step 7: Verify Fix

1. Send a test email from `[SENDER_EMAIL]` to `[RECIPIENT_EMAIL]`
2. Confirm it lands in **Inbox**
3. If still going to Junk, recheck message trace and review SCL assignment
4. If outbound, ask the recipient to add `[SENDER_EMAIL]` to their safe senders as a temporary workaround while the root cause is fixed

---

## Common Root Causes Summary

| Scenario | Most Likely Cause | Fix |
|---|---|---|
| One sender goes to junk | SCL score, blocked sender list | Allow the sender, check anti-spam policy |
| All inbound goes to junk | Anti-spam policy too aggressive | Raise bulk threshold, review SCL action thresholds |
| Our outbound flagged by others | SPF/DKIM/DMARC misconfigured | Fix auth records in DNS and Defender |
| Outbound flagged by one recipient | Their spam filter is aggressive | Nothing we can do server-side; ask them to whitelist us |
| Transport rule redirecting | Wrong rule condition | Review and fix the mail flow rule |
