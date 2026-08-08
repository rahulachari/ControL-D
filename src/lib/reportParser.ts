// Parser for Medical Lab Reports (PDF, Text, Images, Documents)

export interface LabParameter {
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: "normal" | "elevated" | "high" | "low" | "critical";
  simplifiedExplanation: string;
}

export interface ExtractedReportData {
  patientInfo?: {
    patientName?: string;
    age?: number;
    testDate?: string;
    labName?: string;
  };
  patientName?: string;
  age?: number;
  testDate?: string;
  labName?: string;
  parameters: LabParameter[];
  overallSummary: string;
  actionPlan: string[];
  speechTranscript?: string;
  speechTranscripts?: Record<string, string>; // Language code -> transcript string
}

// Translations for offline / fallback clinical parameters
const PARAM_TRANSLATIONS: Record<string, Record<string, {
  name: string;
  normal: string;
  elevated?: string;
  high?: string;
  critical?: string;
  low?: string;
}>> = {
  hba1c: {
    "te-IN": {
      name: "HbA1c (గ్లైకేటెడ్ హిమోగ్లోబిన్)",
      normal: "మీ 3 నెలల సగటు బ్లడ్ షుగర్ సాధారణ పరిమితిలో ఉంది.",
      elevated: "ప్రీ-డయాబెటిస్ సంకేతం. తక్కువ జిఐ ఆహారం మరియు నడక ద్వారా అదుపులో ఉంచుకోవచ్చు.",
      critical: "డయాబెటిస్ అని తెలుస్తోంది. ఆహార నియమాలు మరియు డాక్టర్ సలహా అవసరం.",
    },
    "ta-IN": {
      name: "HbA1c (சர்க்கரை அளவு சராசரி)",
      normal: "உங்கள் 3 மாத சராசரி சர்க்கரை அளவு இயல்பாக உள்ளது.",
      elevated: "சர்க்கரை நோய் முன் நிலை. உடற்பயிற்சி மற்றும் உணவு கட்டுப்பாடு தேவை.",
      critical: "சர்க்கரை நோய் நிலை. மருத்துவரின் ஆலோசனை அவசியம்.",
    },
    "kn-IN": {
      name: "HbA1c (ಗ್ಲೈಕೇಟೆಡ್ ಹೆಮೋಗ್ಲೋಬಿನ್)",
      normal: "ನಿಮ್ಮ 3 ತಿಂಗಳ ಸರಾಸರಿ ರಕ್ತದ ಸಕ್ಕರೆ ಪ್ರಮಾಣ ಸಾಮಾನ್ಯವಾಗಿದೆ.",
      elevated: "ಪೂರ್ವ ಮಧುಮೇಹ ಲಕ್ಷಣ. ಆಹಾರ ನಿಯಂತ್ರಣ ಮತ್ತು ನಡಿಗೆ ಅಗತ್ಯ.",
      critical: "ಮಧುಮೇಹ ಲಕ್ಷಣ. ವೈದ್ಯರ ಸಲಹೆ ಪಡೆಯಿರಿ.",
    },
    "hi-IN": {
      name: "HbA1c (ग्लाइकेटेड हीमोग्लोबिन)",
      normal: "आपका 3 महीने का औसत ब्लड शुगर सामान्य सीमा में है।",
      elevated: "प्री-डायबिटीज का संकेत। कम जीआई आहार और नियमित वॉक से नियंत्रित करें।",
      critical: "डायबिटीज का संकेत। खान-पान में सुधार और डॉक्टर से परामर्श लें।",
    },
    "ml-IN": {
      name: "HbA1c (ഗ്ലൈക്കേറ്റഡ് ഹീമോഗ്ലോബിൻ)",
      normal: "നിങ്ങളുടെ 3 മാസത്തെ ശരാശരി ബ്ലഡ് ഷുഗർ സാധാരണ നിലയിലാണ്.",
      elevated: "പ്രീ-ഡയബറ്റിസ് ലക്ഷണമാണ്. ഭക്ഷണ നിയന്ത്രണം ആവശ്യമാണ്.",
      critical: "ഡയബറ്റിസ് ലക്ഷണമാണ്. ഡോക്ടറുടെ ഉപദേശം തേടുക.",
    },
    "en-IN": {
      name: "HbA1c (Glycated Hemoglobin)",
      normal: "Your 3-month average blood sugar is in healthy normal range.",
      elevated: "Indicates Prediabetes. Lifestyle modifications and low-GI diet recommended.",
      critical: "Indicates Active Diabetes. Careful sugar monitoring and physician advice strongly needed.",
    },
  },
  fbs: {
    "te-IN": {
      name: "ఫాస్టింగ్ బ్లడ్ షుగర్ (FBS)",
      normal: "మీ ఉదయం పరగడుపు షుగర్ లెవెల్స్ ఆరోగ్యకరంగా ఉన్నాయి.",
      elevated: "పరగడుపు షుగర్ కాస్త పెరిగింది. రాత్రి ఆలస్యంగా కార్బోహైడ్రేట్లు తినడం తగ్గించండి.",
      high: "పరగడుపు షుగర్ ఎక్కువ ఉంది (126 mg/dL కంటే ఎక్కువ). వైద్యుల సలహా తీసుకోండి.",
      low: "తక్కువ షుగర్ (హైపోగ్లైసీమియా). వెంటనే గ్లూకోజ్ లేదా పండ్ల రసం తీసుకోండి.",
    },
    "ta-IN": {
      name: "வெறும் வயிறு சர்க்கரை (FBS)",
      normal: "காலை வெறும் வயிற்று சர்க்கரை அளவு இயல்பாக உள்ளது.",
      elevated: "வெறும் வயிற்று சர்க்கரை சற்று உயர்ந்துள்ளது.",
      high: "வெறும் வயிற்று சர்க்கரை அதிகம். மருத்துவரை அணுகவும்.",
      low: "குறைந்த சர்க்கரை அளவு. சர்க்கரை அல்லது பழச்சாறு அருந்தவும்.",
    },
    "kn-IN": {
      name: "ಖಾಲಿ ಹೊಟ್ಟೆಯ ಸಕ್ಕರೆ (FBS)",
      normal: "ನಿಮ್ಮ ಬೆಳಗಿನ ಖಾಲಿ ಹೊಟ್ಟೆಯ ಸಕ್ಕರೆ ಪ್ರಮಾಣ ಉತ್ತಮವಾಗಿದೆ.",
      elevated: "ಖಾಲಿ ಹೊಟ್ಟೆಯ ಸಕ್ಕರೆ ಸ್ವಲ್ಪ ಹೆಚ್ಚಾಗಿದೆ.",
      high: "ಖಾಲಿ ಹೊಟ್ಟೆಯ ಸಕ್ಕರೆ ಪ್ರಮಾಣ ಹೆಚ್ಚಾಗಿದೆ. ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
      low: "ಕಡಿಮೆ ರಕ್ತದ ಸಕ್ಕರೆ. ತಕ್ಷಣವೇ ಸಕ್ಕರೆ ಅಥವಾ ಗ್ಲೂಕೋಸ್ ಸೇವಿಸಿ.",
    },
    "hi-IN": {
      name: "फास्टिंग ब्लड शुगर (FBS)",
      normal: "सुबह खाली पेट आपका ब्लड शुगर स्वस्थ सीमा में है।",
      elevated: "खाली पेट का शुगर थोड़ा बढ़ा हुआ है। रात में मीठा और भारी खाना कम करें।",
      high: "खाली पेट का शुगर अधिक है। डॉक्टर की सलाह अनुसार दवाएं लें।",
      low: "लो ब्लड शुगर (हाइपोग्लाइसीमिया)। तुरंत ग्लूकोज या जूस लें।",
    },
    "ml-IN": {
      name: "ഫാസ്റ്റിംഗ് ബ്ലഡ് ഷുഗർ (FBS)",
      normal: "രാവിലത്തെ ഫാസ്റ്റിംഗ് ബ്ലഡ് ഷുഗർ സാധാരണ നിലയിലാണ്.",
      elevated: "ഫാസ്റ്റിംഗ് ഷുഗർ അൽപ്പം കൂടുതലാണ്.",
      high: "ഫാസ്റ്റിംഗ് ഷുഗർ കൂടുതലാണ്. ഡോക്ടറെ കാണുക.",
      low: "കുറഞ്ഞ ഷുഗർ നില. ഗ്ലൂക്കോസ് കഴിക്കുക.",
    },
    "en-IN": {
      name: "Fasting Blood Sugar (FBS)",
      normal: "Your morning fasting glucose is in healthy range.",
      elevated: "Slightly elevated fasting sugar. Limit late-night carb heavy snacks.",
      high: "High fasting blood sugar (≥ 126 mg/dL). Physician review recommended.",
      low: "Low blood sugar (Hypoglycemia). Keep fast-acting carbohydrates handy.",
    },
  },
  ppbs: {
    "te-IN": {
      name: "భోజనం తర్వాత షుగర్ (PPBS)",
      normal: "భోజనం చేసిన 2 గంటల తర్వాత షుగర్ సాధారణంగా ఉంది.",
      elevated: "భోజనం తర్వాత షుగర్ కొద్దిగా పెరిగింది.",
      critical: "భోజనం తర్వాత షుగర్ చాలా ఎక్కువగా ఉంది (200 mg/dL దాటింది). అన్నం పరిమాణం తగ్గించి రోజూ నడవండి.",
    },
    "ta-IN": {
      name: "உணவுக்கு பின் சர்க்கரை (PPBS)",
      normal: "உணவுக்குப் பிந்தைய சர்க்கரை அளவு இயல்பாக உள்ளது.",
      elevated: "உணவுக்குப் பிந்தைய சர்க்கரை சற்று உயர்ந்துள்ளது.",
      critical: "உணவுக்குப் பிந்தைய சர்க்கரை அதிகம். அரிசி உணவைக் குறைக்கவும்.",
    },
    "kn-IN": {
      name: "ಊಟದ ನಂತರದ ಸಕ್ಕರೆ (PPBS)",
      normal: "ಊಟದ ನಂತರದ ಸಕ್ಕರೆ ಪ್ರಮಾಣ ಸಾಮಾನ್ಯವಾಗಿದೆ.",
      elevated: "ಊಟದ ನಂತರದ ಸಕ್ಕರೆ ಪ್ರಮಾಣ ಸ್ವಲ್ಪ ಹೆಚ್ಚಾಗಿದೆ.",
      critical: "ಊಟದ ನಂತರದ ಸಕ್ಕರೆ ಪ್ರಮಾಣ ತುಂಬಾ ಹೆಚ್ಚಾಗಿದೆ. ಅನ್ನದ ಪ್ರಮಾಣ ಕಡಿಮೆ ಮಾಡಿ.",
    },
    "hi-IN": {
      name: "खाने के बाद शुगर (PPBS)",
      normal: "खाने के 2 घंटे बाद आपका शुगर सामान्य है।",
      elevated: "खाने के बाद शुगर थोड़ा बढ़ा हुआ है।",
      critical: "खाने के बाद शुगर बहुत ज्यादा है (200 mg/dL से अधिक)। चावल/मैदा कम करें और टहलें।",
    },
    "ml-IN": {
      name: "ഭക്ഷണത്തിന് ശേഷമുള്ള ഷുഗർ (PPBS)",
      normal: "ഭക്ഷണത്തിന് ശേഷമുള്ള ഷുഗർ സാധാരണ നിലയിലാണ്.",
      elevated: "ഭക്ഷണത്തിന് ശേഷമുള്ള ഷുഗർ അൽപ്പം കൂടുതലാണ്.",
      critical: "ഭക്ഷണത്തിന് ശേഷമുള്ള ഷുഗർ വളരെ കൂടുതലാണ്.",
    },
    "en-IN": {
      name: "Postprandial Glucose (PPBS)",
      normal: "Your 2-hour post meal glucose response is normal.",
      elevated: "Moderately elevated post-meal sugar spike.",
      critical: "High post-meal sugar spike (≥ 200 mg/dL). Reduce refined carbohydrates and walk after meals.",
    },
  },
  cholesterol: {
    "te-IN": {
      name: "టోటల్ కొలెస్ట్రాల్",
      normal: "మీ కొలెస్ట్రాల్ స్థాయిలు మంచి ఆరోగ్యకర పరిమితిలో ఉన్నాయి.",
      elevated: "కొలెస్ట్రాల్ సరిహద్దులో పెరిగింది.",
      high: "కొలెస్ట్రాల్ ఎక్కువ ఉంది. వేపుళ్లు తగ్గించి పీచు పదార్థాలు ఎక్కువగా తీసుకోండి.",
    },
    "ta-IN": {
      name: "மொத்த கொலஸ்ட்ரால்",
      normal: "கொலஸ்ட்ரால் அளவு இயல்பாக உள்ளது.",
      elevated: "கொலஸ்ட்ரால் சற்று உயர்ந்துள்ளது.",
      high: "கொலஸ்ட்ரால் அதிகம். எண்ணெய் உணவுகளைக் குறைக்கவும்.",
    },
    "kn-IN": {
      name: "ಒಟ್ಟು ಕೊಲೆಸ್ಟ್ರಾಲ್",
      normal: "ನಿಮ್ಮ ಕೊಲೆಸ್ಟ್ರಾಲ್ ಪ್ರಮಾಣ ಉತ್ತಮವಾಗಿದೆ.",
      elevated: "ಕೊಲೆಸ್ಟ್ರಾಲ್ ಸ್ವಲ್ಪ ಹೆಚ್ಚಾಗಿದೆ.",
      high: "ಕೊಲೆಸ್ಟ್ರಾಲ್ ಪ್ರಮಾಣ ಹೆಚ್ಚಾಗಿದೆ. ಕರಿದ ಪದಾರ್ಥಗಳನ್ನು ಕಡಿಮೆ ಮಾಡಿ.",
    },
    "hi-IN": {
      name: "टोटल कोलेस्ट्रॉल",
      normal: "आपका कोलेस्ट्रॉल स्तर सामान्य और स्वस्थ है।",
      elevated: "कोलेस्ट्रॉल थोड़ा बढ़ा हुआ है।",
      high: "कोलेस्ट्रॉल अधिक है। तली हुई चीजें कम करें और फाइबर खाएं।",
    },
    "ml-IN": {
      name: "ടോട്ടൽ കൊളസ്ട്രോൾ",
      normal: "കൊളസ്ട്രോൾ സാധാരണ നിലയിലാണ്.",
      elevated: "കൊളസ്ട്രോൾ അൽപ്പം കൂടുതലാണ്.",
      high: "കൊളസ്ട്രോൾ കൂടുതലാണ്.",
    },
    "en-IN": {
      name: "Total Cholesterol",
      normal: "Total cholesterol level is desirable.",
      elevated: "Borderline high total cholesterol.",
      high: "High cholesterol. Increase fiber intake and reduce saturated fats.",
    },
  },
};

