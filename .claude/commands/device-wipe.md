# Device Wipe / Retire — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[DEVICE_NAME]` — device name in Intune (e.g. DT-John,Smith or LT-Jane,Doe)
- `[USER_UPN]` — primary user's UPN associated with the device
- `[DEVICE_ID]` — Intune device ID (found in device properties)

> ⚠️ **Full Wipe is irreversible.** All data on the device is permanently erased. Confirm with the manager before proceeding.

---

## Wipe Type Decision Guide

| Scenario | Wipe Type | What It Does |
|---|---|---|
| Employee departure, company-owned device | **Full Wipe** | Factory resets the device, removes everything |
| Employee departure, personal BYOD device | **Retire** | Removes company data/apps only, personal data stays |
| Reassigning device to a new user | **Full Wipe** | Clean slate for the next user |
| Device lost or stolen (company-owned) | **Full Wipe** | Remotely erases all data |
| Device lost or stolen (BYOD) | **Retire** | Removes company data, protects personal data |
| Windows PC, keep OS, remove company config | **Fresh Start** | Reinstalls Windows, removes company apps |

---

## Portal Steps (Primary)

### Step 1: Find the Device in Intune

1. Go to **https://intune.microsoft.com**
2. **Devices → All devices**
3. Search by device name: `[DEVICE_NAME]` — or filter by user: `[USER_UPN]`
4. Click the device to open its details
5. Note the device's **Compliance status** and **Last check-in** time before wiping

### Step 2A: Full Wipe (Company-Owned Device)

> ⚠️ This erases all data. No recovery possible after completion.

1. In the device detail page, click **Wipe** in the top action bar
2. A confirmation panel appears — review the options:
   - **Wipe device and continue to enroll even if device loses power** — check this for persistent wipe
   - Leave other options unchecked unless device is being decommissioned
3. Click **Wipe** to confirm
4. Device status changes to **Wipe pending** → then **Wiped** after the device connects
5. If the device is offline, the wipe command queues until it comes online (connects to internet or cellular)

### Step 2B: Retire (BYOD / Personal Device)

1. In the device detail page, click **Retire** in the top action bar
2. Confirm the action
3. Device receives the retire command → company apps, email profiles, and policies are removed
4. Personal apps, photos, and data remain untouched

### Step 2C: Fresh Start (Windows PC — Reinstall Windows cleanly)

1. In the device detail page, click **Fresh Start** in the top action bar
2. Choose whether to **Retain user data on this device** (check the box to keep personal files)
3. Confirm → Windows is reinstalled, all apps removed, Intune re-enrollment begins automatically if the device is Entra-joined

### Step 3: Delete the Device from Intune (After Wipe)

1. After the wipe completes, go back to the device in **Intune → Devices → All devices**
2. Select the device → click **Delete**
3. Confirm — removes it from Intune inventory
4. If it's being reassigned, skip deletion and let the new user enroll it fresh

### Step 4: Remove Device from Entra ID

1. Go to **https://entra.microsoft.com**
2. **Devices → All devices**
3. Search for `[DEVICE_NAME]`
4. Select the device → click **Delete** → confirm
5. Removes the device's Azure AD registration — cleans up identity records

### Step 5: Remove from Autopilot (if applicable)

> Only needed if the device was enrolled via Windows Autopilot and is being decommissioned permanently.

1. Go to **https://intune.microsoft.com**
2. **Devices → Enrollment → Windows enrollment → Windows Autopilot devices**
3. Search for the device by serial number
4. Select → **Delete** → confirm

### Step 6: Verify Completion

- [ ] Device shows **Wiped** or **Retired** status in Intune
- [ ] Device deleted from Intune inventory (if decommissioned)
- [ ] Device deleted from Entra ID devices
- [ ] Autopilot record removed (if applicable)
- [ ] New user enrollment confirmed (if reassigning)

---

## PowerShell (for reference)

### Trigger Full Wipe via Graph API
```powershell
Connect-MgGraph -Scopes "DeviceManagementManagedDevices.PrivilegedOperations.All"

# Get the Intune device ID by device name
$device = Get-MgDeviceManagementManagedDevice -Filter "deviceName eq '[DEVICE_NAME]'"

# Send the wipe command
Invoke-MgWipeManagedDevice -ManagedDeviceId $device.Id
# Sends a full factory reset command to the device
```

### Trigger Retire via Graph API
```powershell
Connect-MgGraph -Scopes "DeviceManagementManagedDevices.PrivilegedOperations.All"

$device = Get-MgDeviceManagementManagedDevice -Filter "deviceName eq '[DEVICE_NAME]'"

# Retire removes company data only (good for BYOD)
Invoke-MgRetireManagedDevice -ManagedDeviceId $device.Id
```

### Delete Device from Intune
```powershell
# Get device
$device = Get-MgDeviceManagementManagedDevice -Filter "deviceName eq '[DEVICE_NAME]'"

# Delete from Intune
Remove-MgDeviceManagementManagedDevice -ManagedDeviceId $device.Id
# Permanently removes the device record from Intune
```

### Delete Device from Entra ID
```powershell
Connect-MgGraph -Scopes "Device.ReadWrite.All"

# Find the device
$device = Get-MgDevice -Filter "displayName eq '[DEVICE_NAME]'"

# Delete the Entra ID registration
Remove-MgDevice -DeviceId $device.Id
# Removes the Azure AD device object
```
