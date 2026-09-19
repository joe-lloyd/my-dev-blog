// Read-only AdSense report: sites, ad units and the last 30 days per unit.
//   node scripts/adsense-report.mjs [--days 30]
// Auth: a service account key at $ADSENSE_SA_KEY (default ~/.config/homelab-dev/adsense-sa.json)
// whose email has been added as a user in AdSense → Account → Access and authorization.
// The AdSense Management API is read-only; placements and Auto ads are dashboard-only.
import { createSign } from "node:crypto"
import { readFileSync } from "node:fs"
import { homedir } from "node:os"

const keyPath = process.env.ADSENSE_SA_KEY ?? `${homedir()}/.config/homelab-dev/adsense-sa.json`
const days = Number(process.argv[process.argv.indexOf("--days") + 1] || 30)
const key = JSON.parse(readFileSync(keyPath, "utf8"))

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url")
async function accessToken() {
  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/adsense.readonly",
    aud: key.token_uri,
    iat: now,
    exp: now + 3600,
  })}`
  const sig = createSign("RSA-SHA256").update(unsigned).sign(key.private_key, "base64url")
  const r = await fetch(key.token_uri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
  })
  if (!r.ok) throw new Error(`token: ${r.status} ${await r.text()}`)
  return (await r.json()).access_token
}

const token = await accessToken()
const api = async (path, params = {}) => {
  const url = new URL(`https://adsense.googleapis.com/v2/${path}`)
  for (const [k, v] of Object.entries(params)) for (const x of [].concat(v)) url.searchParams.append(k, x)
  const r = await fetch(url, { headers: { authorization: `Bearer ${token}` } })
  const body = await r.json()
  if (!r.ok) throw new Error(`${path}: ${r.status} ${body.error?.message ?? JSON.stringify(body)}`)
  return body
}

const { accounts = [] } = await api("accounts")
if (!accounts.length) {
  console.log(`No AdSense accounts visible to ${key.client_email}.`)
  console.log("Add that email as a user in AdSense → Account → Access and authorization → User management.")
  process.exit(2)
}

const end = new Date()
const start = new Date(end.getTime() - days * 864e5)
const ymd = (d) => ({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() })

for (const a of accounts) {
  console.log(`\n${a.displayName} (${a.name}) · ${a.state} · ${a.timeZone?.id}`)
  const { sites = [] } = await api(`${a.name}/sites`)
  console.log("sites:")
  for (const s of sites) console.log(`  ${s.domain.padEnd(28)} ${s.state}${s.autoAdsEnabled ? "  auto ads ON" : ""}`)
  const { adUnits = [] } = await api(`${a.name}/adclients/-/adunits`)
  console.log("ad units:")
  for (const u of adUnits) console.log(`  ${u.displayName.padEnd(28)} slot ${u.name.split("/").pop().split(":").pop()}  ${u.state}  ${u.contentAdsSettings?.type ?? ""}`)

  const dr = { "startDate.year": ymd(start).year, "startDate.month": ymd(start).month, "startDate.day": ymd(start).day, "endDate.year": ymd(end).year, "endDate.month": ymd(end).month, "endDate.day": ymd(end).day }
  const rep = await api(`${a.name}/reports:generate`, { ...dr, dimensions: ["AD_UNIT_NAME", "DOMAIN_NAME"], metrics: ["PAGE_VIEWS", "IMPRESSIONS", "CLICKS", "AD_REQUESTS_COVERAGE", "ESTIMATED_EARNINGS"], orderBy: "-ESTIMATED_EARNINGS" })
  console.log(`\nlast ${days} days by unit and domain:`)
  console.log("  " + (rep.headers ?? []).map((h) => h.name.toLowerCase().padEnd(22)).join(""))
  for (const row of rep.rows ?? []) console.log("  " + row.cells.map((c) => String(c.value).padEnd(22)).join(""))
  const t = rep.totals?.cells ?? []
  if (t.length) console.log("  total: " + t.map((c) => c.value).join("  "))
}