// Built-in clinical Regex matchers for offline fallback extraction
export function extractClinicalParametersFromText(text: string, lang: string = "en-IN"): LabParameter[] {
  const params: LabParameter[] = [];
  const langKey = PARAM_TRANSLATIONS["hba1c"][lang] ? lang : "en-IN";

  // 1. HbA1c
  const hba1cMatch = text.match(/(?:hba1c|glycated\s*hemoglobin|a1c)\D*(\d+\.?\d*)\s*%/i);
  if (hba1cMatch) {
    const val = parseFloat(hba1cMatch[1]);
    let status: LabParameter["status"] = "normal";
    const dict = PARAM_TRANSLATIONS["hba1c"][langKey];
    let explanation = dict.normal;

    if (val >= 6.5) {
      status = "critical";
      explanation = dict.critical || dict.normal;
    } else if (val >= 5.7) {
      status = "elevated";
      explanation = dict.elevated || dict.normal;
    }

    params.push({
      name: dict.name,
      value: val,
      unit: "%",
      referenceRange: "Normal: < 5.7%, Prediabetes: 5.7-6.4%, Diabetes: ≥ 6.5%",
      status,
      simplifiedExplanation: explanation,
    });
  }

  // 2. Fasting Blood Sugar
  const fbsMatch = text.match(/(?:fasting\s*sugar|fasting\s*glucose|fbs)\D*(\d+\.?\d*)\s*(?:mg\/dl)?/i);
  if (fbsMatch) {
    const val = parseFloat(fbsMatch[1]);
    let status: LabParameter["status"] = "normal";
    const dict = PARAM_TRANSLATIONS["fbs"][langKey];
    let explanation = dict.normal;

    if (val >= 126) {
      status = "high";
      explanation = dict.high || dict.normal;
    } else if (val >= 100) {
      status = "elevated";
      explanation = dict.elevated || dict.normal;
    } else if (val < 70) {
      status = "low";
      explanation = dict.low || dict.normal;
    }

    params.push({
      name: dict.name,
      value: val,
      unit: "mg/dL",
      referenceRange: "Normal: 70-99 mg/dL",
      status,
      simplifiedExplanation: explanation,
    });
  }

  // 3. Postprandial Blood Sugar (PPBS)
  const ppbsMatch = text.match(/(?:post\s*prandial|ppbs|post-meal\s*glucose)\D*(\d+\.?\d*)\s*(?:mg\/dl)?/i);
  if (ppbsMatch) {
    const val = parseFloat(ppbsMatch[1]);
    let status: LabParameter["status"] = "normal";
    const dict = PARAM_TRANSLATIONS["ppbs"][langKey];
    let explanation = dict.normal;

    if (val >= 200) {
      status = "critical";
      explanation = dict.critical || dict.normal;
    } else if (val >= 140) {
      status = "elevated";
      explanation = dict.elevated || dict.normal;
    }

    params.push({
      name: dict.name,
      value: val,
      unit: "mg/dL",
      referenceRange: "Normal: < 140 mg/dL",
      status,
      simplifiedExplanation: explanation,
    });
  }

  // 4. Total Cholesterol
  const cholMatch = text.match(/(?:total\s*cholesterol|cholesterol)\D*(\d+\.?\d*)\s*(?:mg\/dl)?/i);
  if (cholMatch) {
    const val = parseFloat(cholMatch[1]);
    let status: LabParameter["status"] = "normal";
    const dict = PARAM_TRANSLATIONS["cholesterol"][langKey];
    let explanation = dict.normal;

    if (val >= 240) {
      status = "high";
      explanation = dict.high || dict.normal;
    } else if (val >= 200) {
      status = "elevated";
      explanation = dict.elevated || dict.normal;
    }

    params.push({
      name: dict.name,
      value: val,
      unit: "mg/dL",
      referenceRange: "Desirable: < 200 mg/dL",
      status,
      simplifiedExplanation: explanation,
    });
  }

  return params;
}

