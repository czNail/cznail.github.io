# Shared site appearance

- `packages/site-ui` is the sole source of brand colors, fonts, logo, global navigation, footer and theme behavior for this site and the blog/tools.
- Do not duplicate shared markup or redefine `--site-*` in application styles. Map application-specific variable names to shared tokens. Keep business layout and reading typography local.
- After changing this package, update its version and regenerate `node scripts/sync-site-ui.mjs --manifest`. Run build, integrity/theme tests and cross-site visual checks. Review desktop/mobile and light/dark screenshots.
- Consumers use checked-in, checksum-verified `vendor/site-ui` snapshots and `site-ui.lock.json`. Their scheduled update workflow opens an upgrade PR. Never patch a generated snapshot by hand.
- Keep old URLs, document search, keyboard navigation, CSP, local storage schemas and tool calculations working. Theme migration may read old preference keys; never clear or migrate business data for a visual change.
