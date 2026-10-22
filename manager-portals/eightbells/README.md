# eightbells-manager

GitHub Pages site for **manager.eightbellsbolney.com** — Eight Bells manager landing menu.

Canonical source in this monorepo: `manager-portals/eightbells/index.html`.

## Landing tiles

- Paperwork, Menus, Card Takings
- **Drink Pricing** → shared Varlo Price Query  
  `…/exec?venue=eightbells` (not `page=kegcosting`)
- **Gift cards** → `https://www.eightbellsbolney.com/staff/vouchers`  
  Staff sign-in password is **`VOUCHER_STAFF_PASSWORD`** in Vercel (pub site).  
  Do not commit that password here.

## Deploy

Cloud agents get **403** pushing `charlesknew-alt/eightbells-manager`. Charles: run
`bash manager-portals/CHARLES_DEPLOY.sh` from a machine with push access, or see
`manager-portals/README.md`.

Until then, use https://owner.kinfoldinns.co.uk/manager-portals/eightbells/
