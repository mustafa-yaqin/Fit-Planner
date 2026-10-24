// Language (Persian / English): t("key") gives the text, pick() gives the Persian or English field.
import { createContext, useContext, useEffect, useState } from 'react'
import en from '../locales/en.js'
import fa from '../locales/fa.js'

const dictionaries = { en, fa }
const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('lang') || 'en'
    } catch {
      return 'en'
    }
  })

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr'
    try {
      localStorage.setItem('lang', lang)
    } catch {
      return
    }
  }, [lang])

  function t(key, params = {}) {
    let text = dictionaries[lang][key] || key
    Object.entries(params).forEach(([name, value]) => {
      text = text.replace('{' + name + '}', value)
    })
    return text
  }

  function pick(item, field) {
    if (lang === 'fa' && item[field + 'Fa']) return item[field + 'Fa']
    return item[field]
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, pick }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
