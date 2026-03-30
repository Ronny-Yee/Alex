# Security Audit — familybridges.org
**Generated:** 2026-03-30  |  **Tenant:** familybridges.org  |  **Licensing:** M365 Business Premium

> Work through each section in the Microsoft admin portals. PowerShell alternatives are included for bulk checks.
> Mark each item ✅ when verified or ❌ if action is needed.

## Audit Summary
| Risk Level | Count |
|------------|-------|
| 🔴 CRITICAL | 4 checks |
| 🟠 HIGH | 15 checks |
| 🟡 MEDIUM | 4 checks |

---

## 1. Identity & Access — Entra ID

### 🟠 HIGH — Stale accounts (no sign-in 30+ days)

**Portal path:**  
Entra → Identity → Users → All Users → filter by "Last sign-in" column

<details>
<summary>PowerShell (for reference only)</summary>

```powershell
Get-MgUser -All -Property DisplayName,UserPrincipalName,SignInActivity | Where-Object { $_.SignInActivity.LastSignInDateTime -lt (Get-Date).AddDays(-30) } | Select DisplayName,UserPrincipalName,@{n='LastSignIn';e={$_.SignInActivity.LastSignInDateTime}}
```

</details>

**Note:** Disable or delete accounts inactive 30+ days. Check with managers before deleting.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🔴 CRITICAL — Accounts with no MFA registered

**Portal path:**  
Entra → Identity → Users → All Users → Authentication methods → filter MFA = None

<details>
<summary>PowerShell (for reference only)</summary>

```powershell
Get-MgReportAuthenticationMethodUserRegistrationDetail | Where-Object { -not $_.IsMfaRegistered } | Select UserDisplayName,UserPrincipalName
```

</details>

**Note:** Every active user must have MFA. Direct unregistered users to aka.ms/mfasetup.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🟠 HIGH — Admin role assignments — are they minimal?

**Portal path:**  
Entra → Identity → Roles & admins → All roles → check Global Admin, Privileged Role Admin, Exchange Admin

<details>
<summary>PowerShell (for reference only)</summary>

```powershell
Get-MgDirectoryRole | ForEach-Object { $role = $_; Get-MgDirectoryRoleMember -DirectoryRoleId $role.Id | Select @{n='Role';e={$role.DisplayName}},@{n='User';e={$_.AdditionalProperties.userPrincipalName}} }
```

</details>

**Note:** Global Admin should have ≤2 accounts. All admin roles should use dedicated admin accounts, not daily-use accounts.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🟠 HIGH — Break-glass emergency access accounts exist and are excluded from CA

**Portal path:**  
Entra → Identity → Users → search for emergency/breakglass accounts → verify excluded from all CA policies

**Note:** Must have 2 break-glass accounts. Cloud-only, no MFA requirement, excluded from CA. Test sign-in quarterly.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🟡 MEDIUM — Guest / external user audit

**Portal path:**  
Entra → Identity → Users → All Users → filter "User type = Guest"

<details>
<summary>PowerShell (for reference only)</summary>

```powershell
Get-MgUser -Filter "userType eq 'Guest'" | Select DisplayName,UserPrincipalName,CreatedDateTime | Sort-Object CreatedDateTime
```

</details>

**Note:** Remove guests who no longer need access. Review any guest with admin roles immediately.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🔴 CRITICAL — Risky users flagged by Identity Protection

**Portal path:**  
Entra → Protection → Identity Protection → Risky users

**Note:** Remediate or dismiss each risky user. Confirm action with manager before dismissing.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

---

## 2. Conditional Access

### 🔴 CRITICAL — MFA required for all users policy exists and is enabled

**Portal path:**  
Entra → Protection → Conditional Access → Policies → look for a "Require MFA" policy in On state

<details>
<summary>PowerShell (for reference only)</summary>

```powershell
Get-MgIdentityConditionalAccessPolicy | Select DisplayName,State | Sort-Object DisplayName
```

