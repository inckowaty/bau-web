const {getRequestConfig} = require('next-intl/server');

const messages = {
  de: require('../messages/de.json'),
  pl: require('../messages/pl.json'),
  en: require('../messages/en.json')
};

module.exports = getRequestConfig(async ({locale}) => {
  // next-intl v4 bywa Promise → rozwiąż i fallback na 'de'
  const loc = (await locale) || 'de';
  return {locale: loc, messages: messages[loc] || messages.de};
});
