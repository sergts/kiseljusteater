// Download the published content from the server into src/content/content.json for local dev.
// Needs SITE_URL and EXPORT_TOKEN in .env (same values as the GitHub secrets).
import fs from 'node:fs';

try {
  process.loadEnvFile('.env');
} catch {
  // no .env: fall back to the environment
}

// SITE_AUTH ("user:password") is optional, for while the site is behind HTTP basic auth.
const { SITE_URL, EXPORT_TOKEN, SITE_AUTH } = process.env;
if (!SITE_URL || !EXPORT_TOKEN) {
  console.error('Set SITE_URL and EXPORT_TOKEN in .env');
  process.exit(1);
}

// The token goes in the query string because the Authorization header may be taken by basic auth.
const url = `${SITE_URL.replace(/\/$/, '')}/admin/export.php?token=${encodeURIComponent(EXPORT_TOKEN)}`;
const headers = SITE_AUTH ? { Authorization: `Basic ${Buffer.from(SITE_AUTH).toString('base64')}` } : {};
const res = await fetch(url, { headers });
if (!res.ok) {
  console.error(`Export failed: HTTP ${res.status} ${await res.text()}`);
  process.exit(1);
}
const content = await res.json();
fs.writeFileSync('src/content/content.json', JSON.stringify(content, null, 2) + '\n');
console.log(`Wrote src/content/content.json (${content.actors.length} actors, ${content.plays.length} plays, updated ${content.updatedAt})`);
