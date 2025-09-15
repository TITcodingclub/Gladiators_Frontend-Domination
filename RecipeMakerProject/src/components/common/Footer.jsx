import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { FiMail, FiUsers, FiExternalLink, FiHeart, FiX, FiArrowUp } from "react-icons/fi";
import { FaGithub, FaLinkedin, FaTwitter, FaHeart } from "react-icons/fa";
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
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 mt-12 border-t border-gray-700/30 relative overflow-hidden"
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-[#22c55e] to-[#FF742C] opacity-80"></div>

      {/* Glow elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#FF742C]/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* About */}
          <div>
            <motion.div
              className="flex items-center gap-2 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <img src="/vite.svg" alt="logo" className="w-8 h-8" />
              <h3 className="text-xl font-bold text-green-400">Nutrithy</h3>
            </motion.div>
            <motion.p
              className="text-gray-300 mb-6 leading-relaxed text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Your AI-powered diet planner & recipe guide with video call connect and more. Transform your cooking experience with personalized recommendations and community-driven recipes.
            </motion.p>
            <motion.div
              className="flex items-center text-sm text-gray-400 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <FiHeart className="mr-2 text-red-500" /> Made with love for food & wellness
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 gap-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {/* <div className="text-center bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                <div className="text-2xl font-bold text-green-400">10K+</div>
                <div className="text-xs text-gray-400">Active Users</div>
              </div>
              <div className="text-center bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                <div className="text-2xl font-bold text-[#FF742C]">5K+</div>
                <div className="text-xs text-gray-400">Recipes</div>
              </div> */}
            </motion.div>

            {/* Meet Our Developers Button */}
            <motion.button
              onClick={() => setShowDevelopers(!showDevelopers)}
              className="flex items-center gap-2 text-sm bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 py-2 px-3 rounded-lg transition-all duration-300 border border-gray-700/30 hover:border-green-400/50 hover:shadow-md hover:shadow-green-400/20 w-full justify-center"
            >
              <FiUsers className="text-green-400" />
              {showDevelopers ? "Hide Developer Info" : "Meet Our Developers"}
            </motion.button>
          </div>

          {/* Quick Links */}
          <div>
            <motion.h3
              className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FiExternalLink className="bg-green-400 text-gray-900 rounded-full p-1" />
              Quick Links
            </motion.h3>
            <ul className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "Recipes", path: "/recipes" },
                { name: "Community", path: "/community" },
                { name: "Diet Planner", path: "/diet-planner" },
                { name: "Profile", path: "/profile" },
                // { name: "About Us", path: "/about" },
                // { name: "Blog", path: "/blog" },
                // { name: "Nutrition Tips", path: "/nutrition" },
              ].map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ x: 3 }}
                >
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <motion.h3
              className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <FiMail className="bg-green-400 text-gray-900 rounded-full p-1" />
              Newsletter
            </motion.h3>
            <motion.p
              className="text-gray-300 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Subscribe to get the latest recipes, tips, and AI diet insights directly in your inbox.
            </motion.p>

            <AnimatePresence mode="wait">
              {!subscribed ? (
                <motion.form
                  key="subscribe-form"
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Your email address"
                    className="flex-1 bg-gray-800/50 border border-gray-700/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all duration-300 shadow-inner"
                    required
                  />
                  <motion.button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-[#FF742C] hover:from-green-600 hover:to-orange-600 text-white py-2 px-6 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-orange-500/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Subscribe
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="success-message"
                  className="bg-green-500/20 border border-green-500/30 text-green-400 p-3 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  Thank you for subscribing! You'll receive our latest updates soon.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Developers */}
        <AnimatePresence>
          {showDevelopers && (
            <motion.div
              className="col-span-1 md:col-span-3 bg-gray-800/80 rounded-xl p-6 mt-12 border border-gray-700/40 backdrop-blur-md relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <button
                onClick={() => setShowDevelopers(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-400"
              >
                <FiX size={20} />
              </button>
              <h3 className="text-xl font-bold text-green-400 flex items-center mb-6">
                <FiUsers className="mr-2" /> Meet Our Developers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    initials: "RT",
                    name: "Rishabh Tomar",
                    role: "Full Stack Developer",
                    desc: "Passionate about creating intuitive user experiences with modern web technologies.",
                    gradient: "from-green-400 to-blue-500",
                    socials: [
                      { icon: <FaGithub />, link: "#" },
                      { icon: <FaLinkedin />, link: "#" },
                    ],
                  },
                  {
                    initials: "SS",
                    name: "Samiksha Suryawanshi",
                    role: "UI/UX Designer & Developer",
                    desc: "Specializes in creating beautiful, accessible, and responsive user interfaces.",
                    gradient: "from-purple-400 to-pink-500",
                    socials: [
                      { icon: <FaTwitter />, link: "#" },
                      { icon: <FaLinkedin />, link: "#" },
                    ],
                  },
                ].map((dev, i) => (
                  <motion.div
                    key={i}
                    className="bg-gray-900/50 p-5 rounded-lg border border-gray-700/30 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${dev.gradient} flex items-center justify-center text-lg font-bold text-white`}>
                        {dev.initials}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{dev.name}</h4>
                        <p className="text-green-400">{dev.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">{dev.desc}</p>
                    <div className="flex gap-3 text-gray-400">
                      {dev.socials.map((s, idx) => (
                        <motion.a 
                          key={idx} 
                          href={s.link} 
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 text-white/60 hover:text-green-400 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {s.icon}
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                ))}
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
        
        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-green-500 to-[#FF742C] hover:from-green-600 hover:to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 backdrop-blur-sm border border-white/10"
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: 20 }}
              whileHover={{ scale: 1.1, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)" }}
              whileTap={{ scale: 0.9 }}
              aria-label="Scroll to top"
            >
              <FiArrowUp size={20} />
              
              {/* Pulse animation */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/50 to-[#FF742C]/50 animate-ping opacity-30"></div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </footer>
  );
};

export default Footer;
