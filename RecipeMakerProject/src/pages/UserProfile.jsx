import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Heart, Settings, User, Calendar, Phone, Activity, Thermometer, Droplet } from "lucide-react";
import { MdEmail, MdPhone } from "react-icons/md"; // ✅ New icons
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { getAuth, signOut } from "firebase/auth";
import ThreadBackground from "../components/ThreadBackground";

export default function UserProfile() {
  const navigate = useNavigate();
  const auth = getAuth();
  const firebaseUser = auth.currentUser;

  const [user, setUser] = useState(firebaseUser || null);
  const [favorites, setFavorites] = useState([]);
  const [showAccountManagement, setShowAccountManagement] = useState(false);

  // Extended profile details
  const [profile, setProfile] = useState({
    age: "",
    gender: "",
    weight: "",
    height: "",
    phone: "",
    bloodGroup: "",
    medicalHistory: "",
    bmi: "",
    dailyCalories: "",
    goalStatus: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!firebaseUser) return navigate("/login");

      try {
        const { data } = await axiosInstance.get("/api/users/me");

        const u = data.user || {};
        const p = data.profile || {};

        setUser((prev) => ({
          ...prev,
          name: u.name || prev?.displayName,
          email: u.email || prev?.email,
          photo: u.photo || prev?.photoURL,
        }));

        setProfile({
          age: p.age || "",
          gender: p.gender || "",
          weight: p.weight || "",
          height: p.height || "",
          phone: p.phone || "",
          bloodGroup: p.bloodGroup || "",
          medicalHistory: p.medicalHistory || "",
          bmi: u.bmi || "22.5",
          dailyCalories: p.dailyCalories || "1800 kcal",
          goalStatus: p.goalStatus || "On Track",
        });

        setFavorites(data.favorites || []);
      } catch (error) {
        console.error(error);
        navigate("/login");
      }
    };

    fetchUserData();
    // Refetch when window regains focus to stay in sync
    const onFocus = () => fetchUserData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [firebaseUser, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      try {
        await axios.post("/api/users/logout");
      } catch {}
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  if (!user)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center h-screen"
      >
        <p className="text-xl font-semibold text-white">Loading profile...</p>
      </motion.div>
    );

  return (
    <div className="relative py-24">
      <ThreadBackground />

      <div className="relative max-w-6xl mx-auto py-10 px-6 flex flex-col gap-8 z-10">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-6 shadow-2xl backdrop-blur-md"
        >
          <motion.img
            whileHover={{ scale: 1.1 }}
            src={
              user.photo ||
              user.photoURL ||
              `https://ui-avatars.com/api/?name=${user.name || user.displayName}`
            }
            alt="User Avatar"
            className="w-28 h-28 rounded-full border-4 border-white shadow-lg"
          />
          <div className="text-center sm:text-left">
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white"
            >
              {user.name || user.displayName || "User"}
            </motion.h2>

            {/* ✅ Email with icon */}
            <p className="text-white/70 mt-2 flex items-center gap-2">
              <MdEmail className="text-green-400" size={20} />
              <a href={`mailto:${user.email}`} className="hover:underline">
                {user.email}
              </a>
            </p>

            {/* ✅ Phone with icon */}
            {profile.phone && (
              <p className="text-white/70 mt-1 flex items-center gap-2">
                <MdPhone className="text-green-400" size={20} />
                <a href={`tel:${profile.phone}`} className="hover:underline">
                  {profile.phone}
                </a>
              </p>
            )}
          </div>
        </motion.div>

        {/* Extended Profile Info */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileCard icon={<Calendar size={20} />} label="Age" value={profile.age} />
          <ProfileCard icon={<User size={20} />} label="Gender" value={profile.gender} />
          <ProfileCard icon={<Droplet size={20} />} label="Blood Group" value={profile.bloodGroup} />
          <ProfileCard icon={<Thermometer size={20} />} label="Weight" value={profile.weight} />
          <ProfileCard icon={<Activity size={20} />} label="Height" value={profile.height} />
          {/* <ProfileCard icon={<Phone size={20} />} label="Phone" value={profile.phone} /> */}
          <ProfileCard icon={<Activity size={20} />} label="BMI" value={profile.bmi} />
          <ProfileCard icon={<Activity size={20} />} label="Calories" value={profile.dailyCalories} />
          <ProfileCard icon={<Activity size={20} />} label="Goals" value={profile.goalStatus} />
          <ProfileCard icon={<Activity size={20} />} label="Medical History" value={profile.medicalHistory} />
        </motion.div>

        {/* Favorite Recipes */}
        <motion.div>
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
            <Heart size={24} className="text-red-500" /> Favorite Recipes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {favorites.length > 0 ? (
              favorites.map((recipe, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
                >
                  <img
                    src={recipe.image || "/images/default.jpg"}
                    alt={recipe.title}
                    className="w-full h-40 object-cover group-hover:brightness-75 transition"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <p className="text-white font-bold text-lg">{recipe.title}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-white/60 col-span-2">No favorite recipes yet.</p>
            )}
          </div>
        </motion.div>

        {/* Account Settings */}
        <div className="mt-auto">
          <motion.div
            className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-md"
          >
            <div className="flex items-center gap-2 text-white">
              <Settings size={20} /> <span className="font-medium">Account Settings</span>
            </div>
            <button
              onClick={() => setShowAccountManagement(!showAccountManagement)}
              className="text-green-400 font-semibold cursor-pointer"
            >
              {showAccountManagement ? "Close" : "Manage"}
            </button>
          </motion.div>

          <AnimatePresence>
            {showAccountManagement && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden mt-4 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex flex-col gap-6"
              >
                <p className="text-white/80 text-sm">
                  Manage your account settings below:
                </p>
                <motion.button
                  onClick={handleLogout}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold self-center shadow-lg"
                >
                  <LogOut size={20} /> Logout
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ProfileCard({ icon, label, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
      className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl"
    >
      <div className="text-green-400">{icon}</div>
      <div>
        <p className="text-white/70 text-sm">{label}</p>
        <p className="text-white font-semibold">{value || "-"}</p>
      </div>
    </motion.div>
  );
}
