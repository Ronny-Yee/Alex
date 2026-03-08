# User Offboarding — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[UPN]` — departing user's UPN (e.g. jsmith@familybridges.org)
- `[MANAGER_UPN]` — manager who receives access/data
- `[SHARED_MAILBOX_NAME]` — name for converted shared mailbox
- `[DEVICE_NAME]` — device name in Intune (e.g. DT-John,Smith)

> ⚠️ Confirm with manager before wiping devices or deleting accounts. These steps are not easily reversible.

---

## Portal Steps (Primary)

### 1. Block Sign-In (Entra ID)
1. Go to **https://entra.microsoft.com**
2. **Users → All users** → search `[UPN]`
3. Click the user → **Edit** (pencil icon)
4. Set **Block sign-in** to **Yes** → **Save**
5. Blocks the account immediately — user can't log in

### 2. Revoke Active Sessions
1. Still on the user's profile in Entra ID
2. Click **Revoke sessions** (button in the user menu)
3. Confirm — kills all active tokens, forces sign-out everywhere

### 3. Reset Password (prevent re-entry)
1. Still on the user's profile
2. Click **Reset password** → auto-generate → **Save**
3. Don't share the new password with anyone — this is just a lockout step

### 4. Remove MFA Methods
1. Go to user profile → **Authentication methods**
2. Delete all registered MFA methods
3. Prevents the account from being accessed even if somehow unblocked

### 5. Convert Mailbox to Shared
1. Go to **https://admin.microsoft.com**
2. **Users → Active users** → select `[UPN]`
3. Click **Mail** tab → **Convert to shared mailbox** → **Confirm**
4. Converts the mailbox so it doesn't need a license but stays accessible

### 6. Grant Manager Access to Shared Mailbox
1. Go to **https://admin.microsoft.com → Exchange → Recipients → Mailboxes**
2. Search for `[SHARED_MAILBOX_NAME]` → click it
3. **Mailbox delegation** → **Full Access** → **Add** → search `[MANAGER_UPN]` → **Save**
4. Manager can now open the mailbox from Outlook

### 7. Remove Licenses
1. Go to **https://admin.microsoft.com → Users → Active users**
2. Select `[UPN]` → **Licenses and apps** tab
3. Uncheck all licenses → **Save changes**
4. Frees up the license seat — mailbox stays because it's now shared

### 8. Transfer OneDrive Data
1. Go to **https://admin.microsoft.com → Users → Active users**
2. Select `[UPN]` → click **OneDrive** tab
3. **Create link to files** → copy the link and send to `[MANAGER_UPN]`
4. Or set a secondary admin: **Site settings → Managers → Add manager**
5. Data is accessible for 30 days after account deletion by default (configurable)

### 9. Remove from Security Groups
1. Go to **https://entra.microsoft.com → Users → All users** → select `[UPN]`
2. **Groups** tab → see all group memberships
3. Click each group → **Remove** (or remove from the group's Members page)
4. Removes access to all resources tied to those groups

### 10. Wipe & Remove Devices in Intune
> ⚠️ Full wipe erases all data on the device. Confirm before proceeding.

1. Go to **https://intune.microsoft.com → Devices → All devices**
2. Filter by user or search `[DEVICE_NAME]`
3. Click each device:
   - Company-owned → **Wipe** (full factory reset)
   - Personal BYOD → **Retire** (removes company data only)
4. After wipe completes → **Delete** to remove from Intune inventory
5. Go to **https://entra.microsoft.com → Devices → All devices** → find and **Delete** the device record

### 11. Disable On-Prem AD Account
1. Open **Active Directory Users and Computers** on the domain controller
2. Search for `[UPN]` (or username without @domain)
3. Right-click → **Disable Account**
4. Move to a **Disabled Users** OU if you have one — keeps it organized

### 12. Final Verification
- [ ] Sign-in blocked in Entra ID
- [ ] Sessions revoked
- [ ] MFA methods removed
- [ ] Mailbox converted to shared
- [ ] Manager has mailbox access
- [ ] Licenses removed
- [ ] OneDrive access transferred
- [ ] Removed from all groups
- [ ] Devices wiped and deleted
- [ ] On-prem AD account disabled

---

## PowerShell (for reference)

### Block Sign-In & Revoke Sessions
```powershell
Connect-MgGraph -Scopes "User.ReadWrite.All"

# Block sign-in
Update-MgUser -UserId "[UPN]" -AccountEnabled $false
# Immediately prevents the user from signing in

# Revoke all active sessions/tokens
Revoke-MgUserSignInSession -UserId "[UPN]"
# Forces sign-out from all active sessions
```

### Convert Mailbox to Shared
```powershell
Connect-ExchangeOnline
# Converts the user mailbox to a shared mailbox (no license required)
Set-Mailbox -Identity "[UPN]" -Type Shared
```

### Grant Manager Full Access to Mailbox
```powershell
# Grants [MANAGER_UPN] full access to the shared mailbox
Add-MailboxPermission -Identity "[UPN]" -User "[MANAGER_UPN]" -AccessRights FullAccess -AutoMapping $true
# AutoMapping:$true makes it appear automatically in Outlook
```

### Remove All Licenses
```powershell
Connect-MgGraph -Scopes "User.ReadWrite.All"

# Get all assigned licenses
$licenses = (Get-MgUser -UserId "[UPN]" -Property AssignedLicenses).AssignedLicenses

# Remove all of them
Set-MgUserLicense -UserId "[UPN]" -RemoveLicenses ($licenses.SkuId) -AddLicenses @()
# Removes every license assigned to the user
```

### Disable On-Prem AD Account
```powershell
# Run on domain controller or RSAT machine
Disable-ADAccount -Identity "[UPN without @domain]"
# Disables the on-prem AD account — Entra Connect will sync the change
```
