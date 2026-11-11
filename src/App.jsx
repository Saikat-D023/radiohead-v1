import { useState } from 'react';
import CustomCursor from './components/CustomCursor';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import OceanDescent from './components/OceanDescent';
import AudioPlayer from './components/AudioPlayer';

import { Routes, Route, useLocation } from 'react-router-dom';
import AlbumPage from './components/AlbumPage';

function MuseumHome() {
  return (
    <>
      <Navbar />
      <div className="absolute inset-0 bg-texture-overlay z-50 pointer-events-none"></div>
      <OceanDescent />
    </>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  return (
    <>
      {/* On the ocean page the fish ducks away while Thom swims his route */}
      <CustomCursor hideOnScroll={pathname === '/'} />
      <AudioPlayer />
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      <main
        className="relative w-full overflow-x-clip flex flex-col transition-opacity duration-1000 bg-[var(--color-void)] text-[var(--color-ghost)]"
        style={{ opacity: loading ? 0 : 1 }}
      >
        <Routes>
          <Route path="/" element={<MuseumHome />} />
          <Route path="/album/:id" element={<AlbumPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
