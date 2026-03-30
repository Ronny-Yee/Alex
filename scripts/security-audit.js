#!/usr/bin/env node
/**
 * security-audit.js
 * Generates a structured security audit report for the familybridges.org M365 tenant.
 * Outputs a ready-to-use checklist with exact portal paths and PS commands.
 * Run with: node scripts/security-audit.js
 * No npm install needed — uses only built-in Node.js modules.
 */

const fs   = require('fs');
const path = require('path');

const TENANT   = 'familybridges.org';
const TODAY    = new Date().toISOString().split('T')[0];
const OUT_FILE = path.join(process.cwd(), `security-audit-${TODAY}.md`);

// ── Audit sections ─────────────────────────────────────────────────────────
const sections = [

  {
    title: '1. Identity & Access — Entra ID',
    items: [
      {
        check: 'Stale accounts (no sign-in 30+ days)',
        portal: 'Entra → Identity → Users → All Users → filter by "Last sign-in" column',
        ps: `Get-MgUser -All -Property DisplayName,UserPrincipalName,SignInActivity | Where-Object { $_.SignInActivity.LastSignInDateTime -lt (Get-Date).AddDays(-30) } | Select DisplayName,UserPrincipalName,@{n='LastSignIn';e={$_.SignInActivity.LastSignInDateTime}}`,
        risk: 'HIGH',
        note: 'Disable or delete accounts inactive 30+ days. Check with managers before deleting.'
      },
      {
        check: 'Accounts with no MFA registered',
        portal: 'Entra → Identity → Users → All Users → Authentication methods → filter MFA = None',
        ps: `Get-MgReportAuthenticationMethodUserRegistrationDetail | Where-Object { -not $_.IsMfaRegistered } | Select UserDisplayName,UserPrincipalName`,
        risk: 'CRITICAL',
        note: 'Every active user must have MFA. Direct unregistered users to aka.ms/mfasetup.'
      },
      {
        check: 'Admin role assignments — are they minimal?',
        portal: 'Entra → Identity → Roles & admins → All roles → check Global Admin, Privileged Role Admin, Exchange Admin',
        ps: `Get-MgDirectoryRole | ForEach-Object { $role = $_; Get-MgDirectoryRoleMember -DirectoryRoleId $role.Id | Select @{n='Role';e={$role.DisplayName}},@{n='User';e={$_.AdditionalProperties.userPrincipalName}} }`,
        risk: 'HIGH',
        note: 'Global Admin should have ≤2 accounts. All admin roles should use dedicated admin accounts, not daily-use accounts.'
      },
      {
        check: 'Break-glass emergency access accounts exist and are excluded from CA',
        portal: 'Entra → Identity → Users → search for emergency/breakglass accounts → verify excluded from all CA policies',
        ps: null,
        risk: 'HIGH',
        note: 'Must have 2 break-glass accounts. Cloud-only, no MFA requirement, excluded from CA. Test sign-in quarterly.'
      },
      {
        check: 'Guest / external user audit',
        portal: 'Entra → Identity → Users → All Users → filter "User type = Guest"',
        ps: `Get-MgUser -Filter "userType eq 'Guest'" | Select DisplayName,UserPrincipalName,CreatedDateTime | Sort-Object CreatedDateTime`,
        risk: 'MEDIUM',
        note: 'Remove guests who no longer need access. Review any guest with admin roles immediately.'
      },
      {
        check: 'Risky users flagged by Identity Protection',
        portal: 'Entra → Protection → Identity Protection → Risky users',
        ps: null,
        risk: 'CRITICAL',
        note: 'Remediate or dismiss each risky user. Confirm action with manager before dismissing.'
      }
    ]
  },

  {
    title: '2. Conditional Access',
    items: [
      {
        check: 'MFA required for all users policy exists and is enabled',
        portal: 'Entra → Protection → Conditional Access → Policies → look for a "Require MFA" policy in On state',
        ps: `Get-MgIdentityConditionalAccessPolicy | Select DisplayName,State | Sort-Object DisplayName`,
        risk: 'CRITICAL',
        note: 'If no MFA CA policy exists, create one immediately. Exclude break-glass accounts only.'
      },
      {
        check: 'Legacy authentication blocked',
        portal: 'Entra → Conditional Access → Policies → look for "Block legacy authentication" policy',
        ps: null,
        risk: 'HIGH',
        note: 'Legacy auth (SMTP, IMAP, POP3, older Office clients) bypasses MFA. Must be blocked.'
      },
      {
        check: 'Named locations are accurate (trusted IPs)',
        portal: 'Entra → Protection → Conditional Access → Named locations',
        ps: null,
        risk: 'MEDIUM',
        note: 'Verify office IP ranges are correct. Remove any stale or unknown IP ranges. Each site should have its own named location.'
      },
      {
        check: 'No CA policy gaps — check for excluded users/groups',
        portal: 'Entra → Conditional Access → each policy → Exclude tab',
        ps: null,
        risk: 'HIGH',
        note: 'Exclusions should be minimal. Flag any non-break-glass accounts excluded from MFA policies.'
      }
    ]
  },

  {
    title: '3. Device Compliance — Intune',
    items: [
      {
        check: 'Non-compliant devices',
        portal: 'Intune → Devices → Compliance → Non-compliant devices report',
        ps: `Get-MgDeviceManagementManagedDevice -Filter "complianceState eq 'noncompliant'" | Select DeviceName,UserPrincipalName,OperatingSystem,ComplianceState`,
        risk: 'HIGH',
        note: 'Investigate each non-compliant device. Common causes: BitLocker off, OS out of date, no passcode.'
      },
      {
        check: 'Devices with no compliance policy assigned',
        portal: 'Intune → Devices → All devices → filter by "Compliance = Not evaluated"',
        ps: null,
        risk: 'HIGH',
        note: '"Not evaluated" means no policy targets the device — it can access resources unchecked. Assign a compliance policy.'
      },
      {
        check: 'BitLocker status on Windows devices',
        portal: 'Intune → Devices → All devices → [device] → Encryption report',
        ps: `Get-MgDeviceManagementManagedDevice -Filter "operatingSystem eq 'Windows'" | Select DeviceName,IsEncrypted,UserPrincipalName`,
        risk: 'HIGH',
        note: 'All Windows devices must be encrypted. Retrieve recovery keys via Intune → Devices → [device] → Recovery keys.'
      },
      {
        check: 'Stale/unmanaged devices (enrolled 90+ days, no check-in)',
        portal: 'Intune → Devices → All devices → sort by "Last check-in" ascending',
        ps: `Get-MgDeviceManagementManagedDevice | Where-Object { $_.LastSyncDateTime -lt (Get-Date).AddDays(-90) } | Select DeviceName,UserPrincipalName,LastSyncDateTime`,
        risk: 'MEDIUM',
        note: 'Retire stale devices. Confirm with user before wiping — device may be in storage or used infrequently.'
      }
    ]
  },

  {
    title: '4. Email Security — Exchange / Defender',
    items: [
      {
        check: 'DKIM enabled for familybridges.org',
        portal: 'Defender → Policies & rules → Threat policies → Email authentication settings → DKIM tab',
        ps: `Get-DkimSigningConfig -Domain ${TENANT} | Select Domain,Enabled,Status`,
        risk: 'HIGH',
        note: 'DKIM must be enabled and both CNAME records published in DNS.'
      },
      {
        check: 'DMARC record published in DNS',
        portal: 'Run: nslookup -type=TXT _dmarc.familybridges.org — should return a p= policy',
        ps: `Resolve-DnsName -Name "_dmarc.${TENANT}" -Type TXT`,
        risk: 'HIGH',
        note: 'DMARC policy should be p=quarantine or p=reject. p=none provides no protection.'
      },
      {
        check: 'SPF record is tight (no ~all or ?all)',
        portal: 'Run: nslookup -type=TXT familybridges.org — SPF should end in -all (hard fail)',
        ps: `Resolve-DnsName -Name "${TENANT}" -Type TXT | Where-Object { $_.Strings -match 'spf' }`,
        risk: 'HIGH',
        note: '~all (soft fail) allows spoofed mail to pass. Use -all. Only include legitimate sending IPs.'
      },
      {
        check: 'Anti-phishing policy enabled',
        portal: 'Defender → Policies & rules → Threat policies → Anti-phishing',
        ps: `Get-AntiPhishPolicy | Select Name,Enabled,EnableMailboxIntelligence,EnableSpoofIntelligence`,
        risk: 'HIGH',
        note: 'Enable impersonation protection for key users (execs, finance, IT). Enable spoof intelligence.'
      },
      {
        check: 'Mailbox forwarding rules — no unexpected external forwards',
        portal: 'Exchange Admin → Recipients → Mailboxes → [each mailbox] → Mailflow settings → check forwarding',
        ps: `Get-Mailbox -ResultSize Unlimited | Where-Object { $_.ForwardingSmtpAddress -ne $null } | Select DisplayName,ForwardingSmtpAddress,DeliverToMailboxAndForward`,
        risk: 'CRITICAL',
        note: 'External forwarding is a top exfiltration method after account compromise. Any unexpected forward = investigate immediately.'
      }
    ]
  },

  {
    title: '5. SharePoint & OneDrive — Data Exposure',
    items: [
      {
        check: 'External sharing settings — is sharing restricted?',
        portal: 'SharePoint Admin (admin.microsoft.com → SharePoint) → Policies → Sharing → check org-level setting',
        ps: `Get-SPOTenant | Select SharingCapability,DefaultSharingLinkType`,
        risk: 'HIGH',
        note: 'Recommended: "New and existing guests" at most. "Anyone" links (anonymous) should be disabled.'
      },
      {
        check: 'Sites shared externally',
        portal: 'SharePoint Admin → Sites → Active sites → filter by "External sharing = On"',
        ps: `Get-SPOSite -Limit All | Where-Object { $_.SharingCapability -ne "Disabled" } | Select Url,SharingCapability`,
        risk: 'MEDIUM',
        note: 'Review each externally shared site. Confirm it is intentional and has a business reason.'
      }
    ]
  },

  {
    title: '6. Privileged Access & App Permissions',
    items: [
      {
        check: 'App registrations with high-permission Graph API scopes',
        portal: 'Entra → Applications → App registrations → All applications → review API permissions',
        ps: `Get-MgApplication | Select DisplayName,CreatedDateTime | Sort-Object CreatedDateTime -Descending`,
        risk: 'HIGH',
        note: 'Flag any app with Mail.Read, User.ReadWrite.All, or Directory.ReadWrite.All scopes. Unused apps should be removed.'
      },
      {
        check: 'Service principals / Enterprise apps with broad permissions',
        portal: 'Entra → Applications → Enterprise applications → Permissions → look for User.ReadWrite.All, etc.',
        ps: null,
        risk: 'HIGH',
        note: 'Third-party apps with admin consent to broad scopes are a supply chain risk. Review quarterly.'
      }
    ]
  },

  {
    title: '7. Microsoft Secure Score',
    items: [
      {
        check: 'Current Secure Score and top improvement actions',
        portal: 'Defender (security.microsoft.com) → Secure score → Improvement actions — sort by Points impact',
        ps: null,
        risk: 'INFO',
        note: `Target score: 70%+. Focus on the top 5 improvement actions by points. Common quick wins: enable MFA, block legacy auth, enable audit log, enable SSPR.`
      }
    ]
  }

];

