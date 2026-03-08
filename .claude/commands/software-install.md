# Software Deployment & Installation — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[APP_NAME]` — name of the application (e.g. Adobe Acrobat, Zoom)
- `[UPN]` — user's UPN who needs the app
- `[DEVICE_NAME]` — device name in Intune (e.g. DT-John,Smith)
- `[GROUP_NAME]` — Entra ID group to assign the app to

---

## Route A: Deploy App via Intune (Managed Install — Preferred)

### Portal Steps (Primary)

**Step 1: Check if the app is already in Intune**
1. Go to **https://intune.microsoft.com**
2. **Apps → All apps**
3. Search for `[APP_NAME]`
4. If found: skip to Step 3 (assign it)
5. If not found: continue to Step 2 (add it)

**Step 2: Add the App to Intune**

*For Microsoft Store apps:*
1. **Apps → All apps → Add**
2. App type: **Microsoft Store app (new)**
3. Search for `[APP_NAME]` → select it → **Select**
4. Fill in name, description → **Next**
5. Assignments: assign to a group or device → **Next → Create**

*For Win32 apps (.exe or .msi):*
1. Package the app as a `.intunewin` file using the **Microsoft Win32 Content Prep Tool**
2. **Apps → All apps → Add → Windows app (Win32)**
3. Upload the `.intunewin` file
4. Configure install/uninstall commands, detection rules → **Next**
5. Assignments → **Next → Create**

*For Microsoft 365 Apps (Word, Excel, etc.):*
1. **Apps → All apps → Add → Microsoft 365 Apps → Windows 10 and later**
2. Configure the suite (which apps to include) → **Next**
3. Assign to a group → **Create**

**Step 3: Assign the App to a User or Device**
1. In **Apps → All apps** → click `[APP_NAME]`
2. Click **Properties → Assignments → Edit**
3. Under **Required** (auto-installs) or **Available for enrolled devices** (user chooses):
   - Click **Add group** → search for `[GROUP_NAME]` → **Select**
   - Or click **Add all users** / **Add all devices** if org-wide
4. **Review + save**

**Step 4: Verify Deployment**
1. Go to **https://intune.microsoft.com → Apps → All apps → [APP_NAME]**
2. Click **Device install status** — see status per device
3. Click **User install status** — see status per user
4. Status meanings:
   - **Installed** — done
   - **Pending** — waiting for device to check in
   - **Failed** — check the error code, may need to sync device
5. If pending: go to the device in Intune → click **Sync** to force a check-in

---

## Route B: Company Portal (User Self-Install)

> Use this when the app is deployed as "Available" (not Required) and the user installs it themselves.

1. On the user's device, open **Company Portal** (should be installed — if not, search the Microsoft Store)
2. Browse or search for `[APP_NAME]`
3. Click the app → **Install**
4. App installs in the background — may take 5-15 minutes
5. If the app doesn't appear in Company Portal: confirm it's been assigned to the user's group (Step 3 above)

---

## Route C: Manual Install (No Intune / Emergency Fallback)

> Use this only when Intune isn't an option — new device not enrolled, urgent need, or app not in Intune.

1. Download the installer from the official vendor website
2. Right-click the installer → **Run as administrator**
3. Follow the install wizard
4. After install: confirm the app works and sign in if needed
5. Plan to add it to Intune afterward so future deployments are managed

---

## Uninstall an App via Intune

1. Go to **https://intune.microsoft.com → Apps → All apps → [APP_NAME]**
2. **Properties → Assignments → Edit**
3. Change the assignment from **Required/Available** to **Uninstall**
4. Add the group or device → **Save**
5. Device will receive the uninstall command on next Intune sync

---

## Common Issues

| Issue | Fix |
|---|---|
| App not showing in Company Portal | Check assignment — confirm user/device is in the assigned group |
| App stuck "Installing" | Sync the device: Intune → device → Sync |
| App install failed | Check error code in Device install status, check install command |
| App not deploying to one device | Check device compliance — non-compliant devices may not receive apps |
| Win32 app fails silently | Check detection rule — app may be installed but Intune can't detect it |

---

## PowerShell (for reference)

### Check App Install Status for a Device

```powershell
Connect-MgGraph -Scopes "DeviceManagementApps.Read.All"

# Get all apps and their install status for a specific device
$device = Get-MgDeviceManagementManagedDevice -Filter "deviceName eq '[DEVICE_NAME]'"
Get-MgDeviceManagementManagedDeviceDetectedApp -ManagedDeviceId $device.Id |
    Select-Object DisplayName, Version | Sort-Object DisplayName
# Lists all detected installed apps on the device
```

### Trigger Intune Sync to Push Apps

```powershell
Connect-MgGraph -Scopes "DeviceManagementManagedDevices.PrivilegedOperations.All"

# Find the device and trigger a sync
$device = Get-MgDeviceManagementManagedDevice -Filter "deviceName eq '[DEVICE_NAME]'"
Invoke-MgSyncDeviceManagementManagedDevice -ManagedDeviceId $device.Id
# Forces the device to check in with Intune and pull pending app installs
```

### Install an App Silently on a Local Machine

```powershell
# For MSI installers — silent install with no reboot prompt
Start-Process msiexec.exe -ArgumentList "/i C:\Temp\[APP_NAME].msi /quiet /norestart" -Wait
# /quiet = no UI, /norestart = don't auto-reboot after install

# For EXE installers — silent flags vary by vendor (check vendor docs)
Start-Process "C:\Temp\[APP_NAME].exe" -ArgumentList "/S /silent /quiet" -Wait
# /S or /silent = common silent install flags — verify with the specific app's documentation
```
