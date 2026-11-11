# Shared site appearance

- `packages/site-ui` provides this site's colors, fonts, logo, navigation, footer and theme behavior. The blog and tools own their navigation and page layout, with a single link back to the homepage.
- Keep the homepage navigation and footer in the homepage. Consumers can use shared tokens and the theme runtime, with their layout and typography defined locally.
- After changing this package, update its version and regenerate `node scripts/sync-site-ui.mjs --manifest`. Run build, integrity/theme tests and cross-site visual checks. Review desktop/mobile and light/dark screenshots.
- Consumers use checked-in, checksum-verified `vendor/site-ui` snapshots and `site-ui.lock.json`. Their scheduled update workflow opens an upgrade PR. Never patch a generated snapshot by hand.
- Keep old URLs, document search, keyboard navigation, CSP, local storage schemas and tool calculations working. Theme migration may read old preference keys; never clear or migrate business data for a visual change.
