import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, Play, Pause, SkipForward, SkipBack, 
  Settings, Video, Music, Map, Camera, Bell, Car, 
  Download, MapPin, AlertTriangle, Battery, Wifi, 
  Menu, X, Volume2
} from 'lucide-react';

// --- CONFIGURACIÓN INICIAL ---
const DEFAULT_LOCATION = [11.0333, -63.8667]; // La Asunción, Nueva Esparta
const DEFAULT_CAR = "Kia Rio Stylus 2009";

export default function CarLauncher() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [speed, setSpeed] = useState(0);
  const [activeTab, setActiveTab] = useState('home'); // home, map, media, dashcam, settings
  const [notifications, setNotifications] = useState([]);
  
  // Settings State
  const [carColor, setCarColor] = useState('#3b82f6'); // Azul por defecto
  const [carModel, setCarModel] = useState(DEFAULT_CAR);
  const [offlineMapDownloaded, setOfflineMapDownloaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Reloj y Notificaciones simuladas
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Simular notificaciones
    const notifTimer = setTimeout(() => {
      addNotification("WhatsApp", "Mensaje nuevo: ¡Llegando a la Asunción!");
    }, 15000);

    return () => {
      clearInterval(timer);
      clearTimeout(notifTimer);
    };
  }, []);

  // Rastreo de Velocidad por GPS
  useEffect(() => {
    let watchId;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          // Convertir m/s a km/h
          const speedKmh = position.coords.speed ? (position.coords.speed * 3.6) : 0;
          setSpeed(Math.round(speedKmh));
        },
        (error) => console.warn("Error GPS: ", error),
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, []);

  const addNotification = (title, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  return (
    <div className="h-screen w-screen bg-gray-950 text-white font-sans overflow-hidden flex flex-col select-none">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 pointer-events-none z-0"></div>
      
      {/* TOP STATUS BAR */}
      <div className="h-12 bg-black/40 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-6 z-50 relative">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold tracking-wider">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <span className="text-sm text-gray-400">{currentTime.toLocaleDateString()}</span>
        </div>
        
        {/* Notificaciones flotantes en el centro */}
        <div className="flex-1 flex justify-center">
          {notifications.map(n => (
            <div key={n.id} className="bg-white/10 backdrop-blur-lg border border-white/20 px-4 py-1 rounded-full flex items-center gap-2 animate-bounce">
              <Bell size={16} className="text-blue-400" />
              <span className="text-sm font-medium">{n.title}: {n.message}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 text-gray-300">
          <Wifi size={20} />
          <Battery size={20} className="text-green-400" />
          <span className="font-semibold">{Math.round(speed)} km/h</span>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex relative z-10 overflow-hidden">
        
        {/* SIDE NAV */}
        <div className="w-24 bg-black/60 backdrop-blur-md border-r border-white/10 flex flex-col items-center py-6 gap-8">
          <NavItem icon={<Menu />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Inicio" />
          <NavItem icon={<MapPin />} active={activeTab === 'map'} onClick={() => setActiveTab('map')} label="Mapa" />
          <NavItem icon={<Music />} active={activeTab === 'media'} onClick={() => setActiveTab('media')} label="Medios" />
          <NavItem icon={<Camera />} active={activeTab === 'dashcam'} onClick={() => setActiveTab('dashcam')} label="Dashcam" />
          <div className="flex-1"></div>
          <NavItem icon={<Settings />} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Ajustes" />
        </div>

        {/* WORKSPACE */}
        <div className="flex-1 p-4 relative">
          <div className={`absolute inset-0 transition-opacity duration-500 p-4 ${activeTab === 'home' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <HomeView speed={speed} setTab={setActiveTab} carModel={carModel} carColor={carColor} />
          </div>
          
          <div className={`absolute inset-0 transition-opacity duration-500 p-4 ${activeTab === 'map' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <MapView carColor={carColor} />
          </div>
          
          <div className={`absolute inset-0 transition-opacity duration-500 p-4 ${activeTab === 'media' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <MediaView />
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

// --- VISTAS PRINCIPALES ---

// 1. HOME VIEW (DASHBOARD)
const HomeView = ({ speed, setTab, carModel, carColor }) => (
  <div className="h-full w-full grid grid-cols-12 grid-rows-6 gap-4">
    
    {/* Map Widget (Large) */}
    <WidgetCard className="col-span-8 row-span-6 relative group cursor-pointer" >
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 pointer-events-none">
        <div className="bg-black/50 w-max px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
          <h2 className="text-lg font-semibold flex items-center gap-2"><MapPin size={18} className="text-red-400"/> Navegando por La Asunción</h2>
        </div>
        <button onClick={() => setTab('map')} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full w-max backdrop-blur-md pointer-events-auto transition-all shadow-lg flex items-center gap-2">
          <Map size={20} /> Pantalla Completa
        </button>
      </div>
      <div className="absolute inset-0 bg-gray-900 overflow-hidden">
         <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            src="https://www.openstreetmap.org/export/embed.html?bbox=-63.9567,10.9833,-63.7767,11.0833&layer=mapnik&marker=11.0333,-63.8667" 
            className="w-full h-full object-cover filter invert-[.9] hue-rotate-[180deg] brightness-75 contrast-125 opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none scale-110"
         ></iframe>
      </div>
    </WidgetCard>

    {/* Speedometer Widget */}
    <WidgetCard className="col-span-4 row-span-3 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl"></div>
      
      <div className="text-gray-400 mb-2 uppercase tracking-widest text-sm">Velocidad Actual</div>
      <div className="flex items-baseline gap-2">
        <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tabular-nums tracking-tighter">
          {speed}
        </span>
        <span className="text-2xl text-gray-400 font-bold">km/h</span>
      </div>
      
      {/* Simulated RPM / Eco bar */}
      <div className="w-3/4 h-2 bg-gray-800 rounded-full mt-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(100, (speed / 120) * 100)}%` }}
        ></div>
      </div>
      <div className="mt-4 flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
        <Car size={16} style={{ color: carColor }} />
        <span className="text-xs text-gray-300">{carModel}</span>
      </div>
    </WidgetCard>

    {/* Quick Media Widget */}
    <WidgetCard className="col-span-4 row-span-3 flex flex-col p-4 justify-between group cursor-pointer" >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
          <Music size={24} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white leading-tight">Reproductor</h3>
          <p className="text-xs text-gray-400">Toca para abrir multimedia</p>
        </div>
      </div>
      
      <div className="flex justify-center items-center gap-6 mt-4">
         <button className="text-gray-400 hover:text-white transition-colors"><SkipBack size={28} /></button>
         <button onClick={() => setTab('media')} className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
           <Play size={32} className="ml-1" />
         </button>
         <button className="text-gray-400 hover:text-white transition-colors"><SkipForward size={28} /></button>
      </div>
    </WidgetCard>
  </div>
);

// 2. MAP VIEW (Leaflet Integration via standard script injection for single-file support)
const MapView = ({ carColor }) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Inject Leaflet CSS & JS
    const loadMap = async () => {
      if (!window.L) {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        document.head.appendChild(script);

        script.onload = initMap;
      } else {
        initMap();
      }
    };

    const initMap = () => {
      if (mapRef.current && window.L && !mapRef.current._leaflet_id) {
        const map = window.L.map(mapRef.current, {
            zoomControl: false, // Ocultar control por defecto para UI más limpia
        }).setView(DEFAULT_LOCATION, 15);
        
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          className: 'map-tiles' // Para aplicar CSS oscuro si quisiéramos
        }).addTo(map);

        // Auto Icon personalizado (SVG inline)
        const carIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${carColor}" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-car"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`;
        
        const carIcon = window.L.divIcon({
            html: `<div style="width: 48px; height: 48px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); transform: rotate(90deg);">${carIconSvg}</div>`,
            className: '',
            iconSize: [48, 48],
            iconAnchor: [24, 24]
        });

        window.L.marker(DEFAULT_LOCATION, {icon: carIcon}).addTo(map);
        
        // Control de zoom personalizado
        window.L.control.zoom({ position: 'bottomright' }).addTo(map);
        
        setMapLoaded(true);

        // Estilos para forzar modo oscuro en OpenStreetMap
        const style = document.createElement('style');
        style.innerHTML = `
            .leaflet-layer, .leaflet-control-zoom-in, .leaflet-control-zoom-out, .leaflet-control-attribution {
                filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
            }
        `;
        document.head.appendChild(style);
      }
    };

    loadMap();
    
    return () => {
       // Cleanup not strictly necessary for simple demo, but good practice
    };
  }, [carColor]);

  return (
    <div className="h-full w-full relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full bg-gray-900"></div>
      
      {/* UI Overlay on Map */}
      <div className="absolute top-6 left-6 z-[400] bg-black/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-xl">
        <h2 className="text-xl font-bold flex items-center gap-2"><Navigation size={20} className="text-blue-400"/> Navegación Activa</h2>
        <p className="text-gray-300 text-sm mt-1">Av. 31 de Julio, La Asunción</p>
      </div>
    </div>
  );
};

// 3. MEDIA VIEW
const MediaView = () => {
  const [source, setSource] = useState('apps'); // apps, local o youtube
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const [fileName, setFileName] = useState("Selecciona una pista...");
  const audioRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioSrc(url);
      setFileName(file.name);
      setIsPlaying(true);
      if(audioRef.current) {
        audioRef.current.load();
        audioRef.current.play();
      }
    }
  };

  const togglePlay = () => {
    if(!audioRef.current) return;
    if(isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const launchAndroidApp = (packageName) => {
    window.location.href = `intent://#Intent;package=${packageName};end;`;
  };

  return (
    <div className="h-full w-full flex flex-col gap-6">
      <div className="flex bg-black/40 backdrop-blur-md rounded-full p-1 w-max border border-white/10">
        <button onClick={() => setSource('apps')} className={`px-8 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${source === 'apps' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Mis Apps</button>
        <button onClick={() => setSource('local')} className={`px-8 py-3 rounded-full font-medium transition-all ${source === 'local' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Música Archivos</button>
        <button onClick={() => setSource('youtube')} className={`px-8 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${source === 'youtube' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><Video size={18}/> YouTube</button>
      </div>

      <WidgetCard className="flex-1 flex overflow-hidden">
        {source === 'apps' ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-8 relative">
             <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent z-0"></div>
             <div className="z-10 text-center max-w-2xl">
                <h2 className="text-3xl font-bold mb-4">Reproductores Instalados</h2>
                <p className="text-gray-400 mb-8">
                    Debido a las medidas de seguridad del navegador, no es posible leer la música en segundo plano. Sin embargo, puedes iniciar tus reproductores nativos favoritos directamente desde aquí con un toque:
                </p>
                
                <div className="flex gap-6 justify-center">
                    <button onClick={() => launchAndroidApp('com.spotify.music')} className="flex flex-col items-center gap-3 hover:scale-105 transition-transform">
                        <div className="w-20 h-20 bg-[#1DB954] rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                            <Music size={40} className="text-white" />
                        </div>
                        <span className="font-semibold">Spotify</span>
                    </button>
                    
                    <button onClick={() => launchAndroidApp('com.google.android.apps.youtube.music')} className="flex flex-col items-center gap-3 hover:scale-105 transition-transform">
                        <div className="w-20 h-20 bg-black border border-white/20 rounded-full flex items-center justify-center shadow-lg">
                            <Play size={40} className="text-red-500" />
                        </div>
                        <span className="font-semibold">YT Music</span>
                    </button>
                    
                    <button onClick={() => launchAndroidApp('com.apple.android.music')} className="flex flex-col items-center gap-3 hover:scale-105 transition-transform">
                        <div className="w-20 h-20 bg-[#FA243C] rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                            <Music size={40} className="text-white" />
                        </div>
                        <span className="font-semibold">Apple Music</span>
                    </button>

                    <button onClick={() => launchAndroidApp('com.sec.android.app.music')} className="flex flex-col items-center gap-3 hover:scale-105 transition-transform">
                        <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Play size={40} className="text-white" />
                        </div>
                        <span className="font-semibold">Samsung</span>
                    </button>
                </div>
             </div>
          </div>
        ) : source === 'local' ? (
          <div className="w-full flex">
            {/* Cover Art Area */}
            <div className="w-1/2 bg-gray-800/50 flex flex-col items-center justify-center p-8 border-r border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <div className={`w-64 h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center z-20 ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
                    <div className="w-16 h-16 bg-gray-900 rounded-full border-4 border-gray-800"></div>
                </div>
                <div className="z-20 mt-8 text-center">
                    <h2 className="text-2xl font-bold truncate max-w-xs">{fileName}</h2>
                    <p className="text-gray-400 mt-1">Reproductor Nativo</p>
                </div>
            </div>
            
            {/* Controls Area */}
            <div className="w-1/2 flex flex-col justify-center px-12 gap-8">
               <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer"
                />
                
                <audio ref={audioRef} src={audioSrc} onEnded={() => setIsPlaying(false)} className="hidden" />

                <div className="bg-white/5 p-8 rounded-3xl border border-white/5 shadow-inner">
                    <div className="flex justify-between items-center mb-6 text-gray-400">
                        <Volume2 size={24} />
                        <div className="h-2 flex-1 mx-4 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-1/2"></div>
                        </div>
                    </div>

                    <div className="flex justify-center items-center gap-8">
                        <button className="text-gray-400 hover:text-white hover:scale-110 transition-all p-2"><SkipBack size={36} /></button>
                        <button 
                            onClick={togglePlay} 
                            disabled={!audioSrc}
                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${!audioSrc ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-white text-black hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]'}`}
                        >
                            {isPlaying ? <Pause size={40} /> : <Play size={40} className="ml-2" />}
                        </button>
                        <button className="text-gray-400 hover:text-white hover:scale-110 transition-all p-2"><SkipForward size={36} /></button>
                    </div>
                </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full">
            {/* YouTube Embed Seguro nativo */}
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/videoseries?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="bg-black"
            ></iframe>
          </div>
        )}
      </WidgetCard>
    </div>
  );
};

// 4. DASHCAM VIEW
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
        // Intenta obtener cámara trasera preferiblemente
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accediendo a la cámara: ", err);
        setHasCameraError(true);
      }
    };
    initCamera();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const toggleRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;

    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      chunksRef.current = [];
      const stream = videoRef.current.srcObject;
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        // En una app real, esto se guardaría en el dispositivo local.
        // Aquí simulamos creando un link de descarga.
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Dashcam_${new Date().getTime()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="h-full w-full relative rounded-3xl overflow-hidden bg-black">
      {hasCameraError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4">
            <AlertTriangle size={64} className="text-yellow-600/50" />
            <p className="text-xl">Cámara no disponible o permisos denegados.</p>
            <p className="text-sm">Asegúrate de otorgar permisos al navegador.</p>
        </div>
      ) : (
        <>
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
            ></video>
            
            {/* AI Overlay Mockup */}
            <div className="absolute inset-0 pointer-events-none border-4 border-transparent flex flex-col">
                <div className="h-1/3 w-full border-b border-green-500/20 bg-gradient-to-b from-green-500/5 to-transparent"></div>
                <div className="flex-1 w-full flex items-center justify-center">
                    <div className="w-64 h-32 border-2 border-yellow-500/50 rounded-lg relative">
                        <span className="absolute -top-6 left-0 bg-yellow-500/80 text-black text-xs px-2 py-1 rounded">Vehículo Detectado</span>
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-yellow-500"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-yellow-500"></div>
                    </div>
                </div>
            </div>

            {/* UI Overlay */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="bg-black/60 backdrop-blur-md px-6 py-4 rounded-2xl text-white border border-white/10">
                    <h3 className="font-bold flex items-center gap-2">
                        <Camera size={20}/> Modo Dashcam Activo
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Grabación en segundo plano optimizada para bajo consumo.</p>
                    <div className="mt-2 text-sm">
                        <span className="text-green-400 mr-4">• IA: Analizando vía</span>
                        <span>• Almacenamiento: 84% libre</span>
                    </div>
                </div>

                <button 
                    onClick={toggleRecording}
                    className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold transition-all shadow-xl backdrop-blur-md border ${
                        isRecording 
                        ? 'bg-red-600/90 hover:bg-red-500 border-red-400 animate-pulse text-white' 
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                >
                    <div className={`w-4 h-4 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`}></div>
                    {isRecording ? 'DETENER GRABACIÓN' : 'INICIAR GRABACIÓN'}
                </button>
            </div>
            
            {/* REC indicator top left */}
            {isRecording && (
                <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
                    <span className="font-bold text-red-500 tracking-wider">REC</span>
                    <span className="text-white text-sm ml-2 font-mono">
                        {new Date().toLocaleTimeString()}
                    </span>
                </div>
            )}
        </>
      )}
    </div>
  );
};

// 5. SETTINGS VIEW
const SettingsView = ({ 
    carColor, setCarColor, carModel, setCarModel, 
    offlineMapDownloaded, setOfflineMapDownloaded, downloadProgress, setDownloadProgress 
}) => {
  
  const handleDownload = () => {
    if(offlineMapDownloaded) return;
    setDownloadProgress(1);
    const interval = setInterval(() => {
        setDownloadProgress(prev => {
            if(prev >= 100) {
                clearInterval(interval);
                setOfflineMapDownloaded(true);
                return 100;
            }
            return prev + 5;
        });
    }, 200);
  };

  return (
    <div className="h-full w-full flex gap-6">
      {/* Menu Settings */}
      <WidgetCard className="w-1/3 flex flex-col p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-8">Configuración</h2>
        
        <div className="space-y-8">
            {/* Auto Settings */}
            <div>
                <h3 className="text-gray-400 text-sm font-semibold mb-4 uppercase tracking-wider">Mi Vehículo</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm mb-2 text-gray-300">Modelo del Auto</label>
                        <input 
                            type="text" 
                            value={carModel} 
                            onChange={(e) => setCarModel(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-2 text-gray-300">Color del Marcador en Mapa</label>
                        <div className="flex gap-3">
                            {['#ffffff', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6b7280'].map(color => (
                                <button 
                                    key={color}
                                    onClick={() => setCarColor(color)}
                                    className={`w-10 h-10 rounded-full border-2 transition-transform ${carColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                            <input 
                                type="color" 
                                value={carColor} 
                                onChange={(e) => setCarColor(e.target.value)}
                                className="w-10 h-10 rounded-full cursor-pointer bg-transparent border-0 p-0"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Offline Maps Settings */}
            <div className="pt-6 border-t border-white/10">
                <h3 className="text-gray-400 text-sm font-semibold mb-4 uppercase tracking-wider">Navegación Offline</h3>
                <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="font-semibold text-white">Mapa de Venezuela</p>
                            <p className="text-xs text-gray-400">Incluye Nueva Esparta (245 MB)</p>
                        </div>
                        <MapPin size={24} className="text-blue-400" />
                    </div>
                    
                    {downloadProgress > 0 && downloadProgress < 100 ? (
                        <div className="mt-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span>Descargando...</span>
                                <span>{downloadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                                <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-200" style={{ width: `${downloadProgress}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={handleDownload}
                            disabled={offlineMapDownloaded}
                            className={`mt-4 w-full py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                                offlineMapDownloaded 
                                ? 'bg-green-600/20 text-green-400 border border-green-500/30 cursor-default' 
                                : 'bg-blue-600 hover:bg-blue-500 text-white'
                            }`}
                        >
                            {offlineMapDownloaded ? "MAPA LOCAL LISTO" : <><Download size={16}/> DESCARGAR PARA USO OFFLINE</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
      </WidgetCard>

      {/* Preview Area */}
      <WidgetCard className="w-2/3 flex flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent"></div>
        <Car size={180} style={{ color: carColor }} className="drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] z-10" />
        <h1 className="text-4xl font-black mt-8 z-10 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{carModel}</h1>
        <p className="text-gray-400 mt-2 z-10">Configuración activa en el sistema</p>
      </WidgetCard>
    </div>
  );
};