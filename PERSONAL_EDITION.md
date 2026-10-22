# All The Ponies — Personal Edition

This is a personal modification of All The Ponies for one user.

## Added
- Personal checklist: received / wanted.
- F2P data imported from the user's spreadsheet (`src/data/personal/f2p.json`).
- Useful pony roles imported from `src/data/personal/useful.json`.
- Separate pages for Useful Ponies and Free Ponies.
- F2P and Useful filters on the pony catalogue.
- A sidebar button that checks the current `game_version.json` from the original All The Ponies asset service and reloads the site after clearing the game-data cache when a newer version is available.

## Important data separation
Original All The Ponies game data remains separate from personal data. A game-data update must not overwrite F2P information, useful roles, or personal checklist state.

Personal checklist state is stored by the existing Pinia persisted-state mechanism in the browser.


## Test/deployment mode

This personal build can run without the original project's private Cloudflare R2/KV bindings. In that mode, game data is read from the public All The Ponies asset service, while optional translation-credit/maze server data gracefully falls back when the private KV binding is unavailable.
