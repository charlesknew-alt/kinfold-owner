# Hospitality yarns (Daily Entry)

Short **classic joke** or **clear industry fact** under the day title on Daily Entry.

## What belongs here

- Classic bar / restaurant jokes with an obvious punchline (“A man walked into a bar. Ouch.”)
- Plain-English hospitality facts (pubs, licensing, hotels, pizza, kitchen slang, coffee, etc.)

## What does **not** belong

- Cryptic “shift yarn” in-jokes with no punchline
- Private-language one-liners managers have to decode

## Repeat behaviour

- Built-in bank is ~425 clear jokes + facts.
- Same calendar day → same yarn (stable).
- Year shifts the sequence so the same date next year is different.

## Top-ups (no code edit)

```bash
clasp run appendHospitalityYarns --params '[[{"k":"joke","t":"A man walked into a bar. Ouch."},{"k":"true","t":"True: CAMRA was founded in 1971."}]]'
```

Kinds: `joke` | `true`  
Keep each line to one or two short sentences.
