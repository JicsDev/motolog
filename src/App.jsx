function TabViagem({ config, entries, activeTrip, setActiveTrip, onStopTrip, currentFuel }) {
  const ultimoAbast = entries.find(e => e.type === 'abastecimento');
  const [precoPlan, setPrecoPlan] = useState(ultimoAbast ? ultimoAbast.precoLitro : 5.89);
  const [destinoQuery, setDestinoQuery] = useState('');
  const [distanciaPlan, setDistanciaPlan] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchSuccess, setSearchSuccess] = useState('');

  const [elapsed, setElapsed] = useState(activeTrip ? activeTrip.elapsedTime || 0 : 0);
  const [gpsKm, setGpsKm] = useState(activeTrip ? activeTrip.accumulatedKm || 0 : 0);
  const [currentSpeed, setCurrentSpeed] = useState(0); 
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    let interval, watchId;
    if (activeTrip && !activeTrip.isPaused) {
      interval = setInterval(() => { setElapsed(prev => prev + 1); }, 1000);
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const now = Date.now();
            setActiveTrip(prev => {
              if (!prev || prev.isPaused) return prev;
              let newKm = 0; let calculatedSpeed = 0;
              if (prev.lastLat && prev.lastLon) {
                newKm = calcHaversine(prev.lastLat, prev.lastLon, latitude, longitude);
                const timeDiffInHours = (now - lastUpdateRef.current) / 3600000;
                if (timeDiffInHours > 0) calculatedSpeed = newKm / timeDiffInHours;
              }
              if (newKm > 0.005) { 
                const updatedKm = prev.accumulatedKm + newKm;
                setGpsKm(updatedKm);
                setCurrentSpeed(calculatedSpeed > 150 ? prev.speed || 0 : calculatedSpeed);
                lastUpdateRef.current = now;
                return { ...prev, lastLat: latitude, lastLon: longitude, accumulatedKm: updatedKm, speed: calculatedSpeed };
              }
              return { ...prev, lastLat: latitude, lastLon: longitude };
            });
          },
          (error) => console.log("GPS aguardando..."),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      }
    }
    return () => { clearInterval(interval); if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [activeTrip, setActiveTrip]);

  const handleStartTrip = () => {
    setActiveTrip({ startTime: Date.now(), elapsedTime: 0, startOdo: config.odometro, accumulatedKm: 0, lastLat: null, lastLon: null, isPaused: false });
    setGpsKm(0); setElapsed(0); setCurrentSpeed(0); lastUpdateRef.current = Date.now();
  };

  const handleTogglePause = () => {
    setActiveTrip(prev => ({ ...prev, isPaused: !prev.isPaused, elapsedTime: elapsed, lastLat: null, lastLon: null }));
  };

  const handleCalcularRota = async () => {
    if (!destinoQuery) return;
    setIsSearching(true); setSearchError(''); setSearchSuccess(''); setDistanciaPlan(0);
    try {
      const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true }));
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinoQuery)}`);
      const geoData = await geoRes.json();
      if (geoData.length === 0) throw new Error('Destino não encontrado.');
      const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${pos.coords.longitude},${pos.coords.latitude};${geoData[0].lon},${geoData[0].lat}?overview=false`);
      const routeData = await routeRes.json();
      setDistanciaPlan((routeData.routes[0].distance / 1000).toFixed(1));
      setSearchSuccess(`Rota traçada!`);
    } catch (err) { setSearchError('Erro ao buscar rota. Ative o GPS.'); }
    setIsSearching(false);
  };

  const calcLitros = (parseFloat(distanciaPlan) || 0) / config.kmL;
  const calcCusto = calcLitros * (parseFloat(precoPlan) || 0);

  // --- RENDERIZAÇÃO QUANDO VIAGEM ESTÁ ATIVA ---
  if (activeTrip) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-4 space-y-6 animate-fade-in-up">
        <div className={`border rounded-3xl p-6 w-full flex flex-col items-center shadow-[0_0_30px_rgba(0,0,0,0.3)] relative overflow-hidden ${activeTrip.isPaused ? 'bg-amber-900/20 border-amber-500/30' : 'bg-indigo-900/30 border-indigo-500/50'}`}>
          <span className={`text-xs font-bold mb-2 flex items-center z-10 ${activeTrip.isPaused ? 'text-amber-500' : 'text-cyan-500'}`}>
             {activeTrip.isPaused ? <><div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div> VIAGEM PAUSADA</> : <><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div> AO VIVO</>}
          </span>
          <div className="text-7xl font-black font-mono text-cyan-300">{activeTrip.isPaused ? '--' : Math.round(currentSpeed)}</div>
          <span className="text-sm text-slate-400 uppercase tracking-widest mb-6">km/h</span>
          <div className="w-full grid grid-cols-2 gap-4 border-t border-indigo-500/30 pt-6">
             <div className="text-center"><p className="text-xl font-bold text-white">{formatTime(elapsed)}</p><p className="text-[9px] text-slate-400">TEMPO</p></div>
             <div className="text-center"><p className="text-xl font-bold text-purple-400">{gpsKm.toFixed(1)} km</p><p className="text-[9px] text-slate-400">DISTÂNCIA</p></div>
          </div>
        </div>
        <div className="w-full flex space-x-3">
          <button onClick={handleTogglePause} className={`flex-1 font-black py-5 rounded-2xl transition-all ${activeTrip.isPaused ? 'bg-emerald-600' : 'bg-amber-600'}`}>
            {activeTrip.isPaused ? 'RETOMAR' : 'PAUSAR'}
          </button>
          <button onClick={onStopTrip} className="flex-1 bg-red-600 text-white font-black py-5 rounded-2xl">ENCERRAR</button>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO PADRÃO (SELEÇÃO DE ROTA) ---
  return (
    <div className="flex flex-col space-y-6 pt-4 animate-fade-in-up">
      <h2 className="text-lg font-bold text-slate-300 px-2 flex items-center"><Map className="mr-2 text-indigo-400" size={20} /> Painel de Viagem</h2>
      <button onClick={handleStartTrip} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg">Iniciar Rota Agora</button>
      
      <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-3xl p-5">
        <h3 className="text-sm font-bold text-slate-300 mb-4">Calculadora de Rota</h3>
        <div className="space-y-4">
           <div className="flex space-x-2"><input type="text" value={destinoQuery} onChange={(e) => setDestinoQuery(e.target.value)} placeholder="Destino..." className="flex-1 bg-slate-900 p-3 rounded-xl text-white text-sm border border-slate-700" /><button onClick={handleCalcularRota} className="bg-cyan-600 p-3 rounded-xl text-white">{isSearching ? <Loader2 className="animate-spin"/> : <Search />}</button></div>
           
           <div className="grid grid-cols-2 gap-3">
              <input type="number" readOnly value={distanciaPlan || ''} placeholder="Distância (km)" className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-slate-400" />
              <input type="number" value={precoPlan} onChange={(e) => setPrecoPlan(e.target.value)} placeholder="Preço (R$)" className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white" />
           </div>

           {distanciaPlan > 0 && (
            <div className="space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-center">
                        <p className="text-[10px] text-slate-400 uppercase">Litros Necessários</p>
                        <p className="text-lg font-bold text-white">{calcLitros.toFixed(1)} L</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-center">
                        <p className="text-[10px] text-slate-400 uppercase">Custo Estimado</p>
                        <p className="text-lg font-bold text-emerald-400">R$ {calcCusto.toFixed(2)}</p>
                    </div>
                </div>
                <div className={`p-3 rounded-xl border ${calcLitros > currentFuel ? 'bg-red-900/20 border-red-800 text-red-400' : (currentFuel - calcLitros < 1 ? 'bg-amber-900/20 border-amber-800 text-amber-400' : 'bg-emerald-900/20 border-emerald-800 text-emerald-400')}`}>
                    <p className="text-xs font-bold text-center">
                    {calcLitros > currentFuel ? "⚠️ Combustível insuficiente para a viagem!" : 
                        (currentFuel - calcLitros < 1 ? "⚠️ Combustível no limite! Considere abastecer." : "✅ Combustível suficiente. Boa viagem!")}
                    </p>
                </div>
            </div>
           )}
        </div>
      </div>
    </div>
  );
}
