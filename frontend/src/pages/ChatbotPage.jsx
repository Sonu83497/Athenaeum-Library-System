import { useEffect, useRef, useState } from "react";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Bot,
  User,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

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
  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    null
  );
}


function getErrorMessage(error) {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  // Our normalized Axios error
  if (error.message) {
    return error.message;
  }

  // Axios fallback
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (typeof error.response?.data === "string") {
    return error.response.data;
  }

  if (error.code === "ERR_NETWORK") {
    return "Unable to connect to the library backend.";
  }

  return "The AI Assistant could not process your request.";
}


export default function ChatbotPage() {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [listening, setListening] = useState(false);

  const [speakingEnabled, setSpeakingEnabled] = useState(true);

  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef(null);

  const scrollRef = useRef(null);


  /*
  |--------------------------------------------------------------------------
  | INITIAL / USER MESSAGE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const firstName =
      user?.full_name?.split(" ")?.[0] || "";

    setMessages([
      {
        role: "assistant",
        text:
          `Hi ${firstName}! I'm your AI Library Assistant. ` +
          "Ask me about books, your borrowed items, due dates, or fines.",
      },
    ]);
  }, [user]);


  /*
  |--------------------------------------------------------------------------
  | SPEECH RECOGNITION
  |--------------------------------------------------------------------------
  */

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
      const transcript =
        event.results?.[0]?.[0]?.transcript || "";

      setInput(transcript);
      setListening(false);
    };


    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
      setListening(false);
    };


    recognition.onend = () => {
      setListening(false);
    };


    recognitionRef.current = recognition;


    return () => {
      try {
        recognition.stop();
      } catch {
        // Ignore stop errors during unmount.
      }
    };
  }, []);


  /*
  |--------------------------------------------------------------------------
  | AUTO SCROLL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);


  /*
  |--------------------------------------------------------------------------
  | TEXT TO SPEECH
  |--------------------------------------------------------------------------
  */

  const speak = (text) => {
    if (
      !speakingEnabled ||
      !window.speechSynthesis ||
      !text
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  };


  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
  };


  /*
  |--------------------------------------------------------------------------
  | VOICE INPUT
  |--------------------------------------------------------------------------
  */

  const toggleListening = () => {
    if (!recognitionRef.current) {
      return;
    }

    if (listening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore.
      }

      setListening(false);
      return;
    }

    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (error) {
      console.error(
        "Unable to start speech recognition:",
        error
      );

      setListening(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | SEND MESSAGE
  |--------------------------------------------------------------------------
  */

  const sendMessage = async (text) => {
    const trimmed = text.trim();

    if (!trimmed || loading) {
      return;
    }

    // Add user's message immediately.
    setMessages((current) => [
      ...current,
      {
        role: "user",
        text: trimmed,
      },
    ]);

    setInput("");
    setLoading(true);
    setError("");


    try {
      console.log(
        "[AI Assistant] Sending message:",
        trimmed
      );

      const response = await chatApi.send(trimmed);

      console.log(
        "[AI Assistant] Backend response:",
        response
      );

      const reply = response?.data?.reply;

      if (!reply) {
        throw new Error(
          "The backend returned an empty AI response."
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: reply,
        },
      ]);

      speak(reply);

    } catch (err) {
      console.error(
        "[AI Assistant] Request failed:",
        err
      );

      const errorMessage = getErrorMessage(err);

      setError(errorMessage);

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      | Show the real backend error instead of hiding it behind
      | "Sorry, I couldn't process that."
      |--------------------------------------------------------------------------
      */

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: errorMessage,
          isError: true,
        },
      ]);

    } finally {
      setLoading(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | FORM SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = (event) => {
    event.preventDefault();

    sendMessage(input);
  };


  /*
  |--------------------------------------------------------------------------
  | CLEAR CHAT
  |--------------------------------------------------------------------------
  */

  const clearChat = () => {
    stopSpeaking();

    const firstName =
      user?.full_name?.split(" ")?.[0] || "";

    setMessages([
      {
        role: "assistant",
        text:
          `Hi ${firstName}! Chat cleared. ` +
          "What would you like to know?",
      },
    ]);

    setInput("");
    setError("");
  };


  /*
  |--------------------------------------------------------------------------
  | RETRY
  |--------------------------------------------------------------------------
  */

  const retryLastMessage = () => {
    const lastUserMessage =
      [...messages]
        .reverse()
        .find((message) => message.role === "user");

    if (!lastUserMessage) {
      return;
    }

    sendMessage(lastUserMessage.text);
  };


  return (
    <div className="flex h-screen flex-col p-8">

      <PageHeader
        title="AI Library Assistant"
        subtitle="Ask about books, availability, your loans, due dates, and fines"

        action={
          <div className="flex gap-2">

            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                setSpeakingEnabled(
                  (enabled) => !enabled
                )
              }
              title={
                speakingEnabled
                  ? "Disable voice replies"
                  : "Enable voice replies"
              }
            >
              {speakingEnabled ? (
                <Volume2 size={16} />
              ) : (
                <VolumeX size={16} />
              )}
            </button>


            <button
              type="button"
              className="btn-secondary"
              onClick={clearChat}
            >
              <Trash2 size={16} />
              Clear
            </button>

          </div>
        }
      />


      {/* ============================================================
          CHAT AREA
      ============================================================ */}

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-card border border-forest/10 bg-white p-5"
      >

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex gap-3 ${
              message.role === "user"
                ? "flex-row-reverse"
                : ""
            }`}
          >

            {/* Avatar */}

            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                message.role === "user"
                  ? "bg-brass/20 text-brass-dark"
                  : "bg-forest/10 text-forest"
              }`}
            >
              {message.role === "user" ? (
                <User size={16} />
              ) : (
                <Bot size={16} />
              )}
            </div>


            {/* Message */}

            <div
              className={`max-w-[75%] rounded-card px-4 py-2.5 text-sm ${
                message.role === "user"
                  ? "bg-forest text-paper"
                  : message.isError
                  ? "border border-stamp-red/30 bg-stamp-red/5 text-stamp-red"
                  : "bg-paper-dim text-ink"
              }`}
            >
              {message.text}
            </div>

          </div>
        ))}


        {/* Loading */}

        {loading && (
          <div className="flex gap-3">

            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
              <Bot size={16} />
            </div>

            <div className="flex items-center gap-2 rounded-card bg-paper-dim px-4 py-2.5 text-sm text-ink-light">
              <Loader2
                size={14}
                className="animate-spin"
              />

              Thinking…
            </div>

          </div>
        )}

      </div>


      {/* ============================================================
          ERROR PANEL
      ============================================================ */}

      {error && (
        <div className="mt-3 flex items-start justify-between gap-3 rounded-card border border-stamp-red/30 bg-stamp-red/5 px-4 py-3 text-sm text-stamp-red">

          <div className="flex items-start gap-2">

            <AlertCircle
              size={16}
              className="mt-0.5 flex-shrink-0"
            />

            <div>
              <div className="font-semibold">
                AI Assistant Error
              </div>

              <div className="mt-1 break-words">
                {error}
              </div>
            </div>

          </div>


          <button
            type="button"
            onClick={retryLastMessage}
            disabled={loading}
            className="flex flex-shrink-0 items-center gap-1 rounded-md border border-stamp-red/20 px-2 py-1 text-xs hover:bg-stamp-red/10 disabled:opacity-50"
          >
            <RefreshCw size={13} />
            Retry
          </button>

        </div>
      )}


      {/* ============================================================
          SUGGESTED PROMPTS
      ============================================================ */}

      {messages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">

          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="rounded-full border border-forest/20 bg-white px-3 py-1.5 text-xs text-forest-dark hover:bg-paper-dim"
              onClick={() => sendMessage(prompt)}
              disabled={loading}
            >
              {prompt}
            </button>
          ))}

        </div>
      )}


      {/* ============================================================
          SPEECH SUPPORT WARNING
      ============================================================ */}

      {!speechSupported && (
        <div className="mt-3 flex items-center gap-2 text-xs text-ink-light">
          <AlertCircle size={13} />

          Voice input isn't supported in this browser —
          try Chrome or Edge.
        </div>
      )}


      {/* ============================================================
          INPUT
      ============================================================ */}

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex gap-2"
      >

        <input
          className="input flex-1"
          placeholder={
            listening
              ? "Listening…"
              : "Ask about books, due dates, fines…"
          }
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          disabled={loading}
        />


        {speechSupported && (
          <button
            type="button"
            onClick={toggleListening}
            disabled={loading}
            className={
              listening
                ? "btn-danger"
                : "btn-secondary"
            }
            title={
              listening
                ? "Stop voice input"
                : "Voice input"
            }
          >
            {listening ? (
              <MicOff size={16} />
            ) : (
              <Mic size={16} />
            )}
          </button>
        )}


        <button
          type="submit"
          disabled={
            loading ||
            !input.trim()
          }
          className="btn-primary"
        >
          {loading ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Send size={16} />
          )}
        </button>

      </form>

    </div>
  );
}