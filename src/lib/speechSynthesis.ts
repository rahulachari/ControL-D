// Web Speech Synthesis API for Medication Voice Alarms & Reminders

let voiceLoopTimer: any = null;
let isLoopingActive = false;

// Single-shot speech (e.g. for testing voice preview in form or button)
export function speakMedicationAlert(name: string, dosage?: string, timing?: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  try {
    window.speechSynthesis.cancel();

    const cleanName = name || "your medication";
    const cleanDosage = dosage ? `, dosage ${dosage}` : "";
    const cleanTiming = timing ? `, take ${timing.replace(/_/g, " ")} food` : "";
    
    const textToSpeak = `Attention! Medication reminder. Time to take ${cleanName}${cleanDosage}${cleanTiming}. Please take your medicine now.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.volume = 1.0;
    utterance.rate = 0.88;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Google") ||
         v.name.includes("Natural") ||
         v.name.includes("Enhanced") ||
         v.name.includes("Samantha") ||
         v.name.includes("Zira") ||
         v.name.includes("David") ||
         v.name.includes("Daniel"))
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("Web Speech synthesis warning:", e);
  }
}

// Continuous repeating voice alarm loop until user marks taken or stops alarm
export function startRepeatingVoiceAlert(name: string, dosage?: string, timing?: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  stopSpeech();
  isLoopingActive = true;

  const cleanName = name || "your medication";
  const cleanDosage = dosage ? `, dosage ${dosage}` : "";
  const cleanTiming = timing ? `, take ${timing.replace(/_/g, " ")} food` : "";
  const textToSpeak = `Attention! Medication reminder. Time to take ${cleanName}${cleanDosage}${cleanTiming}. Please take your medicine now.`;

  const speakOnce = () => {
    if (!isLoopingActive) return;
    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.volume = 1.0;
      utterance.rate = 0.88;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") ||
           v.name.includes("Natural") ||
           v.name.includes("Enhanced") ||
           v.name.includes("Samantha") ||
           v.name.includes("Zira") ||
           v.name.includes("David") ||
           v.name.includes("Daniel"))
      ) || voices.find((v) => v.lang.startsWith("en"));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        if (isLoopingActive) {
          voiceLoopTimer = setTimeout(speakOnce, 2000); // 2 second gap between repeats
        }
      };

      utterance.onerror = () => {
        if (isLoopingActive) {
          voiceLoopTimer = setTimeout(speakOnce, 3000);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis repeating loop error:", e);
    }
  };

  speakOnce();
}

export function stopSpeech() {
  isLoopingActive = false;
  if (voiceLoopTimer) {
    clearTimeout(voiceLoopTimer);
    voiceLoopTimer = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
