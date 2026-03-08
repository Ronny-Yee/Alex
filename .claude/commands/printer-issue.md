# Printer Troubleshooting — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[PRINTER_NAME]` — printer name in Windows (e.g. HP-LaserJet-Finance)
- `[PRINTER_IP]` — printer's static IP address
- `[USER_UPN]` — affected user's UPN
- `[DEVICE_NAME]` — user's computer name (e.g. DT-John,Smith)
- `[VLAN_ID]` — VLAN ID the printer is on (e.g. VLAN 20)

---

## Step 1: Triage the Issue

| Symptom | Go to |
|---|---|
| Print job stuck, won't print | Step 2 (Clear Print Queue) |
| Printer offline in Windows | Step 3 (Check Connectivity) |
| Error printing, driver issue | Step 4 (Driver Fix) |
| Need to add a new printer | Step 5 (Add Printer) |
| Can't ping the printer | Step 6 (Meraki VLAN Check) |

---

## Step 2: Clear a Stuck Print Queue

### Portal Steps (Primary)

1. On the user's computer `[DEVICE_NAME]`, click **Start → Settings → Bluetooth & devices → Printers & scanners**
2. Click `[PRINTER_NAME]` → **Open print queue**
3. In the queue window, click **Printer → Cancel all documents**
4. If that doesn't work, continue to spooler restart below

### Restart Print Spooler (Services)

1. Press **Win + R** → type `services.msc` → Enter
2. Scroll to **Print Spooler** → right-click → **Stop**
3. Open **File Explorer** → navigate to: `C:\Windows\System32\spool\PRINTERS`
4. Delete all files in that folder (do NOT delete the folder itself)
5. Go back to **Services** → right-click **Print Spooler** → **Start**
6. Try printing again

---

## Step 3: Printer Shows Offline in Windows

1. Click **Start → Settings → Bluetooth & devices → Printers & scanners**
2. Click `[PRINTER_NAME]` → **Printer properties**
3. Click **Ports** tab → confirm the IP shown matches `[PRINTER_IP]`
4. If IP is wrong: click **Configure Port** → update IP → **OK**
5. Click **General** tab → **Print Test Page** to verify

### Check Printer Connectivity

1. Open **Command Prompt** on the user's machine
2. Run: `ping [PRINTER_IP]`
3. If pinging succeeds → printer is reachable, issue is in Windows config
4. If ping fails → go to **Step 6 (Meraki VLAN Check)**

---

## Step 4: Driver Issues

### Reinstall the Printer Driver

1. Go to **Settings → Bluetooth & devices → Printers & scanners**
2. Click `[PRINTER_NAME]` → **Remove**
3. Open **Control Panel → Devices and Printers**
4. Right-click any printer → **Print server properties → Drivers tab**
5. Find and remove the old driver for `[PRINTER_NAME]`
6. Download the latest driver from the printer manufacturer's website
7. Run the installer → add the printer back (Step 5)

### For Network Printers — Add via IP

1. **Settings → Bluetooth & devices → Printers & scanners → Add device**
2. Click **Add manually**
3. Select **Add a printer using an IP address or hostname** → **Next**
4. Enter: `[PRINTER_IP]` → **Next**
5. Windows will auto-detect the driver or prompt you to install one
6. Name the printer: `[PRINTER_NAME]` → **Finish**

---

## Step 5: Add a New Network Printer

1. **Settings → Bluetooth & devices → Printers & scanners → Add device**
2. Wait for Windows to scan — if printer appears, click **Add device**
3. If not found: click **Add manually → Add a printer using an IP address or hostname**
4. Enter `[PRINTER_IP]` → **Next**
5. Select or install the correct driver
6. Set as default if needed → **Finish**
7. Print a test page to confirm

### Deploy Printer via Intune (for all users at a site)

1. Go to **https://intune.microsoft.com**
2. **Devices → Configuration → Create → New policy**
3. Platform: **Windows 10 and later** → Profile type: **Settings catalog**
4. Search for **Printer** → add **Printers: Add** setting
5. Enter the printer UNC path (e.g. `\\printserver\[PRINTER_NAME]`) or IP-based port
6. Assign to the relevant group → **Save**

---

## Step 6: Meraki VLAN Check (Printer Not Reachable)

> Use this when a printer can't be pinged or is unreachable from a specific computer.

1. Go to **https://dashboard.meraki.com**
2. Select the network for the affected site
3. **Network-wide → Clients** → search for `[PRINTER_IP]` or the printer's MAC address
4. Confirm the printer shows as **online** and note which **VLAN** it's on
5. Search for `[DEVICE_NAME]` in clients — note which VLAN the computer is on
6. If they're on different VLANs, inter-VLAN routing must be configured:
   - Go to **Security & SD-WAN → Addressing & VLANs**
   - Confirm routing is enabled between the two VLANs
   - Go to **Security & SD-WAN → Firewall → Layer 3 firewall rules**
   - Check that there's no rule blocking traffic from the computer's VLAN to `[VLAN_ID]`
7. If the printer doesn't appear in clients at all: check that it's powered on and plugged into a switch port

---

## PowerShell (for reference)

### Clear Print Queue via PowerShell

```powershell
# Stop the print spooler service
Stop-Service -Name Spooler -Force
# Force stops the print spooler so we can clear the queue

# Delete all pending print jobs
Remove-Item -Path "C:\Windows\System32\spool\PRINTERS\*" -Force -Recurse
# Clears all stuck jobs from the spool folder

# Start the spooler back up
Start-Service -Name Spooler
# Restarts the print spooler — should clear all stuck jobs
```

### Restart Spooler on a Remote Computer

```powershell
# Restart print spooler on a remote machine
Invoke-Command -ComputerName [DEVICE_NAME] -ScriptBlock {
    Stop-Service Spooler -Force
    Remove-Item "C:\Windows\System32\spool\PRINTERS\*" -Force -Recurse
    Start-Service Spooler
}
# Clears the print queue on the remote device without needing to RDP in
```

### Add a Network Printer via PowerShell

```powershell
# Add a printer port using the printer's IP
Add-PrinterPort -Name "IP_[PRINTER_IP]" -PrinterHostAddress "[PRINTER_IP]"
# Creates a TCP/IP port pointing to the printer

# Add the printer using the port and driver
Add-Printer -Name "[PRINTER_NAME]" -DriverName "HP Universal Printing PCL 6" -PortName "IP_[PRINTER_IP]"
# Installs the printer — replace driver name with the correct one for your printer
```
