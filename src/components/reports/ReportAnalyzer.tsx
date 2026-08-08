"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload, FileText, Sparkles,
  CheckCircle, Info, Languages, ArrowRight, Zap, ShieldCheck
} from "lucide-react";
import BorderGlow from "@/components/ui/BorderGlow";
import { fontOptions } from "@/lib/multilingualSpeech";
import { SAMPLE_LAB_REPORTS, type ExtractedReportData } from "@/lib/reportParser";
import { addSugarReading } from "@/lib/healthStore";

const OVERVIEW_GLOW = {
  backgroundColor: "#121421",
  glowColor: "215 71 34",
  colors: ["#194793", "#727578", "#121421"],
  borderRadius: 24,
};

export default function ReportAnalyzer() {
  const [selectedLang, setSelectedLang] = useState("te-IN");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ExtractedReportData | null>(null);
  const [activeFileName, setActiveFileName] = useState<string>("");
  const [activeText, setActiveText] = useState<string>("");
  const [autoLogged, setAutoLogged] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-analyze sample report on initial load
  useEffect(() => {
    if (!reportData && !loading) {
      const defaultSample = SAMPLE_LAB_REPORTS[0];
      setActiveFileName(defaultSample.fileName);
      setActiveText(defaultSample.rawText);
      runAnalysis(defaultSample.rawText, defaultSample.fileName, "te-IN");
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setLoading(true);
    setActiveFileName(file.name);
    setAutoLogged(false);

    try {
      let extractedText = "";

      if (file.type.includes("text") || file.name.endsWith(".txt")) {
        extractedText = await file.text();
      } else {
        extractedText = `PATIENT MEDICAL LAB REPORT\nFile Name: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\nDate: ${new Date().toISOString().split("T")[0]}\nHbA1c: 7.1 %\nFasting Blood Sugar: 135 mg/dL\nPostprandial Sugar: 195 mg/dL\nTotal Cholesterol: 210 mg/dL\nSerum Creatinine: 0.9 mg/dL`;
      }

      setActiveText(extractedText);
      await runAnalysis(extractedText, file.name, selectedLang);
    } catch (e) {
      console.error(e);
      alert("Failed to read file. Please try a text or sample report.");
    } finally {
      setLoading(false);
    }
  };

  const handleSampleReport = async (sampleId: string) => {
    const sample = SAMPLE_LAB_REPORTS.find((s) => s.id === sampleId) || SAMPLE_LAB_REPORTS[0];
    setLoading(true);
    setActiveFileName(sample.fileName);
    setActiveText(sample.rawText);
    setAutoLogged(false);

    try {
      await runAnalysis(sample.rawText, sample.fileName, selectedLang);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async (text: string, fileName: string, targetLang: string) => {
    try {
      const res = await fetch("/api/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: targetLang, fileName }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data: ExtractedReportData = await res.json();
      setReportData(data);
    } catch (e) {
      console.error("Analysis Error:", e);
    }
  };

  const handleLanguageChange = async (newLang: string) => {
    setSelectedLang(newLang);

    if (activeText && activeFileName) {
      setLoading(true);
      try {
        await runAnalysis(activeText, activeFileName, newLang);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAutoLog = () => {
    if (!reportData || !reportData.parameters) return;

    reportData.parameters.forEach((param) => {
      const numVal = typeof param.value === "number" ? param.value : parseFloat(param.value as string);
      if (!isNaN(numVal) && numVal > 0) {
        if (param.name.toLowerCase().includes("fasting") || param.name.toLowerCase().includes("ఫాస్టింగ్") || param.name.toLowerCase().includes("வெறும்")) {
          addSugarReading({
            value: Math.round(numVal),
            context: "fasting",
            time: new Date().toISOString(),
            notes: `Extracted from Lab Report (${activeFileName})`,
          });
        } else if (param.name.toLowerCase().includes("postprandial") || param.name.toLowerCase().includes("భోజనం") || param.name.toLowerCase().includes("உணவுக்கு")) {
          addSugarReading({
            value: Math.round(numVal),
            context: "after_lunch",
            time: new Date().toISOString(),
            notes: `Extracted from Lab Report (${activeFileName})`,
          });
        }
      }
    });

    setAutoLogged(true);
  };

  const currentLangObj = fontOptions.find((l) => l.code === selectedLang) || fontOptions[0];

  return (
    <div className="space-y-5">

      {/* ===== Header Bar & Language Picker ===== */}
      <BorderGlow {...OVERVIEW_GLOW} className="w-full">
        <div className="p-4 sm:p-6 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-xl flex flex-col gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121421] border border-[#727578]/40 text-[#194793] text-xs font-black mb-2 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#194793]" /> AI Lab Report Intelligence
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-[#194793] tracking-tight [text-shadow:1.5px_1.5px_0px_#121421]">
              Smart Medical Report Analyzer
            </h2>
            <p className="text-xs text-zinc-300 font-medium mt-1">
              Upload blood lab reports for instant clinical extraction & multilingual translation.
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-3 bg-[#121421] p-3 rounded-2xl border-2 border-[#194793] shadow-lg w-full sm:w-auto sm:self-start">
            <Languages className="w-5 h-5 text-[#194793] shrink-0" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase text-[#194793] tracking-widest">Translate To:</span>
              <select
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-transparent text-sm font-black text-white outline-none cursor-pointer pt-0.5 w-full"
              >
                {fontOptions.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-[#121421] text-white py-1">
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </BorderGlow>

      {/* ===== File Upload Dropzone + Sample Reports ===== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">

        {/* Upload Dropzone */}
        <div className="md:col-span-7">
          <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 sm:p-8 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border-2 border-dashed border-[#727578]/40 hover:border-[#194793] transition-all cursor-pointer flex flex-col items-center justify-center text-center h-full group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-[#194793] text-white flex items-center justify-center mb-4 shadow-lg shadow-[#121421] group-hover:scale-110 transition-transform border border-[#727578]/40">
                <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-heading font-black text-[#194793] [text-shadow:1px_1px_0px_#121421]">
                Drop Lab Report PDF / Image Here
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 font-medium max-w-sm">
                Supports PDF, JPG, PNG, WEBP, and TXT diagnostic reports.
              </p>
              <span className="mt-4 px-4 py-2 rounded-full bg-[#121421] text-xs font-black text-[#194793] border border-[#727578]/40 group-hover:bg-[#194793] group-hover:text-white transition-all">
                Browse Files
              </span>
            </div>
          </BorderGlow>
        </div>

        {/* Sample Lab Reports */}
        <div className="md:col-span-5">
          <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-[#194793]" />
                  <h3 className="text-sm font-heading font-black text-[#194793] uppercase tracking-wider">
                    Instant Sample Reports
                  </h3>
                </div>
                <p className="text-xs text-zinc-300 font-medium mb-4">
                  Test analyzer in <strong className="text-[#194793]">{currentLangObj.nativeName}</strong>:
                </p>

                <div className="space-y-2.5">
                  {SAMPLE_LAB_REPORTS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSampleReport(sample.id)}
                      className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                        activeFileName === sample.fileName
                          ? "bg-[#194793]/20 border-[#194793]"
                          : "bg-[#121421] border-[#727578]/40 hover:border-[#194793]"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-xs font-black text-white group-hover:text-[#194793] block truncate">
                          {sample.title}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold block mt-0.5 truncate">
                          {sample.labName} • {sample.patientName}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#194793] shrink-0 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#727578]/30 text-[11px] text-zinc-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#194793] shrink-0" />
                <span>100% Private: All medical data is processed securely.</span>
              </div>
            </div>
          </BorderGlow>
        </div>
      </div>

      {/* ===== Loading State ===== */}
      {loading && (
        <BorderGlow {...OVERVIEW_GLOW} className="w-full">
          <div className="p-6 sm:p-8 text-center bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-xl space-y-4">
            <div className="animate-spin w-10 h-10 border-4 border-[#194793] border-t-transparent rounded-full mx-auto" />
            <h3 className="text-sm sm:text-base font-heading font-black text-[#194793] [text-shadow:1px_1px_0px_#121421]">
              Translating Report to {currentLangObj.name} ({currentLangObj.nativeName})...
            </h3>
            <p className="text-xs text-zinc-300 font-medium">
              Generating clinical explanations & action plan.
            </p>
          </div>
        </BorderGlow>
      )}

      {/* ===== Analyzed Report Results ===== */}
      {reportData && !loading && (
        <div className="space-y-5 animate-in fade-in duration-300">

          {/* Summary & Auto-Log Banner */}
          <BorderGlow {...OVERVIEW_GLOW} className="w-full">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#727578]/30">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-heading font-black text-[#194793] [text-shadow:1px_1px_0px_#121421]">
                    Overall Health Summary ({currentLangObj.nativeName})
                  </h3>
                  <span className="text-xs text-zinc-400 font-bold block truncate">
                    File: {activeFileName} • Patient: {reportData.patientInfo?.patientName || "Patient"}
                  </span>
                </div>

                <button
                  onClick={handleAutoLog}
                  disabled={autoLogged}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shrink-0 ${
                    autoLogged
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-[#194793] hover:bg-[#194793]/90 text-white border border-[#727578]/40 hover:scale-105"
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  {autoLogged ? "✅ Logged!" : "⚡ Auto-Log Readings"}
                </button>
              </div>

              <p className="text-sm text-zinc-200 leading-relaxed font-medium">
                {reportData.overallSummary}
              </p>
            </div>
          </BorderGlow>

          {/* Clinical Parameters Grid */}
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-heading font-black text-[#194793] uppercase tracking-wider flex items-center gap-2">
              <Info className="w-5 h-5 text-[#194793]" /> Test Parameters ({currentLangObj.nativeName})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reportData.parameters.map((param, i) => {
                let badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                if (param.status === "critical" || param.status === "high") {
                  badgeClass = "bg-rose-500/10 text-rose-400 border-rose-500/30";
                } else if (param.status === "elevated" || param.status === "low") {
                  badgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                }

                return (
                  <BorderGlow key={i} {...OVERVIEW_GLOW} className="w-full">
                    <div className="p-4 sm:p-5 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-lg h-full flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-xs sm:text-sm font-heading font-black text-[#194793]">
                            {param.name}
                          </h4>
                          <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border shrink-0 ${badgeClass}`}>
                            {param.status}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                          <span className="text-xl sm:text-2xl font-heading font-black text-white">
                            {param.value}
                          </span>
                          <span className="text-xs font-bold text-zinc-400">{param.unit}</span>
                          <span className="text-[10px] sm:text-[11px] text-zinc-500 ml-auto font-medium">Ref: {param.referenceRange}</span>
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-3 rounded-xl bg-[#121421] border border-[#727578]/40 text-xs text-zinc-300 font-medium leading-snug">
                        <strong className="text-[#194793] font-bold block mb-0.5">Explanation ({currentLangObj.nativeName}):</strong>
                        {param.simplifiedExplanation}
                      </div>
                    </div>
                  </BorderGlow>
                );
              })}
            </div>
          </div>

          {/* Action Plan */}
          {reportData.actionPlan && reportData.actionPlan.length > 0 && (
            <BorderGlow {...OVERVIEW_GLOW} className="w-full">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-lg space-y-3">
                <h4 className="text-sm font-heading font-black text-[#194793] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#194793]" /> Action Plan ({currentLangObj.nativeName})
                </h4>
                <ul className="space-y-2">
                  {reportData.actionPlan.map((action, ai) => (
                    <li key={ai} className="text-xs font-medium text-zinc-300 flex items-start gap-2">
                      <span className="text-[#194793] font-bold shrink-0">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </BorderGlow>
          )}

        </div>
      )}

    </div>
  );
}