</details>

**Note:** If no MFA CA policy exists, create one immediately. Exclude break-glass accounts only.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🟠 HIGH — Legacy authentication blocked

**Portal path:**  
Entra → Conditional Access → Policies → look for "Block legacy authentication" policy

**Note:** Legacy auth (SMTP, IMAP, POP3, older Office clients) bypasses MFA. Must be blocked.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🟡 MEDIUM — Named locations are accurate (trusted IPs)

**Portal path:**  
Entra → Protection → Conditional Access → Named locations

**Note:** Verify office IP ranges are correct. Remove any stale or unknown IP ranges. Each site should have its own named location.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🟠 HIGH — No CA policy gaps — check for excluded users/groups

**Portal path:**  
Entra → Conditional Access → each policy → Exclude tab

**Note:** Exclusions should be minimal. Flag any non-break-glass accounts excluded from MFA policies.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

---

## 3. Device Compliance — Intune

### 🟠 HIGH — Non-compliant devices

**Portal path:**  
Intune → Devices → Compliance → Non-compliant devices report

<details>
<summary>PowerShell (for reference only)</summary>

```powershell
Get-MgDeviceManagementManagedDevice -Filter "complianceState eq 'noncompliant'" | Select DeviceName,UserPrincipalName,OperatingSystem,ComplianceState
```

</details>

**Note:** Investigate each non-compliant device. Common causes: BitLocker off, OS out of date, no passcode.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🟠 HIGH — Devices with no compliance policy assigned

**Portal path:**  
Intune → Devices → All devices → filter by "Compliance = Not evaluated"

**Note:** "Not evaluated" means no policy targets the device — it can access resources unchecked. Assign a compliance policy.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🟠 HIGH — BitLocker status on Windows devices

**Portal path:**  
Intune → Devices → All devices → [device] → Encryption report

<details>
<summary>PowerShell (for reference only)</summary>

```powershell
Get-MgDeviceManagementManagedDevice -Filter "operatingSystem eq 'Windows'" | Select DeviceName,IsEncrypted,UserPrincipalName
```

</details>

**Note:** All Windows devices must be encrypted. Retrieve recovery keys via Intune → Devices → [device] → Recovery keys.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🟡 MEDIUM — Stale/unmanaged devices (enrolled 90+ days, no check-in)

**Portal path:**  
Intune → Devices → All devices → sort by "Last check-in" ascending

<details>
<summary>PowerShell (for reference only)</summary>

```powershell
Get-MgDeviceManagementManagedDevice | Where-Object { $_.LastSyncDateTime -lt (Get-Date).AddDays(-90) } | Select DeviceName,UserPrincipalName,LastSyncDateTime
```

</details>

**Note:** Retire stale devices. Confirm with user before wiping — device may be in storage or used infrequently.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

---

## 4. Email Security — Exchange / Defender

### 🟠 HIGH — DKIM enabled for familybridges.org

**Portal path:**  
Defender → Policies & rules → Threat policies → Email authentication settings → DKIM tab

<details>
<summary>PowerShell (for reference only)</summary>

```powershell
Get-DkimSigningConfig -Domain familybridges.org | Select Domain,Enabled,Status
```

</details>

**Note:** DKIM must be enabled and both CNAME records published in DNS.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🟠 HIGH — DMARC record published in DNS

**Portal path:**  
Run: nslookup -type=TXT _dmarc.familybridges.org — should return a p= policy

<details>
<summary>PowerShell (for reference only)</summary>

```powershell
Resolve-DnsName -Name "_dmarc.familybridges.org" -Type TXT
```

</details>

**Note:** DMARC policy should be p=quarantine or p=reject. p=none provides no protection.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🟠 HIGH — SPF record is tight (no ~all or ?all)

**Portal path:**  
Run: nslookup -type=TXT familybridges.org — SPF should end in -all (hard fail)

<details>
<summary>PowerShell (for reference only)</summary>

