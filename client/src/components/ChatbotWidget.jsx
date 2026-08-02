import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaComments, 
  FaTimes, 
  FaPaperPlane, 
  FaRobot, 
  FaUser, 
  FaShieldAlt, 
  FaWhatsapp, 
  FaInfoCircle 
} from "react-icons/fa";

// Predefined suggestion chips
const SUGGESTIONS = [
  { label: "Book a ride ticket", query: "How do I book a ticket?" },
  { label: "Subscribe to newsletter", query: "Subscribe to newsletter" },
  { label: "Track a shipment", query: "Track my cargo" },
  { label: "Become a partner driver", query: "Join as partner driver" },
];

const BOT_RESPONSES = [
  {
    keywords: ["subscribe", "newsletter", "email", "mailing", "promo", "discount"],
    text: "Awesome! Please type your email address below, and I will subscribe you to our list for VadTrans updates, discount offers, and route releases. 📬"
  },
  {
    keywords: ["book", "search", "ticket", "travel", "ride", "bus", "carpool"],
    text: "To book a ride, go to the [Book Ride](/search) page. Simply enter your origin (e.g. Lekki), destination (e.g. Mainland), select your travel date, and click Search! You can then select your seat and pay securely."
  },
  {
    keywords: ["freight", "cargo", "logistics", "shipping", "ship", "parcel", "send package"],
    text: "We offer local, inter-state, and West African shipping. Head over to our [Freight Services](/freight) page to configure package dimensions, get an instant pricing quote, and request custom clearance assistance."
  },
  {
    keywords: ["driver", "partner", "register driver", "vehicle", "monetize", "earn money"],
    text: "You can monetize your empty seats and earn up to ₦50,000+/week! Sign up as a partner driver on our [Partner Signup](/signup) page and toggle the 'Driver / Partner' form to apply."
  },
  {
    keywords: ["route", "price", "fare", "cost", "mainland", "lekki", "abuja", "accra", "nigeria"],
    text: "Popular VadTrans routes include:\n- **Lekki ➔ Mainland**: ₦2,500\n- **Lagos ➔ Abuja**: ₦25,000\n- **Lagos ➔ Accra (West Africa)**: ₦85,000\n\nFares dynamically adjust based on routing. Start a search on the [Search](/search) page to verify current rates."
  },
  {
    keywords: ["tracking", "track", "status", "shipment tracking", "where is my"],
    text: "Track passenger rides or cargo shipments in real-time. Simply go to the [Tracking](/tracking) page and enter your Booking Ref or Shipment Tracking ID."
  },
  {
    keywords: ["support", "contact", "help", "phone", "whatsapp", "call", "email", "address"],
    text: "Need direct help? Contact VadTrans support:\n- **Phone / WhatsApp**: [WhatsApp Support](tel:+2349123284931) (+234-912-328-4931)\n- **Email**: Support@vadtrans.com\n- **Page**: [Help & Support](/support)"
  },
  {
    keywords: ["hello", "hi", "hey", "greetings", "yo", "anyone there"],
    text: "Hello! I am VadBot, your VadTrans AI Assistant. How can I help you today? Ask me about ticket bookings, routes, shipping, or driver registration."
  },
  {
    keywords: ["thanks", "thank you", "perfect", "awesome", "cool", "ok", "okay"],
    text: "You are very welcome! Let me know if there is anything else I can do to assist your travel or logistics."
  }
];

