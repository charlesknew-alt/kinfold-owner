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

## Code fix (PubSystemLib)

Paste-ready helpers: [`ManagerWeekCatchup.gs`](./ManagerWeekCatchup.gs)

They change week selection to:

1. Find the latest week that is **SUBMITTED** or **APPROVED** (filed toward owner)  
2. Target = **next Sunday** after that week ending  
3. Prefer that sheet (create if missing)  
4. **Never** prefer a later calendar draft while an earlier catch-up week is still open  

Wire-in steps are in that file’s header.
