"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const LanguageSwitcher = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get current language from pathname
    const lang = pathname.split('/')[1];
    if (lang === 'ar' || lang === 'en') {
      setCurrentLang(lang);
    } else {
      setCurrentLang('en'); // default to English
    }
  }, [pathname]);

  const handleLanguageChange = (newLang) => {
    setCurrentLang(newLang);
    
    // Set document direction for RTL support
    if (typeof document !== 'undefined') {
      document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
    }
    
    // Update the URL to reflect the new language
    const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '');
    router.push(`/${newLang}${pathWithoutLang}`);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
          currentLang === 'en'
            ? 'bg-indigo-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
        title="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('ar')}
        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
          currentLang === 'ar'
            ? 'bg-indigo-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
        title="التبديل إلى العربية"
      >
        ع
      </button>
    </div>
  );
};

export default LanguageSwitcher;
