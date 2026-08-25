export const CALL_E_REGIONS = [
  { code: "US", name: "United States", flag: "🇺🇸", locales: [{ code: "en-US", label: "English" }] },
  { code: "SG", name: "Singapore", flag: "🇸🇬", locales: [{ code: "en-SG", label: "English" }] },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", locales: [{ code: "en-MY", label: "English" }] },
  { code: "IN", name: "India", flag: "🇮🇳", locales: [{ code: "en-IN", label: "English" }, { code: "hi-IN", label: "Hindi" }] },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", locales: [{ code: "en-AE", label: "English" }, { code: "ar-AE", label: "Arabic" }] },
  { code: "AU", name: "Australia", flag: "🇦🇺", locales: [{ code: "en-AU", label: "English" }] },
  { code: "CA", name: "Canada", flag: "🇨🇦", locales: [{ code: "en-CA", label: "English" }] },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", locales: [{ code: "en-GB", label: "English" }] },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", locales: [{ code: "vi-VN", label: "Vietnamese" }] },
  { code: "DE", name: "Germany", flag: "🇩🇪", locales: [{ code: "en-DE", label: "English" }, { code: "de-DE", label: "German" }] },
  { code: "JP", name: "Japan", flag: "🇯🇵", locales: [{ code: "ja-JP", label: "Japanese" }] },
  { code: "FR", name: "France", flag: "🇫🇷", locales: [{ code: "fr-FR", label: "French" }] },
  { code: "MX", name: "Mexico", flag: "🇲🇽", locales: [{ code: "es-MX", label: "Spanish" }] },
  { code: "BR", name: "Brazil", flag: "🇧🇷", locales: [{ code: "pt-BR", label: "Portuguese" }] },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", locales: [{ code: "en-ID", label: "English" }] },
  { code: "PH", name: "Philippines", flag: "🇵🇭", locales: [{ code: "en-PH", label: "English" }] },
  { code: "KE", name: "Kenya", flag: "🇰🇪", locales: [{ code: "en-KE", label: "English" }] },
] as const;

export type CalleRegionCode = (typeof CALL_E_REGIONS)[number]["code"];
export type CalleLocale = (typeof CALL_E_REGIONS)[number]["locales"][number]["code"];

export function isSupportedRegionLocale(region: string, locale: string): boolean {
  const country = CALL_E_REGIONS.find((item) => item.code === region);
  return Boolean(country?.locales.some((item) => item.code === locale));
}
