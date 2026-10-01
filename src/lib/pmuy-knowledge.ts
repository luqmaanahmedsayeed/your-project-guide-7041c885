/**
 * SAHAYI knowledge layer — Pradhan Mantri Ujjwala Yojana (PMUY) only.
 *
 * This is the single source of truth the reasoning layer is allowed to use.
 * It is intentionally separate from any UI code so it can be maintained and
 * verified independently. Nothing here may be invented: if a fact is not in
 * this file, SAHAYI must say it does not have verified information and point
 * the user to the official portal.
 */

export type Lang = "en" | "hi";

export const OFFICIAL_PMUY_URL = "https://www.pmuy.gov.in/";

export interface KnowledgeTopic {
  id: string;
  /** keywords used by the deterministic matcher (both scripts) */
  match: string[];
  answer: Record<Lang, string>;
  /** simpler re-phrasing of the same meaning */
  simple: Record<Lang, string>;
  bullets?: Record<Lang, string[]>;
}

export const pmuyKnowledge = {
  scheme: {
    name: { en: "Pradhan Mantri Ujjwala Yojana", hi: "प्रधानमंत्री उज्ज्वला योजना" },
    purpose: {
      en: "A government scheme that provides an LPG (cooking gas) connection to women of eligible households.",
      hi: "यह एक सरकारी योजना है जो पात्र परिवारों की महिलाओं को एलपीजी (रसोई गैस) कनेक्शन देती है।",
    },
  },
  officialPortal: OFFICIAL_PMUY_URL,
  topics: [
    {
      id: "eligibility",
      match: [
        "eligib",
        "qualify",
        "can i apply",
        "am i",
        "पात्र",
        "योग्य",
        "आवेदन कर सकती",
        "उम्र",
      ],
      answer: {
        en: "You may be eligible if you are 18 years or older and your household does not already have an LPG connection.",
        hi: "यदि आपकी उम्र 18 वर्ष या उससे अधिक है और आपके घर में पहले से LPG कनेक्शन नहीं है, तो आप पात्र हो सकती हैं।",
      },
      simple: {
        en: "If you are 18 or older, and no gas connection is in your home yet, you can probably apply.",
        hi: "अगर आपकी उम्र 18 साल या ज़्यादा है और घर में अभी गैस कनेक्शन नहीं है, तो आप आवेदन कर सकती हैं।",
      },
    },
    {
      id: "documents",
      match: [
        "document",
        "paper",
        "proof",
        "aadhaar",
        "kyc",
        "दस्तावेज़",
        "दस्तावेज",
        "कागज",
        "आधार",
      ],
      answer: {
        en: "Here are the documents you may need for your application:",
        hi: "आवेदन के लिए आपको ये दस्तावेज़ चाहिए हो सकते हैं:",
      },
      simple: {
        en: "You will need a few identity papers. Keep them ready before you apply.",
        hi: "आपको पहचान से जुड़े कुछ ज़रूरी कागज़ देने होंगे। आवेदन से पहले उन्हें तैयार रखें।",
      },
      bullets: {
        en: [
          "Aadhaar card",
          "Address proof",
          "Bank account details",
          "KYC documents (if required)",
        ],
        hi: [
          "आधार कार्ड",
          "पते का प्रमाण",
          "बैंक खाते की जानकारी",
          "KYC दस्तावेज़ (यदि आवश्यक हो)",
        ],
      },
    },
    {
      id: "apply",
      match: ["how do i apply", "apply", "process", "आवेदन कैसे", "प्रक्रिया", "कैसे करें"],
      answer: {
        en: "The application is made on the official PMUY website. SAHAYI will help you get ready, then take you there.",
        hi: "आवेदन आधिकारिक PMUY वेबसाइट पर होता है। SAHAYI आपको तैयार करने में मदद करेगी, फिर वहाँ ले जाएगी।",
      },
      simple: {
        en: "You apply on the government website. I will show you what to keep ready first.",
        hi: "आवेदन सरकारी वेबसाइट पर करना होता है। पहले मैं बताऊँगी क्या तैयार रखना है।",
      },
      bullets: {
        en: [
          "Check your eligibility",
          "Keep your documents ready",
          "Apply on the official PMUY website",
        ],
        hi: ["अपनी पात्रता देखें", "अपने दस्तावेज़ तैयार रखें", "आधिकारिक PMUY वेबसाइट पर आवेदन करें"],
      },
    },
    {
      id: "benefit",
      match: ["what is", "scheme", "ujjwala", "benefit", "क्या है", "योजना", "उज्ज्वला", "लाभ"],
      answer: {
        en: "Pradhan Mantri Ujjwala Yojana is a government scheme that provides an LPG cooking gas connection to women of eligible households.",
        hi: "प्रधानमंत्री उज्ज्वला योजना एक सरकारी योजना है जो पात्र परिवारों की महिलाओं को एलपीजी रसोई गैस कनेक्शन देती है।",
      },
      simple: {
        en: "It is a government scheme that gives a cooking gas connection to women of eligible homes.",
        hi: "यह सरकारी योजना पात्र घरों की महिलाओं को रसोई गैस कनेक्शन देती है।",
      },
    },
  ] as KnowledgeTopic[],

  /** Used whenever the knowledge layer has no verified answer. */
  unknown: {
    en: "I don't have enough verified information to answer that. You can open the official PMUY website for more information.",
    hi: "मेरे पास इसका पक्का जवाब नहीं है। अधिक जानकारी के लिए आप आधिकारिक PMUY वेबसाइट खोल सकती हैं।",
  },

  verifyNote: {
    en: "Please check the official website for the latest list of documents.",
    hi: "कृपया नवीनतम सूची के लिए आधिकारिक वेबसाइट देखें।",
  },
} as const;

/** Deterministic, offline answer used as the demo/development behaviour. */
export function answerFromKnowledge(question: string, lang: Lang) {
  const q = question.toLowerCase();
  const topic = pmuyKnowledge.topics.find((t) => t.match.some((m) => q.includes(m)));
  if (!topic) {
    return { topicId: "unknown", text: pmuyKnowledge.unknown[lang], bullets: [] as string[] };
  }
  return {
    topicId: topic.id,
    text: topic.answer[lang],
    bullets: topic.bullets?.[lang] ?? [],
  };
}

export function simplifyFromKnowledge(topicId: string, lang: Lang) {
  const topic = pmuyKnowledge.topics.find((t) => t.id === topicId);
  return topic ? topic.simple[lang] : pmuyKnowledge.unknown[lang];
}
