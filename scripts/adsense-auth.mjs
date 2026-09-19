// One-time OAuth consent for the AdSense report (the Management API has no
// service-account support, so it runs as a real Google user).
//   node scripts/adsense-auth.mjs url                 → prints the consent link
//   node scripts/adsense-auth.mjs exchange <landing-url>   → stores the refresh token
// Client: ~/.config/homelab-dev/adsense-oauth-client.json  Token: ~/.config/homelab-dev/adsense-token.json
import { createHash, randomBytes } from "node:crypto"
import { readFileSync, writeFileSync, chmodSync } from "node:fs"
import { homedir } from "node:os"

const dir = `${homedir()}/.config/homelab-dev`
const client = JSON.parse(readFileSync(`${dir}/adsense-oauth-client.json`, "utf8"))
const scope = "https://www.googleapis.com/auth/adsense.readonly"
const [cmd, arg] = process.argv.slice(2)

if (cmd === "url") {
  const verifier = randomBytes(48).toString("base64url")
  const challenge = createHash("sha256").update(verifier).digest("base64url")
  writeFileSync(`${dir}/adsense-pkce.tmp`, verifier)
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  Object.entries({ client_id: client.client_id, redirect_uri: client.redirect_uri, response_type: "code", scope, access_type: "offline", prompt: "consent", code_challenge: challenge, code_challenge_method: "S256" }).forEach(([k, v]) => u.searchParams.set(k, v))
  console.log(u.href)
} else if (cmd === "exchange") {
  const code = new URL(arg).searchParams.get("code")
  if (!code) throw new Error("no code in that url")
  const verifier = readFileSync(`${dir}/adsense-pkce.tmp`, "utf8")
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: client.client_id, client_secret: client.client_secret, redirect_uri: client.redirect_uri, grant_type: "authorization_code", code_verifier: verifier }),
  })
  const t = await r.json()
  if (!t.refresh_token) throw new Error(`exchange failed: ${JSON.stringify(t)}`)
  writeFileSync(`${dir}/adsense-token.json`, JSON.stringify({ refresh_token: t.refresh_token, scope: t.scope }, null, 1))
  chmodSync(`${dir}/adsense-token.json`, 0o600)
  console.log("refresh token stored")
} else {
  console.error("usage: adsense-auth.mjs url | exchange <url>")
  process.exit(1)
}
