import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, Play, Pause, SkipForward, SkipBack, 
  Settings, Video, Music, Map, Camera, Bell, Car, 
  MapPin, AlertTriangle, Battery, Wifi, Menu, Volume2
} from 'lucide-react';

// --- CONFIGURACIÓN INICIAL ---
const DEFAULT_LOCATION = [11.0333, -63.8667]; // La Asunción, Nueva Esparta
const DEFAULT_CAR = "Kia Rio Stylus 2009";

export default function CarLauncher() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [speed, setSpeed] = useState(0);
  const [activeTab, setActiveTab] = useState('home'); 
  
  // Settings State
  const [carColor, setCarColor] = useState('#3b82f6'); 
  const [carModel, setCarModel] = useState(DEFAULT_CAR);
  const [offlineMapDownloaded, setOfflineMapDownloaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // --- ESTADO DEL REPRODUCTOR NATIVO REAL ---
  const [mediaData, setMediaData] = useState({
    title: "Esperando música...",
    artist: "Abre tu reproductor",
    albumArt: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop", 
    isPlaying: false,
    duration: "0:00",
    position: "0:00",
    progressPercent: 0
  });

  // Inyección de Tailwind CSS asegurada
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }, []);

  // Reloj
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Rastreo GPS
  useEffect(() => {
    let watchId;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const speedKmh = position.coords.speed ? (position.coords.speed * 3.6) : 0;
          setSpeed(Math.round(speedKmh));
        },
        (error) => console.warn("Error GPS: ", error),
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, []);

  // Inicialización del Listener de Música Nativa usando window.Capacitor para evitar errores de compilación web
  useEffect(() => {
    let listener = null;
    const initMediaListener = async () => {
      try {
        const plugin = window.Capacitor?.registerPlugin ? window.Capacitor.registerPlugin('MediaListenerPlugin') : null;
        if (plugin) {
          listener = await plugin.addListener('mediaUpdate', (info) => {
            setMediaData({
              title: info.title || "Desconocido",
              artist: info.artist || "Desconocido",
              albumArt: info.albumArt ? `data:image/jpeg;base64,${info.albumArt}` : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop",
              isPlaying: info.isPlaying || false,
              duration: info.duration || "0:00",
              position: info.position || "0:00",
              progressPercent: info.progressPercent || 0
            });
          });
        }
      } catch (e) {
        console.warn("Plugin nativo de música no detectado.");
      }
    };
    initMediaListener();
    return () => { if(listener) listener.remove(); }
  }, []);

  // Controles de Música Reales
  const handleMediaControl = async (action) => {
    try {
      const plugin = window.Capacitor?.registerPlugin ? window.Capacitor.registerPlugin('MediaListenerPlugin') : null;
      if (plugin) {
        await plugin.controlMedia({ action });
      }
    } catch (e) {
      console.warn(`No se pudo enviar el comando ${action}`);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-950 text-white font-sans overflow-hidden flex flex-col select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 pointer-events-none z-0"></div>
      
      {/* BARRA DE ESTADO */}
      <div className="h-12 bg-black/40 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-6 z-50 relative">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold tracking-wider">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <span className="text-sm text-gray-400">{currentTime.toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center gap-4 text-gray-300">
          <Wifi size={20} />
          <Battery size={20} className="text-green-400" />
          <span className="font-semibold">{Math.round(speed)} km/h</span>
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex relative z-10 overflow-hidden">
        
        {/* MENÚ LATERAL */}
        <div className="w-24 bg-black/60 backdrop-blur-md border-r border-white/10 flex flex-col items-center py-6 gap-8">
          <NavItem icon={<Menu />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Inicio" />
          <NavItem icon={<MapPin />} active={activeTab === 'map'} onClick={() => setActiveTab('map')} label="Mapa" />
          <NavItem icon={<Music />} active={activeTab === 'media'} onClick={() => setActiveTab('media')} label="Medios" />
          <NavItem icon={<Camera />} active={activeTab === 'dashcam'} onClick={() => setActiveTab('dashcam')} label="Dashcam" />
          <div className="flex-1"></div>
          <NavItem icon={<Settings />} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Ajustes" />
        </div>

        {/* PANTALLAS */}
        <div className="flex-1 p-4 relative">
          <div className={`absolute inset-0 transition-opacity duration-500 p-4 ${activeTab === 'home' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <HomeView speed={speed} setTab={setActiveTab} carModel={carModel} carColor={carColor} mediaData={mediaData} handleMediaControl={handleMediaControl} />
          </div>
          
          <div className={`absolute inset-0 transition-opacity duration-500 p-4 ${activeTab === 'map' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <MapView carColor={carColor} is3D={false} />
          </div>
          
          <div className={`absolute inset-0 transition-opacity duration-500 p-4 ${activeTab === 'media' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <MediaView mediaData={mediaData} handleMediaControl={handleMediaControl} />
          </div>

          <div className={`absolute inset-0 transition-opacity duration-500 p-4 ${activeTab === 'dashcam' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <DashcamView />
          </div>

          <div className={`absolute inset-0 transition-opacity duration-500 p-4 ${activeTab === 'settings' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <SettingsView 
              carColor={carColor} setCarColor={setCarColor}
              carModel={carModel} setCarModel={setCarModel}
              offlineMapDownloaded={offlineMapDownloaded}
              setOfflineMapDownloaded={setOfflineMapDownloaded}
              downloadProgress={downloadProgress}
              setDownloadProgress={setDownloadProgress}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTES UI REUTILIZABLES ---
const NavItem = ({ icon, active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 w-16 h-16
      ${active ? 'bg-blue-600/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
  >
    {icon}
    <span className="text-[10px] mt-1 opacity-80">{label}</span>
    {active && <div className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full"></div>}
  </button>
);

const WidgetCard = ({ children, className = "" }) => (
  <div className={`bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl ${className}`}>
    {children}
  </div>
);

// --- 1. VISTA DE INICIO (DASHBOARD) ---
const HomeView = ({ speed, setTab, carModel, carColor, mediaData, handleMediaControl }) => (
  <div className="h-full w-full grid grid-cols-12 grid-rows-6 gap-4">
    
    {/* MAPA 3D WIDGET */}
    <WidgetCard className="col-span-8 row-span-6 relative group overflow-hidden" >
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 pointer-events-none">
        <div className="bg-black/60 w-max px-4 py-2 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-2 shadow-lg">
          <Navigation size={18} className="text-blue-400"/> 
          <span className="font-semibold text-white">Ruta en curso: La Asunción</span>
        </div>
        <button onClick={() => setTab('map')} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full w-max backdrop-blur-md pointer-events-auto transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2">
          <Map size={20} /> Pantalla Completa
        </button>
      </div>
      
      {/* Contenedor con perspectiva 3D imitando Navegación */}
      <div className="absolute inset-0 bg-gray-900 overflow-hidden" style={{ perspective: '800px' }}>
        <div className="w-full h-full" style={{ transform: 'rotateX(55deg) scale(1.6)', transformOrigin: 'bottom center', transition: 'transform 0.5s' }}>
            <MapView carColor={carColor} is3D={true} />
        </div>
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-gray-900 to-transparent z-10 pointer-events-none"></div>
      </div>
    </WidgetCard>

    {/* VELOCÍMETRO */}
    <WidgetCard className="col-span-4 row-span-3 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
      
      <div className="text-gray-400 mb-2 uppercase tracking-widest text-sm font-semibold">Velocidad Actual</div>
      <div className="flex items-baseline gap-2">
        <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tabular-nums tracking-tighter drop-shadow-lg">
          {speed}
        </span>
        <span className="text-2xl text-blue-400 font-bold">km/h</span>
      </div>
      
      <div className="w-3/4 h-2 bg-gray-800 rounded-full mt-6 overflow-hidden shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(100, (speed / 120) * 100)}%` }}
        ></div>
      </div>
      <div className="mt-4 flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/5">
        <Car size={16} style={{ color: carColor }} />
        <span className="text-xs text-gray-300 font-medium">{carModel}</span>
      </div>
    </WidgetCard>

    {/* MEDIA MINI WIDGET (Datos Reales) */}
    <WidgetCard className="col-span-4 row-span-3 flex flex-col p-5 justify-between relative overflow-hidden" >
      <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-30 blur-md transition-all duration-500" style={{ backgroundImage: `url(${mediaData.albumArt})` }}></div>
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      
      <div className="relative z-10 flex items-center gap-4 cursor-pointer" onClick={() => setTab('media')}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-white/10">
          <img src={mediaData.albumArt} alt="Album" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="font-bold text-white text-lg truncate drop-shadow-md">{mediaData.title}</h3>
          <p className="text-sm text-gray-300 truncate drop-shadow-md">{mediaData.artist}</p>
        </div>
      </div>
      
      <div className="relative z-10">
          <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-white transition-all duration-1000" style={{ width: `${mediaData.progressPercent}%` }}></div>
          </div>
          <div className="flex justify-center items-center gap-6">
            <button onClick={() => handleMediaControl('PREVIOUS')} className="text-gray-300 hover:text-white transition-colors"><SkipBack size={24} /></button>
            <button onClick={() => handleMediaControl('PLAY_PAUSE')} className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                {mediaData.isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>
            <button onClick={() => handleMediaControl('NEXT')} className="text-gray-300 hover:text-white transition-colors"><SkipForward size={24} /></button>
          </div>
      </div>
    </WidgetCard>
  </div>
);

// --- 2. VISTA DE MAPA (Leaflet con Soporte 3D/2D Failsafe) ---
const MapView = ({ carColor, is3D = false }) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const loadMap = async () => {
      if (!window.L) {
        const css = document.createElement('link');
        css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true; document.head.appendChild(script);
        script.onload = initMap;
      } else {
        initMap();
      }
    };

    const initMap = () => {
      if (mapRef.current && window.L && !mapRef.current._leaflet_id) {
        const map = window.L.map(mapRef.current, {
            zoomControl: !is3D, 
            dragging: !is3D, 
            scrollWheelZoom: !is3D,
            doubleClickZoom: !is3D
        }).setView(DEFAULT_LOCATION, is3D ? 16 : 15);
        
        // Usamos OpenStreetMap estándar pero con un filtro CSS oscuro para mayor compatibilidad
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          className: 'map-tiles-dark'
        }).addTo(map);

        const carIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${carColor}" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`;
        const carIcon = window.L.divIcon({
            html: `<div style="width: 48px; height: 48px; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.8)); transform: rotate(90deg);">${carIconSvg}</div>`,
            className: '', iconSize: [48, 48], iconAnchor: [24, 24]
        });

        window.L.marker(DEFAULT_LOCATION, {icon: carIcon}).addTo(map);
        if(!is3D) window.L.control.zoom({ position: 'bottomright' }).addTo(map);
        
        const style = document.createElement('style');
        style.innerHTML = `.map-tiles-dark { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }`;
        document.head.appendChild(style);

        setMapLoaded(true);
      }
    };
    loadMap();
  }, [carColor, is3D]);

  return (
    <div className={`h-full w-full relative ${!is3D ? 'rounded-3xl border border-white/10 shadow-2xl overflow-hidden' : ''}`} style={{ minHeight: '100%', minWidth: '100%' }}>
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
      )}
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} className="bg-gray-900"></div>
      
      {!is3D && (
        <div className="absolute top-6 left-6 z-[400] bg-black/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-xl">
          <h2 className="text-xl font-bold flex items-center gap-2"><Navigation size={20} className="text-blue-400"/> Navegación Activa</h2>
          <p className="text-gray-300 text-sm mt-1">Av. 31 de Julio, La Asunción</p>
        </div>
      )}
    </div>
  );
};

