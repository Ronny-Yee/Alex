# SharePoint Access — familybridges.org

Use placeholders below. Replace with actual values when running.

**Placeholders:**
- `[USER_EMAIL]` — user's email/UPN being granted access
- `[SITE_URL]` — SharePoint site URL (e.g. https://familybridges.sharepoint.com/sites/Finance)
- `[SITE_NAME]` — display name of the SharePoint site
- `[LIBRARY_NAME]` — specific library or folder name (if not granting full site access)
- `[PERMISSION_LEVEL]` — Read, Edit, or Full Control
- `[EXTERNAL_EMAIL]` — external user's email (if outside org)

---

## Portal Steps — Internal User

### Grant Access to Full Site

1. Go to **https://admin.microsoft.com → SharePoint → Sites → Active sites**
2. Click on `[SITE_NAME]`
3. Click **Membership** tab → **Add members**
4. Search for `[USER_EMAIL]` → select them
5. Choose role:
   - **Member** = Edit access
   - **Visitor** = Read-only access
   - **Owner** = Full control
6. Click **Save**

### Grant Access to a Specific Library or Folder (not the whole site)

1. Open the SharePoint site: `[SITE_URL]`
2. Navigate to the library or folder: `[LIBRARY_NAME]`
3. Click **Settings (gear icon) → Library settings** (for a library)
   - Or right-click the folder → **Manage access**
4. Click **Stop inheriting permissions** (if needed — this breaks inheritance from the parent)
   > ⚠️ Breaking inheritance means future site-level permission changes won't apply here automatically
5. Click **Grant permissions**
6. Enter `[USER_EMAIL]` → select permission level: `[PERMISSION_LEVEL]`
7. Uncheck "Send an email invitation" if you don't want to notify them
8. Click **Share**

---

## Portal Steps — External User

### Check External Sharing Settings First

1. Go to **https://admin.microsoft.com → SharePoint → Policies → Sharing**
2. Confirm **External sharing** is set to at least **New and existing guests**
3. If it's set to **Only people in your organization**, you'll need to change it — check with your manager before doing this

### Grant External Access

1. Go to **https://admin.microsoft.com → SharePoint → Sites → Active sites**
2. Click `[SITE_NAME]` → **Settings** tab
3. Under **External sharing**, confirm the site allows external guests
4. Open the SharePoint site: `[SITE_URL]`
5. Click **Share** (top right) or navigate to the specific library/folder
6. Enter `[EXTERNAL_EMAIL]`
7. Set permission: `[PERMISSION_LEVEL]`
8. Add an optional message → click **Send**
9. External user receives an email with a link and must verify their identity (Microsoft account or one-time passcode)

### Verify External User Access Granted

1. Go to **https://entra.microsoft.com → Users → All users**
2. Filter by **User type: Guest**
3. Search for `[EXTERNAL_EMAIL]` — confirm they appear as a guest

### Revoke External Access (when done)

1. Go to the site: `[SITE_URL]`
2. **Settings → Site permissions → Advanced permissions settings**
3. Find the external user → check their box → **Remove user permissions**
4. Also go to **Entra ID → Users → Guest accounts** → delete the guest account if no longer needed

---

## Notes

- **Internal users via security group (recommended):** Instead of adding individuals, add `[USER_EMAIL]` to a security group that already has SharePoint access. Easier to manage long-term.
- **Permission levels:** Read = view only, Edit = add/edit/delete files, Full Control = manage site settings and permissions
- **License requirement:** External guests don't need an M365 license to view/edit SharePoint files shared with them
