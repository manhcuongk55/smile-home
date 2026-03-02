'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

type Language = 'en' | 'vi';

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: typeof translations.vi;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Language>('vi');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedLang = localStorage.getItem('smile-home-lang') as Language;
        if (savedLang && (savedLang === 'en' || savedLang === 'vi')) {
            setLangState(savedLang);
        }
    }, []);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem('smile-home-lang', newLang);
    };

    // Always use 'vi' during SSR and initial hydration to match server output
    const activeLang = mounted ? lang : 'vi';
    const t = translations[activeLang];

    return (
        <LanguageContext.Provider value={{ lang: activeLang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
