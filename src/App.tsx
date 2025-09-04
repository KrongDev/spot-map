import React, { useState, useEffect, useRef } from 'react';
import { Map } from './components/Map';
import { SpotForm } from './components/SpotForm';
import { SpotList } from './components/SpotList';
import { ContextMenu } from './components/ContextMenu';
import { SpotModal } from './components/SpotModal';
import { Button } from './components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from './components/ui/sheet';
import { MapPin, Plus, List, Zap, Users, TrendingUp, Search } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { motion } from 'motion/react';

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface SpotData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  image?: string;
  rating?: number;
  category?: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  comments: Comment[];
}

export interface CrowdDensityData {
  id: string;
  name: string; // 지역명 (예: "강남구", "종로구", "명동" 등)
  type: 'city' | 'district' | 'dong'; // 지역 타입
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  density: number; // 0-1 (0: 한산함, 1: 매우 혼잡함)
  center: {
    lat: number;
    lng: number;
  };
}

function App() {
  const [spots, setSpots] = useState<SpotData[]>([]);
  const [crowdData, setCrowdData] = useState<CrowdDensityData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSpotFormOpen, setIsSpotFormOpen] = useState(false);
  const [isSpotListOpen, setIsSpotListOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; position: { x: number; y: number }; location: { lat: number; lng: number } | null }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    location: null
  });
  const [isSpotModalOpen, setIsSpotModalOpen] = useState(false);
  const [focusSpot, setFocusSpot] = useState<SpotData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 로컬 스토리지에서 스팟 데이터 로드
  useEffect(() => {
    const savedSpots = localStorage.getItem('mapSpots');
    if (savedSpots) {
      setSpots(JSON.parse(savedSpots));
    }
  }, []);

  // 커스텀 이벤트 리스너 등록
  useEffect(() => {
    const handleSpotLikeEvent = (event: any) => {
      handleSpotLike(event.detail.spotId);
    };

    const handleSpotDislikeEvent = (event: any) => {
      handleSpotDislike(event.detail.spotId);
    };

    const handleSpotCommentEvent = (event: any) => {
      handleSpotComment(event.detail.spotId, event.detail.content);
    };

    window.addEventListener('spot-like', handleSpotLikeEvent);
    window.addEventListener('spot-dislike', handleSpotDislikeEvent);
    window.addEventListener('spot-comment', handleSpotCommentEvent);

    return () => {
      window.removeEventListener('spot-like', handleSpotLikeEvent);
      window.removeEventListener('spot-dislike', handleSpotDislikeEvent);
      window.removeEventListener('spot-comment', handleSpotCommentEvent);
    };
  }, [spots]);

  // Mock 실시간 인구 밀집도 데이터 생성
  useEffect(() => {
    const generateMockCrowdData = () => {
      // 서울 주요 지역 데이터
      const seoulDistricts: CrowdDensityData[] = [
        {
          id: 'gangnam',
          name: '강남구',
          type: 'district',
          bounds: { north: 37.5172, south: 37.4910, east: 127.0694, west: 127.0205 },
          center: { lat: 37.5041, lng: 127.0448 },
          density: Math.random()
        },
        {
          id: 'jung',
          name: '중구',
          type: 'district',
          bounds: { north: 37.5758, south: 37.5530, east: 126.9988, west: 126.9706 },
          center: { lat: 37.5644, lng: 126.9847 },
          density: Math.random()
        },
        {
          id: 'jongno',
          name: '종로구',
          type: 'district',
          bounds: { north: 37.5990, south: 37.5692, east: 126.9998, west: 126.9540 },
          center: { lat: 37.5841, lng: 126.9769 },
          density: Math.random()
        },
        {
          id: 'mapo',
          name: '마포구',
          type: 'district',
          bounds: { north: 37.5664, south: 37.5346, east: 126.9294, west: 126.8966 },
          center: { lat: 37.5505, lng: 126.9130 },
          density: Math.random()
        },
        {
          id: 'yongsan',
          name: '용산구',
          type: 'district',
          bounds: { north: 37.5582, south: 37.5203, east: 126.9994, west: 126.9606 },
          center: { lat: 37.5393, lng: 126.9800 },
          density: Math.random()
        },
        {
          id: 'songpa',
          name: '송파구',
          type: 'district',
          bounds: { north: 37.5319, south: 37.4940, east: 127.1386, west: 127.0632 },
          center: { lat: 37.5130, lng: 127.1009 },
          density: Math.random()
        },
        {
          id: 'seocho',
          name: '서초구',
          type: 'district',
          bounds: { north: 37.5041, south: 37.4732, east: 127.0694, west: 127.0056 },
          center: { lat: 37.4887, lng: 127.0375 },
          density: Math.random()
        },
        {
          id: 'gangdong',
          name: '강동구',
          type: 'district',
          bounds: { north: 37.5319, south: 37.5108, east: 127.1776, west: 127.1096 },
          center: { lat: 37.5214, lng: 127.1436 },
          density: Math.random()
        }
      ];

      // 중구 세부 동 지역 (확대 시 표시될 데이터)
      const jungGuDongs: CrowdDensityData[] = [
        {
          id: 'myeongdong',
          name: '명동',
          type: 'dong',
          bounds: { north: 37.5650, south: 37.5600, east: 126.9860, west: 126.9780 },
          center: { lat: 37.5625, lng: 126.9820 },
          density: Math.random()
        },
        {
          id: 'euljiro',
          name: '을지로',
          type: 'dong',
          bounds: { north: 37.5680, south: 37.5630, east: 126.9900, west: 126.9820 },
          center: { lat: 37.5655, lng: 126.9860 },
          density: Math.random()
        },
        {
          id: 'dongdaemun',
          name: '동대문',
          type: 'dong',
          bounds: { north: 37.5720, south: 37.5680, east: 126.9980, west: 126.9900 },
          center: { lat: 37.5700, lng: 126.9940 },
          density: Math.random()
        }
      ];

      setCrowdData([...seoulDistricts, ...jungGuDongs]);
    };

    // 초기 데이터 생성 (약간의 지연을 두어 지도가 완전히 로드된 후 실행)
    setTimeout(() => {
      generateMockCrowdData();
    }, 1000);
    
    // 30초마다 실시간 업데이트
    const interval = setInterval(generateMockCrowdData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    // 컨텍스트 메뉴 닫기
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  const handleMapRightClick = (lat: number, lng: number, clientX: number, clientY: number) => {
    setContextMenu({
      isOpen: true,
      position: { x: clientX, y: clientY },
      location: { lat, lng }
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  const handleContextMenuAddSpot = () => {
    if (contextMenu.location) {
      setSelectedLocation(contextMenu.location);
      setIsSpotModalOpen(true);
    }
  };

  const handleAddSpot = (spotData: Omit<SpotData, 'id' | 'createdAt'>) => {
    const newSpot: SpotData = {
      ...spotData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    const updatedSpots = [...spots, newSpot];
    setSpots(updatedSpots);
    localStorage.setItem('mapSpots', JSON.stringify(updatedSpots));
    
    setSelectedLocation(null);
    setIsSpotFormOpen(false);
    setIsSpotModalOpen(false);
  };

  const handleDeleteSpot = (spotId: string) => {
    const updatedSpots = spots.filter(spot => spot.id !== spotId);
    setSpots(updatedSpots);
    localStorage.setItem('mapSpots', JSON.stringify(updatedSpots));
  };

  const handleSpotClick = (spot: SpotData) => {
    setFocusSpot(spot);
    setIsSpotListOpen(false); // 스팟 목록 닫기
    
    // 포커스 상태를 잠시 후 초기화 (다시 클릭할 수 있도록)
    setTimeout(() => {
      setFocusSpot(null);
    }, 2000);
  };

  const handleSpotLike = (spotId: string) => {
    const updatedSpots = spots.map(spot => 
      spot.id === spotId 
        ? { ...spot, likes: (spot.likes || 0) + 1 }
        : spot
    );
    setSpots(updatedSpots);
    localStorage.setItem('mapSpots', JSON.stringify(updatedSpots));
  };

  const handleSpotDislike = (spotId: string) => {
    const updatedSpots = spots.map(spot => 
      spot.id === spotId 
        ? { ...spot, dislikes: (spot.dislikes || 0) + 1 }
        : spot
    );
    setSpots(updatedSpots);
    localStorage.setItem('mapSpots', JSON.stringify(updatedSpots));
  };

  const handleSpotComment = (spotId: string, content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: '익명',
      content: content,
      createdAt: new Date().toISOString()
    };

    const updatedSpots = spots.map(spot => 
      spot.id === spotId 
        ? { ...spot, comments: [...(spot.comments || []), newComment] }
        : spot
    );
    setSpots(updatedSpots);
    localStorage.setItem('mapSpots', JSON.stringify(updatedSpots));
  };

  // 검색 필터링된 스팟들
  const filteredSpots = spots.filter(spot => 
    spot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (spot.category && spot.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 개발용: 로컬 스토리지 초기화 함수 (콘솔에서 사용 가능)
  useEffect(() => {
    (window as any).resetSpotData = () => {
      localStorage.removeItem('mapSpots');
      window.location.reload();
    };
  }, []);

  const averageDensity = crowdData.length > 0 
    ? crowdData.reduce((sum, data) => sum + data.density, 0) / crowdData.length 
    : 0;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* 헤더 */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-40"
      >
        <div className="glass-strong border-0 border-b border-white/20">
          <div className="flex items-center justify-between p-4">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <MapPin className="w-8 h-8 text-indigo-400 animate-glow" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  SpotMap
                </h1>
                <p className="text-xs text-muted-foreground">실시간 스팟 탐색</p>
              </div>
            </motion.div>
            
            {/* 상태 표시 */}
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <motion.div 
                className="flex items-center gap-1 glass px-3 py-1 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                <Users className="w-3 h-3 text-blue-400" />
                <span>평균 혼잡도: {(averageDensity * 100).toFixed(0)}%</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-1 glass px-3 py-1 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span>{spots.length}개 스팟</span>
              </motion.div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* 검색 기능 */}
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                className="relative hidden sm:block"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="스팟 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-48 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-sm text-sm"
                  />
                </div>
              </motion.div>

              {/* 모바일 검색 버튼 */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="sm:hidden">
                <Button variant="outline" size="sm" className="glass border-white/30 hover:bg-white/20">
                  <Search className="w-4 h-4" />
                </Button>
              </motion.div>

              <Sheet open={isSpotListOpen} onOpenChange={setIsSpotListOpen}>
                <SheetTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="sm" className="glass border-white/30 hover:bg-white/20">
                      <List className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-96 glass-strong border-l border-white/20">
                  <SheetHeader>
                    <SheetTitle className="text-foreground">내 스팟 목록</SheetTitle>
                    <SheetDescription className="text-muted-foreground">
                      등록된 스팟들을 확인하고 관리할 수 있습니다
                    </SheetDescription>
                  </SheetHeader>
                  <SpotList spots={filteredSpots} onDeleteSpot={handleDeleteSpot} onSpotClick={handleSpotClick} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>

      {/* 지도 영역 */}
      <div className="flex-1 relative">
        <Map
          spots={spots}
          crowdData={crowdData}
          onMapClick={handleMapClick}
          onMapRightClick={handleMapRightClick}
          isAddingSpot={false}
          focusSpot={focusSpot}
        />

        {/* 플로팅 통계 카드들 */}
        <div className="absolute top-4 right-4 space-y-2 z-30 hidden lg:block">
          <motion.div 
            className="glass-strong rounded-xl p-3 w-48"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">실시간 현황</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">평균 혼잡도</span>
                <span className="text-foreground">{(averageDensity * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">등록된 스팟</span>
                <span className="text-foreground">{spots.length}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">혼잡 지역</span>
                <span className="text-foreground">{crowdData.filter(d => d.density > 0.7).length}곳</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 인구 밀집도 범례 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-4 left-4 z-30"
      >
        <div className="glass-strong rounded-xl p-3 text-xs">
          <div className="mb-3 font-medium text-foreground flex items-center gap-2">
            <Users className="w-3 h-3 text-indigo-400" />
            실시간 혼잡도
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm shadow-lg"></div>
              <span className="text-muted-foreground">한산함 (0-30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm shadow-lg"></div>
              <span className="text-muted-foreground">보통 (30-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-sm shadow-lg"></div>
              <span className="text-muted-foreground">혼잡 (50-70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-sm shadow-lg"></div>
              <span className="text-muted-foreground">매우혼잡 (70%+)</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/20">
            <p className="text-xs text-muted-foreground">
              <span className="text-indigo-400">확대</span>하면 더 세부 지역을 확인할 수 있습니다
            </p>
          </div>
        </div>
      </motion.div>

      {/* 스팟 등록 폼 */}
      <Sheet open={isSpotFormOpen} onOpenChange={setIsSpotFormOpen}>
        <SheetContent side="bottom" className="h-[80vh] sm:h-auto glass-strong border-t border-white/20">
          <SheetHeader>
            <SheetTitle className="text-foreground">새 스팟 등록</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              선택한 위치에 새로운 스팟을 등록하고 사진과 후기를 추가할 수 있습니다
            </SheetDescription>
          </SheetHeader>
          {selectedLocation && (
            <SpotForm
              location={selectedLocation}
              onSubmit={handleAddSpot}
              onCancel={() => {
                setIsSpotFormOpen(false);
                setIsAddingSpot(false);
                setSelectedLocation(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* 컨텍스트 메뉴 */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={handleContextMenuClose}
        onAddSpot={handleContextMenuAddSpot}
      />

      {/* 새로운 스팟 모달 */}
      <SpotModal
        isOpen={isSpotModalOpen}
        location={selectedLocation}
        onClose={() => {
          setIsSpotModalOpen(false);
          setSelectedLocation(null);
        }}
        onSubmit={handleAddSpot}
      />

      <Toaster />
    </div>
  );
}

export default App;