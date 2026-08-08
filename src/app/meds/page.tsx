"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Pill, Plus, Clock, Bell, CheckCircle, XCircle, SkipForward, VolumeX, Calendar, AlertTriangle, Trash2, Volume2 } from "lucide-react";
import { getDayData, saveDayData, type MedEntry } from "@/lib/healthStore";
import { speakMedicationAlert } from "@/lib/speechSynthesis";
import BorderGlow from "@/components/ui/BorderGlow";

const MONO_GLOW = {
  backgroundColor: "#09090b",
  glowColor: "0 0 100",
  colors: ["#ffffff", "#e4e4e7", "#a1a1aa"],
  borderRadius: 24,
};

function format12Hour(time24: string): string {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return time24;
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, "0")}:${mStr || "00"} ${period}`;
}

function convertTo24Hour(hour12: string, min: string, ampm: "AM" | "PM"): string {
  let h = parseInt(hour12, 10);
  if (isNaN(h)) h = 8;
  if (h > 12) h = 12;
  if (h < 1) h = 12;
  let m = parseInt(min, 10);
  if (isNaN(m) || m < 0) m = 0;
  if (m > 59) m = 59;
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export default function MedsPage() {
  const [meds, setMeds] = useState<MedEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // 12-Hour AM/PM Time Selector State
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [hour12, setHour12] = useState("08");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [beforeAfterFood, setBeforeAfterFood] = useState<"before" | "after" | "empty_stomach">("after");
  const [doctorName, setDoctorName] = useState("");
  const [medNotes, setMedNotes] = useState("");
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const day = getDayData();
    setMeds(day.meds);
  }, []);

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    const time24 = convertTo24Hour(hour12, minute, ampm);
    const day = getDayData();
    const newMed: MedEntry = {
      id: crypto.randomUUID(),
      name,
      dosage,
      scheduledTime: time24,
      status: "pending",
      beforeAfterFood,
      doctorName: doctorName || undefined,
      remaining: remaining ? parseInt(remaining) : undefined,
      notes: medNotes || undefined,
    };
    day.meds.push(newMed);
    saveDayData(day);
    setMeds([...day.meds]);
    setShowAddForm(false);
    setName(""); setDosage(""); setHour12("08"); setMinute("00"); setAmpm("AM"); setDoctorName(""); setMedNotes(""); setRemaining("");
  };

  const handleStatusChange = (medId: string, status: "taken" | "missed" | "skipped") => {
    const day = getDayData();
    const med = day.meds.find((m) => m.id === medId);
    if (med) {
      med.status = status;
      if (status === "taken") {
        med.takenAt = new Date().toISOString();
        if (med.remaining && med.remaining > 0) med.remaining--;
      }
      saveDayData(day);
      setMeds([...day.meds]);
    }
  };

  const handleDeleteMed = (medId: string) => {
    const day = getDayData();
    day.meds = day.meds.filter((m) => m.id !== medId);
    saveDayData(day);
    setMeds([...day.meds]);
  };

  const totalMeds = meds.length;
  const takenMeds = meds.filter((m) => m.status === "taken").length;
  const missedMeds = meds.filter((m) => m.status === "missed").length;
  const adherencePct = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-28 sm:pb-12" suppressHydrationWarning>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" suppressHydrationWarning>
        <div className="flex flex-col gap-1" suppressHydrationWarning>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#194793] tracking-tight [text-shadow:2px_2px_0px_#121421] flex items-center gap-2">
            <Pill className="w-7 h-7 text-[#194793]" /> Medication Manager
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 font-medium">Set 12-hour AM/PM alarms, track prescriptions, and receive audio reminders.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 rounded-full bg-[#194793] text-white font-black text-xs sm:text-sm shadow-lg shadow-[#121421] hover:scale-105 transition-all flex items-center justify-center gap-2 shrink-0 uppercase tracking-wider border border-[#727578]/40"
        >
          <Plus className="w-4 h-4" /> Add Medicine
        </button>
      </div>

      {/* ===== Stats ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4" suppressHydrationWarning>
        <BorderGlow {...MONO_GLOW} className="w-full">
          <div className="p-4 text-center bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30" suppressHydrationWarning>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#194793] block">Total Today</span>
            <div className="text-2xl font-heading font-black text-[#194793] mt-1 [text-shadow:1.5px_1.5px_0px_#121421]" suppressHydrationWarning>{totalMeds}</div>
          </div>
        </BorderGlow>
        <BorderGlow {...MONO_GLOW} className="w-full">
          <div className="p-4 text-center bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30" suppressHydrationWarning>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#194793] block">Taken</span>
            <div className="text-2xl font-heading font-black text-[#194793] mt-1 [text-shadow:1.5px_1.5px_0px_#121421]" suppressHydrationWarning>{takenMeds}</div>
          </div>
        </BorderGlow>
        <BorderGlow {...MONO_GLOW} className="w-full">
          <div className="p-4 text-center bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30" suppressHydrationWarning>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#194793] block">Missed</span>
            <div className="text-2xl font-heading font-black text-rose-400 mt-1 [text-shadow:1.5px_1.5px_0px_#121421]" suppressHydrationWarning>{missedMeds}</div>
          </div>
        </BorderGlow>
        <BorderGlow {...MONO_GLOW} className="w-full">
          <div className="p-4 text-center bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30" suppressHydrationWarning>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#194793] block">Adherence</span>
            <div className="text-2xl font-heading font-black text-[#194793] mt-1 [text-shadow:1.5px_1.5px_0px_#121421]" suppressHydrationWarning>{adherencePct}%</div>
          </div>
        </BorderGlow>
      </div>

      {/* ===== ADD FORM WITH 12-HOUR AM/PM SELECTOR ===== */}
      {showAddForm && (
        <BorderGlow {...MONO_GLOW} className="w-full">
          <div className="p-5 sm:p-6">
            <h3 className="text-lg font-heading font-black text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add New Medicine
            </h3>
            <form onSubmit={handleAddMed} className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-400">Medicine Name *</label>
                  {name.trim() && (
                    <button
                      type="button"
                      onClick={() => speakMedicationAlert(name, dosage, beforeAfterFood)}
                      className="text-[10px] font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800"
                    >
                      <Volume2 className="w-3 h-3" /> Hear Voice
                    </button>
                  )}
                </div>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Metformin"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 outline-none text-sm font-bold text-white placeholder-zinc-500 focus:border-white transition-all" />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-1 block">Dosage *</label>
                <input type="text" required value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 500mg"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 outline-none text-sm font-bold text-white placeholder-zinc-500 focus:border-white transition-all" />
              </div>

              {/* 12-HOUR AM/PM SELECTOR UI */}
              <div className="md:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300 mb-2 block flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-pink-400" /> Scheduled Time (12-Hour AM/PM Format) *
                </label>
                
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {/* Manual Hour Entry */}
                  <div className="flex-1 min-w-[90px]">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Hour (1 - 12)</span>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={hour12}
                      onChange={(e) => setHour12(e.target.value)}
                      placeholder="08"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-black text-center text-sm outline-none focus:border-white transition-all"
                    />
                  </div>

                  <span className="text-xl font-extrabold text-zinc-500 self-end pb-2">:</span>

                  {/* Manual Minute Entry */}
                  <div className="flex-1 min-w-[90px]">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Minute (0 - 59)</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={minute}
                      onChange={(e) => setMinute(e.target.value)}
                      placeholder="00"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-black text-center text-sm outline-none focus:border-white transition-all"
                    />
                  </div>

                  {/* AM / PM Toggle Selector */}
                  <div className="flex-1 min-w-[130px]">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Period</span>
                    <div className="flex rounded-xl bg-zinc-950 border border-zinc-700 p-1">
                      <button
                        type="button"
                        onClick={() => setAmpm("AM")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${ampm === "AM" ? "bg-white text-black shadow-md" : "text-zinc-400 hover:text-white"}`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setAmpm("PM")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${ampm === "PM" ? "bg-white text-black shadow-md" : "text-zinc-400 hover:text-white"}`}
                      >
                        PM
                      </button>
                    </div>
                  </div>

                  <div className="w-full text-xs font-bold text-zinc-400 mt-2 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                    ⏰ Alarm set for: <span className="text-white font-extrabold">{hour12}:{minute} {ampm}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2 block">Timing</label>
                <div className="flex gap-2">
                  {(["before", "after", "empty_stomach"] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setBeforeAfterFood(t)}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${beforeAfterFood === t ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white"}`}>
                      {t === "empty_stomach" ? "Empty" : t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-1 block">Doctor Name</label>
                <input type="text" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder="Optional"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 outline-none text-sm font-bold text-white placeholder-zinc-500 focus:border-white transition-all" />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-1 block">Tablets Remaining</label>
                <input type="number" value={remaining} onChange={(e) => setRemaining(e.target.value)} placeholder="Optional"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 outline-none text-sm font-bold text-white placeholder-zinc-500 focus:border-white transition-all" />
              </div>

              <div className="md:col-span-2 flex gap-3 mt-2">
                <button type="submit" className="px-6 py-3.5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-white/20 hover:scale-105 transition-all">
                  Save Medicine
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-3.5 rounded-2xl bg-zinc-900 text-zinc-400 border border-zinc-800 font-black text-xs uppercase tracking-wider hover:text-white transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </BorderGlow>
      )}

      {/* ===== Medicine List ===== */}
      <BorderGlow {...MONO_GLOW} className="w-full">
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-white" />
            <h3 className="text-lg font-heading font-black text-white">Today's Schedule</h3>
          </div>

          {meds.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-zinc-500">No medicines added yet. Click "Add Medicine" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meds.map((med) => {
                const isPending = med.status === "pending" || med.status === "snoozed";
                const isTaken = med.status === "taken";
                const isMissed = med.status === "missed";
                const refillWarning = med.remaining != null && med.remaining <= 5;

                return (
                  <div key={med.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                    isTaken ? "bg-emerald-500/5 border-emerald-500/20" :
                    isMissed ? "bg-rose-500/5 border-rose-500/20" :
                    "bg-zinc-900 border-zinc-800"
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isTaken ? "bg-emerald-500 text-white border-emerald-400" :
                        isMissed ? "bg-rose-500 text-white border-rose-400" :
                        "bg-zinc-800 text-white border-zinc-700"
                      }`}>
                        {isTaken ? <CheckCircle className="w-5 h-5" /> : isMissed ? <XCircle className="w-5 h-5" /> : <Pill className="w-5 h-5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-base font-heading font-black ${isTaken ? "text-zinc-500 line-through" : "text-white"}`}>
                            {med.name}
                          </span>
                          <span className="text-xs font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">{med.dosage}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-zinc-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-white">
                            <Clock className="w-3 h-3 text-zinc-500" /> {format12Hour(med.scheduledTime)}
                          </span>
                          <span className="capitalize">{med.beforeAfterFood.replace(/_/g, " ")}</span>
                          {med.doctorName && <span>Dr. {med.doctorName}</span>}
                          {refillWarning && (
                            <span className="flex items-center gap-1 text-amber-400 font-black">
                              <AlertTriangle className="w-3 h-3" /> {med.remaining} left
                            </span>
                          )}
                        </div>
                        {isTaken && med.takenAt && (
                          <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                            Taken at {new Date(med.takenAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto border-t border-zinc-800 sm:border-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => speakMedicationAlert(med.name, med.dosage, med.beforeAfterFood)}
                        title="Test Voice Announcement"
                        className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors flex items-center gap-1 text-xs font-bold"
                      >
                        <Volume2 className="w-4 h-4 text-pink-400" />
                        <span className="hidden sm:inline">Voice Alert</span>
                      </button>
                      {isPending && (
                        <>
                          <button onClick={() => handleStatusChange(med.id, "taken")} className="px-4 py-2 rounded-xl bg-white text-black text-xs font-black shadow-md hover:scale-105 transition-all">
                            Taken
                          </button>
                          <button onClick={() => handleStatusChange(med.id, "missed")} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white text-xs font-black border border-zinc-700 transition-colors">
                            Missed
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDeleteMed(med.id)} title="Delete Reminder" className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </BorderGlow>
    </div>
  );
}
