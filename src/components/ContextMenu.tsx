import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Star } from 'lucide-react';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onAddSpot: () => void;
}

export function ContextMenu({ isOpen, position, onClose, onAddSpot }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleAddSpot = () => {
    onAddSpot();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <div className="glass-strong border border-white/20 rounded-xl shadow-2xl min-w-[200px] overflow-hidden">
            <div className="p-1">
              <motion.button
                whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddSpot}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors text-foreground hover:text-indigo-400"
              >
                <div className="p-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-sm">새 스팟 기록하기</div>
                  <div className="text-xs text-muted-foreground">이 위치에 스팟을 추가합니다</div>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
