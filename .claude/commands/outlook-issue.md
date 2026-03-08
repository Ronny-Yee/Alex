# Outlook Troubleshooting — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[UPN]` — affected user's UPN (e.g. jsmith@familybridges.org)
- `[DEVICE_NAME]` — user's computer (e.g. DT-John,Smith)
- `[SHARED_MAILBOX]` — shared mailbox address if applicable
- `[PROFILE_NAME]` — Outlook profile name (usually the user's name)

---

## Step 1: Triage

| Symptom | Go to |
|---|---|
| Outlook crashes on open | Step 2 (Safe Mode / Repair) |
| Not syncing / stuck | Step 3 (Sync Issues) |
| Keeps prompting for password | Step 4 (Credential Issues) |
| Shared mailbox not showing | Step 5 (Shared Mailbox) |
| Calendar issues | Step 6 (Calendar) |
| Profile corrupt | Step 7 (Rebuild Profile) |

---

## Portal Steps (Primary)

### 2. Outlook Crashes or Won't Open

**Try Safe Mode first:**
1. Press **Win + R** → type `outlook.exe /safe` → Enter
2. If Outlook opens in safe mode → add-in is causing the crash
3. Go to **File → Options → Add-ins → COM Add-ins → Go**
4. Uncheck all add-ins → **OK** → restart Outlook normally
5. Re-enable add-ins one at a time to find the culprit

**If Safe Mode also crashes — run a repair:**
1. Go to **Control Panel → Programs → Programs and Features**
2. Find **Microsoft 365 Apps** or **Microsoft Office**
3. Right-click → **Change**
4. Select **Quick Repair** → **Repair** (takes ~5 min, no internet needed)
5. If Quick Repair doesn't fix it: repeat and choose **Online Repair** (takes longer, needs internet)

### 3. Outlook Not Syncing / Stuck

1. Check the bottom status bar in Outlook — it should say **Connected to: Microsoft Exchange**
2. If it says **Disconnected** or **Trying to connect**:
   - Check internet connectivity first (can they browse the web?)
   - Go to **Send/Receive → Update Folder** to force a sync
3. Check **File → Office Account** — confirm the user is signed into the right account (`[UPN]`)
4. Try removing and re-adding the account:
   - **File → Account Settings → Account Settings**
   - Select the account → **Remove**
   - **Add account** → enter `[UPN]` → sign in

### 4. Outlook Keeps Prompting for Password

1. Open **Control Panel → Credential Manager → Windows Credentials**
2. Expand any entries for **MicrosoftOffice**, **Microsoft**, or `[UPN]`
3. Click **Remove** on each one
4. Restart Outlook → sign in fresh when prompted
5. If it keeps prompting: check if MFA is required and the user hasn't completed MFA setup (see mfa-issue.md)
6. Check Entra ID sign-in logs: **https://entra.microsoft.com → Users → [UPN] → Sign-in logs** — look for failures

### 5. Shared Mailbox Not Showing in Outlook

**Option A: Add it manually in Outlook**
1. In Outlook: right-click **Folders** in the left panel → **Add Shared Folder**
2. Enter `[SHARED_MAILBOX]` → **OK**
3. It appears under the user's mailbox in the folder list

**Option B: Verify access is granted**
1. Go to **https://admin.microsoft.com → Exchange → Recipients → Shared mailboxes**
2. Click `[SHARED_MAILBOX]` → **Mailbox delegation**
3. Under **Full Access** — confirm `[UPN]` is listed
4. If not: click **Edit** → add `[UPN]` → **Save**
5. Wait 30-60 minutes for the mailbox to auto-map in Outlook

**Option C: Auto-mapping not working**
1. Auto-mapping is on by default — if it's not appearing after 60 min, remove and re-grant access via PowerShell (see below)

### 6. Calendar Issues

**Can't see someone's calendar:**
1. In Outlook: **Home → Open Calendar → Open Shared Calendar**
2. Enter the person's name → **OK**
3. If access is denied: the owner needs to share it — right-click their calendar → **Sharing permissions** → add you

**Meetings not showing / calendar sync:**
1. Go to **Send/Receive → Send/Receive All Folders**
2. If still wrong: close Outlook, delete the OST cache file:
   - Press **Win + R** → `%localappdata%\Microsoft\Outlook`
   - Delete the `.ost` file for `[UPN]`
   - Reopen Outlook — it rebuilds the cache from the server (takes a few minutes)

**Room/resource calendar not working:**
- Confirm the room mailbox exists in Exchange: **https://admin.microsoft.com → Exchange → Resources**
- Confirm the user has permission to book it

### 7. Rebuild Outlook Profile (Last Resort)

1. Close Outlook completely
2. Press **Win + R** → type `control mlcfg32.cpl` → Enter
3. Select `[PROFILE_NAME]` → **Remove** → confirm
4. Click **Add** → name the new profile → **OK**
5. Enter `[UPN]` → let Outlook auto-configure
6. Set as default profile → **Apply → OK**
7. Open Outlook — it will rebuild from scratch

---

## PowerShell (for reference)

### Re-Grant Shared Mailbox Access with Auto-Mapping

```powershell
Connect-ExchangeOnline

# Remove existing permission first (to reset auto-mapping)
Remove-MailboxPermission -Identity "[SHARED_MAILBOX]" -User "[UPN]" -AccessRights FullAccess -Confirm:$false

# Re-grant with auto-mapping on
Add-MailboxPermission -Identity "[SHARED_MAILBOX]" -User "[UPN]" -AccessRights FullAccess -AutoMapping $true
# AutoMapping:$true makes the shared mailbox appear automatically in Outlook
```

### Check Mailbox Sync Status

```powershell
Connect-ExchangeOnline

# Check mailbox size and item count
Get-MailboxStatistics -Identity "[UPN]" |
    Select-Object DisplayName, TotalItemSize, ItemCount, LastLogonTime
# Shows mailbox size and last activity — large mailbox can cause slow sync
```

### Delete OST File Remotely (Clears Local Cache)

```powershell
# Run on the affected machine or via remote session
$ostPath = "$env:LOCALAPPDATA\Microsoft\Outlook"
Get-ChildItem -Path $ostPath -Filter "*.ost" | Remove-Item -Force
# Deletes the local Outlook cache — Outlook will rebuild it on next open
# ⚠️ Make sure Outlook is closed before running this
```
