# Hospitality yarns (Daily Entry)

Short joke / shift yarn / true-ish line under the day title when a manager opens Daily Entry.

## Repeat behaviour

- Built-in bank is **~840** lines (original jokes/shift yarns + verified UK pub / hospitality facts).
- Same calendar day always shows the same yarn (stable).
- **Year shifts the sequence**, so 18 Sep next year is not the same line as this year.
- With this bank size, calendar days do not reuse a line within a normal year.

## How to feed new ones (no code edit)

From the PubSystemLib clasp folder (with `CLASPRC_JSON`):

```bash
clasp run appendHospitalityYarns --params '[[{"k":"joke","t":"Your new short line."},{"k":"funny","t":"Another one."},{"k":"true","t":"Surprising fact…"}]]'
```

Kinds: `joke` | `funny` | `true`  
Keep each `t` to **one or two short sentences**.

Extras live in Script Property `HOSPITALITY_YARNS_EXTRA` and merge with the built-in bank on every page serve.

Or send Charles a list in chat and an agent can append + redeploy.

## Notes on “true” yarns

True-ish lines are short, sourced from well-known pub/licensing history (e.g. last orders / DORA wartime hours, ploughman’s marketing, CAMRA 1971, tied vs free house, snug, penny universities). Myths are called out (e.g. tip ≠ “To Insure Promptness”).