// --- 3. MEDIA VIEW (Conectada al reproductor real) ---
const MediaView = ({ mediaData, handleMediaControl }) => {
  const launchApp = (pkg) => window.location.href = `intent://#Intent;package=${pkg};end;`;

  return (
    <div className="h-full w-full flex gap-6">
      {/* Panel Izquierdo: Apps Instaladas */}
      <WidgetCard className="w-1/3 flex flex-col p-6 relative">
         <h2 className="text-2xl font-bold mb-2">Fuentes de Audio</h2>
         <p className="text-sm text-gray-400 mb-8">
             El servicio Nativo capturará automáticamente la música de estas apps una vez que le otorgues permisos.
         </p>
         
         <div className="grid grid-cols-2 gap-4">
            <button onClick={() => launchApp('com.spotify.music')} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex flex-col items-center gap-3 transition-all border border-white/5">
                <div className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(29,185,84,0.4)]"><Music size={24} className="text-white" /></div>
                <span className="font-semibold text-sm">Spotify</span>
            </button>
            <button onClick={() => launchApp('com.google.android.apps.youtube.music')} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex flex-col items-center gap-3 transition-all border border-white/5">
                <div className="w-14 h-14 bg-black border border-white/20 rounded-full flex items-center justify-center"><Play size={24} className="text-red-500" /></div>
                <span className="font-semibold text-sm">YT Music</span>
            </button>
            <button onClick={() => launchApp('com.sec.android.app.music')} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex flex-col items-center gap-3 transition-all border border-white/5">
                <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center"><Music size={24} className="text-white" /></div>
                <span className="font-semibold text-sm">Samsung</span>
            </button>
            <button onClick={() => launchApp('com.apple.android.music')} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex flex-col items-center gap-3 transition-all border border-white/5">
                <div className="w-14 h-14 bg-[#FA243C] rounded-full flex items-center justify-center"><Music size={24} className="text-white" /></div>
                <span className="font-semibold text-sm">Apple Music</span>
            </button>
         </div>
         
         <div className="mt-auto p-4 bg-blue-900/20 rounded-xl border border-blue-500/30">
            <p className="text-xs text-blue-200">
                <AlertTriangle size={14} className="inline mr-1" />
                Asegúrate de haber habilitado el <b>"Acceso a Notificaciones"</b> para esta App en los ajustes de tu teléfono.
            </p>
         </div>
      </WidgetCard>

      {/* Panel Derecho: Reproductor Real */}
      <WidgetCard className="w-2/3 relative overflow-hidden flex flex-col justify-end p-10">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl transition-all duration-700" style={{ backgroundImage: `url(${mediaData.albumArt})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/80 to-transparent"></div>
        
        <div className="relative z-10 flex gap-8 items-end">
            <img src={mediaData.albumArt} alt="Album Art" className="w-48 h-48 rounded-2xl shadow-2xl border border-white/10 object-cover bg-gray-800" />
            
            <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-sm tracking-widest uppercase">
                        {mediaData.isPlaying ? 'Reproduciendo' : 'Pausado'}
                    </span>
                </div>
                <h1 className="text-5xl font-black mb-1 drop-shadow-md truncate">{mediaData.title}</h1>
                <h2 className="text-2xl text-gray-300 font-medium mb-6 truncate">{mediaData.artist}</h2>
                
                {/* Barra de Progreso Dinámica */}
                <div className="flex items-center gap-4 mb-6">
                    <span className="text-sm font-medium w-10">{mediaData.position}</span>
                    <div className="flex-1 h-2 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-md">
                        <div className="h-full bg-white rounded-full relative transition-all duration-1000 ease-linear" style={{ width: `${mediaData.progressPercent}%` }}>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md"></div>
                        </div>
                    </div>
                    <span className="text-sm font-medium text-gray-400 w-10">{mediaData.duration}</span>
                </div>

                {/* Controles Activos */}
                <div className="flex items-center gap-8">
                    <Volume2 size={24} className="text-gray-400" />
                    <div className="flex items-center gap-6 flex-1 justify-center">
                        <button onClick={() => handleMediaControl('PREVIOUS')} className="text-gray-300 hover:text-white hover:scale-110 transition-all"><SkipBack size={36} /></button>
                        <button onClick={() => handleMediaControl('PLAY_PAUSE')} className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            {mediaData.isPlaying ? <Pause size={40} /> : <Play size={40} className="ml-2" />}
                        </button>
                        <button onClick={() => handleMediaControl('NEXT')} className="text-gray-300 hover:text-white hover:scale-110 transition-all"><SkipForward size={36} /></button>
                    </div>
                </div>
            </div>
        </div>
      </WidgetCard>
    </div>
  );
};

