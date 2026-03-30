# [YOUR_ORG] IT Ops — Skill Knowledge Base

## Environment

| Item | Detail |
|------|--------|
| Tenant | [YOUR_DOMAIN] |
| Users | ~120 on M365 Business Premium |
| Identity | Hybrid AD + Entra Connect sync (create users in on-prem AD first) |
| Devices | Windows (majority), few Macs, iPhones, Android (Moto G), MDM work phones |
| MDM | Intune — iOS, Android, Windows |
| Network | Cisco Meraki MX firewall + MR access points — 4 office sites |
| ISP | Comcast fiber |
| WAN | P2P fiber (main ↔ HFC office) → migrating to Meraki site-to-site VPN |
| Remote access | TightVNC (temp) + Client VPN for remote workers |
| VoIP | Intermedia Unite — migrated from Toshiba PRI; [SITE_A] + [SITE_B] still in progress |
| Security | [SECURITY_VENDOR] — upgrading to internet-based |
| Ticketing | Jira Service Management (cloud, 2026) |
| MFA | Microsoft Authenticator + SMS fallback |

**Device naming:** DT-FirstName,LastName (desktop) · LT-FirstName,LastName (laptop)

**Admin portals:**
- admin.microsoft.com
- entra.microsoft.com
- intune.microsoft.com
- portal.azure.com
- security.microsoft.com
- admin.exchange.microsoft.com

---

## Active Projects (2026)

| Project | Status | Key Detail |
|---------|--------|-----------|
| VoIP migration — [SITE_A] + [SITE_B] | In progress | [VOIP_PARTNER] vs [ISP_VENDOR] competing; [VOIP_PARTNER] handles cabling |
| P2P → Site-to-site VPN | In progress | TightVNC still running; Meraki S2S is the target |
| [SECURITY_VENDOR] upgrade | Planning | Tie to VoIP migration — eliminate [ISP_VENDOR] landlines |
| Alex Comrade Amprius | Active | GitHub: [YOUR_GITHUB]/Alex |
| Jira Service Management | In progress | 2026 rollout — DevOps / Get IT Help space |

---

## Response Rules

- Portal/admin center steps FIRST — PowerShell in `<details>` collapse blocks
- ⚠️ on anything destructive (wipe, delete, disable, remove, reset)
- Always confirm before destructive actions
- Placeholders only — never real employee names, emails, or UPNs
- Short bullets, clear headers, phone-readable
- Plain-English comment on every PowerShell line

---

## Placeholder Standards

| Placeholder | Use for |
|-------------|---------|
| `[FIRST_NAME]` | User's first name |
| `[LAST_NAME]` | User's last name |
| `[UPN]` | User principal name (email) |
| `[DEPARTMENT]` | Department name |
| `[MANAGER]` | Manager's name |
| `[MANAGER_UPN]` | Manager's UPN |
| `[DEVICE_NAME]` | Device hostname |
| `[admin@YOUR_DOMAIN]` | IT admin UPN |

---

## Common Procedures — Quick Reference

### New User Flow (Hybrid AD)
1. Create in on-prem AD (ADUC)
2. Force Entra Connect sync: `Start-ADSyncSyncCycle -PolicyType Delta`
3. Assign M365 Business Premium license
4. Add to security groups + distribution lists
5. Set up MFA (Microsoft Authenticator + SMS)
6. Enroll device in Intune — rename DT/LT-FirstName,LastName
7. Add to Intermedia Unite (extension + voicemail PIN)
8. Grant SharePoint/Teams access

### Offboarding Flow
1. Block sign-in (Entra ID)
2. Revoke all sessions
3. Reset password (lock out)
4. Clear MFA methods
5. Convert mailbox to shared → grant manager access
6. Remove all M365 licenses
7. Remove from all groups/DLs
8. Transfer OneDrive to manager
9. ⚠️ Wipe/retire device in Intune
10. ⚠️ Disable on-prem AD account → move to Disabled Users OU

### MFA Reset
1. entra.microsoft.com → Users → [UPN] → Authentication methods → delete all
2. Send user to aka.ms/mfasetup to re-register

### Password Reset
- admin.microsoft.com → Users → [UPN] → Reset password → auto-generate → force change on login

### Email Quarantine
- security.microsoft.com → Email & collaboration → Review → Quarantine → Release

### Device Wipe
- intune.microsoft.com → Devices → All devices → [DEVICE_NAME]
- ⚠️ Full Wipe = factory reset (work-owned only)
- Retire = removes company data, keeps personal (BYOD only)

---

## Server Infrastructure

- **AD Connect server** — syncs on-prem AD → Entra ID
- **TurboTax server** — Windows Server for finance/accounting
- **Third tower** — unknown purpose; check with senior IT

---

## Escalation Templates

**Vendor:**
> We are experiencing [issue] affecting [X users/sites] since [date]. We need Tier 2 escalation. Case: [#]. Please confirm resolution timeline.

**Microsoft:**
> Tenant: [YOUR_DOMAIN] | Admin UPN: [admin@YOUR_DOMAIN] | Issue: [description] | Impact: [X users] | Started: [date] | Steps tried: [list]

**Internal:**
> Hi [Name], working on a ticket and want to check before I proceed. Situation: [what's happening]. What I've done: [steps]. Where I'm stuck: [specific question].
