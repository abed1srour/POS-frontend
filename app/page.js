"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { initI18n } from "./lib/i18n";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Initialize i18n
    initI18n();
    
    // Get the locale from the pathname (e.g., /en -> en, /ar -> ar)
    const locale = pathname.split('/')[1];
    // Redirect to dashboard with locale prefix
    router.replace(`/${locale}/dashboard`);
  }, [router, pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0D10]">
      <div className="text-center">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-cyan-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
