import { useState } from "react"
import { Images, Map, Plus, UserRound } from "lucide-react"

import AddPostcardPage from "@/components/add-postcard/AddPostcardPage"

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
  const [activeTab, setActiveTab] = useState<Tab>("add")

  return (
    <div className="app-shell">
      <nav className="bottom-nav" aria-label="Navegación principal">
        <button
          type="button"
          className={activeTab === "album" ? "nav-item active" : "nav-item"}
          onClick={() => setActiveTab("album")}
        >
          <Images size={21} />
          <span>Álbum</span>
        </button>
        <button
          type="button"
          className={
            activeTab === "add" ? "nav-item add-item active" : "nav-item add-item"
          }
          onClick={() => setActiveTab("add")}
        >
          <span className="add-nav-icon">
            <Plus size={27} />
          </span>
          <span>Añadir</span>
        </button>
        <button
          type="button"
          className={activeTab === "map" ? "nav-item active" : "nav-item"}
          onClick={() => setActiveTab("map")}
        >
          <Map size={21} />
          <span>Mapa</span>
        </button>
      </nav>

      <main className="app-main">
        <header className="page-header">
          <div>
            <p className="eyebrow">Mis recuerdos</p>
            <h1>
              {activeTab === "add"
                ? "Añadir postal"
                : activeTab === "album"
                  ? "Álbum"
                  : "Mapa"}
            </h1>
          </div>
          <div className="profile-badge" title="Perfil de danipvargas">
            <UserRound size={18} />
          </div>
        </header>

        {activeTab === "add" ? (
          <AddPostcardPage />
        ) : (
          <ComingSoon title={activeTab === "album" ? "Tu álbum" : "Tu mapa"} />
        )}
      </main>
    </div>
  )
}

export default App
