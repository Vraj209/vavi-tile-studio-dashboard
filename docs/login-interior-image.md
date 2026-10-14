# Login interior image

The login-only visual uses `public/images/login-ivory-interior.webp`, generated with the built-in image-generation tool and optimized to WebP with Sharp (quality 86, 272,308 bytes). The master is 1024 × 1536 px. It is a generated architectural visualization based on an owner-supplied sample, not a photograph of a completed installation.

## Product reference

- Source: `D:/Agency/vivatiles/data/landscape/L_2.png` in the public landing-page checkout.
- The landing gallery identifies this owner-supplied sample descriptively as **Ivory geometry**; this is not a verified SKU.
- Reference traits: paired tall ivory panels, approximately 1:2 each, three stacked diamond medallions, loop ornament and beadwork, small muted reflective insets and a diamond border.
- The room interpretation retains these recognizable features and colors without inventing a product name or asserting physical measurements.

## Integration

Only `/login` opts into the photograph. The existing right-side form, typography, login handlers and other authentication pages are preserved. The image fills the panel with `object-fit: cover` and a fixed focal point. No color tint hides the product. The login page's concurrent `showPanelCopy={false}` and `showPanelLogo={false}` settings are retained, leaving the photograph unobstructed. Below 768 px the decorative panel is hidden, keeping the sign-in form immediately accessible. Lazy loading avoids requesting the hidden image on mobile; Next.js supplies responsive optimized image sizes, accounting for both panel width and the height needed by the portrait crop.

## Verification

- Lint, Next.js type generation/TypeScript checking and production build passed.
- Browser coverage: 1440 × 900, 1024 × 768, 1920 × 1080, 768 × 1024, 767 × 844, 390 × 844 and 320 × 844.
- Desktop form DOM, geometry and computed styles match the saved baseline. Mobile form styling and internal layout remain unchanged; the submit button is immediately visible.
- Fresh mobile contexts request no decorative interior image. The tall 768 px layout selects a 750 px source instead of an undersized 384 px source.
- No page errors or horizontal overflow. Password visibility and forgot-password navigation work. Seven form/authentication source-file hashes match the baseline; no live sign-in was attempted.
- Local browser evidence: `.qa/login-after.json`, `.qa/login-after-mobile-final.json` and `.qa/login-after-*.png`.

## Generation prompt

```text
Use case: photorealistic-natural.
Asset type: finished architectural photograph for the tall left visual panel of the Viva Tile owner login. PORTRAIT image, ideally 1024 x 1536.
Input image 1 is the exact owner-supplied tile product reference, NOT a mood board: two adjacent ivory geometric relief tile panels. Preserve this specific product's actual design, ivory color, each panel's tall approximately 1:2 proportions, three stacked large beaded diamond medallions per panel, looping floral linework in each medallion, tiny restrained bronze/grey/sage mirror insets, outer repeating small diamond and bead border, narrow central seam, delicate low sculptural depth and relief. Do not invent a replacement pattern. Reproduce the full pair faithfully as the main full-height architectural feature wall.
Create an exquisite yet believable classic contemporary private entrance hall, photographed for a premium interiors magazine. The reference tile pair is fitted almost floor to ceiling in a shallow architectural recess, centered and square-on to camera with straight parallel verticals, occupying about 75% of image width, beginning around 12% image height and ending around 68%. The pattern must remain clear and recognizable within the central crop. Show enough surrounding interior to feel inhabited: warm honed limestone floor, quiet chalky plaster walls, a slim low dark walnut console or bench positioned at the FAR side without concealing most of the relief, restrained natural linen upholstery, one very small dark bronze detail. No excessive decoration. Soft side daylight from an off-frame window skims across the ivory relief to reveal the actual subtle texture and casting shadows. Physically plausible light, subtle microtexture, natural imperfect linen and matte stone, subtle filmic tonal range. No CGI plastic gloss, no exaggerated depth, no invented additional ornaments on the product.
Composition must work edge-to-edge in a portrait panel and also in a nearly-square center crop. Tile face dominates the upper and central image, clearly visible rather than shadowed. Lower foreground roughly last 25% can be naturally darker warm walnut / muted olive seating and shadowed floor, a calm unobtrusive area for separate website copy later. The top-left corner should be quiet warm plaster with space for a small separate logo later. No text baked into the image, no logo, watermark, people, signage, extra wall art, marble feature wall, gold excess or clutter. Image only, not a web page or mockup. Quiet luxury through proportions, natural materials, daylight and accurate product detail.
```