```powershell
Resolve-DnsName -Name "familybridges.org" -Type TXT | Where-Object { $_.Strings -match 'spf' }
```

</details>

**Note:** ~all (soft fail) allows spoofed mail to pass. Use -all. Only include legitimate sending IPs.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🟠 HIGH — Anti-phishing policy enabled

**Portal path:**  
Defender → Policies & rules → Threat policies → Anti-phishing

<details>
<summary>PowerShell (for reference only)</summary>

```powershell
Get-AntiPhishPolicy | Select Name,Enabled,EnableMailboxIntelligence,EnableSpoofIntelligence
```

</details>

**Note:** Enable impersonation protection for key users (execs, finance, IT). Enable spoof intelligence.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🔴 CRITICAL — Mailbox forwarding rules — no unexpected external forwards

**Portal path:**  
Exchange Admin → Recipients → Mailboxes → [each mailbox] → Mailflow settings → check forwarding

<details>
<summary>PowerShell (for reference only)</summary>

```powershell
Get-Mailbox -ResultSize Unlimited | Where-Object { $_.ForwardingSmtpAddress -ne $null } | Select DisplayName,ForwardingSmtpAddress,DeliverToMailboxAndForward
```

</details>

**Note:** External forwarding is a top exfiltration method after account compromise. Any unexpected forward = investigate immediately.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

---

## 5. SharePoint & OneDrive — Data Exposure

### 🟠 HIGH — External sharing settings — is sharing restricted?

**Portal path:**  
SharePoint Admin (admin.microsoft.com → SharePoint) → Policies → Sharing → check org-level setting

<details>
<summary>PowerShell (for reference only)</summary>

```powershell
Get-SPOTenant | Select SharingCapability,DefaultSharingLinkType
```

</details>

**Note:** Recommended: "New and existing guests" at most. "Anyone" links (anonymous) should be disabled.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🟡 MEDIUM — Sites shared externally

**Portal path:**  
SharePoint Admin → Sites → Active sites → filter by "External sharing = On"

<details>
<summary>PowerShell (for reference only)</summary>

```powershell
Get-SPOSite -Limit All | Where-Object { $_.SharingCapability -ne "Disabled" } | Select Url,SharingCapability
```

</details>

**Note:** Review each externally shared site. Confirm it is intentional and has a business reason.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

---

## 6. Privileged Access & App Permissions

### 🟠 HIGH — App registrations with high-permission Graph API scopes

**Portal path:**  
Entra → Applications → App registrations → All applications → review API permissions

<details>
<summary>PowerShell (for reference only)</summary>

```powershell
Get-MgApplication | Select DisplayName,CreatedDateTime | Sort-Object CreatedDateTime -Descending
```

</details>

**Note:** Flag any app with Mail.Read, User.ReadWrite.All, or Directory.ReadWrite.All scopes. Unused apps should be removed.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

### 🟠 HIGH — Service principals / Enterprise apps with broad permissions

**Portal path:**  
Entra → Applications → Enterprise applications → Permissions → look for User.ReadWrite.All, etc.

**Note:** Third-party apps with admin consent to broad scopes are a supply chain risk. Review quarterly.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

---

## 7. Microsoft Secure Score

### 🔵 INFO — Current Secure Score and top improvement actions

**Portal path:**  
Defender (security.microsoft.com) → Secure score → Improvement actions — sort by Points impact

**Note:** Target score: 70%+. Focus on the top 5 improvement actions by points. Common quick wins: enable MFA, block legacy auth, enable audit log, enable SSPR.

- [ ] Checked  &nbsp;&nbsp; Findings: _______________

---

## Audit Sign-off

| Field | Value |
|-------|-------|
| Auditor | Ronnie Yee |
| Date | 2026-03-30 |
| Tenant | familybridges.org |
| Critical items resolved | / 4 |
| High items resolved | / 15 |
| Jira ticket | [JIRA-###] |
| Next review | 2026-06-30 |
