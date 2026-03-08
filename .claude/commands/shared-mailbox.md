# Shared Mailbox Management — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[MAILBOX_NAME]` — display name of the shared mailbox (e.g. Finance Team, Front Desk)
- `[MAILBOX_EMAIL]` — email address of the shared mailbox (e.g. finance@familybridges.org)
- `[UPN]` — user's UPN to add or remove access
- `[EXISTING_UPN]` — UPN of an existing user whose mailbox is being converted

> No license is needed for a shared mailbox — as long as it's under 50 GB, it's free.

---

## Portal Steps (Primary)

### 1. Create a New Shared Mailbox

1. Go to **https://admin.microsoft.com**
2. **Exchange → Recipients → Shared mailboxes**
3. Click **+ Add a shared mailbox**
4. Fill in:
   - **Name:** `[MAILBOX_NAME]` (display name, e.g. "Finance Team")
   - **Email address:** `[MAILBOX_EMAIL]` (e.g. finance@familybridges.org)
5. Click **Create**
6. Next screen: add members who should access this mailbox (see Step 2)

### 2. Add Members to a Shared Mailbox

**Full Access (can read and manage the mailbox):**
1. Go to **https://admin.microsoft.com → Exchange → Recipients → Shared mailboxes**
2. Click `[MAILBOX_NAME]`
3. Click **Edit** next to **Full Access**
4. Click **+ Add members** → search for `[UPN]` → select → **Save**
5. The mailbox will **auto-appear in Outlook** within 30-60 minutes

**Send As (can send email AS the shared mailbox address):**
1. Same location → click **Edit** next to **Send As**
2. Click **+ Add** → search `[UPN]` → **Save**
3. When composing email, user selects the shared mailbox in the **From** field

**Send on Behalf (sends from user's name, but "on behalf of" the shared mailbox):**
1. Same location → click **Edit** next to **Send On Behalf**
2. Add `[UPN]` → **Save**
3. Recipients see: "Sent on behalf of [MAILBOX_NAME]" — less clean than Send As

### 3. Remove a Member from a Shared Mailbox

1. **https://admin.microsoft.com → Exchange → Recipients → Shared mailboxes**
2. Click `[MAILBOX_NAME]` → click **Edit** next to **Full Access** or **Send As**
3. Find `[UPN]` → select → click **Remove** → **Save**
4. Access is revoked — mailbox will disappear from their Outlook

### 4. Convert a User Mailbox to a Shared Mailbox (Offboarding)

> Use this when an employee leaves — keeps the mailbox accessible without a license.

> ⚠️ Confirm the user has been blocked/offboarded first. Remove their license AFTER converting.

1. Go to **https://admin.microsoft.com → Users → Active users**
2. Select `[EXISTING_UPN]`
3. Click the **Mail** tab → **Convert to shared mailbox** → **Confirm**
4. The mailbox is now shared and license-free
5. Go to **Licenses and apps** tab → uncheck all licenses → **Save changes**
6. Grant the manager Full Access (see Step 2)

### 5. Add a Shared Mailbox Manually in Outlook (If Auto-Map Doesn't Work)

1. In Outlook: right-click the user's account in the folder pane → **Add shared folder or mailbox**
2. Type `[MAILBOX_EMAIL]` → **Add**
3. The shared mailbox appears under the user's account in the folder list

### 6. Set Up Shared Mailbox in Outlook on the Web

1. Have the user go to **https://outlook.office.com**
2. Click their profile icon (top right) → **Open another mailbox**
3. Type `[MAILBOX_EMAIL]` → **Open**
4. The shared mailbox opens in a new browser tab

---

## Send As vs Send on Behalf — Quick Comparison

| Permission | What recipient sees | When to use |
|---|---|---|
| **Send As** | From: finance@familybridges.org | Professional — looks like it came from the mailbox |
| **Send on Behalf** | From: John Smith on behalf of finance@familybridges.org | Less clean — shows sender's name |
| **Full Access only** | User can read/manage but not send | For monitoring/archiving purposes |

> **Recommended:** Give users both **Full Access** and **Send As** for typical shared mailbox use.

---

## Notes

- Shared mailboxes don't need a license as long as they're under **50 GB**
- If a shared mailbox exceeds 50 GB: it needs a license (Exchange Online Plan 2 or M365 with Exchange archiving)
- Auto-mapping (mailbox appearing in Outlook automatically) only works if Full Access was granted via the admin center — not via PowerShell without `-AutoMapping $true`
- Changes to membership can take up to **60 minutes** to show in Outlook

---

## PowerShell (for reference)

### Create a Shared Mailbox

```powershell
Connect-ExchangeOnline

# Create a new shared mailbox
New-Mailbox -Shared -Name "[MAILBOX_NAME]" -PrimarySmtpAddress "[MAILBOX_EMAIL]"
# Creates the shared mailbox — no license required
```

### Add Full Access and Send As Permissions

```powershell
Connect-ExchangeOnline

# Grant Full Access (auto-mapping on by default)
Add-MailboxPermission -Identity "[MAILBOX_EMAIL]" -User "[UPN]" -AccessRights FullAccess -AutoMapping $true
# AutoMapping:$true makes the mailbox appear automatically in Outlook

# Grant Send As permission
Add-RecipientPermission -Identity "[MAILBOX_EMAIL]" -Trustee "[UPN]" -AccessRights SendAs -Confirm:$false
# Allows the user to send email as the shared mailbox address
```

### Convert User Mailbox to Shared

```powershell
Connect-ExchangeOnline

# Convert a user mailbox to shared (use after blocking the account)
Set-Mailbox -Identity "[EXISTING_UPN]" -Type Shared
# Converts the mailbox type — license can be removed after this
```

### Remove a Member from Shared Mailbox

```powershell
Connect-ExchangeOnline

# Remove Full Access
Remove-MailboxPermission -Identity "[MAILBOX_EMAIL]" -User "[UPN]" -AccessRights FullAccess -Confirm:$false

# Remove Send As
Remove-RecipientPermission -Identity "[MAILBOX_EMAIL]" -Trustee "[UPN]" -AccessRights SendAs -Confirm:$false
```

### List All Members with Access

```powershell
Connect-ExchangeOnline

# List who has Full Access to the shared mailbox
Get-MailboxPermission -Identity "[MAILBOX_EMAIL]" |
    Where-Object { $_.AccessRights -like "*FullAccess*" -and $_.IsInherited -eq $false } |
    Select-Object User, AccessRights
```
