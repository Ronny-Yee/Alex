# Entra Connect (AD Sync) — Troubleshooting & Management — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[SYNC_SERVER]` — hostname of the server running Entra Connect (ask senior IT if unsure)
- `[UPN]` — user's UPN (e.g. jsmith@familybridges.org)
- `[USERNAME]` — on-prem AD username (without @domain)

---

> ⚠️ Entra Connect runs on a specific server on-prem. All steps below require either RDP access to that server or admin credentials. Ask senior IT for the server name if you don't have it.

---

## Portal Steps (Primary)

### 1. Check Sync Status in Entra ID

1. Go to **https://entra.microsoft.com**
2. **Identity → Overview** — look for **Entra Connect** status on the dashboard
3. Or go to: **Identity → Hybrid management → Microsoft Entra Connect**
4. Check:
   - **Sync status** — Enabled/Disabled
   - **Last sync** timestamp — if it's more than 3 hours ago, sync may have stopped
   - **Health status** — green = healthy, red/orange = error

### 2. Check Sync Health in Detail

1. Go to **https://entra.microsoft.com**
2. **Identity → Hybrid management → Microsoft Entra Connect → Connect Health**
3. Look at the **Sync errors** section — lists any objects that failed to sync
4. Common errors shown here:
   - **AttributeValueMustBeUnique** — duplicate UPN or ProxyAddress
   - **ObjectTypeMismatch** — object type conflict between on-prem and cloud
   - **InvalidSoftMatch** — matching conflict during initial sync
5. Click an error to see which object is affected

### 3. Force a Delta Sync (Most Common Fix)

> A delta sync pushes only objects that changed since the last sync. This is the safe everyday sync.

1. RDP into `[SYNC_SERVER]`
2. Open **PowerShell as Administrator**
3. Run the force sync command (see PowerShell section)
4. Wait 2-5 minutes
5. Go back to **Entra ID → Hybrid management → Entra Connect** and check **Last sync** timestamp updated

### 4. Check If a Specific User Synced

1. Go to **https://entra.microsoft.com → Users → All users**
2. Search for `[UPN]`
3. Click the user → **Properties** tab
4. Look at **On-premises sync enabled** — should say **Yes**
5. If it says **No** or the user doesn't appear at all, the sync hasn't pushed them yet
6. Verify the on-prem account exists in AD and is in an OU that's included in sync scope

### 5. Verify OU is In Sync Scope

> Not all OUs are synced — only OUs explicitly included during Entra Connect setup.

1. RDP into `[SYNC_SERVER]`
2. Open **Entra Connect wizard** (Synchronization Service or AAD Connect icon)
3. Go through to **Customize synchronization options → Domain and OU filtering**
4. Confirm the OU where `[USERNAME]` lives is checked/included
5. If it's unchecked: add it → save → run a full sync (see PowerShell section)

### 6. Password Sync — Check If Passwords Are Syncing

1. Go to **https://entra.microsoft.com → Identity → Hybrid management → Entra Connect**
2. Confirm **Password hash synchronization** shows as **Enabled**
3. If disabled: this means on-prem password changes won't flow to M365
4. To re-enable: RDP to `[SYNC_SERVER]` → open Entra Connect → reconfigure features

---

## Common Sync Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| User not appearing in Entra | OU not in sync scope, or new user | Check OU filter, force delta sync |
| Duplicate attribute error | UPN or email already exists | Fix the duplicate in AD, re-sync |
| Sync stopped (>3 hours old) | Service crashed, credentials expired | Restart sync service on `[SYNC_SERVER]` |
| Password changes not syncing | Password hash sync disabled | Re-enable in Entra Connect config |
| User shows but can't sign in | Account blocked or license missing | Check block sign-in, assign license |

---

## PowerShell (for reference)

### Force Delta Sync (Most Common — Run This First)

```powershell
# Run on the Entra Connect server ([SYNC_SERVER])
Import-Module ADSync
# Loads the sync management module

Start-ADSyncSyncCycle -PolicyType Delta
# Pushes only changed objects to Entra ID — takes 2-5 minutes
# Use this for: new users, attribute changes, group membership changes
```

### Force Full Sync (Use Carefully)

```powershell
# Run on [SYNC_SERVER] — syncs ALL objects (slower, ~15-30 min)
Import-Module ADSync
Start-ADSyncSyncCycle -PolicyType Initial
# Use this when: you added a new OU to scope, or delta sync isn't catching changes
# ⚠️ Full sync is heavier — avoid during business hours if possible
```

### Check Last Sync Status

```powershell
# Run on [SYNC_SERVER]
Import-Module ADSync
Get-ADSyncScheduler
# Shows: NextSyncCyclePolicyType, SyncCycleEnabled, NextSyncCycleStartTimeInUTC
# Also shows LastSyncCycleStartedDate and LastSyncCycleEndedDate
```

### Check Sync Errors

```powershell
# Run on [SYNC_SERVER] — lists all objects that failed to sync
Import-Module ADSync
Get-ADSyncCSObject -ConnectorName "familybridges.org" -DistinguishedName "" |
    Where-Object { $_.SyncState -eq "Error" }
# Shows objects stuck in error state — check the error details for the cause
```

### Restart the Sync Service

```powershell
# If sync has stopped, restart the service on [SYNC_SERVER]
Restart-Service -Name ADSync
# Restarts the Entra Connect sync service — use if last sync is stale
```

### Check If a User Is In Sync Scope

```powershell
# Run on any machine with RSAT (or on [SYNC_SERVER])
Get-ADUser -Identity "[USERNAME]" -Properties DistinguishedName |
    Select-Object DistinguishedName
# Shows the OU the user is in — compare to the sync scope configured in Entra Connect
```
