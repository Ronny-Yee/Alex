Full onboarding procedure for a new user at [YOUR_ORG] ([YOUR_DOMAIN]). Use placeholders [FIRST_NAME], [LAST_NAME], [DEPARTMENT], [MANAGER], [UPN] throughout. Portal steps first, PowerShell in collapsible blocks. Do not ask for real employee details — deliver the full procedure immediately.

---

## New User Onboarding — [YOUR_ORG]

**Placeholders used:** `[FIRST_NAME]` `[LAST_NAME]` `[UPN]` = [first.last@YOUR_DOMAIN] `[DEPARTMENT]` `[MANAGER]`

---

### STEP 1 — Create User in On-Prem Active Directory (ADUC)

**Portal:** Run on the AD Connect server or a domain-joined machine

1. Open **Active Directory Users & Computers** (ADUC)
2. Navigate to the correct OU for your org (e.g., `[YOUR_ORG] > Staff > [DEPARTMENT]`)
3. Right-click → **New → User**
4. Fill in:
   - First name: `[FIRST_NAME]`
   - Last name: `[LAST_NAME]`
   - User logon name: `[first.last]` → domain: `@[YOUR_DOMAIN]`
5. Set temp password → check **User must change password at next logon**
6. Click **Finish**
7. Right-click the new user → **Properties** → fill in: Department, Manager, Office, Phone

<details>
<summary>PowerShell — Create AD User</summary>

```powershell
# Plain English: Creates a new AD user with the required fields
New-ADUser `
  -Name "[FIRST_NAME] [LAST_NAME]" `
  -GivenName "[FIRST_NAME]" `
  -Surname "[LAST_NAME]" `
  -SamAccountName "[first.last]" `
  -UserPrincipalName "[UPN]" `
  -Department "[DEPARTMENT]" `
  -Manager "[MANAGER]" `
  -AccountPassword (ConvertTo-SecureString "[TEMP_PASSWORD]" -AsPlainText -Force) `
  -ChangePasswordAtLogon $true `
  -Enabled $true `
  -Path "OU=Staff,OU=[YOUR_ORG],DC=[ORG],DC=[TLD]"
# ↑ Replace all placeholders. Path OU must match your actual AD structure.
```

</details>

---

### STEP 2 — Force Entra Connect Sync

**Portal:** On the AD Connect server

1. Wait ~30 min for automatic sync, OR force it now:

<details>
<summary>PowerShell — Force Delta Sync</summary>

```powershell
# Plain English: Forces an immediate sync from on-prem AD to Entra ID
Start-ADSyncSyncCycle -PolicyType Delta
# ↑ Run this on the AD Connect server. Delta = only syncs changes since last run.
```

</details>

---

### STEP 3 — Verify User in M365 Admin Center

**Portal:** admin.microsoft.com → Users → Active users

1. Search for `[FIRST_NAME] [LAST_NAME]`
2. Confirm the account appears and shows as **Unlicensed**
3. If not showing after 5 min, run a Full sync:

<details>
<summary>PowerShell — Force Full Sync</summary>

```powershell
# Plain English: Full sync — re-syncs all objects (slower, use if delta didn't work)
Start-ADSyncSyncCycle -PolicyType Initial
```

</details>

---

### STEP 4 — Assign M365 Business Premium License

**Portal:** admin.microsoft.com → Users → Active users → `[FIRST_NAME] [LAST_NAME]` → **Licenses and apps**

1. Check **Microsoft 365 Business Premium**
2. Click **Save changes**
3. ✅ License assigned — user now has Exchange, Teams, OneDrive, Intune enrollment rights

---

### STEP 5 — Add to Security Groups & Distribution Lists

**Portal:** admin.microsoft.com → Teams & groups → Active teams & groups

1. Find the relevant group for `[DEPARTMENT]`
2. Open group → **Members** → **Add members** → search `[FIRST_NAME] [LAST_NAME]`
3. Repeat for each group/DL the user needs

<details>
<summary>PowerShell — Add to Groups</summary>

```powershell
# Plain English: Adds the user to a security group
Add-ADGroupMember -Identity "[GroupName]" -Members "[first.last]"
# ↑ Repeat for each group. Run on domain-joined machine.

# For M365 groups (cloud-only), use:
Add-MgGroupMember -GroupId "[GroupObjectId]" -DirectoryObjectId "[UserObjectId]"
```

</details>

---

### STEP 6 — Set Up MFA

**Portal:** entra.microsoft.com → Users → `[FIRST_NAME] [LAST_NAME]` → **Authentication methods**

1. Send user to: **aka.ms/mfasetup** — they sign in and register Microsoft Authenticator
2. Or set up for them: Authentication methods → **+ Add method** → Microsoft Authenticator → follow prompts
3. SMS fallback: **+ Add method** → Phone → enter mobile number

---

### STEP 7 — Enroll Device in Intune

**Portal:** intune.microsoft.com → Devices → All devices (verify after user self-enrolls)

**User steps (Windows):**
1. Settings → Accounts → Access work or school → Connect → sign in with `[UPN]`
2. Device enrolls automatically via Intune

**Device naming convention:**
- Desktop: `DT-[FIRST_NAME],[LAST_NAME]`
- Laptop: `LT-[FIRST_NAME],[LAST_NAME]`

**Rename device after enrollment:**
- intune.microsoft.com → Devices → `[DEVICE_NAME]` → **Rename** → enter correct name

---

### STEP 8 — Add to Intermedia Unite

**Portal:** unite.intermedia.com

1. Log in → **Users** → **Add user**
2. Fill in: Name, email (`[UPN]`), extension number, department
3. Assign a phone/device if applicable
4. Set voicemail PIN (default or temp, user changes on first login)
5. ✅ Confirm user can make/receive calls

---

### STEP 9 — Grant SharePoint & Teams Access

**Portal:** SharePoint admin center or Teams

1. Navigate to the relevant SharePoint site or Teams channel for `[DEPARTMENT]`
2. Site settings → **Site permissions** → **Add members** → search `[UPN]`
3. Assign appropriate role: Member (edit) or Visitor (read-only)

---

### STEP 10 — Final Checklist

- [ ] AD account created and enabled
- [ ] Entra Connect synced — user visible in M365
- [ ] M365 Business Premium license assigned
- [ ] Added to security groups and distribution lists
- [ ] MFA registered (Authenticator + SMS fallback)
- [ ] Device enrolled in Intune and renamed correctly
- [ ] Intermedia Unite extension and voicemail configured
- [ ] SharePoint/Teams site access granted
- [ ] Temp password communicated to user securely
- [ ] Ticket logged in Jira
