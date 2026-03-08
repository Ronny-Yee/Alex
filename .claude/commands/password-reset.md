# Password Reset — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[UPN]` — user's UPN (e.g. jsmith@familybridges.org)
- `[TEMP_PW]` — temporary password to set (if manual reset)

---

## Portal Steps (Primary)

### Option A: Standard Password Reset (Admin-initiated)

1. Go to **https://entra.microsoft.com**
2. **Users → All users** → search `[UPN]` → click the user
3. Click **Reset password** in the top menu
4. Choose:
   - **Auto-generate password** — Entra creates one and shows it on screen (copy it)
   - Or enter a custom temp password: `[TEMP_PW]`
5. Check **Require this user to change their password when they first sign in**
6. Click **Reset password** → copy the generated password
7. Send `[TEMP_PW]` to the user via a secure channel (phone call, Teams DM — never email)

### Option B: Reset via M365 Admin Center (alternative)

1. Go to **https://admin.microsoft.com**
2. **Users → Active users** → click `[UPN]`
3. **Reset password** tab (in the user details panel)
4. Auto-generate or enter custom password
5. Optionally email the password to yourself or another admin
6. Click **Reset**

### Option C: Force MFA Re-Registration (if user got a new phone or lost MFA access)

1. Go to **https://entra.microsoft.com**
2. **Users → All users** → select `[UPN]`
3. **Authentication methods** tab
4. Delete all existing MFA methods (click each → **Delete**)
5. Send user this link to re-register: **https://aka.ms/mfasetup**
6. Walk user through adding Microsoft Authenticator first, then SMS as backup

### Option D: Unlock Account (if locked out, not a password issue)

1. Go to **https://entra.microsoft.com → Users → All users** → select `[UPN]`
2. Check if **Block sign-in** is set to Yes — if so, flip it to No → Save
3. For on-prem AD lockout:
   - Open **Active Directory Users and Computers**
   - Find the user → right-click → **Properties → Account tab**
   - Click **Unlock account** checkbox → **OK**

---

## Verify It Worked

1. Confirm user can sign in at **https://portal.office.com**
2. Confirm MFA prompt appears and completes successfully
3. Confirm user is prompted to set a new password if you checked that option

---

## PowerShell (for reference)

### Reset Password
```powershell
Connect-MgGraph -Scopes "User.ReadWrite.All"

# Set a temporary password and require change on next sign-in
$passwordProfile = @{
    Password = "[TEMP_PW]"
    ForceChangePasswordNextSignIn = $true
}
Update-MgUser -UserId "[UPN]" -PasswordProfile $passwordProfile
# Resets the password — user must change it at next login
```

### Clear MFA Methods (force re-registration)
```powershell
Connect-MgGraph -Scopes "UserAuthenticationMethod.ReadWrite.All"

# List all registered auth methods for the user
Get-MgUserAuthenticationMethod -UserId "[UPN]"

# Remove Microsoft Authenticator (replace {id} with the method ID from above)
Remove-MgUserAuthenticationMicrosoftAuthenticatorMethod -UserId "[UPN]" -MicrosoftAuthenticatorAuthenticationMethodId "{id}"

# Remove phone/SMS method
Remove-MgUserAuthenticationPhoneMethod -UserId "[UPN]" -PhoneAuthenticationMethodId "{id}"
# After clearing, user must re-register at https://aka.ms/mfasetup
```

### Unlock On-Prem AD Account
```powershell
# Run on domain controller or RSAT machine
Unlock-ADAccount -Identity "[UPN without @domain]"
# Unlocks a locked-out AD account without changing the password
```