const DEFAULT_RESPONSE = "I am programmed to only assist with questions regarding VadTrans services, route bookings, shipments, tracking, and partner drivers. Let me know how I can help you with your journey today!";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem("chatbot_unlocked") === "true";
  });
  const [leadState, setLeadState] = useState(() => {
    const unlocked = sessionStorage.getItem("chatbot_unlocked") === "true";
    return unlocked ? "idle" : "waiting_for_name";
  });
  const [leadName, setLeadName] = useState(() => {
    return sessionStorage.getItem("chatbot_name") || "";
  });
  const [pendingQuery, setPendingQuery] = useState("");

  const [messages, setMessages] = useState(() => {
    const unlocked = sessionStorage.getItem("chatbot_unlocked") === "true";
    const name = sessionStorage.getItem("chatbot_name") || "";
    return [
      {
        id: "welcome",
        sender: "bot",
        text: unlocked
          ? `Welcome back, ${name}! How can I assist you today? Ask me about routes, ticket booking, cargo tracking, or driver registrations.`
          : "Welcome to VadTrans Support! 🚗💨\n\nTo help us serve you, please enter your name to get started:",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle incoming user query
  const processQuery = (queryText) => {
    const cleanQuery = queryText.toLowerCase().trim();
    
    // Check match
    let matchedResponse = null;
    for (const response of BOT_RESPONSES) {
      const match = response.keywords.some(keyword => cleanQuery.includes(keyword));
      if (match) {
        matchedResponse = response.text;
        break;
      }
    }
    
    return matchedResponse || DEFAULT_RESPONSE;
  };

  const handleSend = async (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // GATING FLOW: If chatbot is NOT unlocked yet
    if (!isUnlocked) {
      if (leadState === "waiting_for_name") {
        const cleanInput = textToSend.toLowerCase().trim();
        const isChipQuery = SUGGESTIONS.some(s => s.query.toLowerCase() === cleanInput || s.label.toLowerCase() === cleanInput);
        // Check if user ignored the name prompt and asked a support question or clicked a chip instead
        const isQuestion = isChipQuery || ["book", "search", "ticket", "travel", "ride", "bus", "carpool", "freight", "cargo", "logistics", "shipping", "ship", "parcel", "send", "driver", "partner", "earn", "route", "price", "fare", "cost", "mainland", "lekki", "abuja", "accra", "track", "status", "help", "support", "contact", "how", "what", "where", "subscribe", "newsletter"].some(kw => cleanInput.includes(kw));

        if (isQuestion) {
          setPendingQuery(textToSend); // Save their initial question
          setTimeout(() => {
            const botMsg = {
              id: `msg-${Date.now() + 1}`,
              sender: "bot",
              text: "I would be happy to help you with that! First, please enter your name to get started:",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
          }, 750);
        } else {
          // Input is treated as the user's name
          const name = textToSend.trim();
          setLeadName(name);
          setLeadState("waiting_for_email");
          
          setTimeout(() => {
            const botMsg = {
              id: `msg-${Date.now() + 1}`,
              sender: "bot",
              text: `Nice to meet you, ${name}! What is your email address so we can complete your setup?`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
          }, 750);
        }
        return;
      }

      if (leadState === "waiting_for_email") {
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+)/gi;
        const emailMatch = textToSend.match(emailRegex);

        if (emailMatch && emailMatch.length > 0) {
          const email = emailMatch[0].trim().toLowerCase();
          try {
            const res = await fetch("/api/leads", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ email, name: leadName, source: "chatbot" })
            });
            
            const data = await res.json();
            
            // Save state in session storage so it persists on reload
            sessionStorage.setItem("chatbot_unlocked", "true");
            sessionStorage.setItem("chatbot_name", leadName);
            setIsUnlocked(true);
            setLeadState("idle");

            setTimeout(() => {
              let botReplyText = `Thank you, ${leadName}! Your support session is now active. How can I help you today?`;
              if (res.status === 409) {
                botReplyText = `Welcome back, ${leadName}! Your email is already on our subscription list. Your support session is active. How can I help you today?`;
              }
              
              const botMsg = {
                id: `msg-${Date.now() + 1}`,
                sender: "bot",
                text: botReplyText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              
              setMessages(prev => [...prev, botMsg]);
              setIsTyping(false);

              // If there was a pending query from before the signup, answer it immediately!
              if (pendingQuery) {
                setIsTyping(true);
                setTimeout(() => {
                  const botReply = processQuery(pendingQuery);
                  const followUpMsg = {
                    id: `msg-${Date.now() + 2}`,
                    sender: "bot",
                    text: botReply,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  };
                  setMessages(prev => [...prev, followUpMsg]);
                  setIsTyping(false);
                  setPendingQuery(""); // Clear pending query
                }, 1000);
              }
            }, 850);
            
          } catch (error) {
            console.error("Error submitting email lead:", error);
            sessionStorage.setItem("chatbot_unlocked", "true");
            sessionStorage.setItem("chatbot_name", leadName);
            setIsUnlocked(true);
            setLeadState("idle");

            setTimeout(() => {
              const botMsg = {
                id: `msg-${Date.now() + 1}`,
                sender: "bot",
                text: `Thank you, ${leadName}! Your support session is active. How can I assist you?`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              setMessages(prev => [...prev, botMsg]);
              setIsTyping(false);

              if (pendingQuery) {
                setIsTyping(true);
                setTimeout(() => {
                  const botReply = processQuery(pendingQuery);
                  const followUpMsg = {
                    id: `msg-${Date.now() + 2}`,
                    sender: "bot",
                    text: botReply,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  };
                  setMessages(prev => [...prev, followUpMsg]);
                  setIsTyping(false);
                  setPendingQuery("");
                }, 1000);
              }
            }, 850);
          }
        } else {
          setTimeout(() => {
            const botMsg = {
              id: `msg-${Date.now() + 1}`,
              sender: "bot",
              text: `That doesn't look like a valid email address. Please try again (e.g. name@example.com):`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
          }, 750);
        }
        return;
      }
    }

    // NORMAL OPERATING FLOW (When Unlocked)
    // Simulate natural response timing for normal queries
    setTimeout(() => {
      const botReply = processQuery(textToSend);
      const botMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: "bot",
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 850);
  };

  // Convert markdown-style links [Label](url) to real elements
  const renderMessageText = (text) => {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, matchIndex)}</span>);
      }
      
      const label = match[1];
      const to = match[2];
      
      if (to.startsWith("http") || to.startsWith("tel:") || to.startsWith("mailto:")) {
        parts.push(
          <a 
            key={`link-${matchIndex}`} 
            href={to} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary font-bold hover:underline bg-primary/10 px-1.5 py-0.5 rounded inline-flex items-center gap-1"
          >
            {label}
          </a>
        );
      } else {
        parts.push(
          <Link 
            key={`link-${matchIndex}`} 
            to={to} 
            className="text-primary font-bold hover:underline bg-primary/10 px-1.5 py-0.5 rounded"
            onClick={() => setIsOpen(false)} // Auto-close chat window when navigating internally
          >
            {label}
          </Link>
        );
      }
      
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }
    
    if (parts.length === 0) {
      // Split newlines into paragraphs
      return text.split("\n").map((line, i) => (
        <span key={i} className="block min-h-[5px]">{line}</span>
      ));
    }
    
    return parts;
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[999] w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:shadow-primary/40 active:scale-95 transition-all duration-300 group cursor-pointer focus:outline-none border border-primary-light/10"
        aria-label="Toggle support chat"
      >
        {isOpen ? (
          <FaTimes className="text-xl rotate-0 transition-transform duration-300" />
        ) : (
          <FaComments className="text-xl group-hover:scale-110 transition-all duration-300" />
        )}
        
        {/* Soft Notification Pulse Dot */}
        {!isOpen && (
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-accent-emerald border-2 border-neutral-900 rounded-full animate-ping" />
        )}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-[999] w-[350px] sm:w-[400px] h-[520px] bg-gradient-to-b from-charcoal to-neutral-900 text-white rounded-premium border border-neutral-800 shadow-2xl flex flex-col overflow-hidden animate-slide-up"
        >
          {/* Header */}
          <div className="bg-charcoal-light/60 p-4 border-b border-neutral-800/80 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-glow">
                  <FaRobot className="text-lg" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-accent-emerald border-2 border-charcoal rounded-full" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-black font-raleway tracking-wide">VadBot</h4>
                <p className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-accent-emerald inline-block"></span>
                  VadTrans AI Assistant • Online
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-white/5 border border-white/5 px-2.5 py-1 rounded-full text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <FaShieldAlt className="text-accent-emerald text-[8px]" />
                Secure
              </span>
            </div>
          </div>

          {/* Messages Log */}
          <div className="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-4 bg-neutral-950/20">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] border shrink-0 ${
                  msg.sender === "user" 
                    ? "bg-neutral-800 border-neutral-700 text-neutral-300"
                    : "bg-primary/10 border-primary/20 text-primary"
                }`}>
                  {msg.sender === "user" ? <FaUser /> : <FaRobot />}
                </div>

                {/* Bubble Container */}
                <div className="space-y-1">
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed text-left ${
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-tr-none shadow-md shadow-primary/10"
                      : "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none"
                  }`}>
                    {renderMessageText(msg.text)}
                  </div>
                  <p className={`text-[8px] text-neutral-500 font-medium ${
                    msg.sender === "user" ? "text-right" : "text-left"
                  }`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 max-w-[80%] mr-auto items-center">
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[10px] shrink-0 animate-pulse">
                  <FaRobot />
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Scroll Row */}
          <div className="px-4 py-2 border-t border-neutral-900/50 bg-neutral-900/40 overflow-x-auto whitespace-nowrap custom-scrollbar flex gap-2 flex-shrink-0">
            {SUGGESTIONS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.query)}
                className="text-[10px] bg-neutral-800/80 hover:bg-neutral-800 border border-white/5 text-neutral-300 hover:text-white px-3 py-1.5 rounded-full transition-all cursor-pointer inline-block shrink-0 focus:outline-none"
                type="button"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="p-3 bg-neutral-900/80 border-t border-neutral-850/80 flex items-center gap-2 backdrop-blur-md"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about tickets, cargo, drivers..."
              className="flex-grow bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-700/50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
              aria-label="Send message"
            >
              <FaPaperPlane className="text-xs" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
