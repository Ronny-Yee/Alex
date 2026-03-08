# Conditional Access — Guide & Troubleshooting — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[UPN]` — user's UPN (e.g. jsmith@familybridges.org)
- `[POLICY_NAME]` — name of the CA policy

---

## What Is Conditional Access? (Plain English)

Conditional Access (CA) is a set of rules that control **when and how** users can access M365 resources. Instead of just checking username + password, CA checks additional conditions before allowing access:

- **Who** is signing in (user, group, role)
- **Where** they're signing in from (location, IP range)
- **What device** they're on (compliant, Entra-joined, or unknown)
- **What app** they're accessing (Teams, Outlook, SharePoint)

Based on those conditions, CA either **allows**, **blocks**, or **requires MFA**.

**Example:** "Require MFA for all users accessing Office 365 from any device" — this is a CA policy.

---

## Portal Steps (Primary)

### 1. View All CA Policies

1. Go to **https://entra.microsoft.com**
2. **Identity → Protection → Conditional Access → Policies**
3. See all policies — note which are **On**, **Off**, or **Report-only**
4. Click any policy to see its conditions and grant controls

### 2. Understand a CA Policy

When you open a policy, look at these sections:

| Section | What it means |
|---|---|
| **Assignments → Users** | Who this policy applies to (all users, specific groups, or exclusions) |
| **Assignments → Target resources** | What apps it protects (All cloud apps, Office 365, specific app) |
| **Assignments → Conditions** | Extra filters: location, device platform, sign-in risk, device state |
| **Access controls → Grant** | What happens: Block access, Require MFA, Require compliant device, etc. |
| **Access controls → Session** | Controls like sign-in frequency, persistent browser session |
| **Enable policy** | On = enforced, Report-only = logs but doesn't block, Off = disabled |

### 3. Test a CA Policy — What If Tool

> Use this before making changes to see what policy would apply to a specific user.

1. Go to **https://entra.microsoft.com → Identity → Protection → Conditional Access**
2. Click **What If** (top menu)
3. Fill in:
   - **User:** `[UPN]`
   - **Cloud apps or actions:** select the app (e.g. Office 365)
   - **IP address:** leave blank for any, or enter a specific IP
   - **Device platform:** Windows, iOS, Android, etc.
   - **Device state:** Compliant / Not compliant
4. Click **What If**
5. Results show which policies **Apply** and which **Don't apply** — and whether access is allowed or blocked

### 4. Create a New CA Policy

> ⚠️ Always start new policies in **Report-only** mode. Switch to **On** only after testing with the What If tool.

1. Go to **https://entra.microsoft.com → Identity → Protection → Conditional Access → Policies**
2. Click **+ New policy** → give it a name: `[POLICY_NAME]`
3. **Assignments → Users:**
   - Select **All users** or specific groups
   - Add exclusions: always exclude at least one **break-glass admin account** so you can't lock yourself out
4. **Assignments → Target resources:**
   - **Cloud apps** → select **All cloud apps** or specific apps
5. **Conditions** (optional — add only what you need):
   - **Locations:** Target specific IP ranges or exclude trusted IPs
   - **Device platforms:** Filter by Windows, iOS, Android, etc.
   - **Sign-in risk:** Requires Entra ID P2 — skip if not licensed
6. **Access controls → Grant:**
   - **Grant access** → check **Require multifactor authentication**
   - Or **Block access** for a restriction policy
7. **Enable policy:** Set to **Report-only** first
8. Click **Create**
9. Use the **What If** tool to validate, then switch to **On**

### 5. Troubleshoot a CA Blocked Sign-In

1. Go to **https://entra.microsoft.com**
2. **Users → All users** → click `[UPN]`
3. **Sign-in logs** tab
4. Find the failed sign-in → click it
5. Click the **Conditional Access** tab in the details panel
6. Look at each policy listed:
   - **Success** — policy applied and the user met the requirement
   - **Failure** — policy applied and the user did NOT meet the requirement (this is blocking them)
   - **Not applied** — policy conditions didn't match this sign-in
7. Click the failing policy name to see exactly what condition failed:
   - "MFA required but not satisfied" → user needs to complete MFA or register
   - "Device not compliant" → device is in Intune but failing a compliance policy
   - "Access blocked" → a block policy is applying

### 6. Exclude a User from a CA Policy (Temporary)

> ⚠️ Only do this temporarily — document why and when to remove the exclusion.

1. Go to **https://entra.microsoft.com → Conditional Access → Policies**
2. Click `[POLICY_NAME]`
3. **Assignments → Users → Exclude**
4. Click **Users and groups** → add `[UPN]` or their group → **Select**
5. **Save**
6. Test sign-in for the user — they should now pass
7. Set a reminder to remove the exclusion after the issue is resolved

### 7. Report-Only Mode — Safe Testing

> Report-only lets you see what a policy would do without actually enforcing it.

1. When creating or editing a policy: set **Enable policy** to **Report-only**
2. The policy logs results in sign-in logs but does NOT block or require MFA
3. Review **Sign-in logs** after a day or two — filter by the policy name to see who it would have affected
4. Once confident it's correct: switch to **On**

---

## Common CA Scenarios at familybridges.org

| Goal | Policy Setup |
|---|---|
| Require MFA for all users | Users: All, Apps: All cloud apps, Grant: Require MFA |
| Block sign-in from outside the US | Users: All, Conditions: Locations (exclude US), Grant: Block |
| Require compliant device for M365 | Users: All, Apps: Office 365, Grant: Require compliant device |
| Allow legacy auth for specific app | Users: specific group, Conditions: Client apps (legacy), Grant: Allow |
| MFA only when off-network | Users: All, Conditions: Locations (exclude office IPs), Grant: Require MFA |

---

## PowerShell (for reference)

### List All CA Policies

```powershell
Connect-MgGraph -Scopes "Policy.Read.All"

# List all Conditional Access policies and their state
Get-MgIdentityConditionalAccessPolicy |
    Select-Object DisplayName, State, Id |
    Format-Table
# State: enabled = on, disabled = off, enabledForReportingButNotEnforced = report-only
```

### Get Details of a Specific Policy

```powershell
Connect-MgGraph -Scopes "Policy.Read.All"

# Get full details of a CA policy by name
Get-MgIdentityConditionalAccessPolicy -Filter "displayName eq '[POLICY_NAME]'" |
    Select-Object -ExpandProperty Conditions |
    ConvertTo-Json -Depth 10
# Outputs the full JSON of the policy conditions — useful for auditing
```

### Check Sign-In Logs for CA Failures

```powershell
Connect-MgGraph -Scopes "AuditLog.Read.All"

# Get failed sign-ins for a specific user in the last 24 hours
Get-MgAuditLogSignIn -Filter "userPrincipalName eq '[UPN]' and status/errorCode ne 0" -Top 20 |
    Select-Object CreatedDateTime, AppDisplayName, Status, ConditionalAccessStatus |
    Format-Table
# Shows sign-in failures — ConditionalAccessStatus shows if CA was involved
```
