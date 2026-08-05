import type { ChangeEvent } from "react"
import type { DateParts } from "@/lib/date"

type DatePrecisionFieldsProps = {
  value: DateParts
  onChange: (value: DateParts) => void
  invalid?: boolean
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
const EMPTY_SELECT_VALUE = "__empty__"
const YEARS = Array.from({ length: currentYear - 1899 }, (_, index) =>
  String(currentYear - index),
)

function updateDateParts(
  current: DateParts,
  field: "year" | "month" | "day",
  nextValue: string,
): DateParts {
  const nextParts = { ...current, [field]: nextValue, unknown: false }

  if (field === "year" || field === "month") {
    nextParts.day = ""
  }

  return nextParts
}

function DatePrecisionFields({
  value,
  onChange,
  invalid = false,
}: DatePrecisionFieldsProps) {
  const daysInMonth = value.year && value.month
    ? new Date(Number(value.year), Number(value.month), 0).getDate()
    : 31

  const updateField =
    (field: "year" | "month" | "day") => (event: ChangeEvent<HTMLSelectElement>) => {
      onChange(updateDateParts(value, field, event.target.value))
    }

  return (
    <div className={invalid ? "date-fields invalid" : "date-fields"}>
      <label htmlFor="acquisition-year">Fecha de adquisición</label>
      <label className="unknown-date-checkbox">
        <input
          type="checkbox"
          checked={value.unknown}
          onChange={(event) =>
            onChange({
              year: "",
              month: "",
              day: "",
              unknown: event.target.checked,
            })
          }
        />
        <span>Fecha desconocida</span>
      </label>
      <div className="date-selects">
        <select
          id="acquisition-year"
          value={value.year}
          onChange={updateField("year")}
          disabled={value.unknown}
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
          value={value.month || EMPTY_SELECT_VALUE}
          onChange={(event) => {
            const selectedValue =
              event.target.value === EMPTY_SELECT_VALUE ? "" : event.target.value
            onChange(updateDateParts(value, "month", selectedValue))
          }}
          disabled={value.unknown || !value.year}
        >
          <option value={EMPTY_SELECT_VALUE}>--</option>
          {MONTHS.map((month, index) => (
            <option key={month} value={String(index + 1)}>
              {month}
            </option>
          ))}
        </select>
        <select
          aria-label="Día de adquisición"
          value={value.day || EMPTY_SELECT_VALUE}
          onChange={(event) => {
            const selectedValue =
              event.target.value === EMPTY_SELECT_VALUE ? "" : event.target.value
            onChange(updateDateParts(value, "day", selectedValue))
          }}
          disabled={value.unknown || !value.month}
        >
          <option value={EMPTY_SELECT_VALUE}>--</option>
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
      {invalid && (
        <p className="field-error">
          La fecha de adquisición no es válida. Revisa el año, mes y día.
        </p>
      )}
    </div>
  )
}

export default DatePrecisionFields
