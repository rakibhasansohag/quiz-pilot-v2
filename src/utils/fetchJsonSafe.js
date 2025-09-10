export async function fetchJsonSafe(url, options) {
	const res = await fetch(url, options);
	const text = await res.text();
	let data = null;
	try {
		data = text ? JSON.parse(text) : null;
	} catch (err) {
		// invalid JSON
		console.warn('Non-JSON response for', url, 'text:', text);
	}
	return {
		ok: res.ok,
		status: res.status,
		statusText: res.statusText,
		data,
		res,
	};
}
