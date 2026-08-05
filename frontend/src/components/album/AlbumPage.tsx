import { useDeferredValue, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Filter, LoaderCircle, Search, SlidersHorizontal, X } from "lucide-react"

import { getApiErrorMessage, getPostcards } from "@/lib/api"
import CountryCombobox from "@/components/add-postcard/CountryCombobox"
import PostcardCard from "@/components/album/PostcardCard"

const PAGE_SIZE = 20

type FilterState = {
  country: string
  city: string
  region: string
  startDate: string
  endDate: string
}

const EMPTY_FILTERS: FilterState = {
  country: "",
  city: "",
  region: "",
  startDate: "",
  endDate: "",
}

function AlbumPage() {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [countryResetKey, setCountryResetKey] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const deferredSearch = useDeferredValue(search)

  const query = useInfiniteQuery({
    queryKey: ["postcards", deferredSearch, filters],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getPostcards(
        {
          title: deferredSearch.trim() || undefined,
          country: filters.country || undefined,
          city: filters.city.trim() || undefined,
          region: filters.region.trim() || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        },
        pageParam,
        PAGE_SIZE,
      ),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
  })

  const postcards = query.data?.pages.flat() ?? []
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const updateFilter = (field: keyof FilterState, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS)
    setCountryResetKey((current) => current + 1)
    setSearch("")
  }

  return (
    <>
      <section className="album-intro">
        <p className="eyebrow">Mi colección</p>
        <p className="intro-copy">
          Explora tus postales y vuelve a cada lugar que forma parte de tu
          historia.
        </p>
      </section>

      <section className="album-toolbar" aria-label="Buscar y filtrar postales">
        <label className="album-search">
          <Search size={18} aria-hidden="true" />
          <span className="visually-hidden">Buscar por título</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título..."
          />
          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearch("")}
              aria-label="Borrar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </label>
        <button
          type="button"
          className={filtersOpen ? "filter-trigger active" : "filter-trigger"}
          onClick={() => setFiltersOpen((current) => !current)}
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal size={19} />
          <span className="filter-label">Filtros</span>
          {activeFilterCount > 0 && <b>{activeFilterCount}</b>}
        </button>
      </section>

      {filtersOpen && (
        <section className="album-filters" aria-label="Filtros avanzados">
          <div className="filter-heading">
            <div>
              <p className="eyebrow">Afinar colección</p>
              <h2>Filtrar postales</h2>
            </div>
            {activeFilterCount > 0 && (
              <button type="button" className="text-button" onClick={clearFilters}>
                Limpiar
              </button>
            )}
          </div>
          <label className="form-field">
            <span>País</span>
            <CountryCombobox
              key={countryResetKey}
              value={filters.country}
              onChange={(value) => updateFilter("country", value)}
            />
          </label>
          <div className="form-row">
            <label className="form-field">
              <span>Ciudad</span>
              <input
                type="text"
                value={filters.city}
                onChange={(event) => updateFilter("city", event.target.value)}
                placeholder="Ciudad"
              />
            </label>
            <label className="form-field">
              <span>Región</span>
              <input
                type="text"
                value={filters.region}
                onChange={(event) => updateFilter("region", event.target.value)}
                placeholder="Región"
              />
            </label>
          </div>
          <div className="form-row">
            <label className="form-field">
              <span>Desde</span>
              <input
                type="date"
                value={filters.startDate}
                onChange={(event) => updateFilter("startDate", event.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Hasta</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(event) => updateFilter("endDate", event.target.value)}
              />
            </label>
          </div>
        </section>
      )}

      {query.isPending && (
        <div className="album-feedback" role="status">
          <LoaderCircle className="spin" size={22} />
          Cargando tu colección...
        </div>
      )}

      {query.isError && (
        <div className="feedback feedback-error" role="alert">
          {getApiErrorMessage(query.error)}
        </div>
      )}

      {!query.isPending && !query.isError && postcards.length === 0 && (
        <div className="album-empty">
          <Filter size={28} />
          <h2>No hay postales que mostrar</h2>
          <p>Prueba a cambiar los filtros o añade una nueva postal.</p>
        </div>
      )}

      {postcards.length > 0 && (
        <>
          <div className="album-grid">
            {postcards.map((postcard) => (
              <PostcardCard key={postcard.id} postcard={postcard} />
            ))}
          </div>
          {query.hasNextPage && (
            <button
              type="button"
              className="secondary-button load-more"
              onClick={() => void query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
            >
              {query.isFetchingNextPage ? "Cargando..." : "Cargar más"}
            </button>
          )}
        </>
      )}
    </>
  )
}

export default AlbumPage
