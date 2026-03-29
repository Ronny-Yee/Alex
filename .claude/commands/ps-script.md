Write or explain a PowerShell script for [YOUR_ORG] IT. Tenant: [YOUR_DOMAIN] | Stack: M365, Entra ID, Intune, Exchange, on-prem AD. Always explain every line in plain English. Use placeholders — never real employee data.

---

## PowerShell Script Helper

**Tell me what you need:**
- What should the script do? (e.g., bulk add users to a group, pull license report, reset passwords, check sync status)
- One-off command or full script?
- Any specific output format needed? (CSV, screen, email)

---

**Format for every script:**

```powershell
# ============================================================
# Script: [Script Name]
# Purpose: [What it does in one sentence]
# Run on: [Where to run — AD Connect server, local machine, etc.]
# Prereqs: [Required modules — e.g., Microsoft.Graph, ActiveDirectory]
# ============================================================

# Plain English: what each section does
[code here]
# ↑ Plain English explanation of the command above
```

---

**Common modules used at [YOUR_ORG]:**

```powershell
# Connect to Microsoft Graph (M365/Entra)
Connect-MgGraph -Scopes "User.ReadWrite.All", "Group.ReadWrite.All"

# Connect to Exchange Online
Connect-ExchangeOnline -UserPrincipalName "[admin@YOUR_DOMAIN]"

# Active Directory (run on domain-joined machine)
Import-Module ActiveDirectory
```

Tell me what you need built.