// --- 4. DASHCAM VIEW ---
const DashcamView = () => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasCameraError, setHasCameraError] = useState(false);
  const chunksRef = useRef([]);

  useEffect(() => {
    let stream;
    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setHasCameraError(true);
      }
    };
    initCamera();
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, []);

  const saveVideoNatively = async (blob) => {
      try {
          const fsPkg = '@capacitor/filesystem';
          const { Filesystem, Directory } = await import(/* @vite-ignore */ fsPkg);
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
              const base64data = reader.result;
              await Filesystem.writeFile({
                  path: `Dashcam_${new Date().getTime()}.webm`,
                  data: base64data,
                  directory: Directory.Documents
              });
              alert("✅ Video de Dashcam guardado en la carpeta Documentos.");
          };
      } catch (e) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Dashcam_${new Date().getTime()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          alert("✅ Video descargado en Descargas.");
      }
  };

  const toggleRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;

    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      chunksRef.current = [];
      const stream = videoRef.current.srcObject;
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        saveVideoNatively(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="h-full w-full relative rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
      {hasCameraError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4">
            <AlertTriangle size={64} className="text-yellow-600/50" />
            <p className="text-xl">Cámara no disponible</p>
        </div>
      ) : (
        <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
            
            <div className="absolute inset-0 pointer-events-none border-4 border-transparent flex flex-col">
                <div className="h-1/3 w-full border-b border-green-500/30 bg-gradient-to-b from-green-500/10 to-transparent"></div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10">
                <div className="bg-black/60 backdrop-blur-md px-6 py-4 rounded-2xl text-white border border-white/10 shadow-xl">
                    <h3 className="font-bold flex items-center gap-2"><Camera size={20}/> Modo Dashcam</h3>
                    <p className="text-xs text-green-400 mt-1">Almacenamiento: Guardando en Documentos</p>
                </div>

                <button 
                    onClick={toggleRecording}
                    className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold transition-all shadow-xl backdrop-blur-md border pointer-events-auto ${
                        isRecording 
                        ? 'bg-red-600/90 hover:bg-red-500 border-red-400 animate-pulse text-white' 
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                >
                    <div className={`w-4 h-4 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`}></div>
                    {isRecording ? 'DETENER GRABACIÓN' : 'INICIAR GRABACIÓN'}
                </button>
            </div>
            
            {isRecording && (
                <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 px-5 py-2 rounded-full backdrop-blur-md border border-red-500/30">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
                    <span className="font-bold text-red-500 tracking-wider">REC</span>
                </div>
            )}
        </>
      )}
    </div>
  );
};

