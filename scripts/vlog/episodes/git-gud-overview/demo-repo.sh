#!/usr/bin/env bash
# Build pixel-pets, the demo repo for the Git Gud overview episode.
# Usage: demo-repo.sh OUTDIR   (wipes OUTDIR/pixel-pets and OUTDIR/pixel-pets-origin.git)
set -euo pipefail
OUT=${1:?outdir}
R="$OUT/pixel-pets"; O="$OUT/pixel-pets-origin.git"
rm -rf "$R" "$O"; mkdir -p "$R"; cd "$R"
git init -q -b main
git config user.name "Joe"; git config user.email "joe@example.com"
git config core.autocrlf false
day=0
c() { # c "message" -- commit what is staged, a day apart
  day=$((day + 1))
  local d; d=$(date -u -d "2026-07-01 +${day} days" +%Y-%m-%dT14:%M:00 2>/dev/null || date -u -v+${day}d -j -f %Y-%m-%d 2026-07-01 +%Y-%m-%dT14:%M:00)
  GIT_AUTHOR_DATE="$d" GIT_COMMITTER_DATE="$d" git commit -q -m "$1"
}
w() { mkdir -p "$(dirname "$1")"; cat > "$1"; git add "$1"; }

w package.json <<'X'
{ "name": "pixel-pets", "version": "0.1.0", "type": "module", "scripts": { "dev": "vite", "test": "vitest" } }
X
w README.md <<'X'
# Pixel Pets
A tiny virtual pet that lives in your terminal.
X
c "init: pixel pets"
w src/pet.ts <<'X'
export interface Pet { name: string; hunger: number; mood: 'happy' | 'grumpy' }

export function createPet(name: string): Pet {
  return { name, hunger: 0, mood: 'happy' }
}

export function rename(pet: Pet, name: string): Pet {
  return { ...pet, name }
}

export function isHungry(pet: Pet): boolean {
  return pet.hunger > 50
}

export function describe(pet: Pet): string {
  return `${pet.name} is ${pet.mood}`
}

export function play(pet: Pet): Pet {
  return { ...pet, hunger: pet.hunger + 5, mood: 'happy' }
}
X
c "feat: a pet with a name and hunger"
w src/game.ts <<'X'
import { createPet } from './pet'

const pet = createPet('Byte')
setInterval(() => { pet.hunger += 1 }, 1000)
X
c "feat: game loop"
git tag v0.1.0
w src/ui/hud.ts <<'X'
import type { Pet } from '../pet'

const BAR = 20

function bar(value: number): string {
  const filled = Math.round((value / 100) * BAR)
  return '#'.repeat(filled) + '.'.repeat(BAR - filled)
}

function title(pet: Pet): string {
  return pet.name.toUpperCase()
}

export function hud(pet: Pet): string {
  return `${title(pet)}  hunger ${bar(pet.hunger)}`
}
X
c "feat: heads-up display"

git checkout -q -b feature/feeding
w src/food.ts <<'X'
export const FOODS = { kibble: 2, cake: 5, carrot: 1 } as const
export type Food = keyof typeof FOODS
X
c "feat(feeding): food table"
cat >> src/pet.ts <<'X'

export function feed(pet: Pet, amount: number): Pet {
  return { ...pet, hunger: Math.max(0, pet.hunger - amount) }
}
X
git add src/pet.ts; c "feat(feeding): feed lowers hunger"
git checkout -q main
w docs/controls.md <<'X'
# Controls
F feeds your pet. S puts it to sleep.
X
c "docs: controls"
GIT_AUTHOR_DATE="2026-07-09T10:00:00" GIT_COMMITTER_DATE="2026-07-09T10:00:00" git merge -q --no-ff feature/feeding -m "Merge feature/feeding"
day=$((day + 1))

git checkout -q -b feature/sleep
w src/sleep.ts <<'X'
import type { Pet } from './pet'

