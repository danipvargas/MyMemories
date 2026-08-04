import { useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import { countries } from "@/lib/countries"

type CountryComboboxProps = {
  value: string
  onChange: (value: string) => void
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function CountryCombobox({ value, onChange }: CountryComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedCountry = countries.find((country) => country.code === value)
  const [query, setQuery] = useState(selectedCountry?.name ?? "")
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [])

  const filteredCountries = useMemo(() => {
    const normalizedQuery = normalize(query)

    if (!normalizedQuery) {
      return countries
    }

    return countries.filter((country) => {
      return (
        normalize(country.name).includes(normalizedQuery) ||
        country.code.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [query])

  const selectCountry = (code: string) => {
    const selected = countries.find((country) => country.code === code)
    onChange(code)
    setQuery(selected?.name ?? "")
    setIsOpen(false)
    setActiveIndex(0)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((current) =>
        Math.min(current + 1, Math.max(filteredCountries.length - 1, 0)),
      )
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((current) => Math.max(current - 1, 0))
    }
    if (event.key === "Enter" && isOpen) {
      event.preventDefault()
      const activeCountry = filteredCountries[activeIndex]
      if (activeCountry) {
        selectCountry(activeCountry.code)
      }
    }
    if (event.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div className="country-combobox" ref={containerRef}>
      <div className="country-combobox-input">
        {selectedCountry && (
          <span
            className={`fi fi-${selectedCountry.code.toLowerCase()}`}
            aria-hidden="true"
          />
        )}
        <input
          type="text"
          role="combobox"
          value={query}
          placeholder="Busca un país"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="country-options"
          aria-activedescendant={
            isOpen && filteredCountries[activeIndex]
              ? `country-option-${filteredCountries[activeIndex].code}`
              : undefined
          }
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
            setActiveIndex(0)
            if (value) {
              onChange("")
            }
          }}
          onKeyDown={handleKeyDown}
          required={!value}
        />
        <ChevronDown
          className={isOpen ? "combobox-chevron open" : "combobox-chevron"}
          size={17}
          aria-hidden="true"
        />
      </div>

      {isOpen && (
        <div className="country-options" id="country-options" role="listbox">
          {filteredCountries.length === 0 ? (
            <p className="country-empty">No se ha encontrado ningún país.</p>
          ) : (
            filteredCountries.map((country, index) => (
              <button
                key={country.code}
                id={`country-option-${country.code}`}
                type="button"
                role="option"
                aria-selected={country.code === value}
                className={
                  index === activeIndex ? "country-option active" : "country-option"
                }
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectCountry(country.code)}
              >
                <span
                  className={`fi fi-${country.code.toLowerCase()}`}
                  aria-hidden="true"
                />
                <span>{country.name}</span>
                <small>{country.code}</small>
                {country.code === value && <Check size={16} aria-hidden="true" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default CountryCombobox
