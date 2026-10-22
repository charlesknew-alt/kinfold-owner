# PubSystemLib → drinks-pricing

Paperwork hub **Price Query** / `?page=kegcosting` redirects must target the real calc:

```
https://app.varlo.co.uk/drinks-pricing?venue=eightbells
https://app.varlo.co.uk/drinks-pricing?venue=windmill
```

## Patch (in PubSystemLib project)

**`_Constants.gs`**

```js
const VARLO_PRICE_QUERY_URL =
  'https://app.varlo.co.uk/drinks-pricing';
```

**`Templates_Serve.gs`** — `priceQueryUrlForVenue_` fallback base = same URL;  
`serveKegCosting` title/body copy can say “Drink Pricing”.

Bump library version, then in **Eight Bells Takings** + **Windmill Inn Takings**  
Resources → Libraries → re-pin PubSystemLib to the new version.

Cloud agents often cannot `clasp push` this library from the owner repo; Charles applies the pin.
