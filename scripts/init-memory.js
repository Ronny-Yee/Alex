#!/usr/bin/env node
/**
 * init-memory.js
 * Initializes / regenerates the Claude Code memory files for the ITOps project.
 * Run with: node scripts/init-memory.js
 * No npm install needed — uses only built-in Node.js modules.
 */

const fs   = require('fs');
const path = require('path');
const os   = require('os');

// ── Paths ──────────────────────────────────────────────────────────────────
const MEMORY_DIR = path.join(
  os.homedir(),
  '.claude', 'projects', 'C--Users-ronys-ITOps', 'memory'
);

// ── Memory file definitions ────────────────────────────────────────────────
const memories = [
  {
    file: 'user_role.md',
    indexLine: '- [User Role](user_role.md) — Ronnie Yee, IT Consultant at Family Bridges, M365/Entra/Intune/Meraki stack',
    content: `---
name: User Role & Environment
description: Ronnie's role, experience level, and daily toolset at Family Bridges
type: user
---

Ronnie Yee is the IT Consultant / Systems Administrative Coordinator at Family Bridges (familybridges.org), a nonprofit with ~120 staff.

- **Experience:** 5 years IT, still learning PowerShell — explain every command in plain English
- **Microsoft stack:** M365 Business Premium, Entra ID (hybrid AD via Entra Connect), Intune, Exchange Online, Azure
- **Network:** Cisco Meraki MX + MR across 4 office sites
- **VoIP:** Intermedia Unite (migrated from Toshiba PRI)
- **Ticketing:** Jira Service Management (cloud, 2026) — space: DevOps / Get IT Help
- **Response preference:** Portal/admin center steps FIRST, PowerShell second (wrapped in collapsible block)
- **Device convention:** DT-FirstName,LastName (desktops), LT-FirstName,LastName (laptops) — flag violations
`
  },
  {
    file: 'project_voip_migration.md',
    indexLine: '- [VoIP Migration](project_voip_migration.md) — Intermedia Unite rollout, Hong Fook + Harrison in progress',
    content: `---
name: VoIP Migration — Intermedia Unite
description: Status of VoIP migration from Toshiba PRI to Intermedia Unite across all sites
type: project
---

Migrating all 4 office sites from Toshiba PRI to Intermedia Unite VoIP.

**Why:** Toshiba PRI end-of-life; cost savings by eliminating Comcast landlines site-by-site as Unite goes live.

| Site | Status |
|------|--------|
| Main office | ✅ Complete |
| Hong Fook | 🔄 In progress |
| Harrison | 🔄 In progress |
| Site 4 | Unknown |

**How to apply:** When troubleshooting phone issues, check whether the affected site has completed migration. If not, the user may still be on the old PRI system. ATS handles cabling/install. Coordinate BayAlarm landline cutover to happen simultaneously with Unite go-live at each site.
`
  },
  {
    file: 'project_vpn_migration.md',
    indexLine: '- [VPN Migration](project_vpn_migration.md) — P2P fiber to Meraki site-to-site VPN, TightVNC still on P2P',
    content: `---
name: VPN Migration — P2P to Meraki Site-to-Site
description: Replacing P2P fiber between main office and Hong Fook with Meraki MX-to-MX VPN
type: project
---

Replacing the existing P2P fiber (main ↔ Hong Fook) with a Meraki site-to-site VPN (MX-to-MX).

**Why:** Simplify WAN topology, reduce P2P fiber costs, bring Hong Fook onto the same Meraki SD-WAN fabric as other sites.

**Current blocker:** TightVNC is still running over the P2P link and needs to be migrated before the P2P can be cut.

**How to apply:** Do not recommend cutting the P2P fiber until TightVNC dependency is resolved. VPN config path: Meraki → Security & SD-WAN → Site-to-site VPN. Vendor: ATS handles physical install.
`
  },
  {
    file: 'feedback_response_style.md',
    indexLine: '- [Response Style Feedback](feedback_response_style.md) — Portal first, no PII, plain English PS, direct tone',
    content: `---
name: Response Style Preferences
description: How Ronnie wants Alex to format and deliver responses
type: feedback
---

Always show **portal/admin center steps FIRST**. PowerShell is secondary — wrap it in a \`<details>\` collapse block labeled "PowerShell (for reference only)" and explain every line in plain English.

**Why:** Ronnie is still learning PowerShell and primarily works through admin portals. Portal steps are immediately actionable; PS blocks are for reference.

**How to apply:** Every IT response should lead with numbered GUI steps using exact 2026 portal paths. Never lead with a PS block unless explicitly asked.

---

Never ask for or include real employee names, emails, UPNs, phone numbers, or any PII. Always use placeholders: [FIRST_NAME], [UPN], [USER@DOMAIN.COM], [DEVICE_NAME], etc.

**Why:** Hard security rule to prevent accidental PII exposure in AI conversations.

**How to apply:** Even if the user volunteers real names/emails, use placeholders in all output. No exceptions.

---

Keep responses short, scannable, and phone-screen readable. No walls of text. Use short bullets and clear headers. Never say "Great question!" or "Certainly!" — just answer.

**Why:** Ronnie often works in the field at one of 4 sites and reads responses on a phone.

**How to apply:** Bullet points over paragraphs. Warn with ⚠️ before any destructive action. End every workflow with a verification checklist.
`
  },
  {
    file: 'project_bayalarm_upgrade.md',
    indexLine: '- [BayAlarm Upgrade](project_bayalarm_upgrade.md) — Landline to internet-based alarm, timed with VoIP cutover',
    content: `---
name: BayAlarm Physical Security Upgrade
description: Upgrading alarm monitoring from landline to internet-based, coordinated with VoIP migration
type: project
---

Upgrading BayAlarm monitoring from Comcast landline to internet-based at each site.

**Why:** Once Intermedia Unite is live at a site, the Comcast landline feeding the alarm can be cut — eliminating the landline cost. The BayAlarm cutover is intentionally timed with the VoIP go-live to coordinate a single vendor/cabling visit.

**How to apply:** Do not schedule BayAlarm cutover independently. It must be coordinated with: ATS (cabling), BayAlarm (alarm cutover), and Comcast (landline disconnect) at the same time Unite goes live at that site.
`
  }
];

// ── MEMORY.md index template ───────────────────────────────────────────────
function buildMemoryIndex(entries) {
  const lines = entries.map(e => e.indexLine).join('\n');
  return `# ITOps Session Memory

## User Preferences
- Always show **portal/admin center steps FIRST**, PowerShell second
- Tenant domain: familybridges.org
- Keep responses direct and step-by-step

## Memory Files
${lines}
`;
}

// ── Main ───────────────────────────────────────────────────────────────────
function main() {
  console.log('init-memory.js — ITOps project memory initializer\n');

  // Ensure memory directory exists
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
    console.log(`Created memory directory: ${MEMORY_DIR}`);
  } else {
    console.log(`Memory directory: ${MEMORY_DIR}`);
  }

  // Write each memory file
  const written = [];
  for (const mem of memories) {
    const filePath = path.join(MEMORY_DIR, mem.file);
    fs.writeFileSync(filePath, mem.content, 'utf8');
    written.push(mem.file);
    console.log(`  ✓ ${mem.file}`);
  }

  // Regenerate MEMORY.md index
  const indexPath = path.join(MEMORY_DIR, 'MEMORY.md');
  fs.writeFileSync(indexPath, buildMemoryIndex(memories), 'utf8');
  console.log(`  ✓ MEMORY.md (index regenerated)`);

  console.log(`\nDone — ${written.length} memory files written + MEMORY.md updated.`);
}

main();
