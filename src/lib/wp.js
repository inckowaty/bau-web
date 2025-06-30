// src/lib/wp.js
const API   = process.env.WP_API_URL;
const DEBUG = process.env.DEBUG_WP === 'true';

/*──────────────── HOME  (CPT “homepage”) ────────────────*/
export async function fetchHome(lang='de') {
  const url = `${API}/wp-json/wp/v2/homepage?lang=${lang}&per_page=1&acf_format=standard`;
  DEBUG && console.log('[WP] HOME url →', url);

  const res  = await fetch(url,{cache:'force-cache'});
  if(!res.ok) throw new Error('Home fetch failed');
  const data = (await res.json())[0];

  DEBUG && console.log('[WP] HOME data →',
    data ? {id:data.id, hero:data.acf.hero_title} : '— not found —'
  );
  return data;
}

/* helper – zamienia ID lub Array na URL ------------------*/
export function imgUrl(img){
  if(!img) return null;
  if(typeof img === 'string') return img;         // already URL
  if(typeof img === 'number')                     // id → fetch media once
    return `${API}/wp-json/wp/v2/media/${img}`;   // (do pobrania client-side)
  if(img.url) return img.url;                     // Image Array
  return null;
}

/*──────────────── PAGE (WP Pages) ───────────────────────*/
export async function fetchPage(slug='home',lang='de'){
  const url = `${API}/wp-json/wp/v2/pages?slug=${slug}&lang=${lang}&acf_format=standard`;
  DEBUG && console.log('[WP] PAGE url →', url);

  const res  = await fetch(url,{cache:'force-cache'});
  if(!res.ok) throw new Error('Page fetch failed');
  const data = (await res.json())[0];

  DEBUG && console.log('[WP] PAGE data →',
    data ? {id:data.id,title:data.title.rendered} : '— not found —'
  );
  return data;
}

/*──────────────── MENU (CPT “navitem”) ──────────────────*/
export async function fetchNav(lang='de'){
  const url = `${API}/wp-json/wp/v2/navitem`
            + `?lang=${lang}&per_page=100&orderby=menu_order&order=asc&acf_format=standard`;
  DEBUG && console.log('[WP] NAV url →', url);

  const res  = await fetch(url,{cache:'force-cache'});
  if(!res.ok) throw new Error('Nav fetch failed');
  const data = await res.json();

  DEBUG && console.log('[WP] NAV first 3 →',
    data.slice(0,3).map(i=>({id:i.id,label:i.title.rendered}))
  );
  return data;
}
