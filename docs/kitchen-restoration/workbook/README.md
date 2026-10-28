# Workbook release verification

The [Workbook game page](https://english-games.workbook.co.il/goblin-kitchen) now serves the restored 36-level campaign and current gameplay poster from the immutable `2026-10-28` release. Game source: `2bd6ad9`. Workbook [PR 374](https://github.com/AceDZN/acedzn-tools/pull/374) merged as `3b50d1057b2f919c553484af33644134fb36f377`; discovery CI and CodeRabbit passed. Production deployment `dpl_Bkko9mmtjFw8oTvdFGuCnGcbE65K` reached READY and owns the normal English Games domain.

The standard release workflow ran 84 game checks and the build from a clean committed source. All 53 public files (15,113,748 bytes) matched local SHA-256, content type and immutable cache headers. The adjacent release manifest records every file. All 36 catalog titles match source levels.ts, with the two published recipe/quantity lesson links. Catalog 18/shared 9 tests, catalog/player typechecks, catalog lint and the English Games production build passed.

`live-player.json` records all 36 actual custom-domain iframe entries with exact requested levels, current assets and ready-before-start events. Normal input completed the first dish, earned a completion at catch, and advanced to level 2. Portrait touch took and prepared a cucumber in level 36; every station center was clear of the HUD. Essential cookies were chosen through the ordinary UI. The desktop royal scene, carried first dish and portrait captures were opened and inspected.

The first public automation attempts timed out while waiting on animation-frame polling. Separate direct browser observations loaded levels 1, 2, 3 and 36 with every required model ready and no missing models. The final checker polls readiness every 100ms and completes the whole public flow. No game-code change was needed. The proxy manifest is compressed with Zstandard in a raw HTTP response; after decoding its JSON matches the source exactly. The proxied kitchen GLB also matches the tested bytes.

There is an existing Clerk subdomain-allowlist warning/403 on the host's sign-in client. It is recorded under otherFailures; anonymous play and the game assets pass. No Clerk account configuration was changed, and sign-in was not part of the success claim.

The local records distinguish the first complete smoke test from the later 36-entry run whose final framing assertion rejected a one-pixel outer header border. The live checker allows 2px border rounding. Early local attempts also exposed a shared-port collision and a 127.0.0.1/localhost proxy mismatch; the isolated localhost4471 preview used normal Clerk server configuration. Other crews' processes and credentials were not changed.

Reproduce the public check from the game repository root:

```bash
node scripts/workbook-player-check.cjs https://english-games.workbook.co.il --all
```

It uses normal navigation, pointer, touch and actions. Only game time is stepped; ingredients, positions, saved progress and success are never injected. These checks establish the tested delivery/play flow, not user visual acceptance, physical-phone performance or learning gains.
