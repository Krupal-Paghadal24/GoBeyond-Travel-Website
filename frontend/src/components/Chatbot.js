import { useState, useRef, useEffect } from "react";
import API from "../api/axiosInstance";

const SUGGESTIONS = [
    "Best places to visit in Rajasthan?",
    "Budget trip to Goa under Rs.10,000?",
    "Best time to visit Leh Ladakh?",
    "Hidden gems in Kerala?",
    "Adventure trips for college students?",
];

function Chatbot() {

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hi! I am GoBeyond AI. Ask me anything about traveling in India — destinations, budgets, tips and more!"
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSugg, setShowSugg] = useState(true);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 100);
    }, [open]);


    /* ── Send message ── */
    const sendMessage = async (text) => {
        const msg = text || input.trim();
        if (!msg || loading) return;

        setInput("");
        setShowSugg(false);

        const newMessages = [...messages, { role: "user", content: msg }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const res = await API.post("/api/chatbot/chat", {
                message: msg,
                history: newMessages.slice(-6)
            });
            setMessages(prev => [...prev, { role: "assistant", content: res.data.reply }]);
        } catch {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Sorry, I am having trouble connecting. Please try again!"
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const clearChat = () => {
        setMessages([{ role: "assistant", content: "Hi! I am GoBeyond AI. Ask me anything about traveling in India!" }]);
        setShowSugg(true);
        setInput("");
    };


    /* ══════════════════════════════
       RENDER
    ══════════════════════════════ */
    return (
        <>
            {/* Floating button */}
            <div
                onClick={() => setOpen(!open)}
                style={{
                    position: "fixed", bottom: "28px", right: "28px",
                    width: "56px", height: "56px", borderRadius: "50%",
                    background: open ? "#0b3d2e" : "#0f5132",
                    color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", zIndex: 9999,
                    boxShadow: "0 4px 20px rgba(15,81,50,0.4)",
                    transition: "all 0.2s", userSelect: "none",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
                <i className={`bi ${open ? "bi-x-lg" : "bi-robot"}`} style={{ fontSize: "22px" }}></i>
            </div>

            {/* Tooltip */}
            {!open && (
                <div style={{
                    position: "fixed", bottom: "94px", right: "28px",
                    background: "#0f5132", color: "white",
                    padding: "6px 14px", borderRadius: "20px",
                    fontSize: "13px", fontWeight: "500",
                    zIndex: 9998, whiteSpace: "nowrap",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                }}>
                    <i className="bi bi-chat-dots" style={{ marginRight: "6px" }}></i>
                    Ask me about India travel!
                </div>
            )}

            {/* Chat window */}
            {open && (
                <div style={{
                    position: "fixed", bottom: "98px", right: "28px",
                    width: "360px", height: "520px",
                    background: "white", borderRadius: "20px",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                    zIndex: 9998, display: "flex", flexDirection: "column",
                    overflow: "hidden", animation: "slideUp 0.25s ease",
                }}>

                    {/* Header */}
                    <div style={{ background: "linear-gradient(135deg, #0f5132, #0d9488)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <i className="bi bi-robot" style={{ fontSize: "18px", color: "white" }}></i>
                            </div>
                            <div>
                                <div style={{ fontSize: "14px", fontWeight: "700", color: "white" }}>GoBeyond AI</div>
                                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#86efac", display: "inline-block" }} />
                                    Online — India Travel Expert
                                </div>
                            </div>
                        </div>
                        <button onClick={clearChat}
                            style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "none", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", fontSize: "11px", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px" }}>
                            <i className="bi bi-trash3"></i> Clear
                        </button>
                    </div>

                    {/* Messages area */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", background: "#f8fffe" }}>

                        {messages.map((msg, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: "8px", alignItems: "flex-end" }}>

                                {msg.role === "assistant" && (
                                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <i className="bi bi-robot" style={{ fontSize: "13px", color: "#0f5132" }}></i>
                                    </div>
                                )}

                                <div style={{
                                    maxWidth: "78%", padding: "10px 14px",
                                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                    background: msg.role === "user" ? "#0f5132" : "white",
                                    color: msg.role === "user" ? "white" : "#1e293b",
                                    fontSize: "13px", lineHeight: "1.6",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                }}>
                                    {msg.content}
                                </div>

                            </div>
                        ))}

                        {/* Loading dots */}
                        {loading && (
                            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <i className="bi bi-robot" style={{ fontSize: "13px", color: "#0f5132" }}></i>
                                </div>
                                <div style={{ background: "white", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", display: "flex", gap: "4px", alignItems: "center" }}>
                                    {[0, 1, 2].map(i => (
                                        <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#0f5132", animation: "bounce 1.2s ease infinite", animationDelay: `${i * 0.2}s` }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick suggestions */}
                        {showSugg && messages.length === 1 && (
                            <div style={{ marginTop: "6px" }}>
                                <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Quick questions
                                </p>
                                {SUGGESTIONS.map((s, i) => (
                                    <button key={i} onClick={() => sendMessage(s)}
                                        style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", textAlign: "left", padding: "8px 12px", marginBottom: "6px", background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", cursor: "pointer", fontSize: "12px", color: "#0f5132", fontWeight: "500", transition: "all 0.15s" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#0f5132"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                                        <i className="bi bi-chat-text" style={{ flexShrink: 0 }}></i>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Input area */}
                    <div style={{ padding: "12px 14px", borderTop: "1px solid #e2e8f0", background: "white", display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Ask about India travel..."
                            disabled={loading}
                            style={{ flex: 1, padding: "10px 14px", borderRadius: "25px", border: "1.5px solid #e2e8f0", fontSize: "13px", outline: "none", background: "#f8fafc", color: "#1e293b" }}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                            style={{ width: "38px", height: "38px", borderRadius: "50%", background: input.trim() && !loading ? "#0f5132" : "#e2e8f0", color: "white", border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                            <i className="bi bi-send-fill" style={{ fontSize: "14px" }}></i>
                        </button>
                    </div>

                </div>
            )}

            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-6px); }
        }
      `}</style>

        </>
    );
}

export default Chatbot;