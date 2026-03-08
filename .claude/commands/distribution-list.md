# Distribution Lists & Groups — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[DL_NAME]` — display name of the group (e.g. All Staff, Finance Team)
- `[DL_EMAIL]` — email address for the group (e.g. allstaff@familybridges.org)
- `[UPN]` — user's UPN to add or remove
- `[EXTERNAL_EMAIL]` — external sender's email if allowing outside senders

---

## Group Types — Quick Reference

| Type | Use for | Can email it? | Has M365 features? |
|---|---|---|---|
| **Distribution List (DL)** | Email broadcast to a group | Yes | No (email only) |
| **Mail-enabled Security Group** | Email + resource access | Yes | No |
| **Microsoft 365 Group** | Teams, SharePoint, Planner, email | Yes | Yes |
| **Security Group** | Access control only (no email) | No | No |

> **For "all staff" emails or department emails:** Use a **Distribution List**.
> **For Teams or SharePoint site membership:** Use a **Microsoft 365 Group**.
> **For controlling who can access a resource:** Use a **Security Group**.

---

## Portal Steps (Primary)

### 1. Create a New Distribution List

1. Go to **https://admin.microsoft.com**
2. **Exchange → Recipients → Groups**
3. Click **+ Add a group**
4. Group type: **Distribution list** → **Next**
5. Fill in:
   - **Name:** `[DL_NAME]`
   - **Description:** (optional but helpful)
6. **Next**
7. **Assign owners:** add yourself or the department manager
8. **Next**
9. **Add members:** add initial members (can also do this later)
10. **Next**
11. **Email address:** `[DL_EMAIL]`
12. **Allow people outside of my organization to send to this group:** check if external senders need to email it
13. **Next → Create group**

### 2. Add Members to a Distribution List

1. Go to **https://admin.microsoft.com → Exchange → Recipients → Groups**
2. Find and click `[DL_NAME]`
3. **Members** tab → **View all and manage members**
4. Click **+ Add members**
5. Search for `[UPN]` → select → **Add**
6. Repeat for additional members → **Save**

### 3. Remove Members from a Distribution List

1. **https://admin.microsoft.com → Exchange → Recipients → Groups**
2. Click `[DL_NAME]` → **Members** tab
3. Find `[UPN]` → select → click **Remove** → confirm

### 4. Allow External Senders to Email the List

> By default, only internal users can email a DL. Change this if vendors or clients need to email it.

1. **https://admin.microsoft.com → Exchange → Recipients → Groups**
2. Click `[DL_NAME]` → **Settings** tab
3. Check **Allow senders outside my organization** → **Save**
4. If you need only specific external addresses: use a mail flow rule instead (see email-whitelist.md)

### 5. Create a Microsoft 365 Group (for Teams/SharePoint)

1. Go to **https://admin.microsoft.com**
2. **Exchange → Recipients → Groups → + Add a group**
3. Group type: **Microsoft 365** → **Next**
4. Fill in name, description, owners, members, email address
5. **Privacy:** Public (anyone can join) or Private (invitation only) → choose **Private** for most cases
6. **Next → Create group**
7. This group automatically creates a Teams team, SharePoint site, and shared mailbox

### 6. Create a Security Group (No Email — Access Control Only)

1. Go to **https://entra.microsoft.com**
2. **Groups → All groups → + New group**
3. **Group type:** Security
4. Fill in name and description
5. **Membership type:** Assigned (manual) or Dynamic User (based on attributes)
6. Add members → **Create**
7. Use this group to control access to SharePoint, apps, printers, etc.

### 7. Manage Group Owners

Owners can manage membership without admin help.

1. **https://admin.microsoft.com → Exchange → Recipients → Groups**
2. Click `[DL_NAME]` → **Owners** tab
3. **Add owners** or **Remove** existing owners
4. Owners can then manage membership from **https://outlook.office.com/groups**

---

## Common Issues

| Issue | Fix |
|---|---|
| External sender getting bounce/rejection | Enable "Allow outside senders" on the DL (Step 4) |
| Member not receiving DL emails | Confirm they're in the members list, check if they opted out |
| DL not showing in GAL | Check "Hide from Exchange address list" setting on the group |
| Can't delete a DL | Check if it's a dynamic group or has dependencies — remove members first |
| M365 Group not syncing to on-prem AD | M365 Groups are cloud-only — not supported in hybrid sync |

---

## PowerShell (for reference)

### Create a Distribution List

```powershell
Connect-ExchangeOnline

# Create a new distribution list
New-DistributionGroup -Name "[DL_NAME]" -DisplayName "[DL_NAME]" `
    -PrimarySmtpAddress "[DL_EMAIL]" -Type Distribution
# Creates the DL — members can be added next
```

### Add/Remove Members

```powershell
Connect-ExchangeOnline

# Add a member to the distribution list
Add-DistributionGroupMember -Identity "[DL_EMAIL]" -Member "[UPN]"
# Adds the user to the group immediately

# Remove a member
Remove-DistributionGroupMember -Identity "[DL_EMAIL]" -Member "[UPN]" -Confirm:$false
# Removes the user from the distribution list
```

### Allow External Senders

```powershell
Connect-ExchangeOnline

# Allow emails from outside the organization
Set-DistributionGroup -Identity "[DL_EMAIL]" -RequireSenderAuthenticationEnabled $false
# RequireSenderAuthenticationEnabled $false = external senders allowed
```

### List All Members of a Group

```powershell
Connect-ExchangeOnline

# List all members and their email addresses
Get-DistributionGroupMember -Identity "[DL_EMAIL]" |
    Select-Object DisplayName, PrimarySmtpAddress |
    Sort-Object DisplayName |
    Format-Table
```

### List All Distribution Groups in the Org

```powershell
Connect-ExchangeOnline

# Get all DLs with member count
Get-DistributionGroup -ResultSize Unlimited |
    Select-Object DisplayName, PrimarySmtpAddress,
        @{N="MemberCount";E={(Get-DistributionGroupMember $_.Identity).Count}} |
    Sort-Object DisplayName |
    Format-Table
# Useful for auditing — shows all groups and how many members each has
```
