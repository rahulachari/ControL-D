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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-heading font-bold text-rose-500 tracking-tight flex items-center gap-2">
          <Siren className="w-7 h-7" /> Emergency Mode
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Quick access to emergency contacts, guides, and location sharing.</p>
      </div>

      {/* Emergency Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <a href="tel:108" className="bg-rose-500 text-white rounded-3xl p-6 text-center shadow-xl shadow-rose-500/20 hover:shadow-2xl transition-all">
          <Siren className="w-10 h-10 mx-auto mb-3" />
          <span className="text-lg font-heading font-bold block">Call 108</span>
          <span className="text-xs opacity-80">Emergency Ambulance</span>
        </a>

        <a href="tel:112" className="bg-amber-500 text-white rounded-3xl p-6 text-center shadow-xl shadow-amber-500/20 hover:shadow-2xl transition-all">
          <Phone className="w-10 h-10 mx-auto mb-3" />
          <span className="text-lg font-heading font-bold block">Call 112</span>
          <span className="text-xs opacity-80">Emergency Helpline</span>
        </a>

        <button onClick={shareLocation} className={`rounded-3xl p-6 text-center shadow-xl transition-all ${locationShared ? "bg-emerald-500 text-white" : "bg-blue-500 text-white shadow-blue-500/20 hover:shadow-2xl"}`}>
          <MapPin className="w-10 h-10 mx-auto mb-3" />
          <span className="text-lg font-heading font-bold block">{locationShared ? "Location Copied!" : "Share Location"}</span>
          <span className="text-xs opacity-80">{locationShared ? "Link copied to clipboard" : "Copy Google Maps link"}</span>
        </button>
      </div>

      {/* Hypoglycemia Guide */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <button onClick={() => toggle("hypo")} className="w-full flex items-center justify-between p-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">Hypoglycemia (Low Sugar &lt; 70 mg/dL)</h3>
              <p className="text-xs text-slate-500">What to do when blood sugar drops too low</p>
            </div>
          </div>
          {expandedSection === "hypo" ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>
        {expandedSection === "hypo" && (
          <div className="px-6 pb-6 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">⚠️ Symptoms</h4>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                {["Shaking / Trembling", "Sweating", "Dizziness / Light-headed", "Rapid heartbeat", "Blurred vision", "Confusion", "Weakness / Fatigue", "Irritability / Anxiety"].map((s) => (
                  <span key={s} className="flex items-center gap-1 py-1"><span className="text-amber-500">•</span> {s}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">✅ What to Do (15-15 Rule)</h4>
              <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                <li className="flex gap-2"><span className="text-blue-500 font-bold">1.</span> <strong>Eat 15g of fast-acting carbs:</strong> 3-4 glucose tablets, ½ cup juice, 1 tbsp honey, or 4-5 sugar candies.</li>
                <li className="flex gap-2"><span className="text-blue-500 font-bold">2.</span> <strong>Wait 15 minutes</strong> and recheck blood sugar.</li>
                <li className="flex gap-2"><span className="text-blue-500 font-bold">3.</span> <strong>If still below 70:</strong> Repeat step 1.</li>
                <li className="flex gap-2"><span className="text-blue-500 font-bold">4.</span> <strong>Once above 70:</strong> Eat a small snack (peanut butter crackers, cheese) to stabilize.</li>
                <li className="flex gap-2"><span className="text-rose-500 font-bold">⚠️</span> <strong>If unconscious:</strong> Do NOT give food. Call 108 immediately. Place person on side.</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Hyperglycemia Guide */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <button onClick={() => toggle("hyper")} className="w-full flex items-center justify-between p-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">Hyperglycemia (High Sugar &gt; 250 mg/dL)</h3>
              <p className="text-xs text-slate-500">What to do when blood sugar is dangerously high</p>
            </div>
          </div>
          {expandedSection === "hyper" ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>
        {expandedSection === "hyper" && (
          <div className="px-6 pb-6 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2">⚠️ Symptoms</h4>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                {["Excessive thirst", "Frequent urination", "Nausea / Vomiting", "Fruity breath odor", "Shortness of breath", "Abdominal pain", "Dry mouth", "Confusion / Drowsiness"].map((s) => (
                  <span key={s} className="flex items-center gap-1 py-1"><span className="text-rose-500">•</span> {s}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">✅ What to Do</h4>
              <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                <li className="flex gap-2"><span className="text-blue-500 font-bold">1.</span> <strong>Drink water</strong> — hydration helps kidneys flush excess sugar.</li>
                <li className="flex gap-2"><span className="text-blue-500 font-bold">2.</span> <strong>Take prescribed insulin</strong> if doctor advised correction doses.</li>
                <li className="flex gap-2"><span className="text-blue-500 font-bold">3.</span> <strong>Avoid carbs</strong> — do not eat until sugar starts coming down.</li>
                <li className="flex gap-2"><span className="text-blue-500 font-bold">4.</span> <strong>Light walk</strong> — gentle movement helps muscles absorb glucose.</li>
                <li className="flex gap-2"><span className="text-blue-500 font-bold">5.</span> <strong>Check every 30 min</strong> — if not improving, call your doctor.</li>
                <li className="flex gap-2"><span className="text-rose-500 font-bold">⚠️</span> <strong>If above 400 mg/dL or vomiting:</strong> Go to ER immediately. Risk of DKA.</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Card */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">Emergency Medical Card</h3>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest opacity-70">Medical Alert</span>
            <Heart className="w-5 h-5" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="opacity-70">Condition</span><span className="font-bold">Type 2 Diabetes</span></div>
            <div className="flex justify-between"><span className="opacity-70">App</span><span className="font-bold">ControL-D</span></div>
            <div className="flex justify-between"><span className="opacity-70">Emergency</span><span className="font-bold">108 / 112</span></div>
          </div>
          <p className="text-[10px] mt-4 opacity-60">Show this card to first responders in an emergency.</p>
        </div>
      </div>
    </div>
  );
}
