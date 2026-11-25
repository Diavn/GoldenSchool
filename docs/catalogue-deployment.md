# Catalogue V0.3.2 deployment

KV binding GS_CATALOGUE configured. No secret in repo. Set GS32_TOKEN privately in Cloudflare Worker and Data Engine Script properties. Keep catalogueEnabled and admissionsOpen false until runtime tests. API GET exposes only validated public snapshot; POST requires secret. Empty test before any publication rules or schedule. No MOD permissions, no real class approvals, no Form activation. Snapshot expires after 15 minutes; KV eventual consistency, no live reservation. See local V0.3.2 installation package for owner procedures.
