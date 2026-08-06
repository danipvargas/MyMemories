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

function normalizeCountry(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

export function getCountryCode(value: string): string {
  const normalizedValue = normalizeCountry(value)
  const byCode = countries.find(
    (country) => country.code.toLowerCase() === normalizedValue,
  )

  if (byCode) {
    return byCode.code
  }

  return (
    countries.find((country) => normalizeCountry(country.name) === normalizedValue)
      ?.code ?? ""
  )
}

export function getCountryName(value: string): string {
  const code = getCountryCode(value)

  if (!code) {
    return value
  }

  return displayNames.of(code) ?? value
}
