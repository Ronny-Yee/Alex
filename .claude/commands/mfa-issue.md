# MFA Troubleshooting & Reset — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[UPN]` — user's UPN (e.g. jsmith@familybridges.org)

---

## Step 1: Identify the Scenario

| Scenario | Go to |
|---|---|
| User got a new phone — need to re-register MFA | Step 2 |
| User is locked out, can't pass MFA | Step 3 |
| User never set up MFA (new user) | Step 4 |
| MFA prompt not appearing | Step 5 |
| User wants to add backup method | Step 6 |
| SSPR (self-service password reset) not working | Step 7 |

---

## Portal Steps (Primary)

### 2. New Phone — Re-Register MFA

1. Go to **https://entra.microsoft.com**
2. **Users → All users** → search and click `[UPN]`
3. **Authentication methods** tab
4. Delete all existing methods:
   - Click each method → **Delete** → confirm
   - Delete: Microsoft Authenticator, phone numbers, and any other methods listed
5. Click **Require re-register multifactor authentication** (if the button is available) — forces re-registration at next login
6. Send the user this link: **https://aka.ms/mfasetup**
7. Walk the user through:
   - Sign in with their credentials
   - Click **Next** on the "More information required" screen
   - Choose **Microsoft Authenticator** → follow prompts to scan QR code on new phone
   - Add phone number as backup (SMS) when prompted
8. Test: sign out and sign back in — MFA prompt should appear and work with new phone

### 3. User Locked Out — Can't Pass MFA

> Use this when a user can't sign in because MFA is blocking them (lost phone, broken authenticator, etc.)

1. Go to **https://entra.microsoft.com**
2. **Users → All users** → click `[UPN]`
3. **Authentication methods** tab → delete ALL registered methods
4. This removes the MFA requirement temporarily — user can sign in with just password
5. Immediately send them to **https://aka.ms/mfasetup** to set up new MFA
6. Do NOT leave them without MFA for more than a few minutes — it's a security gap

> ⚠️ Confirm the user's identity via phone or Teams video before clearing MFA methods.

### 4. New User — Set Up MFA for the First Time

1. Assign the M365 license first (see new-user.md)
2. Go to **https://entra.microsoft.com → Users → All users** → click `[UPN]`
3. **Authentication methods** tab — confirm it's empty (new user, nothing registered)
4. Send the user: **https://aka.ms/mfasetup**
5. Guide them through setup:
   - Sign in with their temp credentials
   - **Next** on the "More information required" screen
   - Add **Microsoft Authenticator** first (download from App Store/Play Store)
   - Add a **Phone (SMS)** as backup
6. Confirm by having them sign in again — MFA prompt should fire and complete successfully

### 5. MFA Prompt Not Appearing

> If a user can sign in with just a password and no MFA prompt shows, check these:

1. Go to **https://entra.microsoft.com**
2. **Identity → Protection → Conditional Access → Policies**
3. Find the MFA policy (usually named something like "Require MFA for all users")
4. Confirm it's **Enabled** and `[UPN]` is in scope (not excluded)
5. Check **Per-user MFA** (legacy): **https://entra.microsoft.com → Users → All users → Per-user MFA** (if enabled in your tenant)
6. Check if the user is in an exclusion group — remove them if they shouldn't be excluded

### 6. Add a Backup MFA Method

1. Have the user go to **https://mysignins.microsoft.com/security-info**
2. Click **+ Add method**
3. Choose method:
   - **Authenticator app** — most secure, recommended primary
   - **Phone** — SMS or call (backup)
   - **Email** — for SSPR only (not MFA)
4. Follow the prompts for the chosen method
5. Test by signing out and back in

### 7. SSPR (Self-Service Password Reset) Not Working

> SSPR lets users reset their own passwords without calling IT.

**Check if SSPR is enabled:**
1. Go to **https://entra.microsoft.com**
2. **Identity → Protection → Password reset**
3. Confirm **Self-service password reset enabled** is set to **All** (or **Selected** and the user is in scope)
4. **Authentication methods** tab — confirm the methods (phone, email, authenticator) are enabled
5. **Registration** tab — confirm **Require users to register when signing in** is **Yes**

**If a user can't use SSPR:**
1. Check they have authentication methods registered at **https://aka.ms/mysecurityinfo**
2. SSPR requires at least 1-2 registered methods depending on your policy
3. If they have no methods registered: an admin must reset the password and then have them register

---

## Quick Reference — MFA Setup Link

Send to the user: **https://aka.ms/mfasetup**
Send to the user (security info management): **https://mysignins.microsoft.com/security-info**

---

## PowerShell (for reference)

### List a User's Registered MFA Methods

```powershell
Connect-MgGraph -Scopes "UserAuthenticationMethod.Read.All"

# List all authentication methods registered for the user
Get-MgUserAuthenticationMethod -UserId "[UPN]" |
    Select-Object Id, AdditionalProperties
# Shows all MFA methods — authenticator app, phone, FIDO2 key, etc.
```

### Delete All MFA Methods (Force Re-Registration)

```powershell
Connect-MgGraph -Scopes "UserAuthenticationMethod.ReadWrite.All"

# Get all methods
$methods = Get-MgUserAuthenticationMethod -UserId "[UPN]"

# Loop through and remove each one (you'll need specific cmdlets per method type)
# Remove Microsoft Authenticator
Get-MgUserAuthenticationMicrosoftAuthenticatorMethod -UserId "[UPN]" |
    ForEach-Object { Remove-MgUserAuthenticationMicrosoftAuthenticatorMethod -UserId "[UPN]" -MicrosoftAuthenticatorAuthenticationMethodId $_.Id }

# Remove phone method
Get-MgUserAuthenticationPhoneMethod -UserId "[UPN]" |
    ForEach-Object { Remove-MgUserAuthenticationPhoneMethod -UserId "[UPN]" -PhoneAuthenticationMethodId $_.Id }

# After clearing, user must re-register at https://aka.ms/mfasetup
```

### Require MFA Re-Registration at Next Login

```powershell
Connect-MgGraph -Scopes "UserAuthenticationMethod.ReadWrite.All"

# Revoke all refresh tokens — forces re-authentication
Revoke-MgUserSignInSession -UserId "[UPN]"
# User will be signed out everywhere and must re-authenticate + re-register MFA
```
