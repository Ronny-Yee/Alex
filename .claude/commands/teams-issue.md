# Microsoft Teams Troubleshooting — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[UPN]` — affected user's UPN (e.g. jsmith@familybridges.org)
- `[DEVICE_NAME]` — user's computer name (e.g. DT-John,Smith)
- `[TEAM_NAME]` — name of the Team the user can't access
- `[MEETING_ID]` — Teams meeting ID if troubleshooting a specific meeting

---

## Step 1: Check Microsoft Service Health

1. Go to **https://admin.microsoft.com**
2. **Health → Service health**
3. Look for any active incidents under **Microsoft Teams**
4. If there's an active outage → wait for Microsoft to resolve. Nothing to do on our end.

---

## Portal Steps (Primary)

### 2. Teams Crashes or Won't Open

1. On the user's device, fully quit Teams: **right-click Teams in taskbar → Quit**
2. Press **Win + R** → type `%appdata%\Microsoft\Teams` → Enter
3. Delete the **Cache** folder (or rename it to Cache_old)
4. Relaunch Teams — this clears the app cache (common fix for crashes and loading issues)
5. If still crashing: try **Teams Web App** at **https://teams.microsoft.com** to confirm it's a local app issue

### 3. Teams Audio/Video Issues (Calls/Meetings)

1. In Teams: click your **profile picture → Settings → Devices**
2. Under **Audio devices**: confirm the correct microphone and speaker are selected
3. Under **Camera**: confirm the correct camera is selected
4. Click **Make a test call** — tests mic, speaker, and camera end-to-end
5. If device isn't showing: check Windows permissions:
   - **Start → Settings → Privacy & security → Microphone** → Teams should be allowed
   - **Start → Settings → Privacy & security → Camera** → Teams should be allowed
6. Try an audio call first (no video) to isolate whether it's audio or video

### 4. Screen Share Not Working

1. Confirm the meeting or call is active first
2. Click the **Share content** button (box with up arrow) in the meeting toolbar
3. If screen share button is grayed out: check Teams meeting policy (Step 8)
4. If it works but recipient can't see: ask them to check their internet connection
5. Check Windows permissions: **Settings → Privacy & security → Screen capture** — Teams must be allowed
6. Try sharing a specific window instead of full screen (sometimes more reliable)

### 5. Can't Access a Team or Channel

1. Go to **https://teams.microsoft.com** → search for `[TEAM_NAME]`
2. If the Team doesn't appear: the user may not be a member
3. Check membership:
   - Go to **https://admin.microsoft.com → Teams → Manage teams**
   - Search for `[TEAM_NAME]` → click it → **Members tab**
   - Check if `[UPN]` is listed — add them if missing
4. If Team is private: an owner must add the user

### 6. Teams Sign-In Issues

1. Quit Teams completely
2. Clear credentials: **Control Panel → Credential Manager → Windows Credentials**
3. Remove any stored Teams or Microsoft Office credentials
4. Reopen Teams and sign in fresh
5. If getting MFA errors: check MFA methods in Entra ID (see mfa-issue.md)
6. If Conditional Access is blocking: check sign-in logs in Entra ID

### 7. Teams Notifications Not Working

1. In Teams: **Profile → Settings → Notifications**
2. Confirm notifications are **On** for the relevant channels and activities
3. Check Windows notifications: **Settings → System → Notifications → Microsoft Teams** — must be enabled
4. Check **Do Not Disturb** is not active in Windows (Focus Assist)
5. Confirm Teams is running in the background (taskbar tray)

---

## Teams Admin Center — Policy Checks

### 8. Check Teams Policies for a User

1. Go to **https://admin.teams.microsoft.com**
2. **Users → Manage users** → search `[UPN]`
3. Click the user → **Policies** tab
4. Review assigned policies:
   - **Meeting policy** — controls screen share, recording, etc.
   - **Calling policy** — controls call features
   - **Messaging policy** — controls chat features
5. If a feature is missing, the policy may be restricting it

### 9. Check Meeting Settings

1. **https://admin.teams.microsoft.com → Meetings → Meeting policies**
2. Open the policy assigned to `[UPN]`
3. Check:
   - **Screen sharing mode** — should be **Entire screen** or **Single application**
   - **Allow cloud recording** — on or off
   - **Who can bypass the lobby** — if users are stuck waiting, check this setting
4. To change: edit the policy → save → changes apply within a few minutes

### 10. Check Calling Policies

1. **https://admin.teams.microsoft.com → Voice → Calling policies**
2. Open the policy assigned to `[UPN]`
3. Confirm **Make private calls** is enabled if the user needs calling
4. Check voicemail settings if user isn't getting voicemails

---

## Quick Reference: Common Teams Issues

| Issue | First Fix |
|---|---|
| Teams won't open | Clear cache (%appdata%\Microsoft\Teams\Cache) |
| Frozen/loading forever | Clear cache, try web app |
| No audio in meeting | Check device settings in Teams, Windows mic permissions |
| Camera not showing | Check Windows camera privacy settings |
| Screen share greyed out | Check meeting policy in Teams admin center |
| Can't find a Team | Check membership, private team |
| Notifications missing | Check Teams settings + Windows notification settings |

---

## PowerShell (for reference)

### Clear Teams Cache via PowerShell

```powershell
# Quit Teams first, then clear the cache
Stop-Process -Name Teams -Force -ErrorAction SilentlyContinue
# Force-quits Teams if it's running

$cacheFolder = "$env:APPDATA\Microsoft\Teams\Cache"
Remove-Item -Path $cacheFolder -Recurse -Force
# Deletes the local cache — Teams will rebuild it on next launch
```

### Check Teams License Assignment

```powershell
Connect-MgGraph -Scopes "User.Read.All"

# Get user's license details — look for Teams in the service plans
$user = Get-MgUser -UserId "[UPN]" -Property AssignedLicenses, DisplayName
$user.AssignedLicenses
# If no licenses are listed, Teams won't work — assign M365 Business Premium
```

### Assign Teams Policy via PowerShell

```powershell
# Connect to Teams PowerShell module
Connect-MicrosoftTeams

# Assign a meeting policy to a user
Grant-CsTeamsMeetingPolicy -Identity "[UPN]" -PolicyName "AllOn"
# Assigns the AllOn meeting policy — replace with your org's policy name
```
