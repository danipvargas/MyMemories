import { Images, Map, Plus, UserRound } from "lucide-react"
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom"

import AddPostcardPage from "@/components/add-postcard/AddPostcardPage"
import AlbumPage from "@/components/album/AlbumPage"
import PostcardDetailPage from "@/components/album/PostcardDetailPage"

type Tab = "album" | "add" | "map"

function ComingSoon({ title }: { title: string }) {
  return (
    <section className="coming-soon" aria-live="polite">
      <span className="coming-soon-mark" aria-hidden="true">
        ✦
      </span>
      <p className="eyebrow">En preparación</p>
      <h2>{title}</h2>
      <p>Esta ventana llegará más adelante. Tu colección ya está esperando.</p>
    </section>
  )
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab: Tab = location.pathname.startsWith("/album") ||
    location.pathname.startsWith("/postcards")
    ? "album"
    : location.pathname.startsWith("/map")
      ? "map"
      : "add"
  const pageTitle = location.pathname.startsWith("/postcards")
    ? "Detalle de postal"
    : activeTab === "add"
      ? "Añadir postal"
      : activeTab === "album"
        ? "Álbum"
        : "Mapa"

  return (
    <div className="app-shell">
      <nav className="bottom-nav" aria-label="Navegación principal">
        <div className="nav-brand">
          <img src="/logo.svg" alt="MisPostales" />
        </div>
        <button
          type="button"
          className={activeTab === "album" ? "nav-item album-item active" : "nav-item album-item"}
          onClick={() => navigate("/album")}
        >
          <Images size={21} />
          <span>Álbum</span>
        </button>
        <button
          type="button"
          className={
            activeTab === "add" ? "nav-item add-item active" : "nav-item add-item"
          }
          onClick={() => navigate("/add")}
        >
          <span className="add-nav-icon">
            <Plus size={27} />
          </span>
          <span>Añadir</span>
        </button>
        <button
          type="button"
          className={activeTab === "map" ? "nav-item map-item active" : "nav-item map-item"}
          onClick={() => navigate("/map")}
        >
          <Map size={21} />
          <span>Mapa</span>
        </button>
      </nav>

      <main className="app-main">
        <header className="page-header">
          <div className="page-header-content">
            <div className="mobile-brand">
              <img src="/logo.svg?v=2" alt="" />
              <div className="mobile-brand-copy">
                <p className="eyebrow">Mis postales</p>
                <h1>{pageTitle}</h1>
              </div>
            </div>
            <div className="desktop-page-title">
              <p className="eyebrow">Mis postales</p>
              <h1>{pageTitle}</h1>
            </div>
          </div>
          <div className="profile-badge" title="Perfil de danipvargas">
            <UserRound size={18} />
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/album" replace />} />
          <Route path="/add" element={<AddPostcardPage />} />
          <Route path="/album" element={<AlbumPage />} />
          <Route path="/postcards/:postcardId" element={<PostcardDetailPage />} />
          <Route path="/map" element={<ComingSoon title="Tu mapa" />} />
          <Route path="*" element={<Navigate to="/add" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