// --- 5. SETTINGS VIEW ---
const SettingsView = ({ carColor, setCarColor, carModel, setCarModel, offlineMapDownloaded, setOfflineMapDownloaded, downloadProgress, setDownloadProgress }) => {
  const handleDownload = () => {
    if(offlineMapDownloaded) return;
    setDownloadProgress(1);
    const interval = setInterval(() => {
        setDownloadProgress(prev => {
            if(prev >= 100) { clearInterval(interval); setOfflineMapDownloaded(true); return 100; }
            return prev + 5;
        });
    }, 200);
  };

  return (
    <div className="h-full w-full flex gap-6">
      <WidgetCard className="w-1/3 flex flex-col p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-8">Configuración</h2>
        <div className="space-y-8">
            <div>
                <h3 className="text-gray-400 text-sm font-semibold mb-4 uppercase tracking-wider">Mi Vehículo</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm mb-2 text-gray-300">Modelo del Auto</label>
                        <input type="text" value={carModel} onChange={(e) => setCarModel(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm mb-2 text-gray-300">Color del Marcador</label>
                        <div className="flex gap-3">
                            {['#ffffff', '#3b82f6', '#ef4444', '#10b981', '#f59e0b'].map(color => (
                                <button key={color} onClick={() => setCarColor(color)} className={`w-10 h-10 rounded-full border-2 transition-transform ${carColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: color }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </WidgetCard>
      <WidgetCard className="w-2/3 flex flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent"></div>
        <Car size={180} style={{ color: carColor }} className="drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] z-10" />
        <h1 className="text-4xl font-black mt-8 z-10 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{carModel}</h1>
      </WidgetCard>
    </div>
  );
};