"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react"
import { FaRobot } from "react-icons/fa6";
import { X } from "lucide-react";

export default function Chatbot() {
    const [open, setOpen] = useState(false);

    // 
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef();


    const [hovered, setHovered] = useState(false);
    // Scroll to bottom on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMessage = { type: "user", text: query };


        setMessages((prev) => [...prev, userMessage]);
        setQuery("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: userMessage.text }),
            });

            let data;
            const text = await res.text();
            try {
                data = JSON.parse(text);
            } catch {
                data = { answer: text };
            }

            const botMessage = { type: "bot", text: data.answer || JSON.stringify(data) };
            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { type: "bot", text: "Something went wrong. Try again." },
            ]);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed z-[99999999] bottom-16 right-16">
                <motion.button
                    // hover/focus handlers (works for keyboard too)
                    onHoverStart={() => setHovered(true)}
                    onHoverEnd={() => setHovered(false)}
                    onFocus={() => setHovered(true)}
                    onBlur={() => setHovered(false)}
                    onClick={() => setOpen(true)}
                    aria-label="Open AI assistant"
                    initial={{ width: 48, borderRadius: 999 }}
                    animate={hovered ? { width: 150 } : { width: 48 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    // style + tailwind for visual look
                    style={{ height: 48, overflow: "hidden" }}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg focus:outline-none active:scale-95 transition"
                >
                    {/* Icon */}
                    <div className={`flex items-center justify-center rounded-full bg-white/10`}>
                        <FaRobot className="h-6 w-6" />
                    </div>

                    {/* Expanding label */}
                    <motion.span
                        aria-hidden={!hovered}
                        initial={{ opacity: 0, x: -8 }}
                        animate={hovered ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                        transition={{ duration: 0.4 }}
                        className="whitespace-nowrap font-medium text-sm"
                        style={{ pointerEvents: "none" }}
                    >
                        Chat with AI
                    </motion.span>
                </motion.button>
            </div>


            {/* Popup chat window */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="fixed bottom-16 right-16 w-96 h-[70vh] bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden z-[99999999]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                            <h2 className=" font-semibold">AI Assistant <span className="text-xs font-normal">(powered by gemini)</span></h2>
                            <button onClick={() => setOpen(false)} className="hover:opacity-80">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages area */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
                            {/* Default greeting */}
                            {messages.length === 0 && (
                                <div className="bg-gray-100 dark:bg-neutral-800 p-2 rounded-lg w-fit max-w-[75%]">
                                    👋 Hi! How can I help?
                                </div>
                            )}

                            {/* Loop through messages */}
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`p-2 rounded-lg w-fit max-w-7/10 shadow-md ${msg.type === "user" ? "ml-auto bg-blue-600 text-white" : "bg-gray-100 dark:bg-neutral-800"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            ))}

                            {loading && (
                                <div className="bg-gray-100 dark:bg-neutral-800 p-2 rounded-lg w-fit max-w-[75%] animate-pulse">
                                    Thinking...
                                </div>
                            )}

                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={handleSubmit}
                            className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2"
                        >
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                                Send
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
