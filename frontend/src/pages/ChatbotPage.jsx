import { useEffect, useRef, useState } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Trash2, Bot, User, Loader2, AlertCircle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { chatApi } from "../services/resources";
import { useAuth } from "../context/AuthContext";

const SUGGESTED_PROMPTS = [
  "Find available books",
  "Show my borrowed books",
  "Check my due dates",
  "Find Python books",
  "Do I have any outstanding fines?",
  "What categories are available?",
];

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: "assistant", text: `Hi ${user?.full_name?.split(" ")[0] || ""}! I'm your AI Library Assistant. Ask me about books, your borrowed items, due dates, or fines.` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [speakingEnabled, setSpeakingEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const speak = (text) => {
    if (!speakingEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const { data } = await chatApi.send(trimmed);
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
      speak(data.reply);
    } catch (err) {
      setError(err.message);
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, I couldn't process that. Please try again.", isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    stopSpeaking();
    setMessages([{ role: "assistant", text: "Chat cleared. What would you like to know?" }]);
    setError("");
  };

  return (
    <div className="flex h-screen flex-col p-8">
      <PageHeader
        title="AI Library Assistant"
        subtitle="Ask about books, availability, your loans, due dates, and fines"
        action={
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => setSpeakingEnabled((s) => !s)} title="Toggle voice replies">
              {speakingEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button className="btn-secondary" onClick={clearChat}>
              <Trash2 size={16} /> Clear
            </button>
          </div>
        }
      />

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto rounded-card border border-forest/10 bg-white p-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
              m.role === "user" ? "bg-brass/20 text-brass-dark" : "bg-forest/10 text-forest"
            }`}>
              {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[75%] rounded-card px-4 py-2.5 text-sm ${
              m.role === "user"
                ? "bg-forest text-paper"
                : m.isError
                ? "border border-stamp-red/30 bg-stamp-red/5 text-stamp-red"
                : "bg-paper-dim text-ink"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
              <Bot size={16} />
            </div>
            <div className="flex items-center gap-2 rounded-card bg-paper-dim px-4 py-2.5 text-sm text-ink-light">
              <Loader2 size={14} className="animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((p) => (
            <button key={p} className="rounded-full border border-forest/20 bg-white px-3 py-1.5 text-xs text-forest-dark hover:bg-paper-dim"
              onClick={() => sendMessage(p)}>
              {p}
            </button>
          ))}
        </div>
      )}

      {!speechSupported && (
        <div className="mt-3 flex items-center gap-2 text-xs text-ink-light">
          <AlertCircle size={13} /> Voice input isn't supported in this browser — try Chrome or Edge.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          className="input flex-1"
          placeholder={listening ? "Listening…" : "Ask about books, due dates, fines…"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        {speechSupported && (
          <button type="button" onClick={toggleListening}
            className={listening ? "btn-danger" : "btn-secondary"} title="Voice input">
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
