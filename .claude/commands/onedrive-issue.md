# OneDrive Troubleshooting — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[UPN]` — affected user's UPN (e.g. jsmith@familybridges.org)
- `[DEVICE_NAME]` — user's computer name

---

## Step 1: Triage

| Symptom | Go to |
|---|---|
| Sync paused or stuck | Step 2 (Sync Issues) |
| Red X on files/folders | Step 3 (Sync Errors) |
| Storage full warning | Step 4 (Storage) |
| OneDrive not signed in | Step 5 (Sign-In) |
| Files not available offline | Step 6 (Files On-Demand) |
| Reset needed | Step 7 (Reset OneDrive) |

---

## Portal Steps (Primary)

### 2. Sync Paused or Stuck

1. Click the **OneDrive cloud icon** in the system tray (bottom-right taskbar)
2. Check the status message:
   - **"Sync is paused"** → click **Resume syncing**
   - **"Syncing X files"** stuck for a long time → a file may be locked or open
3. Close any Office files that are currently open (Word, Excel, etc.) — open files can block sync
4. Click the cloud icon → **Pause syncing** → wait 5 seconds → **Resume syncing**
5. Check if any file has a red X and address it (Step 3)

### 3. Red X / Sync Errors on Files

1. Click the **OneDrive icon** in the taskbar → click the error notification or **View sync problems**
2. Note the file(s) causing the issue and the error message
3. Common causes and fixes:

| Error | Fix |
|---|---|
| File name too long | Shorten the file or folder name (max ~260 chars total path) |
| Invalid characters | Remove characters: `< > : " / \ | ? *` from the file name |
| File locked by another app | Close the app using the file, then sync |
| File too large | OneDrive max single file size is 250 GB — break it up if over |
| Permission denied | Check file permissions, or move to a different folder |

4. After fixing: the file should sync automatically within a minute

### 4. Storage Full

1. Click the **OneDrive icon** → click your storage indicator (shows GB used)
2. This opens OneDrive on the web at **https://onedrive.live.com** or **https://[UPN's org domain]**
3. Check storage usage — M365 Business Premium includes 1 TB per user

**Check storage in Admin Center:**
1. Go to **https://admin.microsoft.com → Users → Active users**
2. Click `[UPN]` → **OneDrive** tab
3. See current usage and quota
4. If near limit: user should move files to SharePoint (shared storage) or delete unneeded files

**Free up space on the device:**
1. Click the **OneDrive icon** → **Settings (gear) → Settings → Account → Choose folders**
2. Uncheck large folders the user doesn't need locally — they stay in the cloud (Files On-Demand)

### 5. OneDrive Not Signed In / Account Issue

1. Click the **OneDrive icon** in the taskbar
2. If it prompts to sign in or shows "Sign in to sync files": click **Sign in**
3. Enter `[UPN]` → follow the sign-in prompts (MFA may be required)
4. If already signed into the wrong account:
   - Click **OneDrive icon → Settings (gear) → Settings → Account → Unlink this PC**
   - Sign in with the correct account `[UPN]`

### 6. Files On-Demand (Files Not Available Offline)

> Files On-Demand lets files exist in the cloud without taking local disk space. The status icon tells you what's happening.

| Icon | Meaning |
|---|---|
| Cloud outline | Online-only — only in cloud, not on device |
| Green checkmark | Locally available — downloaded and accessible offline |
| Solid green checkmark | Always keep on device |

**To make a file always available offline:**
1. Right-click the file in File Explorer
2. Click **Always keep on this device**

**To free space (move back to cloud-only):**
1. Right-click the file → **Free up space**

**If Files On-Demand is disabled and taking too much disk space:**
1. Click **OneDrive icon → Settings → Settings → Advanced settings**
2. Under **Files On-Demand**: click **Free up disk space**

### 7. Reset OneDrive (Last Resort)

> Use this if sync is completely broken and nothing else works. OneDrive re-syncs everything from the cloud after reset — no data is lost.

1. Close all Office apps and OneDrive
2. Press **Win + R** → paste: `%localappdata%\Microsoft\OneDrive\onedrive.exe /reset` → Enter
3. Wait 30 seconds
4. Press **Win + R** → paste: `%localappdata%\Microsoft\OneDrive\onedrive.exe` → Enter (restarts OneDrive)
5. Sign back in with `[UPN]` if prompted
6. OneDrive will re-sync — this may take time depending on file count

---

## Admin Steps — OneDrive Settings in Admin Center

### View/Manage a User's OneDrive

1. Go to **https://admin.microsoft.com → Users → Active users**
2. Click `[UPN]` → **OneDrive** tab
3. Click **Create link to files** — generates a share link you can use to access their files
4. Use this for: transferring files when offboarding, or accessing files when user is out

### Set OneDrive Storage Quota

1. Go to **https://admin.microsoft.com → SharePoint admin center → User profiles** (or use PowerShell)
2. Alternatively: **https://[tenant]-admin.sharepoint.com → More features → User profiles → Manage User Profiles**
3. Search for `[UPN]` → **Edit My Profile → Storage quota**

---

## PowerShell (for reference)

### Reset OneDrive via PowerShell

```powershell
# Close OneDrive, reset it, then relaunch
Stop-Process -Name OneDrive -Force -ErrorAction SilentlyContinue
# Force-closes OneDrive

Start-Process "$env:LOCALAPPDATA\Microsoft\OneDrive\onedrive.exe" -ArgumentList "/reset"
# Sends the reset command

Start-Sleep -Seconds 30

Start-Process "$env:LOCALAPPDATA\Microsoft\OneDrive\onedrive.exe"
# Relaunches OneDrive — it will re-sync from scratch
```

### Check OneDrive Storage for a User

```powershell
Connect-SPOService -Url "https://familybridges-admin.sharepoint.com"

# Get OneDrive usage for a specific user
Get-SPOSite -IncludePersonalSite $true -Filter "Owner -eq '[UPN]'" |
    Select-Object Url, StorageUsageCurrent, StorageQuota
# StorageUsageCurrent = MB used, StorageQuota = MB allowed
```

### Set OneDrive Storage Quota

```powershell
Connect-SPOService -Url "https://familybridges-admin.sharepoint.com"

# Set quota to 2048 MB (2 GB) with a warning at 1792 MB
Set-SPOSite -Identity "https://familybridges-my.sharepoint.com/personal/[UPN_with_underscores]" `
    -StorageQuota 2048 -StorageQuotaWarningLevel 1792
# Replace [UPN_with_underscores] with the UPN where @ and . are replaced by underscores
# e.g. jsmith_familybridges_org
```
