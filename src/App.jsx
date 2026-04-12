import { useState } from 'react';
import CustomCursor from './components/CustomCursor';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MarqueeCrown from './components/MarqueeCrown';
import PhotoAlbum from './components/PhotoAlbum';
import Members from './components/Members';
import Discography from './components/Discography';
import Philosophy from './components/Philosophy';
import Footer from './components/Footer';
import AudioPlayer from './components/AudioPlayer';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <CustomCursor />
      <AudioPlayer />
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      <main
        className="min-h-screen relative w-full overflow-hidden transition-opacity duration-1000 bg-[var(--color-void)] text-[var(--color-ghost)]"
        style={{ opacity: loading ? 0 : 1 }}
      >
        <Navbar />
        <Hero />
        <MarqueeCrown />
        <PhotoAlbum />
        <Members />
        <Discography />
        <Philosophy />
        <Footer />
      </main>
    </>
  );
}

export default App;
