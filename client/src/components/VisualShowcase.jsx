import React, { useState, useEffect } from "react";
import { 
  FaCar, 
  FaBus, 
  FaTruck, 
  FaArrowRight, 
  FaClock, 
  FaShieldAlt, 
  FaChevronLeft, 
  FaChevronRight, 
  FaDollarSign,
  FaCheckCircle
} from "react-icons/fa";

const slidesData = [
  {
    id: "urban",
    tag: "VadTrans Commute",
    title: "Urban Commutes Made Simple",
    desc: "Experience stress-free, cost-effective daily travel within city limits with verified drivers.",
    type: "urban",
    route: "Lekki ➔ Mainland",
    price: "₦2,500",
    time: "45 mins",
    distance: "28 km",
    pathD: "M 20,60 C 80,10 160,110 220,60 C 280,10 340,90 380,50",
    color: "#E31E24", // Primary Red
    icon: FaCar,
    vehicleColor: "text-white bg-primary shadow-glow",
    stats: [
      { label: "Frequency", value: "Every 15m" },
      { label: "Comfort", value: "AC Rides" }
    ]
  },
  {
    id: "interstate",
    tag: "VadTrans Inter-State",
    title: "Travel Across States Comfortably",
    desc: "Book your luxury coach tickets to major cities. Safe departures, vetted staff, and terminal security.",
    type: "interstate",
    route: "Lagos ➔ Abuja",
    price: "₦25,000",
    time: "10 hours",
    distance: "750 km",
    pathD: "M 20,40 Q 120,110 220,50 T 380,60",
    color: "#10B981", // Accent Emerald
    icon: FaBus,
    vehicleColor: "text-white bg-accent-emerald shadow-lg shadow-emerald-500/20",
    stats: [
      { label: "Luggage", value: "Free 25kg" },
      { label: "Departures", value: "Daily 6AM" }
    ]
  },
  {
    id: "freight",
    tag: "VadTrans Freight",
    title: "Seamless Border Logistics",
    desc: "Move cargo and parcels across borders efficiently with live tracking and customs clearance support.",
    type: "freight",
    route: "Lagos ➔ Accra",
    price: "₦85,000",
    time: "2 days",
    distance: "460 km",
    pathD: "M 20,80 Q 150,20 200,80 T 380,40",
    color: "#F59E0B", // Accent Amber
    icon: FaTruck,
    vehicleColor: "text-white bg-accent-amber shadow-lg shadow-amber-500/20",
    stats: [
      { label: "Tracking", value: "Real-time" },
      { label: "Customs", value: "Handled" }
    ]
  },
  {
    id: "driver",
    tag: "VadTrans Partner",
    title: "Monetize Your Extra Seats",
    desc: "Earn passive income by sharing your inter-state trips. You decide the route and choose your passengers.",
    type: "partner",
    route: "Earn on your schedule",
    price: "₦50,000+/wk",
    time: "Flexible",
    distance: "Your choice",
    color: "#8B5CF6", // Accent Violet
    icon: FaCheckCircle,
    stats: [
      { label: "Commission", value: "Low 5%" },
      { label: "Payout", value: "Instant" }
    ]
  }
];

