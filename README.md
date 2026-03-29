# Alex Comrade Amprius — AI IT & Software Engineer Agent v6

A Tier 3 AI-powered IT and software engineering agent built on [Claude Code](https://claude.ai/code). Alex is a context-aware copilot for IT admins and engineers managing Microsoft 365 environments — giving you exact portal steps, PowerShell commands, cloud infrastructure guidance, DevOps support, and decision support across the entire technology stack.

Built for small-to-midsize orgs running the M365/Intune/Entra/Meraki stack, with career-growth coverage into Azure, Kubernetes, Terraform, and Linux.

---

## What It Does

Alex ships as a set of slash commands and a CLAUDE.md system prompt that gives Claude deep context about your IT environment. Instead of writing the same prompt every time, you just type `/offboard` or `/mfa-issue` and get a full, actionable procedure instantly.

**194 slash commands** across 13 domains:

| Domain | Count | Example Commands |
|--------|-------|-----------------|
| Core IT Operations | 52 | `/onboard`, `/offboard`, `/password-reset`, `/mfa-issue`, `/device-wipe` |
| Identity & Access Management | 16 | `/bulk-user-create`, `/ca-policy-review`, `/risky-users`, `/break-glass-check` |
| Device Management & Endpoint | 15 | `/device-audit`, `/autopilot-register`, `/bitlocker-key`, `/app-deploy` |
| Email, Exchange & Collaboration | 15 | `/mail-trace`, `/mail-flow-rule`, `/dkim-dmarc-check`, `/teams-governance` |
| Network & Infrastructure | 15 | `/meraki-health`, `/meraki-vpn-status`, `/subnet-calculator`, `/vpn-client-setup` |
| Security & Compliance | 15 | `/secure-score`, `/phishing-response`, `/compromised-account`, `/audit-log-search` |
| VoIP & Telephony | 10 | `/unite-extension-create`, `/unite-call-queue`, `/voip-qos-check`, `/phone-provision` |
| Cloud & DevOps | 15 | `/az-vm-manage`, `/docker-build`, `/k8s-pod-debug`, `/terraform-plan` |
| Database & App Performance | 8 | `/sql-performance`, `/api-troubleshoot`, `/log-analysis`, `/cache-troubleshoot` |
| Automation & Scripting | 10 | `/ps-module-setup`, `/graph-api-call`, `/power-automate-flow`, `/cron-job` |
| Documentation & Reporting | 10 | `/change-request`, `/post-mortem`, `/vendor-comparison`, `/budget-request` |
| Monitoring & Incident Response | 8 | `/health-dashboard`, `/outage-response`, `/war-room-it`, `/root-cause-analysis` |
| Physical Security & Facilities | 5 | `/bayalarm-status`, `/bayalarm-cutover`, `/site-readiness`, `/cabling-request` |

---

## Stack This Was Built For

- **Identity:** Microsoft 365 + Hybrid AD + Entra Connect
- **MDM:** Intune (Windows, iOS, Android)
- **Network:** Cisco Meraki (MX, MR, MS)
- **VoIP:** Intermedia Unite
- **Ticketing:** Jira Service Management
- **Security:** Microsoft Defender / Conditional Access / Identity Protection
- **Cloud:** Azure (IaaS, PaaS, cost management)
- **DevOps:** Docker, Kubernetes, Terraform, GitHub Actions, Azure DevOps
- **Databases:** SQL Server, PostgreSQL
- **Linux:** Ubuntu/CentOS server administration
- **Scripting:** PowerShell, Python, Bash

Works with any M365 org — customize the CLAUDE.md to match your environment.

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/[Ronny-Yee]/Alex.git
cd Alex
```

### 2. Open in Claude Code (VS Code)

Open the folder in VS Code with the Claude Code extension installed. `CLAUDE.md` loads automatically as the system prompt.

### 3. Customize for your org

Edit `CLAUDE.md` — replace all placeholders with your actual values:

| Placeholder | Replace With |
|-------------|-------------|
| `[YOUR_NAME]` | Your name |
| `[YOUR_ORG]` | Your organization name |
| `[YOUR_DOMAIN]` | Your M365 tenant domain (e.g. `contoso.com`) |
| `[YOUR_GITHUB]` | Your GitHub username |
| `[SITE_A]`, `[SITE_B]` | Your office site names |
| `[VOIP_PARTNER]` | Your VoIP vendor/partner |
| `[SECURITY_VENDOR]` | Your physical security vendor |
| `[ISP_VENDOR]` | Your ISP (e.g. `Comcast`, `AT&T`) |
| `[ORG]`, `[TLD]` | Your AD domain components (e.g. `contoso`, `com`) |

Also update the same placeholders in:
- `.claude/commands/onboard.md` — AD OU paths and domain
- `.claude/commands/offboard.md` — AD OU paths
- `.claude/plugins/family-bridges-it/skills/it-ops.md` — environment table
- Any command file that references your environment

### 4. Use a command

In Claude Code, type any slash command:

```
/onboard
/phishing-response
/meraki-health
/k8s-pod-debug
```

Alex will deliver the full procedure immediately — portal steps first, PowerShell in collapsible blocks.

---

## How It Works

```
.claude/
  commands/       # 194 slash command prompt files (.md)
  plugins/
    [org]-it/
      skills/
        it-ops.md  # Environment knowledge base (loaded as a plugin skill)
CLAUDE.md          # Main system prompt — identity + environment + behavior rules + command index
```

Each command file is a self-contained prompt. When you type `/onboard`, Claude Code loads that file as a prompt and responds with a full onboarding procedure, using the context from `CLAUDE.md` and the plugin.

---

## v6 Upgrade Summary (from v5)

| Metric | v5 | v6 |
|--------|----|----|
| Total commands | 52 | 194 |
| Technical domains | 6 | 13 |
| Agent tier | Level 2 IT Support | Tier 3 Full-Stack Engineer |
| Cloud/DevOps | None | Azure, Docker, K8s, Terraform, CI/CD |
| Database | None | SQL Server, PostgreSQL |
| Linux | None | Full server administration |
| Security depth | Basic (MFA, quarantine) | Full (Secure Score, DLP, phishing response, RCA) |

---

## Design Principles

- **Portal steps first** — every procedure shows admin center clicks before PowerShell
- **PowerShell in collapsible blocks** — `<details>` tags keep responses clean
- **Placeholders only** — never real employee names, emails, or UPNs in any output
- **Confirm before destructive actions** — wipe, delete, disable always prompt for confirmation
- **Plain English on every PowerShell line** — every command gets a comment explaining what it does
- **Top-to-bottom knowledge** — can explain from fundamentals to advanced for any topic

---

## Customizing for Your Org

Beyond the domain/name placeholders, you can tailor Alex to your stack:

1. **Add commands** — drop a new `.md` file in `.claude/commands/` with any prompt
2. **Update the environment table** — in `CLAUDE.md` and `it-ops.md`, update the infrastructure table to match your actual setup
3. **Add your active projects** — in `CLAUDE.md`, update the Active IT Projects table so Alex can reference them in board reports and vendor emails
4. **Adjust skill gaps** — the "Skill Gaps" section in `CLAUDE.md` tells Alex where to be extra thorough — edit it to match your actual weak spots

---

## Requirements

- [Claude Code](https://claude.ai/code) (VS Code extension or CLI)
- Claude API access (Sonnet or Opus recommended)

---

## License

MIT — see [LICENSE](LICENSE)
