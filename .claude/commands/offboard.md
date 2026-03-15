Full offboarding procedure for a departing user at Family Bridges (familybridges.org). Use placeholders [UPN], [MANAGER_UPN], [DEVICE_NAME] throughout. Portal steps first, PowerShell in collapsible blocks. Do not ask for real employee details — deliver the full procedure immediately. Flag involuntary terminations with extra warnings.

---

## User Offboarding — Family Bridges

**Placeholders used:** `[UPN]` = departing user's email · `[MANAGER_UPN]` = their manager's email · `[DEVICE_NAME]` = enrolled device name

⚠️ **Involuntary termination?** Complete Steps 1–3 BEFORE notifying the user. Speed matters.

---

### STEP 1 — Block Sign-In (Entra ID)

**Portal:** entra.microsoft.com → Users → `[UPN]` → **Edit** → Block sign-in → **Yes** → Save

This immediately prevents all new logins. Existing sessions stay active until Step 2.

<details>
<summary>PowerShell — Block Sign-In</summary>

```powershell
# Plain English: Blocks the user from signing in to any M365 service
Update-MgUser -UserId "[UPN]" -AccountEnabled $false
# ↑ Disables cloud account in Entra ID. Does NOT disable on-prem AD — do that in Step 10.
```

</details>

---

### STEP 2 — Revoke All Active Sessions

**Portal:** entra.microsoft.com → Users → `[UPN]` → **Revoke sessions** → Confirm

This kills all active tokens — Teams, Outlook, OneDrive, everything.

<details>
<summary>PowerShell — Revoke Sessions</summary>

```powershell
# Plain English: Immediately invalidates all active login tokens for this user
Revoke-MgUserSignInSession -UserId "[UPN]"
```

</details>

---

### STEP 3 — Reset Password (Lock Out)

**Portal:** admin.microsoft.com → Users → Active users → `[UPN]` → **Reset password** → auto-generate → do NOT share with user

This blocks any cached credential use.

<details>
<summary>PowerShell — Reset Password</summary>

```powershell
# Plain English: Sets a random password the user doesn't know, blocking cached logins
$newPass = [System.Web.Security.Membership]::GeneratePassword(16, 4)
Set-MgUserPassword -UserId "[UPN]" -NewPassword $newPass
```

</details>

---

### STEP 4 — Clear MFA Methods

**Portal:** entra.microsoft.com → Users → `[UPN]` → **Authentication methods** → delete all registered methods

Removes Authenticator app, phone numbers, FIDO keys — everything.

---

### STEP 5 — Convert Mailbox to Shared Mailbox

**Portal:** Exchange admin center (admin.exchange.microsoft.com) → Mailboxes → `[UPN]` → **Convert to shared mailbox** → Confirm

Shared mailboxes don't need a license. Mail keeps flowing. Manager can be granted access next.

<details>
<summary>PowerShell — Convert Mailbox</summary>

```powershell
# Plain English: Converts the user's mailbox to a shared mailbox (no license needed)
Set-Mailbox -Identity "[UPN]" -Type Shared
```

</details>

---

### STEP 6 — Grant Manager Access to Shared Mailbox

**Portal:** Exchange admin center → Shared mailboxes → `[UPN]` → **Mailbox delegation** → Full Access → Add → `[MANAGER_UPN]`

Also add Send As if the manager needs to reply from that address.

<details>
<summary>PowerShell — Grant Mailbox Access</summary>

```powershell
# Plain English: Gives the manager full access to read the departed user's mailbox
Add-MailboxPermission -Identity "[UPN]" -User "[MANAGER_UPN]" -AccessRights FullAccess -InheritanceType All

# Plain English: Lets the manager send email as if they were the departed user
Add-RecipientPermission -Identity "[UPN]" -Trustee "[MANAGER_UPN]" -AccessRights SendAs
```

</details>

---

### STEP 7 — Remove All M365 Licenses

**Portal:** admin.microsoft.com → Users → Active users → `[UPN]` → **Licenses and apps** → uncheck all → Save

⚠️ Do this AFTER converting the mailbox to shared — or you'll lose the mailbox.

---

### STEP 8 — Remove from Security Groups & Distribution Lists

**Portal:** admin.microsoft.com → Users → `[UPN]` → **Groups** → remove from each group listed

<details>
<summary>PowerShell — Remove from All Groups</summary>

```powershell
# Plain English: Gets all groups the user is in and removes them from each one
$user = Get-ADUser -Identity "[first.last]"
$groups = Get-ADPrincipalGroupMembership $user | Where-Object { $_.Name -ne "Domain Users" }
foreach ($group in $groups) {
    Remove-ADGroupMember -Identity $group -Members $user -Confirm:$false
}
# ↑ Run on domain-joined machine. Skips Domain Users (can't remove from that).
```

</details>

---

### STEP 9 — Transfer OneDrive Access to Manager

**Portal:** admin.microsoft.com → Users → Active users → `[UPN]` → **OneDrive** → **Create link to files** → copy link → or: Grant access to `[MANAGER_UPN]`

SharePoint admin center → More features → User profiles → Manage User Profiles → search `[UPN]` → Manage site collection administrators → add `[MANAGER_UPN]`

---

### STEP 10 — Wipe or Retire Device in Intune

**Portal:** intune.microsoft.com → Devices → All devices → `[DEVICE_NAME]`

- ⚠️ **Full Wipe** — factory reset, use for work-owned devices
- **Retire** — removes company data only, use for BYOD

Click the action → **Wipe** or **Retire** → Confirm

---

### STEP 11 — ⚠️ Disable On-Prem AD Account

**Portal:** Active Directory Users & Computers (ADUC) on domain-joined machine

1. Find user → right-click → **Disable Account**
2. Move to **Disabled Users** OU: right-click → **Move** → select Disabled Users OU

<details>
<summary>PowerShell — Disable & Move AD Account</summary>

```powershell
# Plain English: Disables the on-prem AD account
Disable-ADAccount -Identity "[first.last]"

# Plain English: Moves the account to the Disabled Users OU
Move-ADObject -Identity (Get-ADUser "[first.last]").DistinguishedName `
  -TargetPath "OU=Disabled Users,DC=familybridges,DC=org"
```

</details>

---

### Done Checklist

- [ ] Sign-in blocked in Entra ID
- [ ] All sessions revoked
- [ ] Password reset (user locked out)
- [ ] MFA methods cleared
- [ ] Mailbox converted to shared
- [ ] Manager granted mailbox access
- [ ] All M365 licenses removed
- [ ] Removed from all security groups and DLs
- [ ] OneDrive access transferred to manager
- [ ] Device wiped or retired in Intune
- [ ] On-prem AD account disabled and moved to Disabled Users OU
- [ ] Ticket closed in Jira with completion notes
