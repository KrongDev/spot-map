import React, { useEffect, useRef } from 'react';
import { SpotData, CrowdDensityData } from '../App';

interface MapProps {
  spots: SpotData[];
  crowdData: CrowdDensityData[];
  onMapClick: (lat: number, lng: number) => void;
  onMapRightClick: (lat: number, lng: number, clientX: number, clientY: number) => void;
  isAddingSpot: boolean;
  focusSpot?: SpotData | null;
}

export function Map({ spots, crowdData, onMapClick, onMapRightClick, isAddingSpot, focusSpot }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const densityLayerRef = useRef<any>(null);
  const currentZoomRef = useRef<number>(13);

  useEffect(() => {
    if (!mapRef.current) return;

    // Leaflet 동적 로드
    const loadLeaflet = async () => {
      // Leaflet CSS 로드
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Leaflet JS 로드
      if (!(window as any).L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        await new Promise((resolve) => {
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      const L = (window as any).L;

      // 지도 초기화 (서울 중심)
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current, {
          zoomControl: false
        }).setView([37.5665, 126.9780], 13);

        // 다크 테마 타일 레이어 사용
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(mapInstanceRef.current);

        // 줌 컨트롤을 오른쪽 하단에 추가
        L.control.zoom({
          position: 'bottomright'
        }).addTo(mapInstanceRef.current);

        // 지도 클릭 이벤트
        mapInstanceRef.current.on('click', (e: any) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });

        // 지도 우클릭 이벤트
        mapInstanceRef.current.on('contextmenu', (e: any) => {
          e.originalEvent.preventDefault();
          onMapRightClick(e.latlng.lat, e.latlng.lng, e.originalEvent.clientX, e.originalEvent.clientY);
        });

        // 줌 레벨 변경 이벤트
        mapInstanceRef.current.on('zoomend', () => {
          currentZoomRef.current = mapInstanceRef.current.getZoom();
        });
      }
    };

    loadLeaflet();
  }, []);

  // 스팟 마커 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // 기존 마커 제거
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // spots가 비어있으면 여기서 종료
    if (!spots || spots.length === 0) return;

    // 카테고리별 아이콘 생성 함수
    const createCategoryIcon = (category: string = '기타') => {
      const getCategoryIcon = (cat: string) => {
        switch (cat) {
          case '맛집': return '🍽️';
          case '카페': return '☕';
          case '관광지': return '🏛️';
          case '쇼핑': return '🛍️';
          default: return '📍';
        }
      };

      const getCategoryColor = (cat: string) => {
        switch (cat) {
          case '맛집': return '#EF4444';
          case '카페': return '#8B5CF6';
          case '관광지': return '#3B82F6';
          case '쇼핑': return '#F59E0B';
          default: return '#6B7280';
        }
      };

      const icon = getCategoryIcon(category);
      const color = getCategoryColor(category);

      return L.divIcon({
        className: 'custom-category-marker',
        html: `
          <div style="
            width: 40px;
            height: 40px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            animation: pulse 2s infinite;
          ">
            ${icon}
          </div>
          <style>
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
          </style>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -42]
      });
    };

    // 새 마커 추가
    spots.forEach(spot => {

      const marker = L.marker([spot.lat, spot.lng], {
        icon: createCategoryIcon(spot.category)
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div class="w-full text-white" style="width: 340px; max-width: 90vw; position: relative;">
            <button id="close-popup-${spot.id}" style="position: absolute; top: 8px; right: 8px; z-index: 1000; background: rgba(0, 0, 0, 0.5); border: none; border-radius: 50%; width: 28px; height: 28px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; line-height: 1;">×</button>
            ${spot.image ? `
              <img src="${spot.image}" class="w-full h-40 object-cover rounded-t-lg" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px 8px 0 0;">
            ` : ''}
            <div class="p-4" style="padding: 16px;">
              <div class="flex justify-between items-center mb-3" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span class="font-bold text-lg bg-gray-700 px-2 py-1 rounded" style="font-weight: bold; background: rgba(55, 65, 81, 0.8); padding: 4px 8px; border-radius: 6px; font-size: 14px;">${spot.category || '기타'}</span>
                <div class="flex text-yellow-400" style="display: flex; color: #FBBF24;">
                  ${[...Array(5)].map((_, i) => `<span style="font-family: 'Material Icons'; font-size: 16px;">${i < (spot.rating || 0) ? 'star' : 'star_border'}</span>`).join('')}
                </div>
              </div>
              
              <h3 class="font-bold text-lg mb-2" style="font-weight: bold; font-size: 18px; margin-bottom: 8px; color: #E2E8F0;">${spot.title}</h3>
              ${spot.noiseLevel ? `<div class="flex items-center gap-2 mb-2" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 14px;">${spot.noiseLevel < 45 ? '🤫' : spot.noiseLevel < 60 ? '🔇' : spot.noiseLevel < 70 ? '🔊' : '📢'}</span>
                <span style="font-size: 12px; color: ${spot.noiseLevel < 45 ? '#10B981' : spot.noiseLevel < 60 ? '#F59E0B' : spot.noiseLevel < 70 ? '#F97316' : '#EF4444'};">소음 ${spot.noiseLevel}dB</span>
              </div>` : ''}
              <p class="text-gray-300 mb-3" style="color: #D1D5DB; margin-bottom: 12px; line-height: 1.4; font-size: 14px;">${spot.description.replace(/\n/g, '<br>')}</p>
              
              <div class="flex items-center justify-between mb-3" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div class="flex items-center gap-4" style="display: flex; gap: 16px;">
                  <button id="like-btn-${spot.id}" class="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors" style="display: flex; align-items: center; gap: 4px; background: none; border: none; cursor: pointer; color: #34D399;">
                    <span style="font-size: 16px;">🤫</span>
                    <span style="font-size: 11px; margin-left: 2px;">조용해요</span>
                    <span id="like-count-${spot.id}" style="font-size: 12px; margin-left: 4px;">${spot.likes || 0}</span>
                  </button>
                  <button id="dislike-btn-${spot.id}" class="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors" style="display: flex; align-items: center; gap: 4px; background: none; border: none; cursor: pointer; color: #F87171;">
                    <span style="font-size: 16px;">📢</span>
                    <span style="font-size: 11px; margin-left: 2px;">시끄러워요</span>
                    <span id="dislike-count-${spot.id}" style="font-size: 12px; margin-left: 4px;">${spot.dislikes || 0}</span>
                  </button>
                </div>
                <div class="text-xs text-gray-400" style="font-size: 12px; color: #9CA3AF;">${new Date(spot.createdAt).toLocaleDateString('ko-KR')}</div>
              </div>
              
              <div class="border-t border-gray-700 pt-3" style="border-top: 1px solid rgba(107, 114, 128, 0.5); padding-top: 12px;">
                <div class="flex items-center gap-2 mb-2" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="font-size: 14px; color: #9CA3AF;">댓글 ${(spot.comments || []).length}개</span>
                </div>
                <div class="flex gap-2" style="display: flex; gap: 8px;">
                  <input id="comment-input-${spot.id}" type="text" placeholder="댓글을 입력하세요..." style="flex: 1; padding: 8px; background: rgba(55, 65, 81, 0.5); border: 1px solid rgba(107, 114, 128, 0.5); border-radius: 6px; color: white; font-size: 12px;" />
                  <button id="comment-btn-${spot.id}" style="padding: 8px 12px; background: linear-gradient(to right, #6366F1, #8B5CF6); border: none; border-radius: 6px; color: white; font-size: 12px; cursor: pointer;">등록</button>
                </div>
                <div id="comments-list-${spot.id}" class="mt-3" style="margin-top: 12px; max-height: 120px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #4B5563 #1F2937;">
                  ${(spot.comments || []).map(comment => `
                    <div class="mb-2 p-2 bg-gray-800/50 rounded text-xs" style="margin-bottom: 8px; padding: 8px; background: rgba(31, 41, 55, 0.5); border-radius: 4px; font-size: 12px;">
                      <div class="font-medium text-indigo-300" style="font-weight: 500; color: #A5B4FC;">${comment.author}</div>
                      <div class="text-gray-300" style="color: #D1D5DB;">${comment.content}</div>
                      <div class="text-gray-500 text-xs mt-1" style="color: #6B7280; font-size: 10px; margin-top: 4px;">${new Date(comment.createdAt).toLocaleDateString('ko-KR')}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        `, {
          closeButton: false,
          className: 'custom-popup',
          minWidth: 340,
          maxWidth: 400,
          autoClose: true,
          closeOnClick: true,
          closeOnEscapeKey: false,
          keepInView: true,
          autoPan: true
        });
      
      // 팝업이 열릴 때 좋아요/싫어요 및 댓글 이벤트 리스너 추가
      marker.on('popupopen', () => {
        // 스크롤바 스타일 추가
        const style = document.createElement('style');
        style.id = `scroll-style-${spot.id}`;
        style.textContent = `
          #comments-list-${spot.id}::-webkit-scrollbar {
            width: 4px;
          }
          #comments-list-${spot.id}::-webkit-scrollbar-track {
            background: rgba(31, 41, 55, 0.3);
            border-radius: 2px;
          }
          #comments-list-${spot.id}::-webkit-scrollbar-thumb {
            background: rgba(75, 85, 99, 0.8);
            border-radius: 2px;
          }
          #comments-list-${spot.id}::-webkit-scrollbar-thumb:hover {
            background: rgba(107, 114, 128, 0.9);
          }
        `;
        document.head.appendChild(style);

        // 팝업 전체 컨테이너에 이벤트 전파 방지 적용 (팝업 내부 클릭 시 닫히지 않도록)
        const popupContent = document.querySelector('.leaflet-popup-content');
        if (popupContent) {
          popupContent.addEventListener('click', (e) => {
            e.stopPropagation();
          });
          popupContent.addEventListener('mousedown', (e) => {
            e.stopPropagation();
          });
          popupContent.addEventListener('mouseup', (e) => {
            e.stopPropagation();
          });
        }

        // 팝업 래퍼에도 이벤트 전파 방지 적용
        const popupWrapper = document.querySelector('.leaflet-popup');
        if (popupWrapper) {
          popupWrapper.addEventListener('click', (e) => {
            e.stopPropagation();
          });
          
          // 마우스 이벤트로 인한 팝업 닫힘 방지
          popupWrapper.addEventListener('mouseleave', (e) => {
            e.stopPropagation();
          });
          popupWrapper.addEventListener('mouseout', (e) => {
            e.stopPropagation();
          });
        }
        
        const likeBtn = document.getElementById(`like-btn-${spot.id}`);
        const dislikeBtn = document.getElementById(`dislike-btn-${spot.id}`);
        const commentBtn = document.getElementById(`comment-btn-${spot.id}`);
        const commentInput = document.getElementById(`comment-input-${spot.id}`) as HTMLInputElement;
        const closeBtn = document.getElementById(`close-popup-${spot.id}`);
        
        // 닫기 버튼 이벤트
        if (closeBtn) {
          closeBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            mapInstanceRef.current.closePopup();
          };
        }
        
        // 좋아요 버튼 이벤트
        if (likeBtn) {
          likeBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // 즉시 UI 업데이트
            const likeCountEl = document.getElementById(`like-count-${spot.id}`);
            if (likeCountEl) {
              const currentCount = parseInt(likeCountEl.textContent || '0');
              likeCountEl.textContent = (currentCount + 1).toString();
            }
            
            // 좋아요 카운트 업데이트 로직을 부모 컴포넌트로 전달
            const event = new CustomEvent('spot-like', { 
              detail: { spotId: spot.id } 
            });
            window.dispatchEvent(event);
          };
        }
        
        // 싫어요 버튼 이벤트
        if (dislikeBtn) {
          dislikeBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // 즉시 UI 업데이트
            const dislikeCountEl = document.getElementById(`dislike-count-${spot.id}`);
            if (dislikeCountEl) {
              const currentCount = parseInt(dislikeCountEl.textContent || '0');
              dislikeCountEl.textContent = (currentCount + 1).toString();
            }
            
            // 싫어요 카운트 업데이트 로직을 부모 컴포넌트로 전달
            const event = new CustomEvent('spot-dislike', { 
              detail: { spotId: spot.id } 
            });
            window.dispatchEvent(event);
          };
        }
        
        // 댓글 등록 이벤트
        if (commentBtn && commentInput) {
          const addComment = (e?: Event) => {
            if (e) {
              e.preventDefault();
              e.stopPropagation();
            }
            
            const content = commentInput.value.trim();
            if (content) {
              // 즉시 UI 업데이트
              const commentsList = document.getElementById(`comments-list-${spot.id}`);
              const commentsCountEl = commentsList?.parentElement?.querySelector('span');
              
              if (commentsList) {
                const newCommentHtml = `
                  <div class="mb-2 p-2 bg-gray-800/50 rounded text-xs" style="margin-bottom: 8px; padding: 8px; background: rgba(31, 41, 55, 0.5); border-radius: 4px; font-size: 12px;">
                    <div class="font-medium text-indigo-300" style="font-weight: 500; color: #A5B4FC;">익명</div>
                    <div class="text-gray-300" style="color: #D1D5DB;">${content}</div>
                    <div class="text-gray-500 text-xs mt-1" style="color: #6B7280; font-size: 10px; margin-top: 4px;">${new Date().toLocaleDateString('ko-KR')}</div>
                  </div>
                `;
                commentsList.insertAdjacentHTML('beforeend', newCommentHtml);
                
                // 스크롤을 맨 아래로 이동
                commentsList.scrollTop = commentsList.scrollHeight;
                
                // 댓글 개수 업데이트
                if (commentsCountEl) {
                  const currentCount = (spot.comments || []).length;
                  commentsCountEl.textContent = `댓글 ${currentCount + 1}개`;
                }
              }
              
              const event = new CustomEvent('spot-comment', { 
                detail: { 
                  spotId: spot.id, 
                  content: content 
                } 
              });
              window.dispatchEvent(event);
              commentInput.value = '';
            }
          };
          
          commentBtn.onclick = addComment;
          commentInput.addEventListener('keypress', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
              addComment(e);
            }
          });
          
          // 댓글 입력 필드에 포커스 이벤트 전파 방지
          commentInput.addEventListener('click', (e) => {
            e.stopPropagation();
          });
          commentInput.addEventListener('focus', (e) => {
            e.stopPropagation();
          });
          commentInput.addEventListener('input', (e) => {
            e.stopPropagation();
          });
                }
      });
      
            // 마커에서 마우스 이벤트로 인한 팝업 닫힘 방지
      marker.off('mouseout');
      marker.off('mouseleave');
      
      // 팝업이 닫힐 때 스타일 정리
      marker.on('popupclose', () => {
        const style = document.getElementById(`scroll-style-${spot.id}`);
        if (style) {
          style.remove();
        }
      });
      
      markersRef.current.push(marker);
    });
  }, [spots]);

  // 인구 밀집도 시각화 업데이트 (지역 기반)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // crowdData가 비어있으면 여기서 종료
    if (!crowdData || crowdData.length === 0) return;

    // 기존 밀집도 레이어 제거
    if (densityLayerRef.current) {
      mapInstanceRef.current.removeLayer(densityLayerRef.current);
    }

    const densityPolygons: any[] = [];
    const currentZoom = mapInstanceRef.current.getZoom();
    
    // 줌 레벨에 따라 표시할 지역 타입 결정
    const getVisibleRegions = (zoom: number) => {
      if (zoom >= 14) {
        // 고줌: 동 단위 표시
        return crowdData.filter(d => d.type === 'dong');
      } else if (zoom >= 11) {
        // 중줌: 구 단위 표시  
        return crowdData.filter(d => d.type === 'district');
      } else {
        // 저줌: 시 단위 표시 (현재는 구 단위로 대체)
        return crowdData.filter(d => d.type === 'district');
      }
    };

    const visibleRegions = getVisibleRegions(currentZoom);
    
    visibleRegions.forEach(region => {
      // 소음 레벨에 따른 색상 결정
      const getColor = (noiseLevel: number) => {
        if (noiseLevel >= 70) return '#EF4444';      // 빨강: 매우 시끄러움 (70dB+)
        if (noiseLevel >= 60) return '#F97316';      // 주황: 시끄러움 (60-70dB)
        if (noiseLevel >= 45) return '#F59E0B';      // 황색: 보통 (45-60dB)
        return '#10B981';                            // 초록: 조용함 (30-45dB)
      };

      const color = getColor(region.noiseLevel);
      
      // 지역 경계를 사각형으로 표시 (실제로는 GeoJSON 경계 데이터를 사용해야 함)
      const bounds = [
        [region.bounds.south, region.bounds.west],
        [region.bounds.north, region.bounds.east]
      ];

      const rectangle = L.rectangle(bounds, {
        color: color,
        fillColor: color,
        fillOpacity: 0.3,
        weight: 2,
        opacity: 0.8
      }).addTo(mapInstanceRef.current);

      // 지역명과 소음/혼잡도 표시
      const popup = L.popup({
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
        className: 'density-popup'
      }).setContent(`
        <div style="
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 8px 12px;
          color: #E2E8F0;
          font-family: system-ui, -apple-system, sans-serif;
          text-align: center;
          min-width: 90px;
        ">
          <div style="font-size: 12px; font-weight: 600; margin-bottom: 2px;">${region.name}</div>
          <div style="font-size: 10px; color: ${color}; margin-bottom: 1px;">소음 ${region.noiseLevel}dB</div>
          <div style="font-size: 10px; color: ${color};">혼잡도 ${(region.density * 100).toFixed(0)}%</div>
        </div>
      `);

      rectangle.bindPopup(popup);
      
      // 마우스 오버 시 팝업 표시
      rectangle.on('mouseover', function() {
        this.openPopup();
      });
      
      rectangle.on('mouseout', function() {
        this.closePopup();
      });
      
      densityPolygons.push(rectangle);
    });

    densityLayerRef.current = L.layerGroup(densityPolygons).addTo(mapInstanceRef.current);

    // 줌 변경 시 레이어 다시 그리기
    mapInstanceRef.current.off('zoomend.density');
    mapInstanceRef.current.on('zoomend.density', () => {
      setTimeout(() => {
        // 레이어 업데이트를 위해 재렌더링 트리거
        if (densityLayerRef.current) {
          mapInstanceRef.current.removeLayer(densityLayerRef.current);
          const newZoom = mapInstanceRef.current.getZoom();
          const newVisibleRegions = getVisibleRegions(newZoom);
          
          const newPolygons: any[] = [];
          newVisibleRegions.forEach(region => {
            const getColor = (noiseLevel: number) => {
              if (noiseLevel >= 70) return '#EF4444';      // 빨강: 매우 시끄러움 (70dB+)
              if (noiseLevel >= 60) return '#F97316';      // 주황: 시끄러움 (60-70dB)
              if (noiseLevel >= 45) return '#F59E0B';      // 황색: 보통 (45-60dB)
              return '#10B981';                            // 초록: 조용함 (30-45dB)
            };

            const color = getColor(region.noiseLevel);
            const bounds = [
              [region.bounds.south, region.bounds.west],
              [region.bounds.north, region.bounds.east]
            ];

            const rectangle = L.rectangle(bounds, {
              color: color,
              fillColor: color,
              fillOpacity: 0.3,
              weight: 2,
              opacity: 0.8
            }).addTo(mapInstanceRef.current);

            const popup = L.popup({
              closeButton: false,
              autoClose: false,
              closeOnClick: false,
              className: 'density-popup'
            }).setContent(`
              <div style="
                background: rgba(15, 23, 42, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                padding: 8px 12px;
                color: #E2E8F0;
                font-family: system-ui, -apple-system, sans-serif;
                text-align: center;
                min-width: 90px;
              ">
                <div style="font-size: 12px; font-weight: 600; margin-bottom: 2px;">${region.name}</div>
                <div style="font-size: 10px; color: ${color}; margin-bottom: 1px;">소음 ${region.noiseLevel}dB</div>
                <div style="font-size: 10px; color: ${color};">혼잡도 ${(region.density * 100).toFixed(0)}%</div>
              </div>
            `);

            rectangle.bindPopup(popup);
            rectangle.on('mouseover', function() { this.openPopup(); });
            rectangle.on('mouseout', function() { this.closePopup(); });
            
            newPolygons.push(rectangle);
          });
          
          densityLayerRef.current = L.layerGroup(newPolygons).addTo(mapInstanceRef.current);
        }
      }, 100);
    });
  }, [crowdData]);

  // 커서 스타일 변경
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.style.cursor = isAddingSpot ? 'crosshair' : 'grab';
    }
  }, [isAddingSpot]);

  // 특정 스팟으로 포커스 이동
  useEffect(() => {
    if (!mapInstanceRef.current || !focusSpot) return;

    const L = (window as any).L;
    if (!L) return;

    // 해당 위치로 지도 이동
    mapInstanceRef.current.setView([focusSpot.lat, focusSpot.lng], 16, {
      animate: true,
      duration: 1
    });

    // 해당 마커 찾아서 팝업 열기
    setTimeout(() => {
      const targetMarker = markersRef.current.find(marker => {
        const markerLatLng = marker.getLatLng();
        return Math.abs(markerLatLng.lat - focusSpot.lat) < 0.0001 && 
               Math.abs(markerLatLng.lng - focusSpot.lng) < 0.0001;
      });
      
      if (targetMarker) {
        targetMarker.openPopup();
      }
    }, 1000); // 지도 이동 애니메이션 완료 후 팝업 열기
  }, [focusSpot]);

  return (
    <div className="relative w-full h-full z-0">
      <div 
        ref={mapRef} 
        className="w-full h-full relative rounded-lg overflow-hidden z-0"
        style={{ minHeight: '400px' }}
      />
      
      {/* 지도 오버레이 효과 */}
      <div className="absolute inset-0 pointer-events-none z-1">
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />
      </div>
      
      <style jsx>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        
        .leaflet-popup-content-wrapper {
          background: rgba(26, 32, 44, 0.85) !important;
          color: #E2E8F0 !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          padding: 0 !important;
          width: 340px !important;
          max-width: 90vw !important;
        }
        .leaflet-popup-tip {
          background: rgba(26, 32, 44, 0.95) !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: rgba(26, 32, 44, 0.95) !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(10px) !important;
          border-radius: 8px !important;
        }
        .leaflet-control-zoom a {
          background: transparent !important;
          color: #E2E8F0 !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 6px !important;
          margin: 2px !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          color: #A5B4FC !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: rgba(26, 32, 44, 0.95) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 16px !important;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}