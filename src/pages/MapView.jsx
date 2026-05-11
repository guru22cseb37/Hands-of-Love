import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../lib/supabase';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

// Fix default icon issue in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom pins logic
const getCategoryColor = (cat) => {
  switch(cat) {
    case 'food': return '#0F6E56'; // green
    case 'clothes': return '#3B82F6'; // blue
    case 'medicine': return '#F97316'; // orange
    case 'books': return '#8B5CF6'; // purple
    default: return '#6B7280'; // gray
  }
};

const createCustomIcon = (color) => {
  return new L.DivIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center;"><div style="width: 10px; height: 10px; background-color: white; border-radius: 50%;"></div></div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// Auto-centering component
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
}

const MapView = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState([40.7128, -74.0060]); // Default NY

  // Get real location on mount to center
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCenter([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        // Seed random nearby points for demo
        setDonations([
          { id: 1, item_name: 'Leftover Sandwiches', category: 'food', lat: center[0] + 0.01, lng: center[1] + 0.005, location: 'Nearby Park' },
          { id: 2, item_name: 'Sleeping Bag', category: 'clothes', lat: center[0] - 0.005, lng: center[1] + 0.01, location: 'West St' },
          { id: 3, item_name: 'Painkillers Sealed', category: 'medicine', lat: center[0] + 0.012, lng: center[1] - 0.01, location: 'Pharmacy Aisle' },
        ]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('donations')
          .select('*')
          .eq('is_collected', false);
        
        if (error) throw error;
        
        // Filter out items that genuinely don't have lat/lng and substitute random for those without to make it showy if needed
        const enriched = data.map(d => {
          if (!d.lat) {
            // Safe fuzzing so things appear on map if user didn't record coordinates during demo
            return { ...d, lat: center[0] + (Math.random() - 0.5) * 0.05, lng: center[1] + (Math.random() - 0.5) * 0.05 };
          }
          return d;
        });
        setDonations(enriched);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (!loading || donations.length === 0) {
        fetchData();
    }
  }, [center]);

  return (
    <div className="pt-16 h-screen w-full flex flex-col md:flex-row overflow-hidden relative">
      {/* Sidebar Controls */}
      <div className="md:w-80 w-full bg-white dark:bg-gray-900 p-6 border-r border-gray-200 dark:border-gray-800 z-10 shadow-xl relative md:h-full flex flex-col flex-shrink-0 h-auto max-h-[30vh] md:max-h-full overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2 dark:text-white flex items-center gap-2">
          <Navigation className="w-6 h-6 text-primary" />
          Live Map
        </h1>
        <p className="text-gray-500 text-sm mb-6 dark:text-gray-400">All unclaimed resources available right now near you.</p>
        
        <div className="space-y-3">
          <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Legend</h4>
          <div className="grid grid-cols-2 gap-2">
            {['food', 'clothes', 'medicine', 'books', 'other'].map(cat => (
              <div key={cat} className="flex items-center gap-2 text-sm dark:text-gray-300">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(cat) }}></div>
                <span className="capitalize">{cat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 hidden md:block">
          <p className="text-xs italic text-gray-400">Click on a pin to view location details and pickup contacts.</p>
        </div>
      </div>

      {/* The Map Container */}
      <div className="flex-grow h-full relative bg-gray-100 z-0">
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        )}
        
        <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap center={center} />

          {donations.map((item) => (
            item.lat && item.lng ? (
              <Marker 
                key={item.id} 
                position={[item.lat, item.lng]}
                icon={createCustomIcon(getCategoryColor(item.category))}
              >
                <Popup>
                  <div className="p-1 font-sans">
                    <h4 className="font-bold text-base m-0 text-gray-900">{item.item_name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.location}</p>
                    <div className="mt-2 pt-2 border-t flex justify-between items-center">
                       <span className="capitalize text-xs font-bold px-2 py-0.5 rounded bg-gray-100">{item.category}</span>
                       <a href={`/feed`} className="text-xs text-primary font-bold">View Details →</a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ) : null
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
