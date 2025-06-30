'use client';

const icons = {
  de: '/flags/de.svg',
  pl: '/flags/pl.svg',
  en: '/flags/gb.svg'
};

export default function LocaleSwitch({langUrls}) {
  if (!langUrls) return null;

  return (
    <div style={{display:'flex',gap:'.5rem',marginRight:'auto'}}>
      {Object.entries(langUrls).map(([l,url])=>(
        <a key={l} href={url}>
          <img src={icons[l]} alt={l} width={24} height={16}/>
        </a>
      ))}
    </div>
  );
}
