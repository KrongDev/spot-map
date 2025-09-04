import React, { useState, useEffect, useRef } from 'react';
import { Map } from './components/Map';
import { SpotForm } from './components/SpotForm';
import { SpotList } from './components/SpotList';
import { ContextMenu } from './components/ContextMenu';
import { SpotModal } from './components/SpotModal';
import { Button } from './components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from './components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { MapPin, Plus, List, Zap, Users, TrendingUp, Filter, X, Sparkles } from 'lucide-react';
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
  noiseLevel?: number; // dB 값 (30-80)
  quietRating?: number; // 조용함 점수 (0-100)
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
  noiseLevel: number; // dB 값 (30-80)
  center: {
    lat: number;
    lng: number;
  };
}

export interface SearchFilters {
  noiseLevel: 'all' | 'quiet' | 'moderate' | 'noisy'; // 소음 레벨
  crowdLevel: 'all' | 'empty' | 'moderate' | 'crowded'; // 혼잡도
  categories: string[]; // 카테고리 필터
  rating: number; // 최소 별점
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
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    noiseLevel: 'all',
    crowdLevel: 'all',
    categories: [],
    rating: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [recommendationCount, setRecommendationCount] = useState(3); // 하루 3회 제한
  const [lastRecommendationDate, setLastRecommendationDate] = useState<string>('');
  const [isGettingRecommendation, setIsGettingRecommendation] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState<string>('');


  // Mock LLM 기반 장소 추천 함수
  const getAIRecommendation = async () => {
    const today = new Date().toDateString();
    
    // 하루 제한 체크
    if (lastRecommendationDate === today && recommendationCount <= 0) {
      alert('오늘의 AI 추천 횟수를 모두 사용했습니다. 내일 다시 이용해주세요!');
      return;
    }
    
    // 첫 사용일 경우 카운트 초기화
    if (lastRecommendationDate !== today) {
      setRecommendationCount(3);
      setLastRecommendationDate(today);
    }
    
    setIsGettingRecommendation(true);
    
    try {
      // Mock AI 추천 로직 (실제로는 Amazon Bedrock API 호출)
      await new Promise(resolve => setTimeout(resolve, 2000)); // 로딩 시뮬레이션
      
      const quietSpots = filteredSpots.filter(spot => 
        (spot.noiseLevel || 50) < 50 || spot.likes > spot.dislikes
      );
      
      const currentHour = new Date().getHours();
      let timeContext = '';
      if (currentHour < 12) timeContext = '오전';
      else if (currentHour < 18) timeContext = '오후';
      else timeContext = '저녁';
      
      let recommendation = '';
      if (quietSpots.length > 0) {
        const bestSpot = quietSpots.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes))[0];
        recommendation = `🤖 AI 추천: ${timeContext} 시간대에는 "${bestSpot.title}"을(를) 추천드려요!\n\n` +
          `📍 위치: ${bestSpot.lat.toFixed(4)}, ${bestSpot.lng.toFixed(4)}\n` +
          `🤫 특징: ${bestSpot.noiseLevel ? `소음 ${bestSpot.noiseLevel}dB로 조용하고` : '조용하고'}, ` +
          `${bestSpot.likes}명이 "조용해요"라고 평가했어요.\n\n` +
          `💭 "${bestSpot.description.slice(0, 50)}${bestSpot.description.length > 50 ? '...' : ''}"\n\n` +
          `지도에서 해당 장소를 확인해보세요! 🗺️`;
        
        // 추천된 스팟으로 포커스 이동
        setTimeout(() => {
          setFocusSpot(bestSpot);
        }, 1000);
      } else {
        recommendation = `🤖 AI 추천: 현재 등록된 쉿플레이스 중에서 ${timeContext} 시간대에 적합한 조용한 장소를 찾지 못했어요.\n\n` +
          `💡 새로운 조용한 장소를 발견하시면 지도에서 우클릭하여 등록해주세요!\n` +
          `다른 사용자들에게도 큰 도움이 될 거예요. 🙏`;
      }
      
