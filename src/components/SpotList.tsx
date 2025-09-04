import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Trash2, MapPin, Calendar, Star, ImageIcon } from 'lucide-react';
import { SpotData } from '../App';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface SpotListProps {
  spots: SpotData[];
  onDeleteSpot: (spotId: string) => void;
  onSpotClick: (spot: SpotData) => void;
}

export function SpotList({ spots, onDeleteSpot, onSpotClick }: SpotListProps) {
  const handleDelete = (spotId: string, spotTitle: string) => {
    if (confirm(`"${spotTitle}" 스팟을 삭제하시겠습니까?`)) {
      onDeleteSpot(spotId);
      toast.success('스팟이 삭제되었습니다.');
    }
  };

  if (spots.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="p-4 glass rounded-full mb-4"
        >
          <MapPin className="w-12 h-12 text-indigo-400" />
        </motion.div>
        <h3 className="text-lg font-medium text-foreground mb-2">쉿플레이스가 없습니다</h3>
        <p className="text-sm text-muted-foreground">
          지도에서 조용한 장소를 추가해보세요!
        </p>
      </motion.div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-120px)] mt-4">
      <div className="space-y-4 pr-2">
        {spots.map((spot, index) => (
          <motion.div
            key={spot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className="group"
          >
            <div 
              className="glass border border-white/20 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => onSpotClick(spot)}
            >
              <div className="relative">
                {spot.image && (
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={spot.image}
                      alt={spot.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="glass bg-white/20 text-white border-0">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        사진
                      </Badge>
                    </div>
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1 group-hover:text-indigo-400 transition-colors">
                        {spot.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}</span>
                      </div>
                    </div>
                    
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(spot.id, spot.title);
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 h-auto opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                    {spot.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(spot.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <Badge 
                      variant="secondary" 
                      className="glass bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/30"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      내 쉿플레이스
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}