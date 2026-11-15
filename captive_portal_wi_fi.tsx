import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Clock, 
  Zap, 
  ShieldCheck, 
  User, 
  Phone, 
  CheckCircle2, 
  ArrowRight, 
  Signal, 
  Activity, 
  LogOut, 
  Pause, 
  Play, 
  Smartphone,
  Lock,
  Globe
} from 'lucide-react';

export default function App() {
  // Estados da Aplicação
  const [step, setStep] = useState(1); // 1: Cadastro, 2: Pacotes, 3: Sessão Ativa
  const [userData, setUserData] = useState({ name: '', phone: '' });
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  // Estado da Sessão Ativa (Cronômetro e Dados Simulado)
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [dataUsedMB, setDataUsedMB] = useState(12.4);

  // Lista de Pacotes Disponíveis
  const packages = [
    {
      id: 'p1',
      name: 'Degustação',
      durationMinutes: 30,
      durationLabel: '30 Minutos',
      speed: '2 Mbps',
      price: 'Grátis',
      isPopular: false,
      badge: 'Teste Grátis',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'p2',
      name: 'Rápido',
      durationMinutes: 60,
      durationLabel: '1 Hora',
      speed: '5 Mbps',
      price: '50 MT',
      isPopular: true,
      badge: 'Mais Vendido',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'p3',
      name: 'Turbo',
      durationMinutes: 180,
      durationLabel: '3 Horas',
      speed: '10 Mbps',
      price: '100 MT',
      isPopular: false,
      badge: 'Alta Velocidade',
      color: 'from-violet-500 to-purple-600'
    },
    {
      id: 'p4',
      name: 'Passaporte 24h',
      durationMinutes: 1440,
      durationLabel: '24 Horas',
      speed: '20 Mbps',
      price: '250 MT',
      isPopular: false,
      badge: 'Ilimitado 1 Dia',
      color: 'from-amber-500 to-orange-600'
    }
  ];

  // Iniciar sessão com pacote escolhido
  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setSecondsLeft(pkg.durationMinutes * 60);
    setIsTimerRunning(true);
    setStep(3);
  };

  // Cronômetro Regressivo + Consumo Simulado de Dados
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
        // Simula pequenos incrementos no consumo de dados a cada segundo
        setDataUsedMB((prev) => parseFloat((prev + Math.random() * 0.15).toFixed(2)));
      }, 1000);
    } else if (secondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft]);

  // Formatação de Tempo (HH:MM:SS)
  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Resetar Sessão
  const handleDisconnect = () => {
    setIsTimerRunning(false);
    setStep(1);
    setSelectedPackage(null);
    setSecondsLeft(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-teal-500 selection:text-slate-900">
      
      {/* BARRA SUPERIOR: STATUS DA REDE WI-FI */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Wifi className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 flex items-center gap-1">
                VIP_WiFi_Zone
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400 inline" />
              </h1>
              <p className="text-[10px] text-slate-400">Rede de Alta Velocidade</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60">
            <Signal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium text-slate-300">Sinal Forte</span>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL COM TRANSIÇÃO DE PASSO */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col justify-center">

        {/* ETAPA 1: CADASTRO / IDENTIFICAÇÃO */}
        {step === 1 && (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-teal-950/20 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-3">
                <Globe className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white">Bem-vindo à nossa Rede</h2>
              <p className="text-xs text-slate-400 mt-1">Preencha seus dados para liberar a navegação na internet.</p>
            </div>

            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                if(userData.name && userData.phone) setStep(2); 
              }} 
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">
                  Seu Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Manuel Silva"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 84 123 4567"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    className="w-full bg-slate-850 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
                >
                  <span>Continuar para Pacotes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-500 mt-4 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 inline" /> Seus dados estão seguros e criptografados.
              </p>
            </form>
          </div>
        )}

        {/* ETAPA 2: ESCOLHA DE PACOTE */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-1 px-1">
              <div>
                <h2 className="text-lg font-bold text-white">Escolha um Pacote</h2>
                <p className="text-xs text-slate-400">Olá, <span className="text-teal-400 font-semibold">{userData.name || 'Visitante'}</span></p>
              </div>
              <button 
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Alterar dados
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => handleSelectPackage(pkg)}
                  className={`relative group cursor-pointer bg-slate-900/70 border ${
                    pkg.isPopular ? 'border-teal-500/80 shadow-lg shadow-teal-500/10' : 'border-slate-800 hover:border-slate-700'
                  } rounded-2xl p-4 transition-all duration-200 active:scale-[0.98] overflow-hidden`}
                >
                  {/* Badge de Destaque */}
                  {pkg.badge && (
                    <span className={`absolute top-0 right-0 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl bg-gradient-to-r ${pkg.color} text-slate-950`}>
                      {pkg.badge}
                    </span>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                        {pkg.name}
                      </h3>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {pkg.durationLabel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          {pkg.speed}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800/80">
                    <div className="text-lg font-extrabold text-teal-400">
                      {pkg.price}
                    </div>
                    <button className="px-3.5 py-1.5 bg-slate-800 group-hover:bg-teal-500 group-hover:text-slate-950 text-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1">
                      <span>Conectar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ETAPA 3: SESSÃO ATIVA / CONECTADO */}
        {step === 3 && selectedPackage && (
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl animate-fadeIn space-y-6">
            
            {/* Status da Conexão */}
            <div className="text-center">
              <div className="relative inline-block mb-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8 animate-pulse" />
                </div>
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
              </div>
              <h2 className="text-xl font-black text-white">Você está Conectado!</h2>
              <p className="text-xs text-slate-400 mt-0.5">Sua navegação para a internet foi liberada.</p>
            </div>

            {/* Contador Regressivo do Tempo Restante */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center relative overflow-hidden">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Tempo Restante
              </div>
              <div className="text-4xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-200 tracking-wider">
                {formatTime(secondsLeft)}
              </div>
              
              {/* Barra de Progresso Simulado do Tempo */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.max(0, (secondsLeft / (selectedPackage.durationMinutes * 60)) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Métricas da Sessão (Velocidade e Consumo) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-850/60 border border-slate-800/80 rounded-xl p-3">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Velocidade</span>
                </div>
                <div className="text-base font-bold text-slate-100">
                  {selectedPackage.speed}
                </div>
                <div className="text-[10px] text-slate-500">Limite Máximo</div>
              </div>

              <div className="bg-slate-850/60 border border-slate-800/80 rounded-xl p-3">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  <span>Consumo</span>
                </div>
                <div className="text-base font-bold text-slate-100">
                  {dataUsedMB} <span className="text-xs font-normal text-slate-400">MB</span>
                </div>
                <div className="text-[10px] text-slate-500">Nesta Sessão</div>
              </div>
            </div>

            {/* Ações da Sessão */}
            <div className="pt-2 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700/60 flex items-center justify-center space-x-1.5 transition-all"
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pausar Simulação</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Retomar Contagem</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleDisconnect}
                className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl border border-red-500/20 flex items-center justify-center space-x-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Desconectar da Rede Wi-Fi</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* RODAPÉ DO SIMULADOR (Para facilitar navegação de testes) */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-teal-400" />
            <span>Etapa do Teste: <strong>{step}/3</strong></span>
          </span>
          <div className="flex gap-1.5">
            <button 
              onClick={() => setStep(1)} 
              className={`px-2 py-1 rounded text-[10px] ${step === 1 ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}
            >
              1. Identificação
            </button>
            <button 
              onClick={() => setStep(2)} 
              className={`px-2 py-1 rounded text-[10px] ${step === 2 ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}
            >
              2. Pacotes
            </button>
            <button 
              onClick={() => {
                if(!selectedPackage) setSelectedPackage(packages[1]);
                setSecondsLeft(3600);
                setIsTimerRunning(true);
                setStep(3);
              }} 
              className={`px-2 py-1 rounded text-[10px] ${step === 3 ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}
            >
              3. Sessão
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}