const VisualShowcase = ({ mode = "traveler" }) => {
  // If partner mode, start on the driver slide, else start on first slide
  const initialIndex = mode === "partner" ? 3 : 0;
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [earningsCount, setEarningsCount] = useState(0);

  // Auto-play interval
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slidesData.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Animate driver earnings odometer if on slide 3 (the driver slide)
  useEffect(() => {
    if (activeIndex === 3) {
      setEarningsCount(0);
      let start = 0;
      const end = 55000;
      const duration = 2000; // 2 seconds
      const stepTime = Math.abs(Math.floor(duration / 100));
      
      const timer = setInterval(() => {
        start += Math.floor(end / 100);
        if (start >= end) {
          setEarningsCount(end);
          clearInterval(timer);
        } else {
          setEarningsCount(start);
        }
      }, stepTime);
      
      return () => clearInterval(timer);
    }
  }, [activeIndex]);

  const activeSlide = slidesData[activeIndex];
  const IconComponent = activeSlide.icon;

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + slidesData.length) % slidesData.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % slidesData.length);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-gradient-to-br from-charcoal to-neutral-900 text-white rounded-premium p-6 lg:p-7 relative overflow-hidden transition-all duration-500 border border-neutral-800 shadow-hover">
      {/* Inline styles for offset-path animation & dasharray drawing */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drive {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes float-badge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animated-path {
          stroke-dasharray: 8, 4;
          stroke-dashoffset: 100;
          animation: dash 12s linear infinite;
        }
        .animated-vehicle {
          animation: drive 10s infinite linear;
          offset-rotate: auto;
        }
        .pulse-destination {
          animation: pulse-ring 2s infinite ease-in-out;
        }
        .floating-badge {
          animation: float-badge 3s ease-in-out infinite;
        }
      `}} />

      {/* Soft radial backdrop glows */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-accent-violet/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Top Banner Tag */}
      <div className="relative z-10 flex justify-between items-center w-full">
        <span 
          className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider transition-all duration-300 font-poppins"
          style={{ 
            backgroundColor: `${activeSlide.color}20`,
            color: activeSlide.color 
          }}
        >
          {activeSlide.tag}
        </span>
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-bold bg-neutral-800/40 px-2.5 py-1.5 rounded-lg border border-white/5">
          <FaShieldAlt className="text-accent-emerald text-xs" />
          <span>Vetted & Secure</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-grow flex flex-col justify-center my-4">
        {/* Title and Description */}
        <div className="text-left mb-4 max-w-sm animate-slide-up">
          <h2 className="text-xl lg:text-2xl font-black font-raleway text-white mb-2 leading-tight min-h-[56px] flex items-center">
            {activeSlide.title}
          </h2>
          <p className="text-[11px] text-neutral-400 font-medium leading-relaxed min-h-[36px]">
            {activeSlide.desc}
          </p>
        </div>

        {/* Visual Graphic Representation */}
        <div className="w-full relative bg-neutral-900/60 rounded-2xl border border-white/5 p-4 backdrop-blur-md overflow-hidden min-h-[145px] flex flex-col justify-between transition-all duration-500">
          {activeSlide.type !== "partner" ? (
            // Route Graphic slide
            <>
              {/* Route line drawing */}
              <div className="w-full h-20 relative">
                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  {/* Background path line */}
                  <path 
                    d={activeSlide.pathD}
                    fill="none" 
                    stroke="rgba(255,255,255,0.06)" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                  />
                  {/* Colored Animated Path line */}
                  <path 
                    d={activeSlide.pathD}
                    fill="none" 
                    stroke={activeSlide.color} 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                    className="animated-path"
                  />

                  {/* Start Point marker */}
                  <circle cx="20" cy={activeSlide.type === "urban" ? 60 : activeSlide.type === "interstate" ? 40 : 80} r="5" fill="#FFF" />
                  <circle cx="20" cy={activeSlide.type === "urban" ? 60 : activeSlide.type === "interstate" ? 40 : 80} r="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" className="pulse-destination" />

                  {/* End Point marker */}
                  <circle cx="380" cy={activeSlide.type === "urban" ? 50 : activeSlide.type === "interstate" ? 60 : 40} r="5" fill={activeSlide.color} />
                  <circle cx="380" cy={activeSlide.type === "urban" ? 50 : activeSlide.type === "interstate" ? 60 : 40} r="10" fill="none" stroke={activeSlide.color} strokeWidth="1" className="pulse-destination" />
                </svg>

                {/* Animated Vehicle following the CSS path */}
                <div 
                  className={`absolute w-7 h-7 rounded-full flex items-center justify-center animated-vehicle ${activeSlide.vehicleColor}`}
                  style={{
                    offsetPath: `path('${activeSlide.pathD}')`,
                    left: 0,
                    top: 0
                  }}
                >
                  <IconComponent className="text-[12px]" />
                </div>

                {/* Badges pointing to destinations */}
                <div className="absolute left-1 top-12 text-[8px] bg-neutral-800 text-neutral-300 font-bold px-2 py-0.5 rounded border border-white/5 shadow-md">
                  {activeSlide.route.split(" ➔ ")[0]}
                </div>
                <div className="absolute right-1 top-12 text-[8px] bg-neutral-800 text-neutral-300 font-bold px-2 py-0.5 rounded border border-white/5 shadow-md">
                  {activeSlide.route.split(" ➔ ")[1]}
                </div>
              </div>

              {/* Bottom details inside card */}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                <div>
                  <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Pricing Model</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black" style={{ color: activeSlide.color }}>{activeSlide.price}</span>
                    <span className="text-[9px] text-neutral-500">one way</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Duration</p>
                    <p className="text-[10px] font-bold text-neutral-300 flex items-center gap-1 justify-end">
                      <FaClock className="text-[8px] text-neutral-500" />
                      {activeSlide.time}
                    </p>
                  </div>
                  <div className="w-px h-6 bg-white/5"></div>
                  <div>
                    <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Distance</p>
                    <p className="text-[10px] font-bold text-white">{activeSlide.distance}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Partner / Earnings Slide
            <div className="flex items-center justify-between gap-4 h-full py-2">
              <div className="flex-1 text-left flex flex-col justify-center">
                <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Estimated Earnings</p>
                <h3 className="text-2xl font-black text-accent-violet">
                  ₦{earningsCount.toLocaleString()}
                  <span className="text-[10px] text-neutral-400 font-medium ml-1">/ week</span>
                </h3>
                <p className="text-[10px] text-neutral-400 mt-2 font-medium">
                  Drive your route, accept bookings, make extra cash. It is that simple.
                </p>
              </div>
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Visual Circle Gauge */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-neutral-800"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-accent-violet transition-all duration-300"
                    strokeWidth="3.2"
                    strokeDasharray="80, 100"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center floating-badge">
                  <div className="bg-accent-violet/20 p-2.5 rounded-full text-accent-violet">
                    <FaCheckCircle className="text-base" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick stats floating overlays */}
          <div className="absolute top-2 right-2 flex gap-1.5 pointer-events-none">
            {activeSlide.stats?.map((stat, i) => (
              <span key={i} className="text-[8px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-neutral-300 font-bold backdrop-blur-md">
                {stat.label}: {stat.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer controls & dot indexers */}
      <div className="relative z-10 flex justify-between items-center w-full mt-2">
        {/* Navigation buttons */}
        <div className="flex gap-2">
          <button 
            onClick={handlePrev}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white/80 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/30"
            type="button"
            aria-label="Previous slide"
          >
            <FaChevronLeft className="text-[10px]" />
          </button>
          <button 
            onClick={handleNext}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white/80 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/30"
            type="button"
            aria-label="Next slide"
          >
            <FaChevronRight className="text-[10px]" />
          </button>
        </div>

        {/* Indicators */}
        <div className="flex gap-2">
          {slidesData.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setActiveIndex(idx)}
              className="group relative focus:outline-none cursor-pointer"
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? "w-6" : "w-2 bg-neutral-700 hover:bg-neutral-500"
                }`}
                style={{
                  backgroundColor: activeIndex === idx ? activeSlide.color : undefined
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisualShowcase;
