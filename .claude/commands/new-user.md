# New User Provisioning — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[FIRST]` — first name
- `[LAST]` — last name
- `[UPN]` — UPN/email (e.g. jsmith@familybridges.org)
- `[DISPLAY]` — display name (e.g. John Smith)
- `[TITLE]` — job title
- `[DEPT]` — department
- `[MANAGER_UPN]` — manager's UPN
- `[TEMP_PW]` — temporary password
- `[GROUP]` — security group(s) to add

---

## Portal Steps (Primary)

### 1. Create User in On-Prem Active Directory
> Hybrid AD — always create in on-prem AD first, then let Entra Connect sync.

1. Open **Active Directory Users and Computers** on the domain controller
2. Navigate to the correct OU for the department
3. Right-click → **New → User**
4. Fill in:
   - First name: `[FIRST]`
   - Last name: `[LAST]`
   - User logon name: `[UPN]` (without @domain)
5. Set password: `[TEMP_PW]` — check **User must change password at next logon**
6. Click **Finish**
7. Open the new user's properties → **General** tab → set Display Name: `[DISPLAY]`
8. **Organization** tab → set Title: `[TITLE]`, Department: `[DEPT]`, Manager: `[MANAGER_UPN]`
9. Wait for Entra Connect sync (~30 min) or force sync (see PowerShell section)

### 2. Assign M365 License in Admin Center
1. Go to **https://admin.microsoft.com**
2. **Users → Active users** → find `[UPN]`
3. Click the user → **Licenses and apps** tab
4. Check **Microsoft 365 Business Premium** → **Save changes**

### 3. Add to Security Groups
1. Go to **https://entra.microsoft.com**
2. **Groups → All groups** → search for `[GROUP]`
3. Open the group → **Members → Add members**
4. Search for `[UPN]` → select → **Select**
5. Repeat for each group

### 4. Set Up MFA
1. Go to **https://entra.microsoft.com**
2. **Users → All users** → select `[UPN]`
3. **Authentication methods** → verify methods are empty (new user)
4. Send user the MFA setup link: https://aka.ms/mfasetup
5. Instruct user to set up Microsoft Authenticator app first, SMS as backup

### 5. Intune Device Enrollment (if needed)
1. Go to **https://intune.microsoft.com**
2. Confirm user is in the enrollment group (check **Groups** in Entra)
3. If assigning a pre-enrolled device: **Devices → All devices** → search device name
4. Open device → **Properties** → assign primary user to `[UPN]`
5. Instruct user to sign into Company Portal app on their device

### 6. Verify Sync & Account
1. Go to **https://entra.microsoft.com → Users → All users**
2. Confirm `[UPN]` shows **Directory synced: Yes**
3. Confirm license is assigned
4. Test sign-in at https://portal.office.com with `[UPN]` and `[TEMP_PW]`

---

## PowerShell (for reference)

### Force Entra Connect Sync
```powershell
# Run on the server where Entra Connect is installed
Import-Module ADSync
Start-ADSyncSyncCycle -PolicyType Delta
# Delta sync pushes only changes — faster than a full sync
```

### Assign License via Graph
```powershell
# Install module if needed: Install-Module Microsoft.Graph
Connect-MgGraph -Scopes "User.ReadWrite.All", "Directory.ReadWrite.All"

# Get the license SKU ID for M365 Business Premium
$sku = Get-MgSubscribedSku | Where-Object { $_.SkuPartNumber -eq "SPB" }

# Assign the license to the user
Set-MgUserLicense -UserId "[UPN]" `
  -AddLicenses @{SkuId = $sku.SkuId} `
  -RemoveLicenses @()
# This assigns M365 Business Premium (SPB) to the user
```

### Add User to Security Group
```powershell
Connect-MgGraph -Scopes "GroupMember.ReadWrite.All"

# Get the group object ID
$group = Get-MgGroup -Filter "displayName eq '[GROUP]'"

# Get the user object ID
$user = Get-MgUser -UserId "[UPN]"

# Add user to group
New-MgGroupMember -GroupId $group.Id -DirectoryObjectId $user.Id
# Adds [UPN] to the specified security group
```

### Create User in AD (PowerShell alternative to ADUC)
```powershell
# Run on domain controller or machine with RSAT
New-ADUser `
  -Name "[DISPLAY]" `
  -GivenName "[FIRST]" `
  -Surname "[LAST]" `
  -SamAccountName "[UPN without @domain]" `
  -UserPrincipalName "[UPN]" `
  -Title "[TITLE]" `
  -Department "[DEPT]" `
  -AccountPassword (ConvertTo-SecureString "[TEMP_PW]" -AsPlainText -Force) `
  -ChangePasswordAtLogon $true `
  -Enabled $true `
  -Path "OU=YourOU,DC=familybridges,DC=org"
# Creates the AD account — Entra Connect will sync it within ~30 minutes
```
