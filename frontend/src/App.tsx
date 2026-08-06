import { useState } from "react"
import { Images, Map, Plus } from "lucide-react"
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom"

import AddPostcardPage from "@/components/add-postcard/AddPostcardPage"
import AlbumPage from "@/components/album/AlbumPage"
import PostcardDetailPage from "@/components/album/PostcardDetailPage"
import UserProfileDialog from "@/components/shared/UserProfileDialog"
import WorldMapPage from "@/components/map/WorldMapPage"
import { ADMIN_USER_ID, getUserProfilePicUrl } from "@/lib/api"

type Tab = "album" | "add" | "map"

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileVersion, setProfileVersion] = useState<number>(() => Date.now())
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
        <button
          type="button"
          className="profile-nav-item"
          onClick={() => setProfileOpen(true)}
          aria-label="Abrir perfil"
        >
          <img
            src={getUserProfilePicUrl(ADMIN_USER_ID, profileVersion)}
            alt=""
          />
          <span>Perfil</span>
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
          <button
            type="button"
            className="profile-badge"
            onClick={() => setProfileOpen(true)}
            title="Perfil de danipvargas"
            aria-label="Abrir perfil"
          >
            <img
              src={getUserProfilePicUrl(ADMIN_USER_ID, profileVersion)}
              alt=""
            />
          </button>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/album" replace />} />
          <Route path="/add" element={<AddPostcardPage />} />
          <Route path="/album" element={<AlbumPage />} />
          <Route path="/postcards/:postcardId" element={<PostcardDetailPage />} />
          <Route path="/map" element={<WorldMapPage />} />
          <Route path="*" element={<Navigate to="/add" replace />} />
        </Routes>
      </main>
      <UserProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onProfileUpdated={() => setProfileVersion(Date.now())}
      />
    </div>
  )
}

export default App
