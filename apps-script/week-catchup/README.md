# Manager week catch-up (not “today’s” week)

## What’s wrong

Owner Paperwork only shows weeks that were **submitted / approved / exported**.  
Your archive last week is **`WEEK_02AUG26`** — that’s the last one that finished the owner path.

The **manager hub** currently shows the **newest DRAFT** sheet by week-ending date.  
Something created (or opened) **this calendar week** as a draft (`WEEK_20SEP26`, Mon 14–Sun 20). So the hub jumps there even though:

- the manager has **not** entered readings for that week, and  
- weeks **after 2 Aug** were never completed in order.

**FRI 18 highlighted** = calendar today (cosmetic).  
**CONTINUE: DAY 1 OF 7 / Monday 14** = first empty day *inside that wrong week*.

What you want: manager stays on **Monday of the first week after the last owner-submitted week**  
→ after `WEEK_02AUG26` that is **Mon 3 Aug 2026** (`WEEK_09AUG26`).

---

## Immediate workaround (today)

1. Manager hub → **All weeks (BROWSE)**  
2. Open **`WEEK_09AUG26`** (week ending 9 Aug) — or the first `WEEK_*` after `WEEK_02AUG26` if that name differs  
3. Enter days in order (Mon → Sun), submit when the week is done  
4. Do **not** use week ending 20 Sep until catch-up reaches it  

If `WEEK_09AUG26` doesn’t exist: create the next week **after** the last submitted one (don’t jump to “this week”).

Optional cleanup: if `WEEK_20SEP26` is empty and was opened by mistake, leave it unused until you catch up (or delete only if you’re sure it’s empty).

---

## Code fix (PubSystemLib) — live

Deployed **18 Sep 2026** with clasp:

| Project | Pin |
|---|---|
| PubSystemLib | **v71** (`4.24 manager week catch-up after last submitted/approved`) |
| Eight Bells takings `/exec` | library **v71**, web app **@203** |
| Windmill takings `/exec` | library **v71**, web app **@54** |

Helpers: [`ManagerWeekCatchup.gs`](./ManagerWeekCatchup.gs) (also `ManagerWeekCatchup.js` in the library).

Week selection now:

1. Find the latest week that is **SUBMITTED** or **APPROVED** (filed toward owner)  
2. Target = **next Sunday** after that week ending  
3. Prefer that exact sheet — **never** a later calendar draft  
4. If the catch-up sheet is missing, hub falls back to last submitted → **Start Next Week**, which creates `WEEK_09AUG26` (not week ending 20 Sep)  
5. `startNewWeekImpl` ignores a later mistaken draft when creating the catch-up week  

After deploy: refresh the manager hub. If `WEEK_09AUG26` does not exist yet, use **Start Next Week** once. Then **CONTINUE** should be Monday 3 Aug. Leave empty `WEEK_20SEP26` unused until catch-up reaches it.
