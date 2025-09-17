import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { FiMail, FiUsers, FiExternalLink, FiHeart, FiX, FiArrowUp, FiStar, FiTrendingUp, FiShield, FiZap, FiGlobe, FiPhone, FiMapPin } from "react-icons/fi";
import { FaGithub, FaLinkedin, FaGlobe, FaHeart, FaInstagram, FaYoutube, FaDiscord, FaTelegramPlane } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Footer = () => {
  const footerRef = useRef(null);
  const [showDevelopers, setShowDevelopers] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  // Entrance and particle animations
  useEffect(() => {
    const footerElement = footerRef.current;
    if (!footerElement) return;

    // Set initial styles to prevent disappearing
    gsap.set(footerElement, { opacity: 0, y: 50 });

    // Create scroll trigger with more reliable settings
    const scrollTrigger = gsap.fromTo(
      footerElement,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerElement,
          start: "top bottom-=50",
          toggleActions: "play none none reverse",
          onComplete: () => {
            // Ensure footer stays visible after animation
            gsap.set(footerElement, { opacity: 1, y: 0 });
          }
        },
      }
    );

    // Particle animation with proper cleanup
    const particles = [];
    let isActive = true;
    
    const createParticle = () => {
      if (!isActive || !footerElement) return;
      
      const particle = document.createElement("div");
      particle.classList.add(
        "absolute",
        "rounded-full",
        "bg-green-500/10",
        "dark:bg-green-400/5",
        "pointer-events-none"
      );

      const size = Math.random() * 25 + 5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.opacity = (Math.random() * 0.5 + 0.1).toString();

      footerElement.appendChild(particle);
      particles.push(particle);

      gsap.to(particle, {
        y: -100 - Math.random() * 100,
        x: (Math.random() - 0.5) * 50,
        opacity: 0,
        duration: 5 + Math.random() * 10,
        onComplete: () => {
          if (isActive && footerElement && footerElement.contains(particle)) {
            footerElement.removeChild(particle);
          }
          const index = particles.indexOf(particle);
          if (index > -1) particles.splice(index, 1);
          if (isActive) {
            setTimeout(createParticle, 1000);
          }
        },
      });
    };

    // Initialize particles
    for (let i = 0; i < 8; i++) {
      setTimeout(() => createParticle(), i * 200);
    }

    // Cleanup function
    return () => {
      isActive = false;
      particles.forEach(particle => {
        if (footerElement && footerElement.contains(particle)) {
          footerElement.removeChild(particle);
        }
      });
      particles.length = 0;
      if (scrollTrigger) {
        scrollTrigger.kill();
      }
    };
  }, []);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Newsletter handler
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.includes("@")) {
      setSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };
  
  
  return (
    <footer
      ref={footerRef}
      className="relative mt-20 overflow-hidden"
    >
      {/* Main footer container with glassmorphism */}
      <div className="bg-gradient-to-br from-slate-900/95 via-gray-900/90 to-black/95 backdrop-blur-xl border-t border-white/10 relative">
        {/* Animated gradient border */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-emerald-400 via-blue-500 via-purple-500 via-pink-500 to-emerald-400 opacity-60 animate-pulse"></div>
        
        {/* Floating orbs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-r from-emerald-500/20 via-blue-500/15 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-l from-pink-500/20 via-orange-500/15 to-red-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative z-20 px-6 lg:px-12 py-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* About Section - Enhanced */}
            <div className="lg:col-span-2">
              <motion.div
                className="flex items-center gap-3 mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <img src="/vite.svg" alt="logo" className="w-6 h-6" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Nutrithy</h3>
              </motion.div>
              
              <motion.p
                className="text-gray-300 mb-8 leading-relaxed text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Your AI-powered nutrition companion that transforms the way you plan meals, discover recipes, and connect with a thriving community of health enthusiasts. Experience personalized recommendations backed by cutting-edge technology.
              </motion.p>
              
              {/* Features Grid */}
              <motion.div
                className="grid grid-cols-2 gap-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {[
                  { icon: FiZap, title: "AI-Powered", desc: "Smart recommendations" },
                  { icon: FiShield, title: "Secure", desc: "Privacy protected" },
                  { icon: FiUsers, title: "Community", desc: "Members" },
                  { icon: FiGlobe, title: "Global", desc: "Worldwide recipes" },
                ].map((feature, idx) => (
                  <div key={idx} className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <feature.icon className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform" size={20} />
                    <h4 className="text-white font-semibold text-sm">{feature.title}</h4>
                    <p className="text-gray-400 text-xs">{feature.desc}</p>
                  </div>
                ))}
              </motion.div>
              
              <motion.div
                className="flex items-center text-emerald-300 mb-8 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <FiHeart className="mr-3 text-emerald-400 animate-pulse" size={20} />
                <span className="font-medium">Crafted with passion for healthier living</span>
              </motion.div>

              {/* Developer Button */}
              <motion.button
                onClick={() => setShowDevelopers(!showDevelopers)}
                className="group flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 hover:border-purple-400/50 rounded-2xl text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiUsers className="text-purple-400 group-hover:scale-110 transition-transform" size={20} />
                <span className="font-semibold">
                  {showDevelopers ? "Hide Developer Info" : "Meet Our Developers"}
                </span>
              </motion.button>
            </div>

            {/* Quick Links - Enhanced */}
            <div>
              <motion.h3
                className="text-2xl font-bold mb-6 flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FiExternalLink className="text-white" size={16} />
                </div>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Quick Links</span>
              </motion.h3>
              
              <div className="space-y-2">
                {[
                  { name: "🏠 Home", path: "/", desc: "Start your journey" },
                  { name: "🍳 Recipes", path: "/recipes", desc: "Discover amazing recipes" },
                  { name: "👥 Community", path: "/community", desc: "Connect with others" },
                  { name: "📊 Activity", path: "/activity", desc: "Track your progress" },
                  { name: "📱 Diet Planner", path: "/diet-planner", desc: "Plan your meals" },
                  { name: "👤 Profile", path: "/profile", desc: "Manage your account" },
                ].map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    whileHover={{ x: 8 }}
                    className="group"
                  >
                    <Link
                      to={link.path}
                      className="block p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-400/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium group-hover:text-blue-400 transition-colors">
                          {link.name}
                        </span>
                        <FiExternalLink className="text-gray-400 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" size={14} />
                      </div>
                      <p className="text-gray-400 text-xs mt-1 group-hover:text-gray-300 transition-colors">{link.desc}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              {/* Social Links */}
              {/* <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <FiGlobe size={16} className="text-blue-400" />
                  Follow Us
                </h4>
                <div className="flex gap-3">
                  {[
                    { icon: <FaGithub />, link: "#", color: "hover:bg-gray-600" },
                    { icon: <FaLinkedin />, link: "#", color: "hover:bg-blue-600" },
                    { icon: <FaTwitter />, link: "#", color: "hover:bg-sky-500" },
                    { icon: <FaInstagram />, link: "#", color: "hover:bg-pink-500" },
                    { icon: <FaYoutube />, link: "#", color: "hover:bg-red-600" },
                    { icon: <FaDiscord />, link: "#", color: "hover:bg-indigo-600" },
                  ].map((social, idx) => (
                    <motion.a
                      key={idx}
                      href={social.link}
                      className={`w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white ${social.color} transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </motion.div> */}
            </div>

            {/* Newsletter & Contact - Enhanced */}
            <div>
              <motion.h3
                className="text-2xl font-bold mb-6 flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <FiMail className="text-white" size={16} />
                </div>
                <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">Stay Connected</span>
              </motion.h3>
              
              <motion.div
                className="mb-6 p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <FiStar className="text-emerald-400 mt-1 flex-shrink-0" size={16} />
                  <div>
                    {/* <h4 className="text-white font-semibold text-sm mb-1">Premium Newsletter</h4> */}
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Get exclusive AI-powered nutrition insights, personalized recipe recommendations, and early access to new features.
                    </p>
                  </div>
                </div>
                
                {/* Benefits list */}
                {/* <div className="grid grid-cols-1 gap-2 text-xs">
                  {[
                    "🎯 Personalized meal plans",
                    "🔬 AI nutrition analysis",
                    "🏆 Exclusive recipes",
                    "⚡ Early feature access"
                  ].map((benefit, idx) => (
                    <div key={idx} className="text-emerald-300 font-medium">{benefit}</div>
                  ))}
                </div> */}
              </motion.div>

              <AnimatePresence mode="wait">
                {!subscribed ? (
                  <motion.form
                    key="subscribe-form"
                    onSubmit={handleSubscribe}
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="relative">
                      <input
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300 backdrop-blur-sm"
                        required
                      />
                      <FiMail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    
                    <motion.button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 relative overflow-hidden"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <FiMail size={16} />
                        Subscribe Now
                      </span>
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success-message"
                    className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-center"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          ✓
                        </motion.div>
                      </div>
                    </div>
                    <h4 className="font-semibold mb-1">Welcome to the community! 🎉</h4>
                    <p className="text-sm opacity-90">Check your inbox for a welcome email with exclusive content.</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Contact info */}
              {/* <motion.div
                className="mt-8 pt-6 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <FiPhone size={16} className="text-emerald-400" />
                  Contact & Support
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiMail className="text-emerald-400 flex-shrink-0" size={14} />
                    <span>support@nutrithy.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiMapPin className="text-emerald-400 flex-shrink-0" size={14} />
                    <span>Available worldwide, 24/7 support</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiGlobe className="text-emerald-400 flex-shrink-0" size={14} />
                    <span>Join our community of 50K+ users</span>
                  </div>
                </div>
              </motion.div> */}
            </div>
        </div>

          {/* Enhanced Developers Section */}
          <AnimatePresence>
            {showDevelopers && (
              <motion.div
                className="mt-16 relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Background with glassmorphism */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-purple-900/20 to-blue-900/20 backdrop-blur-2xl rounded-3xl border border-white/10"></div>
                
                {/* Floating decorative elements */}
                {/* <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
                 */}
                <div className="relative z-10 p-8 lg:p-12">
                  {/* Close button */}
                  <motion.button
                    onClick={() => setShowDevelopers(false)}
                    className="absolute top-6 right-6 w-10 h-10 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-400/50 rounded-xl text-red-400 hover:text-red-300 transition-all duration-300 flex items-center justify-center group"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiX className="group-hover:scale-110 transition-transform" size={18} />
                  </motion.button>
                  
                  {/* Header */}
                  <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30 mb-6">
                      <FiUsers className="text-purple-400" size={20} />
                      <span className="text-purple-300 font-medium">Meet the Dream Team</span>
                    </div>
                    <h3 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                      The Minds Behind Nutrithy
                    </h3>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                      Passionate developers and designers dedicated to revolutionizing your nutrition journey with cutting-edge technology.
                    </p>
                  </motion.div>
                  
                  {/* Developers Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {[
                     {
                        initials: "R",
                        name: "Rishabh Tomar",
                        role: "Full Stack Developer & Co-Founder",
                        location: "📍 Bhopal, Madhya Pradesh, India",
                        experience: "Fresher | Enthusiastic Learner & Developer",
                        desc: "Aspiring full-stack developer passionate about building scalable web apps and experimenting with AI-powered solutions. Always eager to learn, explore, and turn ideas into impactful projects.",
                        gradient: "from-emerald-400 via-blue-500 to-purple-600",
                        skills: [
                          "Agentic AI", "Gen AI", "Node.js", "Express",
                          "Python", "MySQL", "React.js", "JavaScript",
                          "Firebase", "MongoDB", "TypeScript"
                        ],
                        achievements: [
                          "🚀 Built multiple personal and academic projects",
                          "🤖 Experimented with AI/ML integrations",
                          "💡 Quick learner, adapting to new stacks rapidly",
                          "⚡ Passionate about writing clean and optimized code"
                        ],
                        socials: [
                          { icon: <FaGithub />, link: "https://github.com/RishabhTomar9", color: "hover:bg-gray-700" },
                          { icon: <FaLinkedin />, link: "https://www.linkedin.com/in/rishabhtomar99", color: "hover:bg-blue-600" },
                          { icon: <FaGlobe />, link: "https://portfolio-nxt8349.web.app/", color: "hover:bg-emerald-500" }
                        ],
                        email: "rishabhtomar9999@gmail.com",
                        funFact: "☕ Fueled by coffee and curiosity — always exploring, building, and learning something new."
                      },
                      {
                        initials: "S",
                        name: "Samiksha Suryawanshi",
                        role: "UI/UX Designer & Frontend Developer",
                        location: "📍 Bhopal, Madhya Pradesh, India",
                        experience: "Fresher | Enthusiastic Learner & Developer",
                        desc: "Creative and motivated designer & frontend developer passionate about building user-friendly, responsive, and accessible digital products. Loves exploring new tools and learning by creating real projects.",
                        gradient: "from-pink-400 via-purple-500 to-indigo-600",
                        skills: [
                          "React.js", "MySQL", "Java", "JavaScript",
                          "Node.js", "Express", "Figma", "Tailwind",
                          "GSAP", "Framer Motion", "Adobe XD"
                        ],
                        achievements: [
                          "🎨 Designed and developed several personal & academic projects",
                          "✨ Explored animations, transitions, and micro-interactions",
                          "📱 Practiced mobile-first and responsive design approaches",
                          "🌟 Focused on accessibility and user-centered design"
                        ],
                        socials: [
                          { icon: <FaGithub />, link: "https://github.com/samikshasuryawanshi", color: "hover:bg-gray-700" },
                          { icon: <FaLinkedin />, link: "https://www.linkedin.com/in/samiksha-suryawanshi83", color: "hover:bg-blue-600" },
                          { icon: <FaGlobe />, link: "https://my-portfolio-xi-seven-68.vercel.app/", color: "hover:bg-indigo-500" }
                        ],
                        email: "suryawanshisamiksha506@gmail.com",
                        funFact: "🎨 Finds joy in learning new design trends and turning ideas into creative, interactive experiences."
                      }
                    ,
                    ].map((dev, i) => (
                      <motion.div
                        key={i}
                        className="group relative"
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                        whileHover={{ y: -8 }}
                      >
                        {/* Card background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl rounded-3xl border border-white/10 group-hover:border-white/20 transition-all duration-500"></div>
                                                
                        <div className="relative z-10 p-8">
                          {/* Header with avatar and basic info */}
                          <div className="flex items-start gap-6 mb-6">
                            <div className="relative">
                              {/* Avatar with animated border */}
                              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${dev.gradient} flex items-center justify-center text-2xl font-bold text-white shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                                {dev.initials}
                              </div>
                              {/* Floating ring */}
                              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${dev.gradient} blur-lg opacity-0 group-hover:opacity-50 animate-pulse transition-all duration-500`}></div>
                              {/* Status indicator */}
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                                {dev.name}
                              </h4>
                              <p className={`text-lg font-semibold bg-gradient-to-r ${dev.gradient} bg-clip-text text-transparent mb-2`}>
                                {dev.role}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                                <span>{dev.location}</span>
                                <span>•</span>
                                <span>{dev.experience}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Description */}
                          <p className="text-gray-300 text-lg leading-relaxed mb-6">
                            {dev.desc}
                          </p>
                          
                          {/* Skills */}
                          <div className="mb-6">
                            <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <FiZap className="text-yellow-400" size={16} />
                              Tech Stack
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {dev.skills.map((skill, idx) => (
                                <motion.span
                                  key={idx}
                                  className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm text-gray-300 hover:bg-white/20 transition-all duration-300"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {skill}
                                </motion.span>
                              ))}
                            </div>
                          </div>
                          
                          {/* Achievements */}
                          <div className="mb-6">
                            <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <FiStar className="text-yellow-400" size={16} />
                              Highlights
                            </h5>
                            <div className="grid grid-cols-2 gap-2">
                              {dev.achievements.map((achievement, idx) => (
                                <div key={idx} className="text-sm text-gray-300 font-medium">
                                  {achievement}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Fun fact */}
                          <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl">
                            <p className="text-purple-300 text-sm font-medium">
                              {dev.funFact}
                            </p>
                          </div>
                          
                          {/* Social links */}
                          <div className="flex flex-row flex-wrap gap-3 justify-between items-center">
                            <div className="flex gap-3">
                              {dev.socials.map((social, idx) => (
                                <motion.a
                                  key={idx}
                                  href={social.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white ${social.color} transition-all duration-300 hover:scale-110 hover:shadow-lg backdrop-blur-sm`}
                                >
                                  {social.icon}
                                </motion.a>
                              ))}
                            </div>
                            
                            {/* Connect button */}
                            <motion.button
                              link={`mailto:${dev.email}`}
                              className={`px-6 py-3 bg-black/90 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 relative overflow-hidden`}
                            >
                              <span className="relative z-10 flex items-center gap-2">
                                <FiMail size={16} />
                                Let's Connect
                              </span>
                              {/* Shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Team stats */}
                  {/* <motion.div
                    className="mt-12 pt-8 border-t border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                      {[
                        { label: "Projects Built", value: "15+", icon: "🚀" },
                        { label: "Happy Users", value: "50K+", icon: "😊" },
                        { label: "Code Commits", value: "1000+", icon: "💻" },
                        { label: "Coffee Cups", value: "∞", icon: "☕" },
                      ].map((stat, idx) => (
                        <motion.div
                          key={idx}
                          className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
                          whileHover={{ y: -4, scale: 1.02 }}
                        >
                          <div className="text-3xl mb-2">{stat.icon}</div>
                          <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                          <div className="text-gray-400 text-sm">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                   */}
                  {/* Call to action */}
                  {/* <motion.div
                    className="mt-12 text-center p-8 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/20 rounded-3xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <h4 className="text-2xl font-bold text-white mb-3">Want to collaborate?</h4>
                    <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                      We're always excited to work on innovative projects and connect with fellow developers and designers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <motion.button
                        className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Start a Project
                      </motion.button>
                      <motion.button
                        className="px-8 py-3 border border-white/20 text-white hover:bg-white/10 backdrop-blur-sm rounded-xl transition-all duration-300"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Our Work
                      </motion.button>
                    </div>
                  </motion.div> */}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        {/* Copyright */}
        {/* Copyright & Links */}
        <motion.div
          className="border-t border-gray-700/30 pt-8 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-center lg:text-left text-sm text-gray-400">
              <span className="flex items-center justify-center lg:justify-start flex-wrap">
                © {new Date().getFullYear()} Nutrithy. All rights reserved.
                <span className="ml-2 flex items-center">
                  Made with <FaHeart className="mx-1 text-[#FF742C] animate-pulse" size={12} /> for healthy living
                </span>
              </span>
            </div>
            
            {/* Footer Links */}
            <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-6 text-sm text-gray-400">
              <motion.a
                href="#"
                className="hover:text-green-400 transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-400 after:transition-all after:duration-300 hover:after:w-full"
                whileHover={{ y: -1 }}
              >
                Privacy Policy
              </motion.a>
              <span className="hidden sm:block text-gray-600">•</span>
              <motion.a
                href="#"
                className="hover:text-green-400 transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-400 after:transition-all after:duration-300 hover:after:w-full"
                whileHover={{ y: -1 }}
              >
                Terms of Service
              </motion.a>
              <span className="hidden sm:block text-gray-600">•</span>
              <motion.button
                onClick={() => setShowDevelopers(!showDevelopers)}
                className="hover:text-green-400 transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-400 after:transition-all after:duration-300 hover:after:w-full"
                whileHover={{ y: -1 }}
              >
                {showDevelopers ? "Hide Developers" : "Developers"}
              </motion.button>
            </div>
          </div>
        </motion.div>
        
          {/* Scroll to Top Button - Enhanced */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-700 text-white rounded-2xl shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center z-50 backdrop-blur-xl border border-white/20 group"
                initial={{ opacity: 0, scale: 0, y: 20, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 0, y: 20, rotate: 180 }}
                whileHover={{ 
                  scale: 1.15, 
                  y: -4,
                  boxShadow: "0 20px 40px rgba(16, 185, 129, 0.4)",
                  rotate: [0, -5, 5, 0]
                }}
                whileTap={{ scale: 0.9 }}
                aria-label="Scroll to top"
              >
                <FiArrowUp className="relative z-10 group-hover:scale-110 transition-transform" size={22} />
                
                {/* Multiple pulse rings */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/30 to-purple-500/30 animate-ping"></div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-purple-500/20 animate-ping delay-75"></div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
