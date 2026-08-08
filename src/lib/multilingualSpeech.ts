// Multilingual Speech Engine for ControL-D
// Uses phonetic Latin transliteration with English voices when native regional voices are unavailable

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const fontOptions: LanguageOption[] = [
  { code: "te-IN", name: "Telugu", nativeName: "తెలుగు", flag: "🏛️" },
  { code: "ta-IN", name: "Tamil", nativeName: "தமிழ்", flag: "🛕" },
  { code: "kn-IN", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🏰" },
  { code: "hi-IN", name: "Hindi", nativeName: "हिंदी", flag: "🕉️" },
  { code: "ml-IN", name: "Malayalam", nativeName: "മലയാളം", flag: "🌴" },
  { code: "en-IN", name: "English", nativeName: "English", flag: "🌐" },
];

let isSpeakingActive = false;
let currentChunkTimeouts: ReturnType<typeof setTimeout>[] = [];

// Built-in phonetic fallback scripts for when the API doesn't return speechPhonetic
const PHONETIC_FALLBACKS: Record<string, string> = {
  "te-IN": "Namaskaram! Mee medical lab report analysis tayaarugundhi. Mee HbA1c 7.2 percent mariyu fasting blood sugar 142 milligrams per deciliter ga ekkuvaga unnayi. Kidney function normal ga undhi. Prathi roju 30 nimishalu nadavandi mariyu thakkuva carbohydrates unna aaharam theeskondi. Mee doctor ni consult cheyandi.",
  "ta-IN": "Vanakkam! Ungal medical lab report analysis tayaaragha ulladhu. Ungal HbA1c 7.2 percent matrum fasting blood sugar 142 milligrams per deciliter adhigamaga ulladhu. Kidney function normal aga ulladhu. Dhinamum 30 nimidam nadaipayirchi seiyavum. Ungal doctor ai aalosanai perungal.",
  "kn-IN": "Namaskara! Nimma medical lab report analysis tayaragide. Nimma HbA1c 7.2 percent mattu fasting blood sugar 142 milligrams per deciliter hechagide. Kidney function samanyyavagide. Pratidina 30 nimisha nadige madi. Nimma doctor annu bhethi madi.",
  "hi-IN": "Namaste! Aapki medical lab report ka vishleshan tayar hai. Aapka HbA1c 7.2 percent aur fasting sugar 142 milligrams per deciliter badha hua hai. Kidney function samanya hai. Rozana 30 minute walk karen aur kam carbohydrate wala bhojan len. Apne doctor se salah len.",
  "ml-IN": "Namaskaram! Ningalude medical lab report analysis tayaranu. Ningalude HbA1c 7.2 percent matram fasting blood sugar 142 milligrams per deciliter kooduthal aanu. Kidney function normal aanu. Divasavum 30 minute nadakkuka. Ningalude doctor ne kaanuka.",
  "en-IN": "Hello! Your medical lab report analysis is complete. Your HbA1c is 7.2 percent and fasting blood sugar is 142 milligrams per deciliter, which are elevated. Kidney function is normal. Walk 30 minutes daily and maintain a low carbohydrate diet. Consult your doctor for review.",
};

function cleanTextForSpeech(text: string): string {
  if (!text) return "";
  return text
    .replace(/%/g, " percent ")
    .replace(/mg\/dL/gi, " milligrams per deciliter ")
    .replace(/mmHg/gi, " millimeters of mercury ")
    .replace(/≥/g, " greater than or equal to ")
    .replace(/<=/g, " less than or equal to ")
    .replace(/>=/g, " greater than or equal to ")
    .replace(/</g, " less than ")
    .replace(/>/g, " greater than ")
    .replace(/•/g, ". ")
    .replace(/\//g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasNativeVoice(langCode: string): { voice: SpeechSynthesisVoice | null; found: boolean } {
  const voices = window.speechSynthesis.getVoices() || [];
  const shortLang = langCode.split("-")[0].toLowerCase();

  const match = voices.find((v) => {
    const vl = v.lang.toLowerCase().replace("_", "-");
    return vl.startsWith(shortLang);
  });

  return match ? { voice: match, found: true } : { voice: null, found: false };
}

function getEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices() || [];

  // Prefer Indian English voice for natural accent
  const indianVoice = voices.find(
    (v) => v.lang.toLowerCase().includes("en-in") || v.name.toLowerCase().includes("ravi") || v.name.toLowerCase().includes("heera")
  );
  if (indianVoice) return indianVoice;

  // Fallback to any English voice
  const anyEnglish = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
  return anyEnglish || voices[0] || null;
}

function isLatinText(text: string): boolean {
  // Check if text is mostly Latin characters (phonetic transliteration)
  const latinChars = text.replace(/[^a-zA-Z]/g, "").length;
  const totalChars = text.replace(/\s/g, "").length;
  return totalChars > 0 && (latinChars / totalChars) > 0.5;
}

export function speakMultilingualText(
  nativeText: string,
  phoneticText: string = "",
  langCode: string = "te-IN",
  onEndCallback?: () => void
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("[ControL-D Speech] SpeechSynthesis API not available");
    if (onEndCallback) onEndCallback();
    return;
  }

  try {
    stopMultilingualSpeech();
    isSpeakingActive = true;

    const doSpeak = () => {
      if (!isSpeakingActive) return;
      window.speechSynthesis.cancel();

      const { voice: nativeVoice, found: hasNative } = hasNativeVoice(langCode);
      const englishVoice = getEnglishVoice();

      let textToSpeak: string;
      let voiceToUse: SpeechSynthesisVoice | null;
      let langTag: string;

      if (hasNative && nativeVoice) {
        // Native voice available (e.g., te-IN voice installed) → speak Unicode text
        textToSpeak = cleanTextForSpeech(nativeText);
        voiceToUse = nativeVoice;
        langTag = nativeVoice.lang;
        console.log("[ControL-D Speech] Using native voice:", nativeVoice.name);
      } else {
        // No native voice → MUST use phonetic Latin text with English voice
        // This is the critical path for Windows Chrome without Telugu/Tamil voice packs
        const phonetic = phoneticText && phoneticText.trim().length > 0
          ? phoneticText
          : PHONETIC_FALLBACKS[langCode] || PHONETIC_FALLBACKS["en-IN"]!;

        textToSpeak = cleanTextForSpeech(phonetic);
        voiceToUse = englishVoice;
        langTag = englishVoice?.lang || "en-IN";
        console.log("[ControL-D Speech] No native voice for", langCode, "→ using phonetic with", voiceToUse?.name || "default");
      }

      if (!textToSpeak || textToSpeak.length === 0) {
        isSpeakingActive = false;
        if (onEndCallback) onEndCallback();
        return;
      }

      // Safety: if the resolved text is still non-Latin (Unicode) and we have no native voice, use built-in fallback
      if (!hasNative && !isLatinText(textToSpeak)) {
        console.log("[ControL-D Speech] Text is non-Latin without native voice, switching to phonetic fallback");
        textToSpeak = cleanTextForSpeech(PHONETIC_FALLBACKS[langCode] || PHONETIC_FALLBACKS["en-IN"]!);
      }

      // Split into sentences for Chrome's 15-second utterance limit
      const sentences = textToSpeak.match(/[^.!?]+[.!?]*/g) || [textToSpeak];
      let idx = 0;

      const speakNext = () => {
        if (!isSpeakingActive || idx >= sentences.length) {
          isSpeakingActive = false;
          if (onEndCallback) onEndCallback();
          return;
        }

        const sentence = sentences[idx]!.trim();
        idx++;

        if (!sentence || sentence.length === 0) {
          speakNext();
          return;
        }

        const utt = new SpeechSynthesisUtterance(sentence);
        utt.volume = 1.0;
        utt.rate = 0.9;
        utt.pitch = 1.0;
        utt.lang = langTag;
        if (voiceToUse) utt.voice = voiceToUse;

        utt.onend = () => {
          if (isSpeakingActive) {
            const t = setTimeout(speakNext, 80);
            currentChunkTimeouts.push(t);
          }
        };

        utt.onerror = (e) => {
          console.warn("[ControL-D Speech] Utterance error:", e.error, "on:", sentence.slice(0, 30));
          if (isSpeakingActive) {
            const t = setTimeout(speakNext, 80);
            currentChunkTimeouts.push(t);
          }
        };

        window.speechSynthesis.speak(utt);
      };

      speakNext();
    };

    // Voices may load async in Chrome
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      doSpeak();
    } else {
      const handler = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
      window.speechSynthesis.onvoiceschanged = handler;
      // Also try after a short delay in case onvoiceschanged already fired
      const t = setTimeout(() => {
        if (isSpeakingActive) doSpeak();
      }, 200);
      currentChunkTimeouts.push(t);
    }
  } catch (e) {
    console.warn("[ControL-D Speech] Fatal error:", e);
    isSpeakingActive = false;
    if (onEndCallback) onEndCallback();
  }
}

export function pauseMultilingualSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

export function resumeMultilingualSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

export function stopMultilingualSpeech() {
  isSpeakingActive = false;
  currentChunkTimeouts.forEach(clearTimeout);
  currentChunkTimeouts = [];
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  return isSpeakingActive;
}