export function sleep(pet: Pet): Pet {
  return { ...pet, mood: 'happy' }
}
X
c "feat(sleep): pets can nap"
echo "export const NAP_SECONDS = 30" >> src/sleep.ts; git add src/sleep.ts; c "feat(sleep): nap length"
echo "// TODO: snoring sound" >> src/sleep.ts; git add src/sleep.ts; c "wip(sleep): snoring"
git checkout -q main
git checkout -q -b fix/hunger-overflow
sed -i.bak 's/pet.hunger += 1/pet.hunger = Math.min(100, pet.hunger + 1)/' src/game.ts && rm -f src/game.ts.bak
git add src/game.ts; c "fix: hunger stops at 100"
git checkout -q main
echo "Feed it, or it gets grumpy." >> README.md; git add README.md; c "docs: grumpy warning"
git tag v0.2.0
# a stash to forget about
echo "export const SOUNDS = ['purr', 'munch']" > src/sounds.ts; git add src/sounds.ts; git stash push -q -m "half-done sound effects"
echo "export const TICK_MS = 1000" > src/config.ts; git add src/config.ts; c "feat: tick config"
echo "export const MAX_HUNGER = 100" >> src/config.ts; git add src/config.ts; c "wip"
echo "export const START_MOOD = 'happy'" >> src/config.ts; git add src/config.ts; c "wip again"
echo "// game config" | cat - src/config.ts > /tmp/pp.$$ && mv /tmp/pp.$$ src/config.ts; git add src/config.ts; c "fix typo"

git init -q --bare -b main "$O"
git remote add origin "$O"
git push -q -u origin main feature/sleep >/dev/null 2>&1
# one commit only the remote has, so Pull shows a count
tmp=$(mktemp -d); git clone -q "$O" "$tmp/c"
( cd "$tmp/c" && git config user.name "Sam" && git config user.email "sam@example.com" && echo "MIT" > LICENSE && git add LICENSE && git commit -q -m "chore: add licence" && git push -q origin main )
rm -rf "$tmp"; git fetch -q origin


# work in progress: three hunks in pet.ts, one in hud.ts, a new file
cat > src/pet.ts <<'X'
export type Mood = 'happy' | 'grumpy' | 'sleepy'

export interface Pet { name: string; hunger: number; mood: Mood }

export function createPet(name: string): Pet {
  return { name, hunger: 0, mood: 'happy' }
}

export function rename(pet: Pet, name: string): Pet {
  return { ...pet, name }
}

export function isHungry(pet: Pet): boolean {
  return pet.hunger > 50
}

export function describe(pet: Pet): string {
  return `${pet.name} feels ${pet.mood} today`
}

export function play(pet: Pet): Pet {
  return { ...pet, hunger: pet.hunger + 5, mood: 'happy' }
}

export function feed(pet: Pet, amount: number): Pet {
  return { ...pet, hunger: Math.max(0, pet.hunger - amount) }
}

export function moodFor(pet: Pet): Mood {
  if (pet.hunger > 70) return 'grumpy'
  return pet.mood
}
X
cat > src/ui/hud.ts <<'X'
import type { Pet } from '../pet'

const BAR = 30

function bar(value: number): string {
  const filled = Math.round((value / 100) * BAR)
  return '#'.repeat(filled) + '.'.repeat(BAR - filled)
}

function title(pet: Pet): string {
  return pet.name.toUpperCase()
}

export function hud(pet: Pet): string {
  return `${title(pet)}  hunger ${bar(pet.hunger)}  mood ${pet.mood}`
}
X
echo '{ "purr": "purr.wav" }' > sounds.json
# a copy whose remote looks like Gerrit, for the Gerrit banner
G="$OUT/pixel-pets-gerrit"; rm -rf "$G"; git clone -q "$R" "$G"
git -C "$G" remote set-url origin ssh://review.pixelpets.dev:29418/pixel-pets
