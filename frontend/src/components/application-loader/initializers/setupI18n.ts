/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isDevMode } from '../../../utils/test-modes'
import i18n, { use as i18nUse } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { Settings } from 'luxon'
import { initReactI18next } from 'react-i18next'
import englishTranslation from '../../../../locales/en.json'

// The translations are bundled and i18n is initialized when this module
// loads, so server-side rendering and the first client paint can already
// render translated text without waiting for an asynchronous setup task or
// an extra network round trip.
if (typeof window !== 'undefined') {
  i18nUse(LanguageDetector)
}
const i18nInitialization = i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: typeof window === 'undefined' ? 'en' : undefined,
  resources: {
    en: {
      translation: englishTranslation
    }
  },
  initImmediate: false,
  debug: isDevMode,
  interpolation: {
    escapeValue: false
  }
})

/**
 * Set up the internationalisation framework i18n.
 */
export const setUpI18n = async (): Promise<void> => {
  await i18nInitialization

  i18n.on('languageChanged', (language) => {
    Settings.defaultLocale = language
    document.documentElement.lang = i18n.language
  })
  Settings.defaultLocale = i18n.language
}
