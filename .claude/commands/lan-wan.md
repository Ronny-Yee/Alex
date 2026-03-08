# LAN/WAN Troubleshooting — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[SITE_NAME]` — site name (e.g. Main Office, HFC Office, Branch)
- `[DEVICE_NAME]` — affected device name (e.g. DT-John,Smith)
- `[DEVICE_IP]` — affected device's IP address
- `[VLAN_ID]` — VLAN number (e.g. 10, 20, 30)
- `[SWITCH_NAME]` — Meraki switch name

---

## Step 1: Scope the Problem

| Scope | Likely Cause |
|---|---|
| One device can't reach internet | Device config, port, VLAN |
| Whole site has no internet | MX uplink, ISP (Comcast), WAN |
| One VLAN can't reach another | Inter-VLAN routing, firewall rule |
| Slow internet at one site | ISP congestion, bandwidth cap, bad uplink |
| Can't reach internal server | DNS, routing, firewall, switch port |

---

## Portal Steps (Primary)

### 2. Check Meraki Dashboard — Overall Site Health

1. Go to **https://dashboard.meraki.com**
2. Select the org → select the network for `[SITE_NAME]`
3. **Network-wide → Overview** — look for red/yellow indicators
4. **Security & SD-WAN → Appliance status** — check:
   - **WAN uplink status** — is the uplink up or down?
   - **Active uplink** — WAN1 or WAN2?
   - **Uplink utilization graph** — are we near bandwidth capacity?
5. If uplink shows down → likely ISP issue → go to Step 8 (Comcast)

### 3. Check a Specific Client Device

1. **Network-wide → Clients** → search for `[DEVICE_NAME]` or `[DEVICE_IP]`
2. Click the client:
   - **Status** — online or idle
   - **VLAN** — confirm it's on the correct VLAN
   - **Signal** (if wireless) — check signal strength
   - **Usage** — is this device consuming unusual bandwidth?
   - **IP address** — confirm it got the right IP (not 169.x.x.x = DHCP fail)
3. If device shows 169.x.x.x IP → DHCP issue → check Step 5

### 4. Check Switch Port Status

1. **Switch → Switches** → click `[SWITCH_NAME]`
2. **Ports** tab — find the port connected to the affected device
3. Check:
   - **Status** — Up or Down
   - **VLAN** — is it tagged to `[VLAN_ID]`?
   - **Speed/Duplex** — any errors?
   - **Usage** — unusual traffic on this port?
4. If port is down: check physical cable, try a different port
5. If wrong VLAN: click the port → edit → set correct VLAN → **Update**

### 5. Check DHCP / VLAN Configuration

1. **Security & SD-WAN → Addressing & VLANs**
2. Find `[VLAN_ID]` in the list
3. Check:
   - **DHCP mode** — is DHCP enabled? (Run DHCP server or relay to another)
   - **DHCP range** — is there IP space available?
   - **Subnet** — is the IP range correct?
4. If DHCP is off or no range set → that VLAN won't assign IPs → fix here

### 6. Check Inter-VLAN Routing and Firewall Rules

1. **Security & SD-WAN → Addressing & VLANs** — confirm routing is enabled between VLANs
2. **Security & SD-WAN → Firewall → Layer 3 firewall rules**
3. Look for deny rules between VLANs that might be blocking traffic
4. If a rule is blocking: click it → edit or delete → **Save**
5. ⚠️ Be careful modifying firewall rules — test in off-hours if possible

### 7. Check DNS

1. On the affected device, open **Command Prompt**
2. Run: `nslookup google.com` — if it fails, DNS is broken
3. Run: `nslookup google.com 8.8.8.8` — if this works, internal DNS is the issue
4. In Meraki: **Security & SD-WAN → Addressing & VLANs** → check **DNS nameservers** for `[VLAN_ID]`
5. Should be pointing to internal DNS (DC IP) or `8.8.8.8` / `1.1.1.1`
6. Fix DNS entry in the VLAN config if wrong

### 8. Check Event Log

1. **Network-wide → Event log**
2. Filter by **Appliance** or **Switch**
3. Set time range to when the issue started
4. Look for:
   - `WAN disconnected` or `uplink down` — ISP or cable issue
   - `DHCP lease` errors — DHCP pool exhausted
   - `Port up/down` — switch port flapping
   - `Firewall deny` — traffic being blocked

---

## When to Call Comcast

Call Comcast Business support if:
- [ ] Meraki MX shows WAN uplink as **down** or **degraded**
- [ ] Packet loss on the WAN uplink is consistently above 5%
- [ ] Internet is down for the entire site (not just one device)
- [ ] You've confirmed Meraki config is correct (VLANs, firewall) and issue persists
- [ ] Meraki event log shows repeated `WAN disconnected` entries

**Comcast Business Support:** 1-800-391-3000
Have ready: account number, service address, a description of the issue and when it started

---

## PowerShell (for reference)

### Test Device Connectivity

```powershell
# Test if a device can reach the internet
Test-NetConnection -ComputerName "google.com" -Port 443
# If this fails, the device has no internet connectivity

# Test internal connectivity to a server or gateway
Test-NetConnection -ComputerName [DEVICE_IP] -Port 445
# Tests if a specific IP is reachable on the network
```

### Check IP Configuration on a Device

```powershell
# Show IP, subnet, gateway, and DNS — run on the affected device
ipconfig /all
# Look for: IP address (should NOT be 169.x.x.x), Default Gateway, DNS Servers

# Release and renew DHCP lease (fixes "169" IP issues)
ipconfig /release
ipconfig /renew
# Forces the device to get a fresh IP from DHCP
```

### Flush DNS Cache

```powershell
# Clear the local DNS cache on a Windows device
ipconfig /flushdns
# Fixes issues where the device is resolving to old/cached DNS entries

# Verify DNS is resolving correctly
Resolve-DnsName google.com
# Should return an IP — if it fails, DNS is broken
```

### Traceroute to Diagnose Routing

```powershell
# Trace the network path from the device to a destination
tracert 8.8.8.8
# Shows each hop — useful for finding where traffic stops

# Test a specific port (e.g. is a web server reachable?)
Test-NetConnection -ComputerName [DEVICE_IP] -Port 80
# TcpTestSucceeded: True = port is open and reachable
```
