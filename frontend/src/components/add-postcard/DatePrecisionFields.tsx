import type { ChangeEvent } from "react"
import type { DateParts } from "@/lib/date"

type DatePrecisionFieldsProps = {
  value: DateParts
  onChange: (value: DateParts) => void
}

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: currentYear - 1899 }, (_, index) =>
  String(currentYear - index),
)

function DatePrecisionFields({
  value,
  onChange,
}: DatePrecisionFieldsProps) {
  const daysInMonth = value.year && value.month
    ? new Date(Number(value.year), Number(value.month), 0).getDate()
    : 31

  const updateField =
    (field: keyof DateParts) => (event: ChangeEvent<HTMLSelectElement>) => {
      const nextValue = event.target.value
      const nextParts = { ...value, [field]: nextValue }

      if (field === "year") {
        nextParts.day = ""
      }
      if (field === "month") {
        nextParts.day = ""
      }

      onChange(nextParts)
    }

  return (
    <div className="date-fields">
      <label htmlFor="acquisition-year">Fecha de adquisición</label>
      <div className="date-selects">
        <select
          id="acquisition-year"
          value={value.year}
          onChange={updateField("year")}
        >
          <option value="">Año</option>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select
          aria-label="Mes de adquisición"
          value={value.month}
          onChange={updateField("month")}
          disabled={!value.year}
        >
          <option value="">Mes</option>
          {MONTHS.map((month, index) => (
            <option key={month} value={String(index + 1)}>
              {month}
            </option>
          ))}
        </select>
        <select
          aria-label="Día de adquisición"
          value={value.day}
          onChange={updateField("day")}
          disabled={!value.month}
        >
          <option value="">Día</option>
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = String(index + 1)
            return (
              <option key={day} value={day}>
                {day}
              </option>
            )
          })}
        </select>
      </div>
      <p className="field-hint">
        Puedes indicar solo el año, el año y el mes, o la fecha completa.
      </p>
    </div>
  )
}

export default DatePrecisionFields
