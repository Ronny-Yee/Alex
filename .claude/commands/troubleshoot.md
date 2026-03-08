# IT Troubleshooting Framework — familybridges.org

General diagnostic framework. Apply to any issue — swap in specifics as needed.

---

## Step 1: Define the Problem Clearly

Before touching anything, nail down:
- **What** is broken? (app, feature, login, connectivity, device)
- **Who** is affected? (one user, one device, one site, everyone)
- **When** did it start? (specific time, after an update, after a change)
- **Is it reproducible?** Can you make it happen again consistently?
- **What changed recently?** (updates, new policies, password change, new device)

> The fastest troubleshooting always starts with "what changed."

---

## Step 2: Scope the Impact

| Scope | Likely cause |
|---|---|
| One user, one device | Local config, profile, user-specific settings |
| One user, multiple devices | Account issue, license, Entra/AD problem |
| Multiple users, one app | App outage, permission change, policy |
| Multiple users, one site | Network issue, Meraki, ISP, firewall rule |
| Everyone | Tenant-wide policy, service outage, DNS |

---

## Step 3: Check Microsoft Service Health First

> Always rule out a Microsoft outage before digging in locally.

1. Go to **https://admin.microsoft.com**
2. **Health → Service health**
3. Check for any active incidents affecting the relevant service
4. Also check: **https://status.office365.com** or **@MSFT365Status** on Twitter/X

---

## Step 4: Check Logs & Traces

### For Email Issues
1. **https://admin.microsoft.com → Exchange → Mail flow → Message trace**
2. Set sender, recipient, date range → run trace
3. Look at **Status** and **Events** to find where it failed or was redirected

### For Sign-In / Account Issues
1. **https://entra.microsoft.com → Users → [user] → Sign-in logs**
2. Look at **Status**, **Failure reason**, **Conditional Access** column
3. Filter by **Failure** to isolate failed logins

### For Intune / Device Issues
1. **https://intune.microsoft.com → Devices → [device name]**
2. Check **Device compliance** — is it compliant?
3. **Device configuration → [policy name]** — check assignment and status
4. **Device → Sync** to force a policy refresh if needed

### For Conditional Access Blocks
1. **https://entra.microsoft.com → Users → [user] → Sign-in logs**
2. Click a failed sign-in → **Conditional Access** tab
3. Shows which CA policy applied and whether it **Succeeded**, **Failed**, or **Not applied**

---

## Step 5: Isolate the Variable

Test one thing at a time:
- **Different device** — same user, different machine → isolates device vs account
- **Different user** — same device → isolates user vs device
- **Different network** — mobile hotspot vs office WiFi → isolates network
- **Different browser** — Edge vs Chrome → isolates browser-specific issues
- **Incognito mode** — rules out cached credentials or extensions

---

## Step 6: Common Issues and First Checks

### Can't Sign In
- [ ] Is the account enabled? (Entra ID → Users → Block sign-in = No)
- [ ] Is the password correct / not expired?
- [ ] Is MFA registered? (Entra ID → User → Authentication methods)
- [ ] Is a Conditional Access policy blocking? (Sign-in logs → CA tab)
- [ ] Is the on-prem AD account locked? (ADUC → User → Account tab → Unlock)

### No Email / Email Not Sending
- [ ] Run a message trace (Exchange → Mail flow → Message trace)
- [ ] Check if mailbox is over quota (Exchange → Mailboxes → [user] → Storage)
- [ ] Check if account is licensed (Admin center → Users → Licenses)
- [ ] Check if a mail flow rule is redirecting or blocking it
- [ ] Check quarantine (security.microsoft.com → Quarantine)

### Can't Access SharePoint / Teams / OneDrive
- [ ] Is the user licensed for M365? (Admin center → Users → Licenses)
- [ ] Is the site/team accessible by others? (rules out permission issue vs service issue)
- [ ] Is the user in the correct security group for access?
- [ ] Check for Conditional Access policies restricting access from certain devices/locations

### App Not Working on Device
- [ ] Sync/check-in the device in Intune first (Devices → [device] → Sync)
- [ ] Is the device compliant? Non-compliant devices may be blocked by CA policies
- [ ] Is the app deployed to this device/user? (Intune → Apps → [app] → Device install status)
- [ ] Try reinstalling the app via Company Portal

### Network / Internet Issue (One Site)
- [ ] Check Meraki dashboard for the affected site (meraki.cisco.com)
- [ ] **Network → Clients** → find the affected device, check connectivity
- [ ] Check **Network → Event log** for errors around the time the issue started
- [ ] Check uplink status on the MX firewall for that site
- [ ] Test from a wired connection vs WiFi to isolate AP vs firewall

### Slow Performance
- [ ] Is it one user/device or widespread? (scope the impact — Step 2)
- [ ] Check device health in Intune → Hardware info → available memory/disk
- [ ] Check if a large sync (OneDrive, Teams) is running in background
- [ ] Check Meraki for bandwidth usage spikes on that site

---

## Step 7: Document and Escalate

If you've exhausted the above and can't resolve:
1. Document: what you tried, what the logs show, what you ruled out
2. Check Microsoft support: **https://admin.microsoft.com → Support → New service request**
3. For network issues: open a Meraki support case at **https://meraki.cisco.com**
4. Provide logs and traces to support — saves significant time

---

## Step 8: After Resolving

- Document the root cause and fix in the ticket
- If a policy or rule caused it, review whether it needs adjustment to prevent recurrence
- If a Microsoft service caused it, note the incident ID for future reference
