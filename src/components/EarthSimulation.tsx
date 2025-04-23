import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cloud, Droplets, Users, Skull, 
  TreePine, Mountain, Wind, Locate, 
  ThermometerSun, Waves, TowerControl, Trash
} from 'lucide-react';

// Начальные данные симуляции
const initialStats = {
  population: 8_000_000_000,
  vegetation: 30.6, // процент от поверхности
  water: 71.4, // процент от поверхности
  deaths: 56_000_000
};

const EarthSimulation = () => {
  const [stats, setStats] = useState(initialStats);
  const [rotating, setRotating] = useState(true);
  
  // Обновляем счетчик населения каждую секунду (родилось ~4.5 человек в секунду)
  useEffect(() => {
    if (!rotating) return;
    
    const interval = setInterval(() => {
      setStats(prevStats => ({
        ...prevStats,
        population: prevStats.population + 4,
        deaths: prevStats.deaths + 2
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [rotating]);
  
  // Функция для форматирования больших чисел
  const formatNumber = (num: number): string => {
    return num >= 1_000_000_000 
      ? (num / 1_000_000_000).toFixed(2) + ' млрд' 
      : num >= 1_000_000 
        ? (num / 1_000_000).toFixed(2) + ' млн' 
        : num.toLocaleString('ru-RU');
  };
  
  // Функция для обработки событий планеты
  const handleEvent = (event: string, magnitude: number = 1) => {
    switch(event) {
      case 'meteor':
        setStats(prev => ({
          ...prev,
          population: Math.max(0, prev.population - (1_000_000 * magnitude)),
          vegetation: Math.max(0, prev.vegetation - (0.5 * magnitude)),
          deaths: prev.deaths + (1_000_000 * magnitude)
        }));
        break;
      case 'people':
        setStats(prev => ({
          ...prev,
          population: prev.population + (1_000_000 * magnitude)
        }));
        break;
      case 'water':
        setStats(prev => ({
          ...prev,
          water: Math.min(100, prev.water + (0.5 * magnitude)),
          vegetation: Math.max(0, prev.vegetation - (0.2 * magnitude))
        }));
        break;
      case 'vegetation':
        setStats(prev => ({
          ...prev,
          vegetation: Math.min(100, prev.vegetation + (1 * magnitude))
        }));
        break;
      case 'hurricane':
        setStats(prev => ({
          ...prev,
          population: Math.max(0, prev.population - (500_000 * magnitude)),
          deaths: prev.deaths + (500_000 * magnitude)
        }));
        break;
      case 'warming':
        setStats(prev => ({
          ...prev,
          water: Math.max(0, prev.water - (0.3 * magnitude)),
          vegetation: Math.max(0, prev.vegetation - (0.5 * magnitude))
        }));
        break;
      case 'pollution':
        setStats(prev => ({
          ...prev,
          vegetation: Math.max(0, prev.vegetation - (1 * magnitude)),
          water: Math.max(0, prev.water - (0.2 * magnitude))
        }));
        break;
      case 'tsunami':
        setStats(prev => ({
          ...prev,
          population: Math.max(0, prev.population - (200_000 * magnitude)),
          deaths: prev.deaths + (200_000 * magnitude)
        }));
        break;
      case 'reset':
        setStats(initialStats);
        break;
      default:
        break;
    }
  };
  
  return (
    <div className="relative min-h-screen flex flex-col items-center">
      <div className="space-background"></div>
      
      <div className="w-full max-w-7xl px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Левая панель управления */}
        <Card className="control-panel w-full md:w-1/3 p-4 bg-black/50 border-accent">
          <h2 className="text-2xl font-bold mb-4 text-white">Панель управления</h2>
          
          <Tabs defaultValue="natural">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="natural">Природа</TabsTrigger>
              <TabsTrigger value="disasters">Катастрофы</TabsTrigger>
              <TabsTrigger value="population">Население</TabsTrigger>
            </TabsList>
            
            <TabsContent value="natural" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="text-blue-400" />
                    <span>Вода</span>
                  </div>
                  <Button 
                    onClick={() => handleEvent('water')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Добавить
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TreePine className="text-green-500" />
                    <span>Растительность</span>
                  </div>
                  <Button 
                    onClick={() => handleEvent('vegetation')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Озеленить
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mountain className="text-gray-400" />
                    <span>Горы</span>
                  </div>
                  <Button 
                    onClick={() => handleEvent('water', -1)}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Поднять
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="disasters" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Locate className="text-red-500" />
                    <span>Метеорит</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleEvent('meteor', 1)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Малый
                    </Button>
                    <Button 
                      onClick={() => handleEvent('meteor', 10)}
                      className="bg-red-800 hover:bg-red-900"
                    >
                      Большой
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="text-cyan-400" />
                    <span>Ураган</span>
                  </div>
                  <Button 
                    onClick={() => handleEvent('hurricane')}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    Вызвать
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThermometerSun className="text-yellow-500" />
                    <span>Глобальное потепление</span>
                  </div>
                  <Button 
                    onClick={() => handleEvent('warming')}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Нагреть
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Waves className="text-blue-500" />
                    <span>Цунами</span>
                  </div>
                  <Button 
                    onClick={() => handleEvent('tsunami')}
                    className="bg-blue-800 hover:bg-blue-900"
                  >
                    Вызвать
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="population" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="text-indigo-400" />
                    <span>Люди</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleEvent('people', 1)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      +1 млн
                    </Button>
                    <Button 
                      onClick={() => handleEvent('people', 100)}
                      className="bg-indigo-800 hover:bg-indigo-900"
                    >
                      +100 млн
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TowerControl className="text-gray-400" />
                    <span>Загрязнение</span>
                  </div>
                  <Button 
                    onClick={() => handleEvent('pollution')}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Увеличить
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Trash className="text-red-400" />
                    <span>Сбросить</span>
                  </div>
                  <Button 
                    onClick={() => handleEvent('reset')}
                    className="bg-red-700 hover:bg-red-800"
                  >
                    Перезапуск
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2 text-white">Интенсивность события</h3>
            <Slider 
              defaultValue={[1]} 
              max={10} 
              step={1}
              className="mb-4"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Низкая</span>
              <span>Средняя</span>
              <span>Высокая</span>
            </div>
          </div>
        </Card>
        
        {/* Центральная часть с Землей и статистикой */}
        <div className="w-full md:w-2/3 flex flex-col items-center justify-center">
          <div className="stats-panel mb-8 w-full rounded-lg p-4 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="mr-1 text-indigo-400" />
                  <h3 className="text-lg font-medium">Население</h3>
                </div>
                <p className="text-xl md:text-2xl font-bold">{formatNumber(stats.population)}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TreePine className="mr-1 text-green-500" />
                  <h3 className="text-lg font-medium">Растительность</h3>
                </div>
                <p className="text-xl md:text-2xl font-bold">{stats.vegetation.toFixed(1)}%</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Droplets className="mr-1 text-blue-400" />
                  <h3 className="text-lg font-medium">Вода</h3>
                </div>
                <p className="text-xl md:text-2xl font-bold">{stats.water.toFixed(1)}%</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Skull className="mr-1 text-red-400" />
                  <h3 className="text-lg font-medium">Смертей</h3>
                </div>
                <p className="text-xl md:text-2xl font-bold">{formatNumber(stats.deaths)}</p>
              </div>
            </div>
          </div>
          
          <div className="earth-container mb-12">
            <div 
              className="earth"
              style={{ 
                animationPlayState: rotating ? 'running' : 'paused',
                cursor: 'pointer'
              }}
              onClick={() => setRotating(!rotating)}
            ></div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setRotating(!rotating)}
            className="mt-4 text-white border-white hover:bg-white/10"
          >
            {rotating ? 'Остановить вращение' : 'Запустить вращение'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EarthSimulation;