      setRecommendationResult(recommendation);
      setRecommendationCount(prev => prev - 1);
      
    } catch (error) {
      console.error('AI 추천 오류:', error);
      setRecommendationResult('🤖 죄송해요. AI 추천 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsGettingRecommendation(false);
    }
  };

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

  // Mock 실시간 인구 밀집도 및 소음 레벨 데이터 생성
  useEffect(() => {
    const generateMockCrowdData = () => {
      // 소음 레벨 생성 함수 (30-80dB)
      const generateNoiseLevel = () => Math.floor(Math.random() * 50) + 30;
      
      // 서울 주요 지역 데이터
      const seoulDistricts: CrowdDensityData[] = [
        {
          id: 'gangnam',
          name: '강남구',
          type: 'district',
          bounds: { north: 37.5172, south: 37.4910, east: 127.0694, west: 127.0205 },
          center: { lat: 37.5041, lng: 127.0448 },
          density: Math.random(),
          noiseLevel: generateNoiseLevel()
        },
        {
          id: 'jung',
          name: '중구',
          type: 'district',
          bounds: { north: 37.5758, south: 37.5530, east: 126.9988, west: 126.9706 },
          center: { lat: 37.5644, lng: 126.9847 },
          density: Math.random(),
          noiseLevel: generateNoiseLevel()
        },
        {
          id: 'jongno',
          name: '종로구',
          type: 'district',
          bounds: { north: 37.5990, south: 37.5692, east: 126.9998, west: 126.9540 },
          center: { lat: 37.5841, lng: 126.9769 },
          density: Math.random(),
          noiseLevel: generateNoiseLevel()
        },
        {
          id: 'mapo',
          name: '마포구',
          type: 'district',
          bounds: { north: 37.5664, south: 37.5346, east: 126.9294, west: 126.8966 },
          center: { lat: 37.5505, lng: 126.9130 },
          density: Math.random(),
          noiseLevel: generateNoiseLevel()
        },
        {
          id: 'yongsan',
          name: '용산구',
          type: 'district',
          bounds: { north: 37.5582, south: 37.5203, east: 126.9994, west: 126.9606 },
          center: { lat: 37.5393, lng: 126.9800 },
          density: Math.random(),
          noiseLevel: generateNoiseLevel()
        },
        {
          id: 'songpa',
          name: '송파구',
          type: 'district',
          bounds: { north: 37.5319, south: 37.4940, east: 127.1386, west: 127.0632 },
          center: { lat: 37.5130, lng: 127.1009 },
          density: Math.random(),
          noiseLevel: generateNoiseLevel()
        },
        {
          id: 'seocho',
          name: '서초구',
          type: 'district',
          bounds: { north: 37.5041, south: 37.4732, east: 127.0694, west: 127.0056 },
          center: { lat: 37.4887, lng: 127.0375 },
          density: Math.random(),
          noiseLevel: generateNoiseLevel()
        },
        {
          id: 'gangdong',
          name: '강동구',
          type: 'district',
          bounds: { north: 37.5319, south: 37.5108, east: 127.1776, west: 127.1096 },
          center: { lat: 37.5214, lng: 127.1436 },
          density: Math.random(),
          noiseLevel: generateNoiseLevel()
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
          density: Math.random(),
          noiseLevel: generateNoiseLevel()
        },
        {
          id: 'euljiro',
          name: '을지로',
          type: 'dong',
          bounds: { north: 37.5680, south: 37.5630, east: 126.9900, west: 126.9820 },
          center: { lat: 37.5655, lng: 126.9860 },
          density: Math.random(),
          noiseLevel: generateNoiseLevel()
        },
        {
          id: 'dongdaemun',
          name: '동대문',
          type: 'dong',
          bounds: { north: 37.5720, south: 37.5680, east: 126.9980, west: 126.9900 },
          center: { lat: 37.5700, lng: 126.9940 },
          density: Math.random(),
          noiseLevel: generateNoiseLevel()
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

  // 스마트 필터링 로직
  const filteredSpots = spots.filter(spot => {
    // 소음 레벨 필터
    const matchesNoiseLevel = searchFilters.noiseLevel === 'all' || 
      (searchFilters.noiseLevel === 'quiet' && (spot.noiseLevel || 50) < 45) ||
      (searchFilters.noiseLevel === 'moderate' && (spot.noiseLevel || 50) >= 45 && (spot.noiseLevel || 50) < 60) ||
      (searchFilters.noiseLevel === 'noisy' && (spot.noiseLevel || 50) >= 60);
    
    // 혼잡도 필터 (주변 지역 기반)
    const nearbyRegion = crowdData.find(region => {
      const distance = Math.sqrt(
        Math.pow(region.center.lat - spot.lat, 2) + 
        Math.pow(region.center.lng - spot.lng, 2)
      );
      return distance < 0.01; // 대략 1km 내
    });
    const crowdDensity = nearbyRegion?.density || 0.5;
    const matchesCrowdLevel = searchFilters.crowdLevel === 'all' ||
      (searchFilters.crowdLevel === 'empty' && crowdDensity < 0.3) ||
      (searchFilters.crowdLevel === 'moderate' && crowdDensity >= 0.3 && crowdDensity < 0.7) ||
      (searchFilters.crowdLevel === 'crowded' && crowdDensity >= 0.7);
    
    // 카테고리 필터
    const matchesCategory = searchFilters.categories.length === 0 ||
      (spot.category && searchFilters.categories.includes(spot.category));
    
    // 별점 필터
    const matchesRating = (spot.rating || 0) >= searchFilters.rating;
    
    return matchesNoiseLevel && matchesCrowdLevel && matchesCategory && matchesRating;
  });

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

  const averageNoiseLevel = crowdData.length > 0 
    ? crowdData.reduce((sum, data) => sum + data.noiseLevel, 0) / crowdData.length 
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
                <div className="text-2xl animate-pulse">🤫</div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  쉿플레이스
                </h1>
                <p className="text-xs text-muted-foreground">조용한 공간을 찾는 가장 빠른 방법</p>
              </div>
            </motion.div>
            
            {/* 상태 표시 */}
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <motion.div 
                className="flex items-center gap-1 glass px-3 py-1 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-sm">🔊</div>
                <span>평균 소음: {averageNoiseLevel.toFixed(0)}dB</span>
              </motion.div>
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
                <span>{filteredSpots.length}개 스팟</span>
              </motion.div>
              
              {/* AI 추천 버튼 */}
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getAIRecommendation}
                  disabled={isGettingRecommendation || (lastRecommendationDate === new Date().toDateString() && recommendationCount <= 0)}
                  className="glass border-white/30 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 text-xs px-2"
                >
                  {isGettingRecommendation ? (
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin mr-1" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1" />
                  )}
                  AI 추천 ({recommendationCount})
                </Button>
              </motion.div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* 필터 버튼 */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`glass border-white/30 hover:bg-white/20 ${showFilters ? 'bg-indigo-500/20 border-indigo-400/50' : ''}`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  필터
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
                    <SheetTitle className="text-foreground">내 쉿플레이스 목록</SheetTitle>
                    <SheetDescription className="text-muted-foreground">
                      등록한 조용한 장소들을 확인하고 관리할 수 있습니다
                    </SheetDescription>
                  </SheetHeader>
                  <SpotList spots={filteredSpots} onDeleteSpot={handleDeleteSpot} onSpotClick={handleSpotClick} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>

      {/* 검색 필터 패널 */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative z-30 glass-strong border-b border-white/20"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Filter className="w-4 h-4" />
                스마트 필터
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 소음 레벨 필터 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">소음 레벨</label>
                <select
                  value={searchFilters.noiseLevel}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, noiseLevel: e.target.value as any }))}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="all">전체</option>
                  <option value="quiet">🤫 조용함 (45dB 미만)</option>
                  <option value="moderate">🔇 보통 (45-60dB)</option>
                  <option value="noisy">📢 시끄러움 (60dB 이상)</option>
                </select>
              </div>
              
              {/* 혼잡도 필터 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">혼잡도</label>
                <select
                  value={searchFilters.crowdLevel}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, crowdLevel: e.target.value as any }))}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="all">전체</option>
                  <option value="empty">🏞️ 한적함</option>
                  <option value="moderate">👥 보통</option>
                  <option value="crowded">🏙️ 혼잡함</option>
                </select>
              </div>
              
              {/* 카테고리 필터 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">카테고리</label>
                <select
                  multiple
                  value={searchFilters.categories}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setSearchFilters(prev => ({ ...prev, categories: selected }));
                  }}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 h-20"
                >
                  <option value="맛집">🍽️ 맛집</option>
                  <option value="카페">☕ 카페</option>
                  <option value="관광지">🏛️ 관광지</option>
                  <option value="쇼핑">🛍️ 쇼핑</option>
                  <option value="기타">📍 기타</option>
                </select>
              </div>
              
              {/* 별점 필터 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">최소 별점</label>
                <select
                  value={searchFilters.rating}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value={0}>전체</option>
                  <option value={1}>⭐ 1점 이상</option>
                  <option value={2}>⭐ 2점 이상</option>
                  <option value={3}>⭐ 3점 이상</option>
                  <option value={4}>⭐ 4점 이상</option>
                  <option value={5}>⭐ 5점</option>
                </select>
              </div>
            </div>
            
            {/* 필터 초기화 버튼 */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchFilters({
                  noiseLevel: 'all',
                  crowdLevel: 'all',
                  categories: [],
                  rating: 0
                })}
                className="glass border-white/30 hover:bg-white/20 text-sm"
              >
                필터 초기화
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 지도 영역 */}
      <div className="flex-1 relative">
        <Map
          spots={filteredSpots}
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
                <span className="text-muted-foreground">평균 소음</span>
                <span className="text-foreground">{averageNoiseLevel.toFixed(0)}dB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">평균 혼잡도</span>
                <span className="text-foreground">{(averageDensity * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">필터된 스팟</span>
                <span className="text-foreground">{filteredSpots.length}곳</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">시끄러운 지역</span>
                <span className="text-foreground">{crowdData.filter(d => d.noiseLevel > 60).length}곳</span>
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
            <div className="text-sm">🤫</div>
            실시간 소음/혼잡도
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm shadow-lg"></div>
              <span className="text-muted-foreground">조용함 (30-45dB)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm shadow-lg"></div>
              <span className="text-muted-foreground">보통 (45-60dB)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-sm shadow-lg"></div>
              <span className="text-muted-foreground">시끄러움 (60-70dB)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-sm shadow-lg"></div>
              <span className="text-muted-foreground">매우시끄러움 (70dB+)</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/20">
            <p className="text-xs text-muted-foreground">
              <span className="text-green-400">소음 레벨</span>과 <span className="text-blue-400">혼잡도</span>를 함께 표시합니다
            </p>
          </div>
        </div>
      </motion.div>

      {/* 스팟 등록 폼 */}
      <Sheet open={isSpotFormOpen} onOpenChange={setIsSpotFormOpen}>
        <SheetContent side="bottom" className="h-[80vh] sm:h-auto glass-strong border-t border-white/20">
          <SheetHeader>
            <SheetTitle className="text-foreground">새 쉿플레이스 등록</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              조용한 장소를 발견했나요? 다른 사람들과 공유해보세요
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

      {/* AI 추천 결과 모달 */}
      <Dialog open={!!recommendationResult} onOpenChange={() => setRecommendationResult('')}>
        <DialogContent className="glass-strong border border-white/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI 쉿플레이스 추천
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              남은 추천 횟수: {recommendationCount}회
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
                {recommendationResult}
              </pre>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setRecommendationResult('')}
                className="glass border-white/30 hover:bg-white/20"
              >
                닫기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}

export default App;