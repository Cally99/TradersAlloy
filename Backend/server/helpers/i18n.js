exports.t = async function(key_word) {
    const axios = require('axios');
    const path = require('path');

    const { I18n, __ } = require('i18n');
    const i18n = new I18n();

    i18n.configure({
        locales: ['SE', 'EN'],
        directory: path.join(__dirname + './../resources/locales')
    });

    const locale = (await axios.get("https://geolocation-db.com/json/")).data;

    locale.country_code = locale.country_code === 'SE' ? 'SE' : 'EN';

    i18n.setLocale(locale.country_code);

    const getTranslation = i18n.__(key_word);

    return getTranslation;
};
