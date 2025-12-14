import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Skull, Info } from 'lucide-react';

const ResultCard = ({ result }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Styles based on Risk Level
  const styles = {
    HIGH: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-700 dark:text-red-400",
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    },
    MODERATE: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-800",
      text: "text-orange-700 dark:text-orange-400",
      icon: <AlertTriangle className="w-12 h-12 text-orange-500" />,
      badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    },
    LOW: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-800",
      text: "text-emerald-700 dark:text-emerald-400",
      icon: <CheckCircle className="w-12 h-12 text-emerald-500" />,
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
    }
  };

  const theme = styles[result.risk_level] || styles.LOW;

  return (
    <div className={`w-full rounded-2xl border-2 ${theme.border} ${theme.bg} overflow-hidden shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}>
      {/* HEADER SECTION */}
      <div className="p-6 flex items-start gap-4">
        <div className="shrink-0">{theme.icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${theme.text} tracking-tight`}>
              {result.risk_level} RISK
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${theme.badge}`}>
              AI Analysis
            </span>
          </div>
          <p className="mt-2 text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
            {result.explanation}
          </p>
        </div>
      </div>

      {/* DROPDOWN SECTION */}
      <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-3 flex items-center justify-between text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          {isOpen ? "Hide Detailed Analysis" : "Show Detailed Analysis"}
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isOpen && (
          <div className="px-6 pb-6 pt-2 space-y-6">
            
            {/* 1. HAZARD PROTOCOL SECTION (The Cancer/Toxin Warnings) */}
            {result.detected_hazards && Object.keys(result.detected_hazards).length > 0 && (
              <div className="bg-gray-900 dark:bg-black rounded-xl p-4 border border-gray-700 shadow-inner">
                <h4 className="text-xs font-bold text-red-400 uppercase mb-3 flex items-center gap-2">
                  <Skull className="w-4 h-4" /> Health Hazard Warnings
                </h4>
                <div className="space-y-3">
                  {Object.entries(result.detected_hazards).map(([key, data]) => (
                    <div key={key} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-white capitalize">{data.label}</span>
                        <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                          Toxic
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Found in: <span className="italic text-gray-300">"{data.found_term}"</span></p>
                      
                      {/* Danger Explanation */}
                      <div className="mt-2 flex items-start gap-2 bg-red-950/50 p-2 rounded text-xs text-red-200 border border-red-900/50">
                         <Info className="w-3 h-3 mt-0.5 shrink-0" />
                         {data.danger_msg}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. ALLERGEN SECTION */}
            {result.detected_allergens && Object.keys(result.detected_allergens).length > 0 ? (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Detected Allergens</h4>
                <div className="space-y-2">
                  {Object.entries(result.detected_allergens).map(([key, data]) => (
                    <div key={key} className={`p-3 rounded-lg border flex justify-between items-center ${data.is_direct_risk ? "bg-red-50 border-red-100 dark:bg-red-900/30 dark:border-red-800" : "bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700"}`}>
                      <div>
                        <span className={`font-bold capitalize ${data.is_direct_risk ? "text-red-700 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>
                          {key.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Found: "{data.found_terms[0]}"
                        </p>
                      </div>
                      {data.is_direct_risk && <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900 px-2 py-1 rounded">MATCH</span>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              !result.detected_hazards && <p className="text-sm text-gray-500 italic">No specific allergens or hazards detected.</p>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;