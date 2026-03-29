# Server Infrastructure — Checks & Questions Guide — [YOUR_DOMAIN]

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[SERVER_NAME]` — server hostname (e.g. DC01, TURBOSERVER01)
- `[SERVER_IP]` — server IP address
- `[SERVICE_NAME]` — Windows service name being checked
- `[USERNAME]` — user who needs server access

---

## Portal Steps (Primary)

### 1. Check If a Server Is Reachable

1. Open **Server Manager** on the server or a remote admin machine
2. **All Servers → [SERVER_NAME]** — check **Manageability** status
3. Green = reachable, red = offline or WMI error
4. Also check: **Task Manager → Performance** tab if you can RDP in

### 2. Check Windows Services on a Server

1. RDP into `[SERVER_NAME]`
2. Open **Services** (services.msc)
3. Find `[SERVICE_NAME]` in the list
4. Check **Status** (Running/Stopped) and **Startup Type**
5. Right-click → **Start** if stopped, or **Restart** if it's running but misbehaving

### 3. Check Event Viewer for Server Errors

1. RDP into `[SERVER_NAME]`
2. Open **Event Viewer** (eventvwr.msc)
3. Go to **Windows Logs → System** — filter by **Error** and **Critical**
4. Go to **Windows Logs → Application** — look for errors from specific apps
5. Sort by **Date and Time** (newest first) — focus on errors around when the issue started

### 4. Check Disk Space

1. RDP into `[SERVER_NAME]`
2. Open **File Explorer → This PC**
3. Check all drives — flag anything below 15% free space
4. Or open **Server Manager → All Servers → [SERVER_NAME]** → **Disk** section

### 5. Check Active Directory Domain Controller Health

1. RDP into the domain controller
2. Open **Active Directory Users and Computers** — confirm it opens without errors
3. Open **DNS Manager** — confirm zones are present and healthy
4. Open **Event Viewer → Directory Service** log — check for replication errors
5. Run **dcdiag** in Command Prompt (see PowerShell section)

### 6. Check User Access to a Server or Share

1. RDP into `[SERVER_NAME]`
2. Open **Computer Management → Local Users and Groups → Groups**
3. Check **Remote Desktop Users** — `[USERNAME]` should be listed if they need RDP
4. For file shares: **Computer Management → Shared Folders → Shares**
5. Right-click the share → **Properties → Security tab** — confirm `[USERNAME]` or their group has access

---

## Smart Questions to Ask Senior IT

### About Any Server

- What OS is this running and when was the last Windows Update?
- Is this server backed up, and when did the last backup complete successfully?
- What services depend on this server — if it goes down, what breaks?
- Who has admin access to this server?
- Is there monitoring on this server? What tool?

### About the Domain Controller / Active Directory

- How many domain controllers do we have, and which one is the PDC emulator?
- What's the replication schedule between DCs?
- Where is Entra Connect installed, and which account runs the sync?
- What's the FSMO role holder setup?
- How do we back up Active Directory?

### About the TurboTax / Tax Server

- What credentials are used to log into the server itself vs the application?
- Is the software installed per-user or shared/published via Remote Desktop?
- Where is the data stored — local drive or a network share?
- Who has access and how is it granted?
- Is there a license count limit? How many concurrent users can use it?
- What do I do if the service crashes — is there a restart procedure?
- Where are the log files for this application?

### About Network Shares / File Servers

- What's the UNC path for the share and what's the DNS name (if mapped)?
- How are permissions managed — directly on the share, or via security groups?
- Is this share replicated anywhere or backed up?
- Who do I contact if users report access issues?

### About Entra Connect (AD Sync)

- Which server has Entra Connect installed?
- What account is used for the sync service (local or domain account)?
- How do I check if sync has errors?
- Is password hash sync enabled, or are we using pass-through authentication?
- What happens if the Entra Connect server goes offline?

---

## PowerShell (for reference)

### Check Server Ping and Connectivity

```powershell
# Test basic connectivity to the server
Test-NetConnection -ComputerName [SERVER_NAME] -Port 445
# Port 445 = SMB (file shares) — confirms server is up and reachable

Test-NetConnection -ComputerName [SERVER_NAME] -Port 3389
# Port 3389 = RDP — confirms Remote Desktop is accessible
```

### Check a Service Status Remotely

```powershell
# Check a service on a remote server without RDP
Get-Service -ComputerName [SERVER_NAME] -Name "[SERVICE_NAME]"
# Shows if the service is Running or Stopped

# Restart a service remotely
Restart-Service -InputObject (Get-Service -ComputerName [SERVER_NAME] -Name "[SERVICE_NAME]")
# Restarts the service on the remote server
```

### Run DC Diagnostics

```powershell
# Run on the domain controller — checks AD health
dcdiag /v /c /d /e /s:[SERVER_NAME]
# /v = verbose, /c = comprehensive, /e = runs all tests
# Look for PASSED or FAILED next to each test
```

### Check Disk Space Remotely

```powershell
# Check disk usage on a remote server
Get-PSDrive -PSProvider FileSystem -ComputerName [SERVER_NAME] |
    Select-Object Name, @{N="UsedGB";E={[Math]::Round(($_.Used/1GB),1)}},
    @{N="FreeGB";E={[Math]::Round(($_.Free/1GB),1)}}
# Shows used and free space for each drive on the server
```

### Force AD Replication Check

```powershell
# Run on domain controller — shows replication status between DCs
repadmin /showrepl
# Look for any failures or errors in the output

# Force replication from all partners
repadmin /syncall /AdeP
# Triggers a manual replication sync across all domain controllers
```
