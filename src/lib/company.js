// src/lib/company.js
// Dane firmy (NAP) – jedno miejsce dla kontaktu, stopki i danych strukturalnych.

export const COMPANY = {
  name: 'GRP Bau',
  slogan: 'Wir sind immer für Sie da',
  street: 'In den Feldgärten 11D',
  postalCode: '27232',
  city: 'Sulingen',
  region: 'Niedersachsen',
  country: 'DE',
  phone: '+4915561013765',
  phoneDisplay: '+49 1556 1013765',
  whatsapp: 'https://wa.me/4915561013765',
  email: 'info@grp-bau.de',
  // obszar działania: Sulingen i okolica w promieniu ok. 100 km
  serviceRadiusKm: 100,
  // środek Sulingen (do danych strukturalnych GeoCircle)
  geo: { latitude: 52.6833, longitude: 8.8 },
  areaServed: [
    'Sulingen', 'Bremen', 'Hannover', 'Oldenburg', 'Osnabrück', 'Minden',
    'Nienburg (Weser)', 'Diepholz', 'Vechta', 'Verden (Aller)', 'Delmenhorst', 'Syke',
  ],
};
