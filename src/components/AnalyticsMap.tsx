import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

// TopoJSON for World Map
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Mock Data
const data = [
  { id: "IND", value: 850000 },
  { id: "USA", value: 340000 },
  { id: "GBR", value: 120000 },
  { id: "CAN", value: 95000 },
  { id: "AUS", value: 80000 },
  { id: "BRA", value: 65000 },
  { id: "DEU", value: 50000 },
  { id: "ZAF", value: 45000 },
  { id: "ARE", value: 30000 },
];

export default function AnalyticsMap() {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden h-full">
      <div className="absolute top-8 left-8 text-left z-10 w-full pr-16 pointer-events-none">
        <h4 className="font-black font-display text-lg tracking-tight uppercase">Global Audience</h4>
        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Listener Density Array</p>
      </div>
      
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-brand-blue/10 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="w-full h-[250px] md:h-[300px] flex items-center justify-center mt-8">
        <ComposableMap
          projectionConfig={{
            scale: 140,
            center: [0, 10]
          }}
          className="w-full h-full outline-none"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const d = data.find((s) => s.id === geo.id);
                // If it's a top country, we color it.
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={d ? "#0066FF" : "#F1F5F9"}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#0055DD", outline: "none", cursor: "pointer" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
    </div>
  );
}