// Sample lab report data for 1-click testing
export const SAMPLE_LAB_REPORTS = [
  {
    id: "sample-diabetes-panel",
    title: "Sample Diabetes & Metabolic Lab Report",
    fileName: "Diagnostic_Lab_Report_Jan2026.pdf",
    patientName: "Rahul Achari",
    age: 32,
    testDate: "2026-01-28",
    labName: "Apollo Diagnostic Labs",
    rawText: `
PATIENT REPORT - APOLLO DIAGNOSTICS
Patient Name: Rahul Achari | Age: 32 Yrs | Gender: Male | Date: 28-Jan-2026

TEST PARAMETERS & RESULTS:
1. HbA1c (Glycated Hemoglobin): 7.2 % (High) [Ref: Normal < 5.7%]
2. Fasting Blood Sugar (FBS): 142 mg/dL (High) [Ref: Normal 70 - 99 mg/dL]
3. Postprandial Glucose (PPBS): 215 mg/dL (High) [Ref: Normal < 140 mg/dL]
4. Total Cholesterol: 218 mg/dL (Borderline High) [Ref: Desirable < 200 mg/dL]
5. Serum Creatinine: 0.9 mg/dL (Normal) [Ref: 0.6 - 1.2 mg/dL]
6. Blood Pressure: 128/84 mmHg (Prehypertension)

CLINICAL IMPRESSION:
Patient shows elevated HbA1c (7.2%) indicating active Type 2 Diabetes with postprandial sugar spikes. Kidney function parameters are normal. Recommended physician review for medication adjustment and carb-restricted South Indian diet.
    `,
  },
  {
    id: "sample-prediabetes",
    title: "Sample Prediabetes & Health Screen Report",
    fileName: "Apollo_Health_Checkup_Report.pdf",
    patientName: "Anitha Sharma",
    age: 45,
    testDate: "2026-02-02",
    labName: "Thyrocare Technologies",
    rawText: `
THYROCARE WELLNESS REPORT
Patient Name: Anitha Sharma | Age: 45 Yrs | Gender: Female | Date: 02-Feb-2026

TEST PARAMETERS & RESULTS:
1. HbA1c: 6.1 % (Prediabetes) [Ref: Normal < 5.7%]
2. Fasting Blood Sugar: 108 mg/dL (Elevated) [Ref: Normal 70 - 99 mg/dL]
3. Postprandial Glucose: 155 mg/dL (Elevated) [Ref: Normal < 140 mg/dL]
4. Total Cholesterol: 185 mg/dL (Normal)
5. Serum Creatinine: 0.8 mg/dL (Normal)

CLINICAL IMPRESSION:
Prediabetes detected. Lifestyle modifications, 30-minute daily brisk walks, low-GI foods, and weight management can effectively reverse prediabetes.
    `,
  },
];
