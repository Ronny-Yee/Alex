# TurboTax Server — Management & Troubleshooting — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[SERVER_NAME]` — TurboTax server hostname (ask senior IT)
- `[SERVER_IP]` — server's IP address
- `[USERNAME]` — user who needs access (without @domain)
- `[UPN]` — user's full email/UPN

> ⚠️ If you're unsure about any server-level changes, check with senior IT before proceeding. This is a production server with financial data.

---

## Portal Steps (Primary)

### 1. Check If the Server Is Online

1. Open **File Explorer** → type `\\[SERVER_IP]` or `\\[SERVER_NAME]` in the address bar
2. If the share opens → server is reachable on the network
3. If it fails → try pinging: open **Command Prompt** → run `ping [SERVER_IP]`
4. If ping fails → server may be powered off, RDP in or check physically

### 2. RDP Into the Server

1. Press **Win + R** → type `mstsc` → Enter
2. In **Computer** field: enter `[SERVER_NAME]` or `[SERVER_IP]`
3. Log in with your domain admin credentials
4. Once in: check the desktop or taskbar for TurboTax application or service status
5. Check **Task Manager → Services tab** — look for TurboTax-related services and confirm they're running

### 3. Check If TurboTax Application Is Running

1. RDP into `[SERVER_NAME]`
2. Open **Task Manager → Processes** — look for TurboTax or related processes
3. Open **Services** (services.msc) — search for TurboTax service
4. If the service is stopped: right-click → **Start**
5. Check **Event Viewer → Windows Logs → Application** for TurboTax error entries around the time of the issue

### 4. Check User Access

1. RDP into `[SERVER_NAME]`
2. Open **Computer Management → Local Users and Groups → Groups**
3. Open **Remote Desktop Users** — confirm `[USERNAME]` is listed (needed for RDP access)
4. Open **Users** — confirm the account exists and is enabled
5. Check file/share permissions:
   - Open **File Explorer** → navigate to the TurboTax data folder
   - Right-click → **Properties → Security tab**
   - Confirm `[USERNAME]` or their group has at least **Read & Execute** access

### 5. Add a User to Remote Desktop Access

1. RDP into `[SERVER_NAME]`
2. Open **Computer Management → Local Users and Groups → Groups → Remote Desktop Users**
3. Double-click → **Add**
4. Enter `[USERNAME]` → **Check Names** → **OK**
5. User can now RDP into the server

### 6. Check Disk Space on the Server

1. RDP into `[SERVER_NAME]`
2. Open **File Explorer → This PC**
3. Check C: drive free space — flag if below 15%
4. TurboTax data files can grow large — if space is low, alert senior IT

### 7. Check Server Event Logs for Errors

1. RDP into `[SERVER_NAME]`
2. Open **Event Viewer** (eventvwr.msc)
3. **Windows Logs → System** — filter by Error/Critical, look at recent entries
4. **Windows Logs → Application** — look for TurboTax-specific errors
5. Note the **Event ID** and **Source** for any errors — useful when escalating to senior IT

---

## Smart Questions to Ask Senior IT About This Server

**Access & Authentication:**
- What credentials do users log into this server with — local accounts or domain accounts?
- Is this published via Remote Desktop Services / RemoteApp, or do users RDP to the full desktop?
- Who currently has access, and how is access granted or revoked?
- Is there an AD security group that controls access, or is it managed locally on the server?

**Application:**
- Where is TurboTax installed — C: drive or a different volume?
- Where is the data stored — local drive, network share, or attached storage?
- How many concurrent users can use TurboTax at the same time (license limit)?
- What version of TurboTax is installed, and who handles updates?

**Backups & Recovery:**
- Is this server backed up? What tool, and how often?
- Where do backups go — local, NAS, or cloud?
- If the server goes down, what's the recovery plan?

**Maintenance:**
- Who is the primary person responsible for this server?
- Are Windows Updates applied automatically or manually?
- Is there monitoring on this server? What alerts exist?

**Troubleshooting:**
- If the TurboTax service crashes, what's the restart procedure?
- Are there log files specific to TurboTax I should know where to find?
- Is there a test/staging environment or is this the only instance?

---

## PowerShell (for reference)

### Test Server Connectivity

```powershell
# Test if the server is reachable
Test-NetConnection -ComputerName [SERVER_NAME] -Port 3389
# Port 3389 = RDP — if this returns TcpTestSucceeded: True, server is reachable

Test-NetConnection -ComputerName [SERVER_NAME] -Port 445
# Port 445 = SMB (file shares) — tests if file shares are accessible
```

### Check Services on the Server Remotely

```powershell
# List running services on the server — look for TurboTax or related services
Get-Service -ComputerName [SERVER_NAME] | Where-Object {$_.Status -eq "Running"} |
    Select-Object Name, DisplayName, Status | Format-Table
# Shows all running services — helps identify if TurboTax service is up
```

### Check Disk Space Remotely

```powershell
# Check disk usage on the TurboTax server without RDP
Get-WmiObject -Class Win32_LogicalDisk -ComputerName [SERVER_NAME] |
    Select-Object DeviceID,
        @{N="SizeGB";E={[Math]::Round($_.Size/1GB,1)}},
        @{N="FreeGB";E={[Math]::Round($_.FreeSpace/1GB,1)}},
        @{N="Free%";E={[Math]::Round(($_.FreeSpace/$_.Size)*100,0)}} |
    Format-Table
# Shows total and free disk space — flag anything below 15% free
```

### Check Who Is Logged Into the Server

```powershell
# See who is currently logged into the server (run on the server or remotely via RDP)
query user /server:[SERVER_NAME]
# Lists all active RDP sessions and logged-in users
```