// ── Render report ──────────────────────────────────────────────────────────
function riskBadge(risk) {
  const map = { CRITICAL: '🔴 CRITICAL', HIGH: '🟠 HIGH', MEDIUM: '🟡 MEDIUM', INFO: '🔵 INFO' };
  return map[risk] || risk;
}

function renderReport() {
  const lines = [];
  lines.push(`# Security Audit — ${TENANT}`);
  lines.push(`**Generated:** ${TODAY}  |  **Tenant:** ${TENANT}  |  **Licensing:** M365 Business Premium`);
  lines.push('');
  lines.push('> Work through each section in the Microsoft admin portals. PowerShell alternatives are included for bulk checks.');
  lines.push('> Mark each item ✅ when verified or ❌ if action is needed.');
  lines.push('');

  // Summary table
  let critCount = 0, highCount = 0, medCount = 0;
  for (const s of sections) {
    for (const item of s.items) {
      if (item.risk === 'CRITICAL') critCount++;
      else if (item.risk === 'HIGH') highCount++;
      else if (item.risk === 'MEDIUM') medCount++;
    }
  }
  lines.push('## Audit Summary');
  lines.push(`| Risk Level | Count |`);
  lines.push(`|------------|-------|`);
  lines.push(`| 🔴 CRITICAL | ${critCount} checks |`);
  lines.push(`| 🟠 HIGH | ${highCount} checks |`);
  lines.push(`| 🟡 MEDIUM | ${medCount} checks |`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const section of sections) {
    lines.push(`## ${section.title}`);
    lines.push('');
    for (const item of section.items) {
      lines.push(`### ${riskBadge(item.risk)} — ${item.check}`);
      lines.push('');
      lines.push(`**Portal path:**  `);
      lines.push(`${item.portal}`);
      lines.push('');
      if (item.ps) {
        lines.push('<details>');
        lines.push('<summary>PowerShell (for reference only)</summary>');
        lines.push('');
        lines.push('```powershell');
        lines.push(item.ps);
        lines.push('```');
        lines.push('');
        lines.push('</details>');
        lines.push('');
      }
      lines.push(`**Note:** ${item.note}`);
      lines.push('');
      lines.push('- [ ] Checked  &nbsp;&nbsp; Findings: _______________');
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  lines.push('## Audit Sign-off');
  lines.push('');
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| Auditor | Ronnie Yee |`);
  lines.push(`| Date | ${TODAY} |`);
  lines.push(`| Tenant | ${TENANT} |`);
  lines.push(`| Critical items resolved | / ${critCount} |`);
  lines.push(`| High items resolved | / ${highCount} |`);
  lines.push(`| Jira ticket | [JIRA-###] |`);
  lines.push(`| Next review | ${nextReviewDate()} |`);
  lines.push('');

  return lines.join('\n');
}

function nextReviewDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().split('T')[0];
}

// ── Main ───────────────────────────────────────────────────────────────────
function main() {
  console.log(`security-audit.js — ${TENANT} security audit generator\n`);

  const report = renderReport();
  fs.writeFileSync(OUT_FILE, report, 'utf8');

  console.log(`  ✓ Report written to: ${OUT_FILE}`);
  console.log('');

  // Print summary to console
  let critCount = 0, highCount = 0, medCount = 0;
  for (const s of sections) {
    for (const item of s.items) {
      if (item.risk === 'CRITICAL') critCount++;
      else if (item.risk === 'HIGH') highCount++;
      else if (item.risk === 'MEDIUM') medCount++;
    }
  }
  console.log('Audit checklist:');
  console.log(`  🔴 CRITICAL  ${critCount} checks`);
  console.log(`  🟠 HIGH      ${highCount} checks`);
  console.log(`  🟡 MEDIUM    ${medCount} checks`);
  console.log('');
  console.log(`Open ${path.basename(OUT_FILE)} in VS Code or any Markdown viewer to work through the audit.`);
}

main();
