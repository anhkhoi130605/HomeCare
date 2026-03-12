import React, { useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Sửa lỗi icon ghim mặc định của Leaflet bị lỗi trong React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Tọa độ trung tâm Đà Nẵng
const DA_NANG_CENTER = { lat: 16.0544, lng: 108.2022 };

const MapPicker = ({ onAddressSelect }) => {
  const [position, setPosition] = useState(DA_NANG_CENTER);
  const [loading, setLoading] = useState(false);
  const markerRef = useRef(null);

  // Hàm chuyển đổi Tọa độ -> Tên địa chỉ (Dùng OpenStreetMap API miễn phí)
  const getAddressFromCoords = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      if (!data || !data.display_name) return;

      // KIỂM TRA KHU VỰC: Quét trên toàn bộ chuỗi địa chỉ trả về để tránh lỗi API thiếu field
      const fullAddressLower = data.display_name.toLowerCase();
      const isValidLocation = 
        fullAddressLower.includes("đà nẵng") || 
        fullAddressLower.includes("da nang") || 
        fullAddressLower.includes("quảng nam") || 
        fullAddressLower.includes("quang nam");

      if (!isValidLocation) {
        alert("Xin lỗi, hệ thống hiện tại chỉ hỗ trợ khu vực Đà Nẵng và Quảng Nam!");
        // Đẩy ghim về lại trung tâm
        setPosition(DA_NANG_CENTER);
        return;
      }

      // Nếu hợp lệ -> Trả địa chỉ về cho Component cha (AddPatient)
      if (onAddressSelect) {
        onAddressSelect(data.display_name);
      }
    } catch (error) {
      console.error("Lỗi lấy địa chỉ:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sự kiện khi thả ghim (Drag End)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          getAddressFromCoords(newPos.lat, newPos.lng);
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="w-full h-64 mt-2 rounded-xl overflow-hidden border-2 border-[#B2EBF2] shadow-inner relative z-0">
      {loading && (
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-[1000] bg-white px-4 py-1.5 rounded-full shadow-lg shadow-[#99C5D3]/40 text-sm text-[#5fa5ba] font-bold border border-[#99C5D3] flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
          Đang tải địa chỉ...
        </div>
      )}
      <MapContainer 
        center={DA_NANG_CENTER} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={position}
          ref={markerRef}
        >
          <Popup minWidth={90} className="font-medium text-stone-700">
            Kéo thả ghim <br /> để chọn địa chỉ.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapPicker;