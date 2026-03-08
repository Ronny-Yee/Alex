# VPN Check & Troubleshooting — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[SITE_NAME]` — site name (e.g. Main Office, HFC Office)
- `[SITE_IP]` — public IP of the site
- `[REMOTE_SUBNET]` — remote subnet (e.g. 192.168.10.0/24)
- `[LOCAL_SUBNET]` — local subnet (e.g. 192.168.1.0/24)
- `[MX_NAME]` — Meraki MX device name

---

## Portal Steps (Primary)

### 1. Check VPN Status in Meraki Dashboard

1. Go to **https://dashboard.meraki.com**
2. Select the org → select the network for `[SITE_NAME]`
3. **Security & SD-WAN → Site-to-site VPN**
4. Look at the **VPN status** table:
   - **Green checkmark** = tunnel is up
   - **Grey/red** = tunnel is down or degraded
5. Click the status icon for the peer to see latency and packet loss
6. Note the **Uptime** and **Last seen** fields — confirms if it dropped recently

### 2. Check Uplink / WAN Status

1. In the same network → **Security & SD-WAN → Appliance status**
2. Check **Uplink status** — both WAN1 and WAN2 (if dual WAN)
3. Look at **Active uplink** — confirms which WAN is being used for VPN traffic
4. Check **Uplink utilization** graph for spikes or drops around the time the issue started

### 3. Check Client VPN Status (Remote Workers)

1. **Security & SD-WAN → Client VPN**
2. View **Active clients** list — shows connected users and IPs
3. Check **Client VPN settings**:
   - Server IP: should be the public IP of `[SITE_NAME]` MX
   - Authentication: RADIUS or Active Directory
   - DNS nameservers: should point to internal DNS

### 4. Test Connectivity Between Sites

1. Go to **Network-wide → Clients**
2. Find a device on `[SITE_NAME]`
3. Click the device → **Tools** tab
4. Use **Ping** to test connectivity to a device on the remote subnet: `[REMOTE_SUBNET]`
5. Use **Traceroute** to see where packets are dropping

### 5. Check Firewall Rules

1. Go to **Security & SD-WAN → Firewall**
2. **Site-to-site outbound firewall rules** — check if any rule is blocking traffic between `[LOCAL_SUBNET]` and `[REMOTE_SUBNET]`
3. Look for deny rules that might be too broad
4. **Layer 3 firewall** — check rules allowing traffic across the VPN

### 6. Check Event Log

1. **Network-wide → Event log**
2. Filter by **VPN** or **Appliance**
3. Look for VPN negotiation failures, tunnel drops, or IKE errors around the time the issue started
4. Common events to watch for:
   - `VPN tunnel down` — tunnel dropped
   - `IKE negotiation failure` — authentication or config mismatch
   - `VPN peer unreachable` — WAN routing or firewall issue

### 7. Check VLAN Routing

1. **Security & SD-WAN → Addressing & VLANs**
2. Confirm the local VLANs that need VPN access are enabled for VPN traffic
3. In **Site-to-site VPN** settings, confirm the correct local networks are set to **Enabled** (not just hub or VPN off)

---

## Common Scenarios & Fixes

| Symptom | Likely Cause | What to Check |
|---|---|---|
| Tunnel shows down | WAN outage or IP changed | Uplink status, ISP, peer IP |
| Tunnel up but no traffic | Firewall rule blocking | L3 firewall, VPN firewall rules |
| One VLAN not reachable | VLAN not enabled for VPN | Addressing & VLANs, VPN settings |
| Client VPN can't connect | Auth failure or DNS | RADIUS/AD, DNS settings, credentials |
| Intermittent drops | ISP instability | Event log, Comcast call if consistent |

---

## When to Call Comcast

Call Comcast Business support if:
- [ ] WAN uplink shows **offline** or **degraded** in Meraki
- [ ] Packet loss is >5% consistently on the WAN uplink
- [ ] The issue affects all sites on the same ISP circuit
- [ ] Event log shows repeated `WAN disconnected` events
- [ ] You've ruled out Meraki config as the cause

**Comcast Business Support:** 1-800-391-3000 (have the account number and site address ready)

---

## PowerShell (for reference)

### Test VPN Connectivity from a Windows Machine

```powershell
# Test basic connectivity to the remote subnet gateway
Test-NetConnection -ComputerName [SITE_IP] -Port 443
# Checks if the remote MX is reachable on HTTPS

# Ping a device on the remote subnet
ping [REMOTE_SUBNET_DEVICE_IP] -n 10
# Sends 10 pings — look for packet loss or high latency

# Traceroute to remote site
tracert [REMOTE_SUBNET_DEVICE_IP]
# Shows the hop-by-hop path — useful for finding where traffic drops
```

### Check Local Routes

```powershell
# Show the local routing table — confirms VPN route is present
route print
# Look for an entry for [REMOTE_SUBNET] pointing to the VPN adapter

# Show active network adapters and IPs
Get-NetIPAddress | Select-Object InterfaceAlias, IPAddress, AddressFamily
# Confirms the VPN adapter has an IP assigned (for Client VPN)
```
