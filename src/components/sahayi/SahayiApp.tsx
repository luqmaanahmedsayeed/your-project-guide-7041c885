import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { t, type Lang } from "@/lib/i18n";
import { OFFICIAL_PMUY_URL } from "@/lib/pmuy-knowledge";
import { getPortalUrl, reasonAnswer } from "@/lib/sahayi.functions";
import { useVoiceInput, useVoiceOutput } from "@/hooks/use-voice";
import { LanguageSelection } from "./LanguageSelection";
import { AssistantHome } from "./AssistantHome";
import { VoiceListening } from "./VoiceListening";
import { Conversation, type Message } from "./Conversation";
import { GuidedApply } from "./GuidedApply";
import { PortalHandoff } from "./PortalHandoff";

type Screen = "language" | "home" | "listening" | "chat" | "apply" | "handoff";
type ApplyStage = "age" | "lpg" | "notEligible" | "documents";

function clock(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

let counter = 0;
function nextId(): string {
  counter += 1;
  return `m${counter}`;
}

/** One continuous guided experience: all eight reference states in one flow. */
export function SahayiApp() {
  const [lang, setLang] = useState<Lang>("en");
  const [screen, setScreen] = useState<Screen>("language");
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyStage, setApplyStage] = useState<ApplyStage>("age");
  const [portal, setPortal] = useState(OFFICIAL_PMUY_URL);
  const requestIdRef = useRef(0);
  const [eligibilityState, setEligibilityState] = useState({
    age18OrOlder: null as boolean | null,
    hasLpgConnection: null as boolean | null,
    isEligible: null as boolean | null,
    blockedReason: null as string | null,
  });

  const s = t(lang);
  const ask = useServerFn(reasonAnswer);
  const loadPortal = useServerFn(getPortalUrl);
  const voiceIn = useVoiceInput(lang);
  const voiceOut = useVoiceOutput(lang);

  useEffect(() => {
    loadPortal({})
      .then((result) => setPortal(result.url))
      .catch(() => undefined);
  }, [loadPortal]);

  const runQuestion = useCallback(
    async (question: string, useVoice = false) => {
      const requestId = ++requestIdRef.current;
      setError(null);
      setScreen("chat");
      const history = messages.map((message) => ({
        role: message.role === "user" ? ("user" as const) : ("assistant" as const),
        content: message.text,
      }));
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user", text: question, time: clock() },
      ]);
      setPending(true);
      try {
        const result = await ask({
          data: { question, lang, history, simplify: false },
        });
        if (!result.ok) throw new Error("unavailable");
        if (requestId !== requestIdRef.current) return;
        const answer: Message = {
          id: nextId(),
          role: "sahayi",
          text: result.text,
          bullets: result.bullets,
          note: result.bullets.length ? s.docsIntro && undefined : undefined,
          time: clock(),
          topicId: result.topicId,
          nextLabel: result.bullets.length ? s.viewProcess : s.nextStep,
        };
        setMessages((prev) => [...prev, answer]);
        if (useVoice) {
          void voiceOut.play(answer.id, [answer.text, ...(answer.bullets ?? [])].join(". "));
        }
      } catch {
        setError(s.errAi);
      } finally {
        setPending(false);
      }
    },
    [ask, lang, messages, s, voiceOut],
  );

  const handleAsk = useCallback(
    (question: string) => {
      if (question === s.helpMeApply) {
        setApplyStage("age");
        setScreen("apply");
        return;
      }
      void runQuestion(question);
    },
    [runQuestion, s.helpMeApply],
  );

  const startVoice = useCallback(async () => {
    setError(null);
    setScreen("listening");
    try {
      const text = await voiceIn.listen();
      if (!text) {
        setScreen("home");
        setError(s.errVoice);
        return;
      }
      void runQuestion(text, true);
    } catch {
      setScreen("home");
      setError(s.errMic);
    }
  }, [runQuestion, s.errMic, s.errVoice, voiceIn]);

  const handleListen = useCallback(
    async (message: Message) => {
      if (voiceOut.speakingId === message.id) {
        voiceOut.stop();
        return;
      }
      const spoken = [message.text, ...(message.bullets ?? [])].join(". ");
      const played = await voiceOut.play(message.id, spoken);
      if (!played) setError(s.errTts);
    },
    [s.errTts, voiceOut],
  );

  const handleSimplify = useCallback(
    async (message: Message) => {
      setPending(true);
      setError(null);
      try {
        const result = await ask({
          data: {
            question: message.text,
            lang,
            history: [{ role: "assistant" as const, content: message.text }],
            simplify: true,
            previousTopicId: message.topicId,
          },
        });
        if (!result.ok) throw new Error("unavailable");
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "sahayi",
            text: result.text,
            time: clock(),
            topicId: message.topicId,
            nextLabel: s.nextStep,
          },
        ]);
      } catch {
        setError(s.errAi);
      } finally {
        setPending(false);
      }
    },
    [ask, lang, s.errAi, s.nextStep],
  );

  const handleNextStep = useCallback(() => {
    setApplyStage("age");
    setScreen("apply");
  }, []);

  if (screen === "language") {
    return (
      <LanguageSelection
        onSelect={(selected) => {
          setLang(selected);
          setScreen("home");
        }}
      />
    );
  }

  if (screen === "listening") {
    return (
      <VoiceListening
        lang={lang}
        onBack={() => {
          voiceIn.stop();
          setScreen("home");
        }}
        onStop={() => voiceIn.stop()}
      />
    );
  }

  if (screen === "apply") {
    const back = () => setScreen(messages.length ? "chat" : "home");

    if (applyStage === "age") {
      return (
        <GuidedApply
          lang={lang}
          step={0}
          intro={s.applyIntro}
          question={s.q18}
          onYes={() => setApplyStage("lpg")}
          onNo={() => setApplyStage("notEligible")}
          onBack={back}
        />
      );
    }
    if (applyStage === "lpg") {
      return (
        <GuidedApply
          lang={lang}
          step={0}
          question={s.qLpg}
          onYes={() => setApplyStage("notEligible")}
          onNo={() => setApplyStage("documents")}
          onBack={() => setApplyStage("age")}
        />
      );
    }
    if (applyStage === "notEligible") {
      return (
        <GuidedApply
          lang={lang}
          step={0}
          question={s.notEligible}
          primaryLabel={s.openPortal}
          onPrimary={() => setScreen("handoff")}
          onBack={() => setApplyStage("age")}
        />
      );
    }
    return (
      <GuidedApply
        lang={lang}
        step={1}
        question={s.docsIntro}
        bullets={
          lang === "hi"
            ? [
                "आधार कार्ड",
                "पते का प्रमाण",
                "बैंक खाते की जानकारी",
                "KYC दस्तावेज़ (यदि आवश्यक हो)",
              ]
            : [
                "Aadhaar card",
                "Address proof",
                "Bank account details",
                "KYC documents (if required)",
              ]
        }
        note={
          lang === "hi"
            ? "कृपया नवीनतम सूची के लिए आधिकारिक वेबसाइट देखें।"
            : "Please check the official website for the latest list of documents."
        }
        primaryLabel={s.docsReady}
        onPrimary={() => setScreen("handoff")}
        onBack={() => setApplyStage("lpg")}
      />
    );
  }

  if (screen === "handoff") {
    return <PortalHandoff lang={lang} portalUrl={portal} onBack={() => setScreen("apply")} />;
  }

  if (screen === "chat" && (messages.length > 0 || pending)) {
    return (
      <Conversation
        lang={lang}
        messages={messages}
        pending={pending}
        error={error}
        step={null}
        speakingId={voiceOut.speakingId}
        onAsk={handleAsk}
        onListen={handleListen}
        onSimplify={handleSimplify}
        onNextStep={handleNextStep}
        onStartVoice={startVoice}
      />
    );
  }

  return (
    <>
      <AssistantHome lang={lang} onStartVoice={startVoice} onAsk={handleAsk} />
      {error ? (
        <p
          role="alert"
          className="mx-auto -mt-2 max-w-5xl px-4 pb-8 font-body text-base text-foreground sm:px-6"
        >
          {error}
        </p>
      ) : null}
    </>
  );
}
