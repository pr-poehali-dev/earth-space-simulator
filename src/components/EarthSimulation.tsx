import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cloud, Droplets, Users, Skull, 
  TreePine, Mountain, Wind, Locate, 
  ThermometerSun, Waves, TowerControl, Trash,
  Heart, BabyIcon, ChevronUp, Info
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Начальные данные симуляции
const initialStats = {
  population: 8_000_000_000,
  vegetation: 30.6, // процент от поверхности
  water: 71.4, // процент от поверхности
  deaths: 56_000_000,
  birthRate: 2.5, // рождений на 100 человек в год
  deathRate: 0.8, // смертей на 100 человек в год
  lastEvent: null as string | null,
  eventIntensity: 0,
};

type Stats = typeof initialStats;

const EarthSimulation = () => {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [rotating, setRotating] = useState(true);
  const [eventIntensity, setEventIntensity] = useState(1);
  const [showEventEffect, setShowEventEffect] = useState(false);
  const [eventType, setEventType] = useState<string | null>(null);
  const [statsChanges, setStatsChanges] = useState<Partial<Record<keyof Stats, number>>>({});
  
  const earthRef = useRef<HTMLDivElement>(null);
  
  // Природные процессы, происходящие каждую секунду
  useEffect(() => {
    if (!rotating) return;
    
    const interval = setInterval(() => {
      setStats(prevStats => {
        // Расчет рождений и смертей в зависимости от условий среды
        const environmentFactor = calculateEnvironmentFactor(prevStats);
        const births = Math.max(0, prevStats.population * (prevStats.birthRate / 100) * environmentFactor.birthMultiplier / 31536000 * 5);
        const naturalDeaths = Math.max(0, prevStats.population * (prevStats.deathRate / 100) * environmentFactor.deathMultiplier / 31536000 * 5);
        
        return {
          ...prevStats,
          population: Math.max(0, prevStats.population + births - naturalDeaths),
          deaths: prevStats.deaths + naturalDeaths,
          // Небольшие естественные изменения
          vegetation: Math.max(0, Math.min(100, prevStats.vegetation + (Math.random() * 0.01 - 0.005))),
          water: Math.max(0, Math.min(100, prevStats.water + (Math.random() * 0.005 - 0.002))),
        };
      });
    }, 200); // Обновляем чаще для более плавного изменения
    
    return () => clearInterval(interval);
  }, [rotating]);
  
  // Расчет влияния окружающей среды на рождаемость и смертность
  const calculateEnvironmentFactor = (currentStats: Stats) => {
    // Оптимальные условия
    const optimalVegetation = 40; // %
    const optimalWater = 70; // %
    
    // Расчет отклонений от оптимальных условий
    const vegetationDeviation = Math.abs(currentStats.vegetation - optimalVegetation) / optimalVegetation;
    const waterDeviation = Math.abs(currentStats.water - optimalWater) / optimalWater;
    
    // Факторы, влияющие на рождаемость и смертность
    // Чем дальше от оптимальных условий, тем хуже для людей
    const birthMultiplier = 1 - (vegetationDeviation * 0.3 + waterDeviation * 0.2);
    const deathMultiplier = 1 + (vegetationDeviation * 0.4 + waterDeviation * 0.3);
    
    return {
      birthMultiplier: Math.max(0.5, Math.min(1.2, birthMultiplier)),
      deathMultiplier: Math.max(0.8, Math.min(2.0, deathMultiplier))
    };
  };
  
  // Функция для форматирования больших чисел
  const formatNumber = (num: number): string => {
    return num >= 1_000_000_000 
      ? (num / 1_000_000_000).toFixed(2) + ' млрд' 
      : num >= 1_000_000 
        ? (num / 1_000_000).toFixed(2) + ' млн' 
        : num.toLocaleString('ru-RU');
  };
  
  // Функция для обработки событий планеты
  const handleEvent = (event: string, magnitude: number = eventIntensity) => {
    setEventType(event);
    setShowEventEffect(true);
    
    // Создаем копию изменений
    const changes: Partial<Record<keyof Stats, number>> = {};
    
    switch(event) {
      case 'meteor':
        const populationLoss = 1_000_000 * magnitude;
        const vegetationLoss = 0.5 * magnitude;
        
        setStats(prev => {
          changes.population = -populationLoss;
          changes.vegetation = -vegetationLoss;
          changes.deaths = populationLoss;
          
          return {
            ...prev,
            population: Math.max(0, prev.population - populationLoss),
            vegetation: Math.max(0, prev.vegetation - vegetationLoss),
            deaths: prev.deaths + populationLoss,
            lastEvent: 'Падение метеорита',
            eventIntensity: magnitude
          };
        });
        
        // Эффект взрыва на планете
        if (earthRef.current) {
          earthRef.current.classList.add('meteor-impact');
          setTimeout(() => {
            if (earthRef.current) earthRef.current.classList.remove('meteor-impact');
          }, 1000);
        }
        break;
        
      case 'people':
        const populationGain = 1_000_000 * magnitude;
        
        setStats(prev => {
          changes.population = populationGain;
          
          return {
            ...prev,
            population: prev.population + populationGain,
            lastEvent: 'Увеличение населения',
            eventIntensity: magnitude
          };
        });
        break;
        
      case 'water':
        const waterIncrease = 0.5 * magnitude;
        const vegetationDecrease = waterIncrease > 0 ? 0.2 * magnitude : 0;
        
        setStats(prev => {
          changes.water = waterIncrease;
          changes.vegetation = -vegetationDecrease;
          
          return {
            ...prev,
            water: Math.min(100, prev.water + waterIncrease),
            vegetation: Math.max(0, prev.vegetation - vegetationDecrease),
            lastEvent: 'Повышение уровня воды',
            eventIntensity: magnitude
          };
        });
        
        // Эффект волны на планете
        if (earthRef.current) {
          earthRef.current.classList.add('water-ripple');
          setTimeout(() => {
            if (earthRef.current) earthRef.current.classList.remove('water-ripple');
          }, 1000);
        }
        break;
        
      case 'vegetation':
        const vegetationIncrease = 1 * magnitude;
        
        setStats(prev => {
          changes.vegetation = vegetationIncrease;
          
          return {
            ...prev,
            vegetation: Math.min(100, prev.vegetation + vegetationIncrease),
            lastEvent: 'Озеленение планеты',
            eventIntensity: magnitude
          };
        });
        
        // Эффект озеленения
        if (earthRef.current) {
          earthRef.current.classList.add('vegetation-bloom');
          setTimeout(() => {
            if (earthRef.current) earthRef.current.classList.remove('vegetation-bloom');
          }, 1000);
        }
        break;
        
      case 'hurricane':
        const hurricanePopulationLoss = 500_000 * magnitude;
        
        setStats(prev => {
          changes.population = -hurricanePopulationLoss;
          changes.deaths = hurricanePopulationLoss;
          
          return {
            ...prev,
            population: Math.max(0, prev.population - hurricanePopulationLoss),
            deaths: prev.deaths + hurricanePopulationLoss,
            lastEvent: 'Ураган',
            eventIntensity: magnitude
          };
        });
        
        // Эффект урагана
        if (earthRef.current) {
          earthRef.current.classList.add('hurricane-effect');
          setTimeout(() => {
            if (earthRef.current) earthRef.current.classList.remove('hurricane-effect');
          }, 1000);
        }
        break;
        
      case 'warming':
        const waterDecrease = 0.3 * magnitude;
        const warmingVegetationLoss = 0.5 * magnitude;
        const populationAffected = 300_000 * magnitude;
        
        setStats(prev => {
          changes.water = -waterDecrease;
          changes.vegetation = -warmingVegetationLoss;
          changes.population = -populationAffected;
          changes.deaths = populationAffected;
          
          return {
            ...prev,
            water: Math.max(0, prev.water - waterDecrease),
            vegetation: Math.max(0, prev.vegetation - warmingVegetationLoss),
            population: Math.max(0, prev.population - populationAffected),
            deaths: prev.deaths + populationAffected,
            lastEvent: 'Глобальное потепление',
            eventIntensity: magnitude
          };
        });
        
        // Эффект нагревания
        if (earthRef.current) {
          earthRef.current.classList.add('warming-effect');
          setTimeout(() => {
            if (earthRef.current) earthRef.current.classList.remove('warming-effect');
          }, 1000);
        }
        break;
        
      case 'pollution':
        const pollutionVegetationLoss = 1 * magnitude;
        const pollutionWaterLoss = 0.2 * magnitude;
        const pollutionDeaths = 100_000 * magnitude;
        
        setStats(prev => {
          changes.vegetation = -pollutionVegetationLoss;
          changes.water = -pollutionWaterLoss;
          changes.population = -pollutionDeaths;
          changes.deaths = pollutionDeaths;
          
          return {
            ...prev,
            vegetation: Math.max(0, prev.vegetation - pollutionVegetationLoss),
            water: Math.max(0, prev.water - pollutionWaterLoss),
            population: Math.max(0, prev.population - pollutionDeaths),
            deaths: prev.deaths + pollutionDeaths,
            lastEvent: 'Загрязнение',
            eventIntensity: magnitude
          };
        });
        break;
        
      case 'tsunami':
        const tsunamiPopulationLoss = 200_000 * magnitude;
        
        setStats(prev => {
          changes.population = -tsunamiPopulationLoss;
          changes.deaths = tsunamiPopulationLoss;
          
          return {
            ...prev,
            population: Math.max(0, prev.population - tsunamiPopulationLoss),
            deaths: prev.deaths + tsunamiPopulationLoss,
            lastEvent: 'Цунами',
            eventIntensity: magnitude
          };
        });
        
        // Эффект цунами
        if (earthRef.current) {
          earthRef.current.classList.add('tsunami-wave');
          setTimeout(() => {
            if (earthRef.current) earthRef.current.classList.remove('tsunami-wave');
          }, 1000);
        }
        break;
        
      case 'reset':
        setStats(initialStats);
        break;
        
      default:
        break;
    }
    
    // Запоминаем изменения для анимации
    setStatsChanges(changes);
    
    // Через некоторое время сбрасываем эффект события
    setTimeout(() => {
      setShowEventEffect(false);
      setStatsChanges({});
    }, 2000);
  };
  
  // Отображает изменение с правильным знаком
  const renderChange = (value: number | undefined) => {
    if (!value || Math.abs(value) < 0.01) return null;
    
    const prefix = value > 0 ? '+' : '';
    const className = value > 0 ? 'text-green-500' : 'text-red-500';
    
    return (
      <span className={`text-xs font-medium ${className} animate-fade-in absolute ml-2`}>
        {prefix}{value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : 
          value >= 1000 ? (value / 1000).toFixed(1) + 'K' : 
          value.toFixed(1)}
      </span>
    );
  };
  
  // Функция для расчета цвета фона в зависимости от здоровья экосистемы
  const calculateEcosystemHealth = () => {
    const { vegetation, water } = stats;
    const vegetationFactor = Math.min(1, vegetation / 40); // 40% растительности - оптимум
    const waterFactor = Math.min(1, water / 70); // 70% воды - оптимум
    
    const health = (vegetationFactor + waterFactor) / 2;
    
    if (health > 0.8) return 'from-blue-400 to-green-500';
    if (health > 0.6) return 'from-blue-400 to-green-400';
    if (health > 0.4) return 'from-amber-300 to-orange-500';
    if (health > 0.2) return 'from-orange-400 to-red-500';
    return 'from-red-500 to-rose-700';
  };
  
  // Функция для генерации классов облаков в зависимости от уровня воды
  const getCloudClasses = () => {
    const { water } = stats;
    
    if (water > 80) return 'clouds-heavy';
    if (water > 60) return 'clouds-medium';
    return 'clouds-light';
  };
  
  // Стили для отображения кнопки события в зависимости от интенсивности
  const getEventButtonStyle = (baseColor: string) => {
    const intensityScale = Math.min(10, eventIntensity) / 10;
    
    return {
      background: `linear-gradient(to right, ${baseColor}, ${baseColor}AA)`,
      boxShadow: `0 0 ${10 + eventIntensity * 2}px ${baseColor}80`,
      transform: showEventEffect ? 'scale(0.95)' : 'scale(1)'
    };
  };
  
  return (
    <div className="relative min-h-screen flex flex-col items-center">
      <div className="space-background"></div>
      
      {/* Последнее событие */}
      {stats.lastEvent && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white font-medium animate-fade-in flex items-center">
            <span className="text-yellow-400 mr-2">➤</span> 
            {stats.lastEvent} 
            {stats.eventIntensity > 0 && (
              <span className="ml-2 text-xs bg-yellow-600/50 rounded-full px-2">
                Сила: {stats.eventIntensity}
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="w-full max-w-7xl px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Левая панель управления */}
        <Card className="control-panel w-full md:w-1/3 p-4 bg-black/60 border-accent backdrop-blur-md">
          <h2 className="text-2xl font-bold mb-4 text-white font-display">Панель управления</h2>
          
          <Tabs defaultValue="natural" className="custom-tabs">
            <TabsList className="w-full mb-4 bg-black/50 p-1 rounded-lg">
              <TabsTrigger value="natural" className="custom-tab">
                <TreePine className="mr-2 h-4 w-4" />
                Природа
              </TabsTrigger>
              <TabsTrigger value="disasters" className="custom-tab">
                <Wind className="mr-2 h-4 w-4" />
                Катастрофы
              </TabsTrigger>
              <TabsTrigger value="population" className="custom-tab">
                <Users className="mr-2 h-4 w-4" />
                Население
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="natural" className="space-y-4 animate-fade-in">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-2">
                    <Droplets className="text-blue-400" />
                    <span className="font-medium">Вода</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={() => handleEvent('water')}
                          className="neo-button"
                          style={getEventButtonStyle('#3b82f6')}
                        >
                          Добавить
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Повышает уровень воды в океанах</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-2">
                    <TreePine className="text-green-500" />
                    <span className="font-medium">Растительность</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={() => handleEvent('vegetation')}
                          className="neo-button"
                          style={getEventButtonStyle('#22c55e')}
                        >
                          Озеленить
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Увеличивает растительный покров</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-2">
                    <Cloud className="text-purple-300" />
                    <span className="font-medium">Атмосфера</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={() => handleEvent('water', 0.5)}
                          className="neo-button"
                          style={getEventButtonStyle('#a78bfa')}
                        >
                          Облака
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Увеличивает облачность и осадки</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="disasters" className="space-y-4 animate-fade-in">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-2">
                    <Locate className="text-red-500" />
                    <span className="font-medium">Метеорит</span>
                  </div>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={() => handleEvent('meteor', 1)}
                            className="neo-button bg-red-600 hover:bg-red-700"
                            style={getEventButtonStyle('#dc2626')}
                          >
                            Малый
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Малый метеорит (меньше жертв)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={() => handleEvent('meteor', 10)}
                            className="neo-button"
                            style={getEventButtonStyle('#991b1b')}
                          >
                            Большой
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Большой метеорит (массовое вымирание)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-2">
                    <Wind className="text-cyan-400" />
                    <span className="font-medium">Ураган</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={() => handleEvent('hurricane')}
                          className="neo-button"
                          style={getEventButtonStyle('#06b6d4')}
                        >
                          Вызвать
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Вызывает разрушительный ураган</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-2">
                    <ThermometerSun className="text-yellow-500" />
                    <span className="font-medium">Потепление</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={() => handleEvent('warming')}
                          className="neo-button"
                          style={getEventButtonStyle('#eab308')}
                        >
                          Нагреть
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Усиливает глобальное потепление</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-2">
                    <Waves className="text-blue-500" />
                    <span className="font-medium">Цунами</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={() => handleEvent('tsunami')}
                          className="neo-button"
                          style={getEventButtonStyle('#1d4ed8')}
                        >
                          Вызвать
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Вызывает разрушительное цунами</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="population" className="space-y-4 animate-fade-in">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-2">
                    <Users className="text-indigo-400" />
                    <span className="font-medium">Люди</span>
                  </div>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={() => handleEvent('people', 1)}
                            className="neo-button"
                            style={getEventButtonStyle('#6366f1')}
                          >
                            +1 млн
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Добавляет 1 миллион человек</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={() => handleEvent('people', 100)}
                            className="neo-button"
                            style={getEventButtonStyle('#4338ca')}
                          >
                            +100 млн
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Добавляет 100 миллионов человек</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-2">
                    <TowerControl className="text-gray-400" />
                    <span className="font-medium">Загрязнение</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={() => handleEvent('pollution')}
                          className="neo-button"
                          style={getEventButtonStyle('#71717a')}
                        >
                          Увеличить
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Увеличивает загрязнение планеты</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex items-center justify-between mt-4 p-2 rounded-lg hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-2">
                    <Trash className="text-red-400" />
                    <span className="font-medium">Сбросить</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={() => handleEvent('reset')}
                          className="neo-button"
                          style={getEventButtonStyle('#b91c1c')}
                        >
                          Перезапуск
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Сбрасывает все параметры к начальным</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 bg-black/40 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">Интенсивность события</h3>
              <span className="text-lg font-bold text-yellow-400">{eventIntensity}</span>
            </div>
            <Slider 
              value={[eventIntensity]} 
              onValueChange={(value) => setEventIntensity(value[0])}
              max={10} 
              step={1}
              className="slider-track mb-4"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Низкая</span>
              <span>Средняя</span>
              <span>Высокая</span>
            </div>
          </div>
          
          <div className="mt-6 bg-black/40 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Состояние экосистемы</span>
              <div className={`h-2 w-24 rounded-full bg-gradient-to-r ${calculateEcosystemHealth()}`}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Рождаемость</span>
              <div className="flex items-center">
                <BabyIcon className="h-4 w-4 text-blue-300 mr-1" />
                <span className="text-blue-300 font-semibold">
                  {(stats.birthRate * calculateEnvironmentFactor(stats).birthMultiplier).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Смертность</span>
              <div className="flex items-center">
                <Skull className="h-4 w-4 text-red-300 mr-1" />
                <span className="text-red-300 font-semibold">
                  {(stats.deathRate * calculateEnvironmentFactor(stats).deathMultiplier).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Центральная часть с Землей и статистикой */}
        <div className="w-full md:w-2/3 flex flex-col items-center justify-center">
          <div className="stats-panel mb-8 w-full rounded-xl p-5 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center stats-animation-container">
                <div className="flex items-center justify-center mb-2">
                  <Users className="mr-1 text-indigo-400" />
                  <h3 className="text-lg font-medium">Население</h3>
                </div>
                <div className="relative">
                  <p className={`text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-blue-400 ${statsChanges.population ? 'stats-value-change' : ''}`}>
                    {formatNumber(stats.population)}
                  </p>
                  {renderChange(statsChanges.population)}
                </div>
              </div>
              
              <div className="text-center stats-animation-container">
                <div className="flex items-center justify-center mb-2">
                  <TreePine className="mr-1 text-green-500" />
                  <h3 className="text-lg font-medium">Растительность</h3>
                </div>
                <div className="relative">
                  <p className={`text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-emerald-400 ${statsChanges.vegetation ? 'stats-value-change' : ''}`}>
                    {stats.vegetation.toFixed(1)}%
                  </p>
                  {renderChange(statsChanges.vegetation)}
                </div>
              </div>
              
              <div className="text-center stats-animation-container">
                <div className="flex items-center justify-center mb-2">
                  <Droplets className="mr-1 text-blue-400" />
                  <h3 className="text-lg font-medium">Вода</h3>
                </div>
                <div className="relative">
                  <p className={`text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-400 ${statsChanges.water ? 'stats-value-change' : ''}`}>
                    {stats.water.toFixed(1)}%
                  </p>
                  {renderChange(statsChanges.water)}
                </div>
              </div>
              
              <div className="text-center stats-animation-container">
                <div className="flex items-center justify-center mb-2">
                  <Skull className="mr-1 text-red-400" />
                  <h3 className="text-lg font-medium">Смертей</h3>
                </div>
                <div className="relative">
                  <p className={`text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-300 to-rose-400 ${statsChanges.deaths ? 'stats-value-change' : ''}`}>
                    {formatNumber(stats.deaths)}
                  </p>
                  {renderChange(statsChanges.deaths)}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              <div className="py-2 px-4 bg-black/30 rounded-full flex items-center space-x-3">
                <div className="flex items-center">
                  <Heart className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm">Рождений в год: {formatNumber(stats.population * (stats.birthRate / 100) * calculateEnvironmentFactor(stats).birthMultiplier)}</span>
                </div>
                <div className="h-3 w-px bg-gray-600"></div>
                <div className="flex items-center">
                  <Skull className="h-4 w-4 text-red-400 mr-1" />
                  <span className="text-red-400 text-sm">Смертей в год: {formatNumber(stats.population * (stats.deathRate / 100) * calculateEnvironmentFactor(stats).deathMultiplier)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="earth-container mb-12 relative">
            <div 
              className={`earth ${getCloudClasses()} ${showEventEffect ? `effect-${eventType}` : ''}`}
              style={{ 
                animationPlayState: rotating ? 'running' : 'paused',
                cursor: 'pointer'
              }}
              onClick={() => setRotating(!rotating)}
              ref={earthRef}
            ></div>
            <div className="planet-pulse"></div>
            
            {/* Облака как отдельный слой */}
            <div 
              className={`clouds ${getCloudClasses()}`}
              style={{ animationPlayState: rotating ? 'running' : 'paused' }}
            ></div>
            
            {/* Подсказка при наведении */}
            <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 text-xs text-white/70 flex items-center">
              <Info className="h-3 w-3 mr-1" />
              Нажмите на планету, чтобы {rotating ? 'остановить' : 'запустить'} вращение
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setRotating(!rotating)}
            className="mt-4 text-white border-white hover:bg-white/10 animate-pulse"
          >
            {rotating ? 'Приостановить симуляцию' : 'Возобновить симуляцию'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EarthSimulation;
