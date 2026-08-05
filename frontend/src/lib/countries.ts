import { getAlpha2Codes } from "i18n-iso-countries"

export type CountryOption = {
  code: string
  name: string
}

const displayNames = new Intl.DisplayNames(["es"], { type: "region" })

export const countries: CountryOption[] = Object.keys(getAlpha2Codes())
  .map((code) => ({
    code,
    name: displayNames.of(code) ?? code,
  }))
  .sort((first, second) => first.name.localeCompare(second.name, "es"))

export function getCountryName(code: string): string {
  return displayNames.of(code) ?? code
}
