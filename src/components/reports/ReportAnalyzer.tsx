"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload, FileText, Sparkles,
  CheckCircle, Info, Languages, ArrowRight, Zap, ShieldCheck
} from "lucide-react";
import BorderGlow from "@/components/ui/BorderGlow";
import { fontOptions } from "@/lib/multilingualSpeech";
import { type ExtractedReportData } from "@/lib/reportParser";
import { addSugarReading, type LabReport, saveLabReport, getLabReports, syncLabReportsFromSupabase } from "@/lib/healthStore";

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
  const [history, setHistory] = useState<LabReport[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from local storage / Supabase on mount
  useEffect(() => {
    syncLabReportsFromSupabase().then((data) => {
      setHistory(data);
      if (data.length > 0 && !reportData && !loading) {
        // Load the latest report automatically
        const latest = data[0];
        setActiveFileName(latest.file_name);
        setReportData({
          patientInfo: {
            patientName: "Patient",
            age: 30,
            testDate: latest.test_date,
            labName: latest.file_name
          },
          parameters: latest.parameters,
          overallSummary: latest.overall_summary,
          actionPlan: latest.action_plan,
          speechTranscript: "",
          speechPhonetic: ""
        });
      }
    });
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setLoading(true);
    setActiveFileName(file.name);
    setAutoLogged(false);

    try {
      let extractedText = "";
      let base64Image = "";

      if (file.type.includes("pdf")) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/extract-pdf", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Failed to extract PDF");
        const json = await res.json();
        extractedText = json.text;
      } else if (file.type.includes("image")) {
        const buffer = await file.arrayBuffer();
        const base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        base64Image = `data:${file.type};base64,${base64}`;
      } else {
        extractedText = await file.text();
      }

      setActiveText(extractedText);
      await runAnalysis(extractedText, base64Image, file.name, selectedLang);
    } catch (e) {
      console.error(e);
      alert("Failed to analyze file. Ensure it's a valid PDF, Image, or Text file.");
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryReport = (report: LabReport) => {
    setActiveFileName(report.file_name);
    setActiveText(report.raw_text || "");
    setAutoLogged(false);
    setReportData({
      patientInfo: {
        patientName: "Patient",
        age: 30,
        testDate: report.test_date,
        labName: report.file_name
      },
      parameters: report.parameters,
      overallSummary: report.overall_summary,
      actionPlan: report.action_plan,
      speechTranscript: "",
      speechPhonetic: ""
    });
  };

  const runAnalysis = async (text: string, image: string, fileName: string, targetLang: string) => {
    try {
      const res = await fetch("/api/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, image, language: targetLang, fileName }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data: ExtractedReportData = await res.json();
      setReportData(data);

      const newReport: LabReport = {
        id: crypto.randomUUID(),
        file_name: fileName,
        test_date: data.patientInfo?.testDate || new Date().toISOString().split("T")[0],
        overall_summary: data.overallSummary,
        parameters: data.parameters,
        action_plan: data.actionPlan || [],
        raw_text: text,
        created_at: new Date().toISOString()
      };
      
      saveLabReport(newReport);
      setHistory(getLabReports());

    } catch (e) {
      console.error("Analysis Error:", e);
      alert("Analysis failed. Please try again.");
    }
  };

  const handleLanguageChange = async (newLang: string) => {
    setSelectedLang(newLang);
    if (activeText && activeFileName) {
      setLoading(true);
      try {
        await runAnalysis(activeText, "", activeFileName, newLang);
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

        {/* My Lab Reports */}
        <div className="md:col-span-5">
          <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-lg flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-[#194793]" />
                  <h3 className="text-sm font-heading font-black text-[#194793] uppercase tracking-wider">
                    My Recent Reports
                  </h3>
                </div>
                <p className="text-xs text-zinc-300 font-medium mb-4">
                  View your securely stored analysis results:
                </p>

                <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                  {history.length === 0 ? (
                    <div className="text-xs text-zinc-500 font-medium p-4 text-center border border-dashed border-[#727578]/40 rounded-2xl">
                      No reports uploaded yet.
                    </div>
                  ) : history.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => handleHistoryReport(report)}
                      className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                        activeFileName === report.file_name
                          ? "bg-[#194793]/20 border-[#194793]"
                          : "bg-[#121421] border-[#727578]/40 hover:border-[#194793]"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-xs font-black text-white group-hover:text-[#194793] block truncate">
                          {report.file_name}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold block mt-0.5 truncate">
                          Analyzed on {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#194793] shrink-0 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#727578]/30 text-[11px] text-zinc-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#194793] shrink-0" />
                <span>100% Private: All medical data is stored securely.</span>
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
              Analyzing Report in {currentLangObj.name} ({currentLangObj.nativeName})...
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
