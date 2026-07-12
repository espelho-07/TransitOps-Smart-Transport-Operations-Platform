import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Truck, User, Route, Command } from 'lucide-react';
import { vehicleService } from '../services/vehicleService';
import { driverService } from '../services/driverService';
import { tripService } from '../services/tripService';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ vehicles: [], drivers: [], trips: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery('');
      setSelectedIndex(0);
      setResults({ vehicles: [], drivers: [], trips: [] });
    }
  }, [isOpen]);

  // Load searchable data from services in parallel
  useEffect(() => {
    if (!query.trim()) {
      setResults({ vehicles: [], drivers: [], trips: [] });
      return;
    }

    const searchTerm = query.toLowerCase();

    Promise.all([
      vehicleService.getAll(),
      driverService.getAll(),
      tripService.getAll()
    ]).then(([vehiclesList, driversList, tripsList]) => {
      const filteredVehicles = vehiclesList.filter(
        v => v.plateNumber.toLowerCase().includes(searchTerm) ||
             v.make.toLowerCase().includes(searchTerm) ||
             v.model.toLowerCase().includes(searchTerm)
      );

      const filteredDrivers = driversList.filter(
        d => d.name.toLowerCase().includes(searchTerm) ||
             d.licenseNumber.toLowerCase().includes(searchTerm)
      );

      const filteredTrips = tripsList.filter(
        t => t.tripNumber.toLowerCase().includes(searchTerm) ||
             t.origin.toLowerCase().includes(searchTerm) ||
             t.destination.toLowerCase().includes(searchTerm)
      );

      setResults({
        vehicles: filteredVehicles,
        drivers: filteredDrivers,
        trips: filteredTrips
      });
      setSelectedIndex(0);
    }).catch(err => console.error("Palette loading error", err));
  }, [query]);

  // Flattened results for easy key index navigation
  const flattenedResults = [
    ...results.vehicles.map(v => ({ ...v, paletteType: 'vehicle', label: `${v.make} ${v.model} (${v.plateNumber})`, path: '/vehicles' })),
    ...results.drivers.map(d => ({ ...d, paletteType: 'driver', label: d.name, path: '/drivers' })),
    ...results.trips.map(t => ({ ...t, paletteType: 'trip', label: `${t.tripNumber}: ${t.origin} ➔ ${t.destination}`, path: '/trips' }))
  ];

  // Key handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, flattenedResults.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + flattenedResults.length) % Math.max(1, flattenedResults.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flattenedResults[selectedIndex]) {
          const item = flattenedResults[selectedIndex];
          navigate(item.path);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, flattenedResults, navigate, onClose]);

  const getIcon = (type) => {
    switch (type) {
      case 'vehicle':
        return <Truck size={14} className="text-info" />;
      case 'driver':
        return <User size={14} className="text-success" />;
      case 'trip':
      default:
        return <Route size={14} className="text-warning" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[1px]"
          />

          {/* Search Box panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden flex flex-col"
          >
            {/* Search Input field */}
            <div className="flex items-center px-4 py-3.5 border-b border-border bg-hover/10">
              <Search size={18} className="text-text-secondary mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search assets, drivers, trips... (Arrow keys to navigate)"
                className="bg-transparent w-full text-sm text-text-main placeholder:text-text-secondary/40 focus:outline-none"
              />
              <button
                onClick={onClose}
                className="text-[10px] bg-hover border border-border text-text-secondary rounded px-1.5 py-0.5 font-bold uppercase tracking-wider scale-90"
              >
                esc
              </button>
            </div>

            {/* Results items */}
            <div className="max-h-[300px] overflow-y-auto divide-y divide-border/20 py-2">
              {query && flattenedResults.length === 0 ? (
                <div className="px-6 py-10 text-center text-text-secondary text-xs font-semibold">
                  No records matching "{query}" found.
                </div>
              ) : !query ? (
                <div className="px-6 py-8 text-center text-text-secondary text-xs flex flex-col items-center gap-2 select-none">
                  <Command size={18} className="text-text-secondary/40" />
                  <span>Type to search active vehicle logs, commercial drivers, or scheduled dispatches.</span>
                </div>
              ) : (
                flattenedResults.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id + idx}
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`
                        px-4 py-3 flex items-center justify-between cursor-pointer transition-colors text-xs font-semibold
                        ${isSelected ? 'bg-hover text-text-main' : 'text-text-secondary hover:text-text-main'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1 rounded bg-hover/80 border border-border/20 flex items-center justify-center">
                          {getIcon(item.paletteType)}
                        </div>
                        <span className="truncate max-w-[280px]">{item.label}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-text-secondary bg-hover px-1.5 py-0.5 rounded border border-border/30 capitalize select-none">
                          {item.paletteType}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] text-info font-bold uppercase tracking-wider animate-pulse select-none">
                            ↵ Enter
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Help guidelines footer */}
            <div className="px-4 py-2 border-t border-border/40 bg-hover/10 flex items-center justify-between text-[10px] font-bold text-text-secondary uppercase tracking-widest select-none">
              <span>Navigate: ↑↓</span>
              <span>Open: Enter</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
