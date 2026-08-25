# Varlo

Unified login for The Windmill Inn and The Eight Bells.

**Use this now:** [https://owner.kinfoldinns.co.uk](https://owner.kinfoldinns.co.uk)

**Intended app host:** `https://app.varlo.co.uk` (DNS not pointed yet — see below)

`/app.html` redirects to the same front door.

## Who lands where

Everyone signs in on this GitHub Pages site (one CNAME). After login:

| Role | Lands on |
|---|---|
| Owner | Existing owner tiles (Staff Hub, invoicing, paperwork, rooms, payroll, card takings) |
| Eight Bells manager | Venue manager hub iframe — EB `/exec` with **no** `page=` and **no** `shell=owner` |
| Windmill manager | Venue manager hub iframe — WM `/exec` with **no** `page=` and **no** `shell=owner` |

Sheets and the live takings `/exec` IDs are unchanged. Owner paperwork / Card Takings still iframe those scripts with `shell=owner`. Manager views never send `shell=owner`. There is no owner-paperwork link on the manager hub. `openOwnerReview` is untouched.

## Owner: set manager passwords

1. Sign in as **Owner**.
2. Open **Manager passwords** on the owner home.
3. Enter your owner password, then the new Eight Bells and/or Windmill password.
4. Save. The new password is stored as a hash in the **Varlo Auth** Apps Script (Script Properties). It is not written into this HTML.
5. The next manager sign-in uses that password.

If the password service is unreachable, the owner tiles still work. Manager password changes need the Varlo Auth web app deployed (see `apps-script/varlo-auth/`).

## Charles: DNS for app.varlo.co.uk

This Pages site must keep working on **owner.kinfoldinns.co.uk** until DNS exists. The committed `CNAME` file stays `owner.kinfoldinns.co.uk` on purpose (GitHub Pages allows one custom domain).

When you want `app.varlo.co.uk`:

1. At the DNS host for `varlo.co.uk`, add a **CNAME**:
   - Name: `app`
   - Target: `charlesknew-alt.github.io`
2. After that record resolves, change this repo’s `CNAME` file to `app.varlo.co.uk` and push `main` so Pages issues a cert.
3. Optionally keep `owner.kinfoldinns.co.uk` as a DNS CNAME to `app.varlo.co.uk`. GitHub Pages will serve the domain named in the `CNAME` file.

Until step 2, use [owner.kinfoldinns.co.uk](https://owner.kinfoldinns.co.uk). Old manager Pages (`manager.eightbellsbolney.com`, `manager.windmilllittleworth.com`) can later redirect here.

## Paperwork Apps Scripts (unchanged)

There is **no separate "paperwork" project**. Owner paperwork (`page=owner`) and Card Takings (`page=cardday`) are pages on the **takings** web apps.

| Role | Live /exec |
|---|---|
| Eight Bells paperwork + cardday + manager hub | `AKfycbz4Q-UMy3o8Z6bjYrQMsWbRB4mSs1iHqz2CHAgYhT9QvakBY0pnutRbyQ2YUwpFnYtIww` |
| Windmill paperwork + manager hub | `AKfycbxgzF9DVJQ2sBPVGMWCfXsaAn5-3SUzWXuURGbu4lE__ccPowt0vWmQKqY43qtyGXgP` |
| Shared library (NA gate) | PubSystemLib `1JgPyQgHHD_DA9w28CJFth-7Bs3SNnt59vTERrxGhMJqd1g-y-j_YuOYU` (v58 honours `shell=owner`) |

Venue `doGet` remains `PubSystemLib.routePage(VENUE_CONFIG, e)`. Do not put an owner-paperwork link back on the manager hub.

## Varlo Auth Apps Script

Standalone project in `apps-script/varlo-auth/`. JSONP `doGet` actions: `ping`, `login`, `set`, `status`. It is **not** a venue page router.

```
cd apps-script/varlo-auth
clasp push
clasp deploy -d "Varlo Auth web app"
clasp run seedRolePassword --params '["owner","…"]'
clasp run seedRolePassword --params '["eightbells","…"]'
clasp run seedRolePassword --params '["windmill","…"]'
```

Live auth `/exec` (standalone, not a venue router):
`AKfycbyghJc5aFAK7pqBo5_ih5IGILWungoJnhwWxy_9MImlcH13sKmpfGU6a4NIt0CjLgvN`

Seed via clasp; do not commit passwords.
