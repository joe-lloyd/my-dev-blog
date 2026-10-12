# byteMyFaceOff FX pack

Full-frame explainers for the videos, as a Neon Video Studio FX pack: `FourApps` (apps around
a protocol hub), `StatCounter`, `CardList`, `SpecCard` and `PostCard`. Install with
`neon-cli packs install <this folder>` (or FX → Library → Install folder), then add it to the
project. `assemble.mjs` enables it in projects it builds.

Reveal times are seconds from the clip start; `record.mjs`'s `ctx.when()` works them out from
the voiceover so each item lands on the word that names it.

To type-check, copy the folder into a Neon checkout's `examples/packs/`, link
`node_modules` from `boba-expressive`, and run `npx tsc -p tsconfig.json --noEmit`.

On Windows, installing through the app needs joe-lloyd/neon-video-studio#2; headless renders
from a source checkout work without it.
