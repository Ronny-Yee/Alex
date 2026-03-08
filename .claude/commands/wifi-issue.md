# Wi-Fi Troubleshooting — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[SITE_NAME]` — office location (e.g. Main Office, HFC Office)
- `[AP_NAME]` — Meraki access point name (e.g. AP-Main-Floor1)
- `[SSID_NAME]` — Wi-Fi network name (e.g. FamilyBridges-Staff, FamilyBridges-Guest)
- `[CLIENT_NAME]` — affected device name (e.g. LT-John,Smith)
- `[CLIENT_MAC]` — device MAC address (find in Settings → Wi-Fi → Hardware address)

---

## Step 1: Triage the Issue

| Symptom | Go to |
|---|---|
| One device can't connect | Step 2 (Client Check) |
| SSID not showing up at all | Step 4 (AP & SSID Check) |
| Connected but slow | Step 5 (Signal & Channel) |
| All devices at site affected | Step 6 (AP Status / Meraki) |
| Guest Wi-Fi not working | Step 7 (Guest Wi-Fi) |

---

## Portal Steps (Primary)

### 2. Check the Affected Client in Meraki

1. Go to **https://dashboard.meraki.com**
2. Select the network for `[SITE_NAME]`
3. **Network-wide → Clients** → search for `[CLIENT_NAME]` or `[CLIENT_MAC]`
4. Click the client:
   - **Status** — online or offline
   - **Associated AP** — which AP is it connected to?
   - **SSID** — which SSID?
   - **Signal** — RSSI value (aim for -65 dBm or better; -80+ is too weak)
   - **Channel** — what channel is it on?
   - **Usage** — is it consuming unusual bandwidth?

### 3. Basic Fixes on the Device First

1. On the device: **Forget** the Wi-Fi network → reconnect from scratch
2. Toggle Wi-Fi off and back on
3. Restart the device
4. If on a laptop: make sure the physical Wi-Fi toggle isn't off (some have a key combo)
5. Try connecting to a different SSID (like guest) to confirm the radio works
6. Try moving closer to the AP to rule out signal

### 4. Check AP and SSID Status in Meraki

1. **Wireless → Access points** → find `[AP_NAME]`
2. Check **Status** — green = online, orange = alerting, red = offline
3. If AP is offline:
   - Check the physical AP — is the LED on? (solid white/green = good; orange/red = issue)
   - Check the switch port it's connected to: **Switch → Switches → [switch] → Ports**
   - Check if it's getting PoE power from the switch
4. **Wireless → SSIDs** → find `[SSID_NAME]`
5. Confirm the SSID is **Enabled** and the **VLAN** assignment is correct
6. Confirm the SSID is set to broadcast (not hidden) if devices are expecting to see it

### 5. Check Signal Strength and Channel

1. **Wireless → Access points → [AP_NAME]** → click into it
2. **RF** tab — check:
   - **Channel** (2.4 GHz and 5 GHz) — should be auto or a non-overlapping channel
   - **Channel utilization** — if above 70%, too much interference on that channel
   - **Transmit power** — should be auto unless manually set
3. **Wireless → RF profiles** → confirm the profile is appropriate for the site
4. If signal is weak on the client device:
   - Move the device closer to test
   - Check if something physical is blocking (walls, metal shelving)
   - Consider adding an AP if coverage is consistently poor

### 6. Check All APs at the Site

1. **Wireless → Access points**
2. Filter by the network for `[SITE_NAME]`
3. Look for any APs showing **offline** or **alerting**
4. If multiple APs are offline: check the switch and uplink (may be a network-wide issue → see lan-wan.md)
5. **Network-wide → Event log** → filter by **Wireless** → look for AP disconnects, radar events, or RF issues

### 7. Guest Wi-Fi Issues

1. **Wireless → SSIDs** → find the guest SSID
2. Confirm it's **Enabled**
3. Check **Access control**:
   - Should be **Open** or **Password** (not 802.1X for guests)
   - **Client isolation** should be **Enabled** (guests can't see each other's devices)
   - **Firewall** — confirm guest SSID can reach internet but NOT internal VLANs
4. Check VLAN assignment — guest should be on a separate VLAN from staff
5. **Security & SD-WAN → Addressing & VLANs** — confirm guest VLAN has DHCP enabled
6. Test: connect a device to the guest SSID → confirm internet works → confirm internal resources are blocked

---

## Common Wi-Fi Errors & Fixes

| Error | Likely Cause | Fix |
|---|---|---|
| Can't authenticate | Wrong password, policy block | Forget network, reconnect, check SSID password |
| Gets IP 169.x.x.x | DHCP not working on VLAN | Check VLAN DHCP in Meraki |
| SSID not visible | AP offline, SSID hidden | Check AP status, toggle SSID broadcast |
| Slow speeds | Weak signal, congested channel | Move closer, check channel utilization |
| Keeps disconnecting | Roaming issue, AP overloaded | Check band steering, client count per AP |
| Guest can access internal | VLAN not isolated | Check guest SSID VLAN and firewall rules |

---

## PowerShell (for reference)

### Check Wi-Fi Details on Windows Device

```powershell
# Show all Wi-Fi networks the device can see and their signal strength
netsh wlan show networks mode=bssid
# Lists SSIDs, signal strength, channel, and authentication type

# Show current Wi-Fi connection details
netsh wlan show interfaces
# Shows SSID, BSSID (AP MAC), signal, channel, receive/transmit rate
```

### Forget and Reconnect to Wi-Fi

```powershell
# Forget (delete) the saved Wi-Fi profile
netsh wlan delete profile name="[SSID_NAME]"
# Removes the saved network so it can be reconnected fresh

# Connect to a Wi-Fi network
netsh wlan connect name="[SSID_NAME]"
# Reconnects using the saved profile (must have been saved before)
```

### Get Wi-Fi Adapter Info

```powershell
# Show Wi-Fi adapter status and IP
Get-NetAdapter | Where-Object {$_.InterfaceDescription -like "*Wireless*" -or $_.InterfaceDescription -like "*Wi-Fi*"}
# Shows whether the adapter is up and what name it has

# Get IP assigned to the Wi-Fi adapter
Get-NetIPAddress -InterfaceAlias "Wi-Fi"
# Shows current IP — 169.x.x.x means DHCP failure
```
