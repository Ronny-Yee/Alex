# M365 License Audit — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[UPN]` — specific user's UPN if auditing one user
- `[LICENSE_NAME]` — license name (e.g. Microsoft 365 Business Premium)
- `[DATE]` — audit date for documentation

---

## Portal Steps (Primary)

### 1. View All License Assignments

1. Go to **https://admin.microsoft.com**
2. **Billing → Licenses**
3. See all purchased licenses, total count, and how many are assigned vs available
4. Note any licenses at 100% usage — those are at risk of blocking new users

### 2. Export License Assignments for All Users

1. Go to **https://admin.microsoft.com → Users → Active users**
2. Click **Export users** (top right) → **Export all users**
3. Open the downloaded CSV in Excel
4. Key columns to review:
   - **Licenses** — what's assigned to each user
   - **Sign-in allowed** — if blocked, should they still have a license?
   - **Last sign-in date** — users who haven't signed in for 90+ days are candidates for review

### 3. Find Users with No Sign-In Activity (License Waste)

1. Go to **https://admin.microsoft.com → Reports → Usage → Microsoft 365**
2. Select **Active users report**
3. Set date range to **Last 90 days** or **Last 180 days**
4. Filter and look for users with **0 activity** across all products
5. Cross-reference these against licensed users — inactive licensed users = wasted seats

### 4. Find Blocked Users Still Holding Licenses

1. Go to **https://admin.microsoft.com → Users → Active users**
2. Add filter: **Sign-in status → Blocked**
3. Check each blocked user — if they have a license assigned, remove it
4. Blocked users don't need licenses; shared mailboxes don't need licenses either

### 5. Check for Shared Mailboxes with Licenses

1. Go to **https://admin.microsoft.com → Exchange → Recipients → Shared mailboxes**
2. Export the list
3. Cross-check against **Admin center → Users → Active users** — shared mailboxes should NOT appear there as licensed users
4. If a converted shared mailbox still shows a license in Active users, remove it

### 6. Check License Usage by Service (Is Each App Being Used?)

1. Go to **https://admin.microsoft.com → Reports → Usage**
2. Review individual app reports:
   - **Exchange** — is email active?
   - **Teams** — active Teams users?
   - **SharePoint** — site activity?
   - **OneDrive** — file activity?
3. Users fully licensed but using 0 apps = license candidates for reassignment or downgrade

### 7. Identify Users Who Could Use a Cheaper License

1. Compare what users actually use vs what the license includes:
   - M365 Business Premium = full suite + Intune + Defender
   - Users who only need email → could use **Exchange Online Plan 1** ($4/mo vs $22/mo)
2. Go to **https://admin.microsoft.com → Reports → Usage** for each app
3. Flag users who only have Exchange activity and no Teams/SharePoint/OneDrive usage

### 8. Reassign or Remove a License

1. Go to **https://admin.microsoft.com → Users → Active users**
2. Select `[UPN]` → click **Licenses and apps** tab
3. Uncheck the license to remove it → **Save changes**
4. Or check a different license to reassign
5. Removing a license immediately revokes access to those services

---

## Audit Checklist

- [ ] Total licenses purchased vs assigned — any available seats?
- [ ] Blocked accounts holding licenses — remove them
- [ ] Users with 90+ days no sign-in — review and flag
- [ ] Shared mailboxes with licenses — remove licenses
- [ ] Users using fewer apps than licensed — consider downgrade
- [ ] New users without licenses — assign as needed

---

## PowerShell (for reference)

### List All Users and Their Licenses

```powershell
Connect-MgGraph -Scopes "User.Read.All", "Directory.Read.All"

# Get all licensed users with their license SKUs
Get-MgUser -All -Property DisplayName, UserPrincipalName, AssignedLicenses, AccountEnabled |
    Where-Object { $_.AssignedLicenses.Count -gt 0 } |
    Select-Object DisplayName, UserPrincipalName, AccountEnabled,
        @{N="Licenses"; E={($_.AssignedLicenses | ForEach-Object { $_.SkuId }) -join ", "}} |
    Export-Csv -Path "C:\Temp\LicenseAudit_[DATE].csv" -NoTypeInformation
# Exports all licensed users to a CSV for review
```

### Find Blocked Users with Licenses

```powershell
Connect-MgGraph -Scopes "User.Read.All"

# Get users who are blocked (AccountEnabled = false) but still have licenses
Get-MgUser -All -Property DisplayName, UserPrincipalName, AccountEnabled, AssignedLicenses |
    Where-Object { $_.AccountEnabled -eq $false -and $_.AssignedLicenses.Count -gt 0 } |
    Select-Object DisplayName, UserPrincipalName |
    Format-Table
# These users are costing a license seat but can't log in — candidates to remove licenses
```

### Get Available License Counts

```powershell
Connect-MgGraph -Scopes "Directory.Read.All"

# Show all subscribed SKUs with total and consumed counts
Get-MgSubscribedSku | Select-Object SkuPartNumber,
    @{N="Total"; E={$_.PrepaidUnits.Enabled}},
    @{N="Used"; E={$_.ConsumedUnits}},
    @{N="Available"; E={$_.PrepaidUnits.Enabled - $_.ConsumedUnits}} |
    Format-Table
# Shows how many of each license you have, how many are used, and how many are free
```

### Remove License from a User

```powershell
Connect-MgGraph -Scopes "User.ReadWrite.All"

# Get the user's current licenses
$user = Get-MgUser -UserId "[UPN]" -Property AssignedLicenses

# Remove all licenses from the user
Set-MgUserLicense -UserId "[UPN]" `
    -RemoveLicenses ($user.AssignedLicenses.SkuId) `
    -AddLicenses @()
# Removes all assigned licenses from the user
```
