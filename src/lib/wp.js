export async function getWP(endpoint, {locale = 'de', revalidate = 600} = {}) {
    const url = new URL(`${process.env.WP_API_URL}${endpoint}`, 'https://example.com');
    url.searchParams.set('lang', locale);
  
    console.log('[WP-FETCH]', url.href);      // 👈 zobaczysz pełny adres w konsoli
  
    const res = await fetch(url.href, {next: {revalidate}});
    if (!res.ok) throw new Error(`WP fetch failed: ${res.status}`);
    return res.json();
  }