"use client";

import { useState } from "react";
import { AlertTriangle, Phone, MapPin, Heart, Shield, ChevronDown, ChevronUp, Siren, Thermometer, Users } from "lucide-react";

export default function EmergencyPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>("hypo");
  const [locationShared, setLocationShared] = useState(false);

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const url = `https://maps.google.com/maps?q=${latitude},${longitude}`;
          navigator.clipboard.writeText(url).then(() => setLocationShared(true));
        },
        () => alert("Location access denied. Please enable location services.")
      );
    }
  };

  const toggle = (s: string) => setExpandedSection(expandedSection === s ? null : s);

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-28 sm:pb-12">
      <div>
        <h1 className="text-3xl font-heading font-black text-[#194793] tracking-tight [text-shadow:2px_2px_0px_#121421] flex items-center gap-2">
          <Siren className="w-7 h-7 text-[#194793]" /> Emergency Mode
        </h1>
        <p className="text-zinc-300 text-sm mt-1">Quick access to emergency contacts, guides, and location sharing.</p>
      </div>

      {/* Emergency Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <a href="tel:108" className="bg-rose-500 text-white rounded-3xl p-4 sm:p-6 text-center shadow-xl shadow-[#121421] hover:scale-105 transition-all border border-rose-400/40">
          <Siren className="w-10 h-10 mx-auto mb-3" />
          <span className="text-lg font-heading font-black block [text-shadow:1px_1px_0px_#121421]">Call 108</span>
          <span className="text-xs opacity-90">Emergency Ambulance</span>
        </a>

        <a href="tel:112" className="bg-amber-500 text-white rounded-3xl p-4 sm:p-6 text-center shadow-xl shadow-[#121421] hover:scale-105 transition-all border border-amber-400/40">
          <Phone className="w-10 h-10 mx-auto mb-3" />
          <span className="text-lg font-heading font-black block [text-shadow:1px_1px_0px_#121421]">Call 112</span>
          <span className="text-xs opacity-90">Emergency Helpline</span>
        </a>

        <button onClick={shareLocation} className={`rounded-3xl p-4 sm:p-6 text-center shadow-xl transition-all hover:scale-105 border ${locationShared ? "bg-[#194793] text-white border-[#194793]" : "bg-[#121421] text-[#194793] border-[#727578]/40"}`}>
          <MapPin className="w-10 h-10 mx-auto mb-3 text-[#194793]" />
          <span className="text-lg font-heading font-black block [text-shadow:1px_1px_0px_#121421]">{locationShared ? "Location Copied!" : "Share Location"}</span>
          <span className="text-xs text-zinc-300">{locationShared ? "Link copied to clipboard" : "Copy Google Maps link"}</span>
        </button>
      </div>

      {/* Hypoglycemia Guide */}
      <div className="bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] backdrop-blur-xl border border-[#727578]/30 rounded-3xl shadow-xl overflow-hidden">
        <button onClick={() => toggle("hypo")} className="w-full flex items-center justify-between p-4 sm:p-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-heading font-black text-[#194793] [text-shadow:1px_1px_0px_#121421]">Hypoglycemia (Low Sugar &lt; 70 mg/dL)</h3>
              <p className="text-xs text-zinc-300 font-medium">What to do when blood sugar drops too low</p>
            </div>
          </div>
          {expandedSection === "hypo" ? <ChevronUp className="w-5 h-5 text-[#194793]" /> : <ChevronDown className="w-5 h-5 text-[#194793]" />}
        </button>
        {expandedSection === "hypo" && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
            <div>
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-2">⚠️ Symptoms</h4>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] sm:text-xs text-zinc-300 font-medium">
                {["Shaking / Trembling", "Sweating", "Dizziness / Light-headed", "Rapid heartbeat", "Blurred vision", "Confusion", "Weakness / Fatigue", "Irritability / Anxiety"].map((s) => (
                  <span key={s} className="flex items-center gap-1 py-1"><span className="text-amber-400">•</span> {s}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-2">✅ What to Do (15-15 Rule)</h4>
              <ol className="space-y-2 text-xs sm:text-sm text-zinc-200 font-medium">
                <li className="flex gap-2"><span className="text-[#194793] font-bold">1.</span> <strong>Eat 15g of fast-acting carbs:</strong> 3-4 glucose tablets, ½ cup juice, 1 tbsp honey, or 4-5 sugar candies.</li>
                <li className="flex gap-2"><span className="text-[#194793] font-bold">2.</span> <strong>Wait 15 minutes</strong> and recheck blood sugar.</li>
                <li className="flex gap-2"><span className="text-[#194793] font-bold">3.</span> <strong>If still below 70:</strong> Repeat step 1.</li>
                <li className="flex gap-2"><span className="text-[#194793] font-bold">4.</span> <strong>Once above 70:</strong> Eat a small snack (peanut butter crackers, cheese) to stabilize.</li>
                <li className="flex gap-2"><span className="text-rose-400 font-bold">⚠️</span> <strong>If unconscious:</strong> Do NOT give food. Call 108 immediately. Place person on side.</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Hyperglycemia Guide */}
      <div className="bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] backdrop-blur-xl border border-[#727578]/30 rounded-3xl shadow-xl overflow-hidden">
        <button onClick={() => toggle("hyper")} className="w-full flex items-center justify-between p-4 sm:p-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-heading font-black text-[#194793] [text-shadow:1px_1px_0px_#121421]">Hyperglycemia (High Sugar &gt; 250 mg/dL)</h3>
              <p className="text-xs text-zinc-300 font-medium">What to do when blood sugar is dangerously high</p>
            </div>
          </div>
          {expandedSection === "hyper" ? <ChevronUp className="w-5 h-5 text-[#194793]" /> : <ChevronDown className="w-5 h-5 text-[#194793]" />}
        </button>
        {expandedSection === "hyper" && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
            <div>
              <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider mb-2">⚠️ Symptoms</h4>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] sm:text-xs text-zinc-300 font-medium">
                {["Excessive thirst", "Frequent urination", "Nausea / Vomiting", "Fruity breath odor", "Shortness of breath", "Abdominal pain", "Dry mouth", "Confusion / Drowsiness"].map((s) => (
                  <span key={s} className="flex items-center gap-1 py-1"><span className="text-rose-400">•</span> {s}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black text-[#194793] uppercase tracking-wider mb-2">✅ What to Do</h4>
              <ol className="space-y-2 text-xs sm:text-sm text-zinc-200 font-medium">
                <li className="flex gap-2"><span className="text-[#194793] font-bold">1.</span> <strong>Drink water</strong> — hydration helps kidneys flush excess sugar.</li>
                <li className="flex gap-2"><span className="text-[#194793] font-bold">2.</span> <strong>Take prescribed insulin</strong> if doctor advised correction doses.</li>
                <li className="flex gap-2"><span className="text-[#194793] font-bold">3.</span> <strong>Avoid carbs</strong> — do not eat until sugar starts coming down.</li>
                <li className="flex gap-2"><span className="text-[#194793] font-bold">4.</span> <strong>Light walk</strong> — gentle movement helps muscles absorb glucose.</li>
                <li className="flex gap-2"><span className="text-[#194793] font-bold">5.</span> <strong>Check every 30 min</strong> — if not improving, call your doctor.</li>
                <li className="flex gap-2"><span className="text-rose-400 font-bold">⚠️</span> <strong>If above 400 mg/dL or vomiting:</strong> Go to ER immediately. Risk of DKA.</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Card */}
      <div className="bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] backdrop-blur-xl border border-[#727578]/30 rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-[#194793]" />
          <h3 className="text-lg font-heading font-black text-[#194793] [text-shadow:1px_1px_0px_#121421]">Emergency Medical Card</h3>
        </div>
        <div className="bg-gradient-to-r from-[#194793] to-[#121421] border border-[#727578]/40 text-white rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#194793]">Medical Alert</span>
            <Heart className="w-5 h-5 text-rose-400" />
          </div>
          <div className="space-y-2 text-xs sm:text-sm font-medium">
            <div className="flex justify-between"><span className="text-zinc-400">Condition</span><span className="font-bold">Type 2 Diabetes</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">App</span><span className="font-bold">ControL-D</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">Emergency</span><span className="font-bold">108 / 112</span></div>
          </div>
          <p className="text-[10px] mt-4 text-zinc-400 font-bold">Show this card to first responders in an emergency.</p>
        </div>
      </div>
    </div>
  );
}
