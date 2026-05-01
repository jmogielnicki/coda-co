# Open work

Known gaps in the Next.js rebuild. The original phased rebuild is complete;
what's left is polish that wasn't required to ship the prototype faithfully.

- **Cart count in Nav.** Requires `Nav` to become a client component or to
  read a server-side cookie. Currently the cart total is invisible until the
  PDP.
- **Server Actions for vendor forms.** `GoodsForm` and `ServicesForm` finish
  with `router.push('/list-with-us/confirm')` — replace with a real Server
  Action so submissions persist.
- **`generateStaticParams` for `/shop/[productId]`** to enable full static
  generation of product pages.
- **Suspense boundaries** around filter components on `/shop` and `/services`
  to enable streaming.
