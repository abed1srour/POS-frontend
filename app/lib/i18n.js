import i18next from 'i18next';
import enTranslations from '../locales/en/global.json';
import arTranslations from '../locales/ar/global.json';

export const initI18n = () => {
  if (i18next.isInitialized) {
    return;
  }

  i18next.init({
    lng: 'en', // default language
    fallbackLng: 'en',
    debug: false,
    
    resources: {
      en: {
        translation: enTranslations
      },
      ar: {
        translation: arTranslations
      }
    },
    
    interpolation: {
      escapeValue: false // React already does escaping
    }
  });
};

export const changeLanguage = (lng) => {
  i18next.changeLanguage(lng);
  
  // Set document direction for RTL support
  if (typeof document !== 'undefined') {
    document.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  }
};

export const t = (key, options = {}) => {
  return i18next.t(key, options);
};

export default i18next;
