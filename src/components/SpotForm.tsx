import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Camera, Upload, X, MapPin, Star } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SpotData } from '../App';
import { motion } from 'motion/react';

interface SpotFormProps {
  location: { lat: number; lng: number };
  onSubmit: (spotData: Omit<SpotData, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function SpotForm({ location, onSubmit, onCancel }: SpotFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
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
    
    if (!title.trim()) {
      toast.error('스팟 이름을 입력해주세요.');
      return;
    }

    if (!description.trim()) {
      toast.error('후기를 입력해주세요.');
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
        image: image || undefined
      });

      toast.success('스팟이 성공적으로 등록되었습니다!');
    } catch (error) {
      toast.error('스팟 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass rounded-xl border border-white/20 shadow-2xl mt-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">새 쉿플레이스 등록</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Label htmlFor="title" className="text-foreground">장소 이름 *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="조용한 장소의 이름을 입력하세요"
                maxLength={50}
                className="glass border-white/30 focus:border-indigo-400 bg-white/5 text-foreground placeholder:text-muted-foreground"
              />
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Label htmlFor="description" className="text-foreground">후기 *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="이곳이 얼마나 조용한지, 어떤 분위기인지 알려주세요"
                rows={4}
                maxLength={500}
                className="glass border-white/30 focus:border-indigo-400 bg-white/5 text-foreground placeholder:text-muted-foreground resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/500자
              </p>
            </motion.div>

            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label className="text-foreground">사진 (선택)</Label>
              
              {image ? (
                <motion.div 
                  className="relative group"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <img 
                    src={image} 
                    alt="업로드된 이미지" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <motion.div
                    className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                  >
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeImage}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      삭제
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  className="glass border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-indigo-400/50 transition-colors cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Camera className="w-10 h-10 mx-auto mb-3 text-muted-foreground group-hover:text-indigo-400 transition-colors" />
                  <Label htmlFor="imageUpload" className="cursor-pointer">
                    <span className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                      사진 업로드
                    </span>
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </Label>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG 파일 (최대 5MB)
                  </p>
                </motion.div>
              )}
            </motion.div>

            <motion.div 
              className="flex gap-3 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 glass border-white/30 hover:bg-white/10 text-foreground"
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    등록 중...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    쉿플레이스 등록
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}