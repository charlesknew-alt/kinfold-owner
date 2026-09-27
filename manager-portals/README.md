# Manager department homes

These are the GitHub Pages `index.html` files for the dedicated manager domains.

They match the Varlo owner portal card style, but show **one pub** and **manager-only** tools.

| Folder | Domain | Tools |
|--------|--------|--------|
| `eightbells/` | manager.eightbellsbolney.com | Paperwork, Menus, Card Takings, Drink Pricing |
| `windmill/` | manager.windmilllittleworth.com | Paperwork, Menus, Rooms, Card Takings |

## Why they live here

This cloud agent can push to **kinfold-owner** only. The live manager domains are separate repos:

- `charlesknew-alt/eightbells-manager`
- `charlesknew-alt/windmill-manager`

## Deploy (from your PC)

```bash
# Eight Bells
cp manager-portals/eightbells/index.html /path/to/eightbells-manager/index.html
cd /path/to/eightbells-manager && git add index.html && git commit -m "Manager department home" && git push origin main

# Windmill
cp manager-portals/windmill/index.html /path/to/windmill-manager/index.html
cd /path/to/windmill-manager && git add index.html && git commit -m "Manager department home with Menus" && git push origin main
```

Or add both repos to the Cursor cloud environment so agents can push them directly.

## Preview on owner site

Until those repos are updated, you can open:

- https://owner.kinfoldinns.co.uk/manager-eightbells.html
- https://owner.kinfoldinns.co.uk/manager-windmill.html

Managers signing into **owner.kinfoldinns.co.uk** as Eight Bells / Windmill also get the same department home (no longer dropped straight into paperwork).
