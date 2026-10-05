# Manager portal deploy copies

Ready-to-copy HTML for the dedicated manager sites.

## Eight Bells — `eightbells/index.html`

Copy into **[charlesknew-alt/eightbells-manager](https://github.com/charlesknew-alt/eightbells-manager)** as `index.html` (GitHub Pages → `manager.eightbellsbolney.com`).

Cursor cannot push to that repo from this environment — paste/push from your PC, or merge a PR you open there.

### Gift cards tile

- Opens `https://www.eightbellsbolney.com/staff/vouchers`
- Staff password is **`VOUCHER_STAFF_PASSWORD`** in Vercel on the pub site  
- Do **not** commit that password into git

### Menus tile

Update the Menus URL cache-bust when Menus ships a new flow:

`https://owner.kinfoldinns.co.uk/menus.html?mode=staff&v=20261005-flow159`
