const label = 'registry downloads (30d)';
const cacheSeconds = 3600;
const dayMilliseconds = 86_400_000;
const query = `
	query RegistryDownloads($zone: string, $start: Time, $end: Time) {
		viewer {
			zones(filter: { zoneTag: $zone }) {
				downloads: httpRequestsAdaptiveGroups(limit: 1, filter: {
					datetime_geq: $start
					datetime_lt: $end
					requestSource: "eyeball"
					clientRequestHTTPHost: "glassform.jiyan.space"
					clientRequestHTTPMethodName: "GET"
					clientRequestPath_in: ["/r/glassform.json", "/r/glassform-react.json"]
					edgeResponseStatus: 200
				}) {
					count
				}
			}
		}
	}
`;

export async function registryDownloads(token, zone) {
	const now = Date.now();
	const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			query,
			variables: {
				zone,
				start: new Date(now - 30 * dayMilliseconds).toISOString(),
				end: new Date(now).toISOString()
			}
		}),
		signal: AbortSignal.timeout(5000)
	});

	const result = await response.json();
	const rows = result.data?.viewer?.zones?.[0]?.downloads;
	if (!response.ok || result.errors?.length || !Array.isArray(rows)) {
		throw new Error(result.errors?.[0]?.message ?? `Cloudflare Analytics HTTP ${response.status}`);
	}

	const count = rows[0]?.count ?? 0;
	if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid download count');
	return count;
}

function pendingBadge() {
	return Response.json(
		{ schemaVersion: 1, label, message: 'unavailable', color: 'lightgrey', isError: true },
		{ headers: { 'Cache-Control': 'no-store' } }
	);
}

export async function onRequestGet(context) {
	const { GLASSFORM_ANALYTICS_TOKEN: token, GLASSFORM_ZONE_ID: zone } = context.env;
	if (!token || !zone) return pendingBadge();

	const cache = caches.default;
	const cacheKey = new Request(new URL('/api/downloads-badge', context.request.url));
	try {
		const cached = await cache.match(cacheKey);
		if (cached) return cached;

		const count = await registryDownloads(token, zone);
		const badge = Response.json(
			{ schemaVersion: 1, label, message: count.toLocaleString('en-US'), color: 'blue' },
			{ headers: { 'Cache-Control': `public, max-age=${cacheSeconds}` } }
		);
		context.waitUntil(cache.put(cacheKey, badge.clone()));
		return badge;
	} catch {
		return pendingBadge();
	}
}
