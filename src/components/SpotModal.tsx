import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Star, MapPin, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { SpotData } from '../App';

interface SpotModalProps {
  isOpen: boolean;
  location: { lat: number; lng: number } | null;
  onClose: () => void;
  onSubmit: (spotData: Omit<SpotData, 'id' | 'createdAt'>) => void;
}

export function SpotModal({ isOpen, location, onClose, onSubmit }: SpotModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('맛집');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image) {
      toast.error('사진을 업로드해주세요.');
      return;
    }

    if (!title.trim()) {
      toast.error('스팟 제목을 입력해주세요.');
      return;
    }

    if (!description.trim()) {
      toast.error('후기를 입력해주세요.');
      return;
    }

    if (rating === 0) {
      toast.error('별점을 선택해주세요.');
      return;
    }

    if (!location) {
      toast.error('위치 정보가 없습니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 업로드 시뮬레이션
      
      onSubmit({
        lat: location.lat,
        lng: location.lng,
        title: title.trim(),
        description: description.trim(),
        image: image || undefined,
        rating: rating,
        category: category,
        likes: 0,
        dislikes: 0,
        comments: []
      });

      toast.success('스팟이 성공적으로 등록되었습니다!');
      handleClose();
    } catch (error) {
      console.error('스팟 등록 오류:', error);
      toast.error('스팟 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleClose = () => {
    setTitle('');
    setDescription('');
    setImage(null);
    setRating(0);
    setCategory('맛집');
    onClose();
  };

  const removeImage = () => {
    setImage(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto max-h-[95vh] overflow-y-auto"
          >
            <div className="glass-strong border border-white/20 rounded-2xl shadow-2xl w-full mx-auto">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-white flex-1">새 스팟 기록하기</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground p-2"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>

              {/* 폼 */}
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                {/* 사진 업로드 영역 - 고정 높이 */}
                <Label htmlFor="imageUpload" className="cursor-pointer block">
                  <div className={`w-full h-32 sm:h-40 md:h-48 ${image ? '' : 'border-2 border-dashed border-gray-600'} rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-700/50 hover:border-gray-500 transition overflow-hidden`}>
                    {image ? (
                      <img 
                        src={image} 
                        alt="업로드된 이미지" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2" />
                        <span className="text-xs sm:text-sm font-medium">사진 추가</span>
                      </div>
                    )}
                  </div>
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </Label>

                {/* 별점 */}
                <div className="flex justify-center gap-1 sm:gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setRating(star);
                        console.log('별점 선택:', star);
                      }}
                      className="transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded p-1"
                    >
                      <Star
                        className={`w-6 h-6 sm:w-8 sm:h-8 transition-all duration-300 ${
                          star <= rating 
                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg scale-110' 
                            : 'fill-none text-gray-400 hover:text-yellow-300 hover:scale-105'
                        }`}
                        strokeWidth={2}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <div className="text-center mb-2">
                    <p className="text-sm text-yellow-400 font-medium">
                      {rating}점 선택됨
                    </p>
                    <div className="flex justify-center mt-1">
                      {[...Array(rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400 mx-0.5" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 카테고리 선택 */}
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full py-3 pl-12 pr-10 bg-gray-800 border-2 border-gray-600 rounded-lg text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none text-sm sm:text-base appearance-none cursor-pointer transition-all duration-200 hover:border-gray-500"
                  >
                    <option value="맛집" style={{backgroundColor: '#1f2937', color: 'white', padding: '8px'}}>🍽️ 맛집</option>
                    <option value="카페" style={{backgroundColor: '#1f2937', color: 'white', padding: '8px'}}>☕ 카페</option>
                    <option value="관광지" style={{backgroundColor: '#1f2937', color: 'white', padding: '8px'}}>🏛️ 관광지</option>
                    <option value="쇼핑" style={{backgroundColor: '#1f2937', color: 'white', padding: '8px'}}>🛍️ 쇼핑</option>
                    <option value="기타" style={{backgroundColor: '#1f2937', color: 'white', padding: '8px'}}>📍 기타</option>
                  </select>
                  {/* 커스텀 드롭다운 화살표 */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {/* 선택된 카테고리 표시 */}
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-lg">
                      {category === '맛집' && '🍽️'}
                      {category === '카페' && '☕'}
                      {category === '관광지' && '🏛️'}
                      {category === '쇼핑' && '🛍️'}
                      {category === '기타' && '📍'}
                    </span>
                  </div>
                </div>

                {/* 스팟 제목 입력 */}
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="스팟 제목을 입력하세요..."
                  maxLength={50}
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-400 focus:outline-none text-sm sm:text-base"
                />

                {/* 후기 입력 */}
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="후기를 남겨주세요..."
                  rows={3}
                  maxLength={500}
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:border-indigo-400 focus:outline-none text-sm sm:text-base"
                />


                {/* 등록 버튼 */}
                <Button
                  type="submit"
                  onClick={() => {
                    console.log('등록 버튼 클릭');
                    console.log('현재 상태:', { image: !!image, description, rating, category, location });
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 text-sm sm:text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                      등록 중...
                    </>
                  ) : (
                    '등록하기'
                  )}
                </Button>
              </form>

              {location && (
                <div className="px-4 sm:px-6 pb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
