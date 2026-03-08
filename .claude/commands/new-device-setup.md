# New Windows Device Setup — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[DEVICE_NAME]` — device name per naming convention:
  - Desktop: `DT-FirstName,LastName` (e.g. `DT-John,Smith`)
  - Laptop: `LT-FirstName,LastName` (e.g. `LT-Jane,Doe`)
- `[UPN]` — primary user's UPN (e.g. jsmith@familybridges.org)
- `[SERIAL]` — device serial number (for Autopilot registration)

---

## Route A: Autopilot Device (Pre-registered in Intune)

> Use this if the device was purchased through a Microsoft partner or has already been registered in Autopilot.

### Portal Steps (Primary)

**Before handing the device to the user — register it (if not already done):**

1. Go to **https://intune.microsoft.com**
2. **Devices → Enrollment → Windows enrollment → Windows Autopilot devices**
3. Confirm the device's serial number `[SERIAL]` appears in the list
4. If not: click **Import** → upload a CSV with the hardware hash (get this from the vendor)

**Assign the user:**
1. In Autopilot devices: click the device → **Assign user**
2. Search for `[UPN]` → **Select**
3. This pre-assigns the device so the user's name appears on the OOBE screen

**Assign Autopilot profile:**
1. **Devices → Enrollment → Windows enrollment → Deployment profiles**
2. Confirm a profile is assigned to the device's group
3. Profile should set: Join type = Entra ID joined, user account type = Standard User

**Hand off to user — OOBE steps (user does this):**
1. Power on the device
2. Select region and keyboard → connect to Wi-Fi
3. Sign in with `[UPN]` and M365 password when prompted
4. Complete MFA if prompted
5. Device auto-enrolls into Intune, applies policies, installs apps (~30-60 min)
6. Device name is set automatically from Autopilot profile (if configured)

---

## Route B: Standard New Device Setup (No Autopilot)

### Portal Steps (Primary)

**Step 1: OOBE — Initial Windows Setup**
1. Power on the device → select **Country/Region: United States** → **Keyboard: US**
2. Connect to Wi-Fi
3. When prompted **"How would you like to set up?"** → select **Set up for work or school**
4. Sign in with `[UPN]` and the user's M365 password
5. Complete MFA when prompted
6. Windows joins Entra ID and Intune enrollment begins automatically

**Step 2: Rename the Device**
1. After reaching the desktop: right-click **Start → System**
2. Click **Rename this PC** → enter `[DEVICE_NAME]` (e.g. DT-John,Smith)
3. Click **Next → Restart now**
4. After restart, confirm the name stuck: right-click **Start → System** → check **Device name**

**Step 3: Verify Intune Enrollment**
1. After restart: go to **Settings → Accounts → Access work or school**
2. Confirm `[UPN]` is listed and connected
3. Click the account → **Info** → confirm it shows **Managed by familybridges.org**
4. In Intune portal: **https://intune.microsoft.com → Devices → All devices**
5. Search for `[DEVICE_NAME]` → confirm it appears and shows **Enrollment date**

**Step 4: Trigger Policy Sync**
1. On the device: **Settings → Accounts → Access work or school**
2. Click the account → **Info → Sync**
3. This forces Intune to push all policies and apps immediately
4. In Intune portal: find the device → click **Sync** button at the top

**Step 5: Install Apps**
1. On the device: open **Company Portal** app (should be installed via Intune)
2. Apps assigned to the user will appear here — install any that haven't auto-installed
3. Check back after 30-60 min for all apps to fully deploy

**Step 6: Configure User Preferences**
1. Have the user sign into **Outlook** — it will auto-configure their Exchange account
2. Have the user sign into **Teams** — confirms Teams is working
3. Verify **OneDrive** is syncing: click the cloud icon in the taskbar → sign in with `[UPN]`
4. Test printing if the user needs a printer (see printer-issue.md)

**Step 7: Verify in Intune**
1. Go to **https://intune.microsoft.com → Devices → All devices**
2. Find `[DEVICE_NAME]`
3. Check:
   - **Compliance status** — should be **Compliant**
   - **Last check-in** — should be recent
   - **Primary user** — should show `[UPN]`
4. If not compliant: click the device → **Device compliance** → see which policy is failing

---

## Checklist — New Device Setup

- [ ] Device renamed to `[DEVICE_NAME]` (DT- or LT- convention)
- [ ] Signed in with `[UPN]` — Entra ID joined
- [ ] Intune enrollment confirmed — device appears in portal
- [ ] Device compliance = Compliant
- [ ] Policies synced (clicked Sync in portal)
- [ ] Apps installed via Company Portal
- [ ] Outlook configured and syncing
- [ ] Teams signed in and working
- [ ] OneDrive syncing
- [ ] Printer added if needed
- [ ] User can access their files and M365 apps

---

## PowerShell (for reference)

### Rename Device via PowerShell

```powershell
# Run on the device (with admin rights)
Rename-Computer -NewName "[DEVICE_NAME]" -Restart
# Renames the device and immediately restarts to apply the change
```

### Force Intune Sync via PowerShell

```powershell
# Trigger an Intune management sync on the local device
Start-Process "C:\Windows\system32\DeviceEnroller.exe" -ArgumentList "/o /c /d"
# Sends a sync request to Intune — same as clicking Sync in Settings
```

### Check Entra ID Join Status

```powershell
# Confirm the device is Entra ID joined and who it's joined as
dsregcmd /status
# Look for:
# AzureAdJoined: YES — device is joined to Entra ID
# TenantName: familybridges.org — correct tenant
# UserEmail: [UPN] — the signed-in user
```

### Register Device in Autopilot from Existing Device

```powershell
# Run on the device to get the hardware hash for Autopilot registration
Install-Script -Name Get-WindowsAutoPilotInfo -Force
Get-WindowsAutoPilotInfo -OutputFile "C:\Temp\AutopilotHash.csv"
# Generates a CSV with the hardware hash — import this into Intune Autopilot
```
