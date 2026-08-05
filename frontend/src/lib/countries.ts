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

const COUNTRY_TINTS = [
  { background: "#f8e8c7", border: "#e4c995" },
  { background: "#e7f0e8", border: "#b9d1bc" },
  { background: "#e4edf5", border: "#b9cde0" },
  { background: "#f3e5ed", border: "#d9b9ca" },
  { background: "#eee7f4", border: "#cdbbdb" },
  { background: "#f7e4d5", border: "#dfbca0" },
  { background: "#e7efed", border: "#b8d0ca" },
  { background: "#f3edcf", border: "#d8ca8e" },
]

export function getCountryTint(code: string) {
  const normalizedCode = code.toUpperCase()
  const hash = [...normalizedCode].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  )

  return COUNTRY_TINTS[hash % COUNTRY_TINTS.length]
}
