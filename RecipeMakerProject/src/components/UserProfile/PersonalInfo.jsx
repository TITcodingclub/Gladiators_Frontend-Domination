import React from "react";
import { motion } from "framer-motion";
import { UserCircle, Calendar, User, Droplet, Thermometer, Activity, Flame, Target, Edit3, Stethoscope } from "lucide-react";

function ProfileCard({ icon, label, value, onClick }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition" onClick={onClick}>
      <div>{icon}</div>
      <div>
        <div className="text-xs text-white/60">{label}</div>
        <div className="text-lg font-bold text-white">{value}</div>
      </div>
    </div>
  );
}

export default function PersonalInfo({ profile, setEditMode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl relative overflow-hidden"
    >
      <div className="absolute -left-20 -top-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-green-500/10 rounded-full blur-3xl"></div>
      <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <UserCircle className="text-blue-400" size={24} /> Personal Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileCard icon={<Calendar size={20} className="text-blue-400" />} label="Age" value={profile.age || "Not specified"} onClick={() => setEditMode(true)} />
        <ProfileCard icon={<User size={20} className="text-purple-400" />} label="Gender" value={profile.gender || "Not specified"} onClick={() => setEditMode(true)} />
        <ProfileCard icon={<Droplet size={20} className="text-red-400" />} label="Blood Group" value={profile.bloodGroup || "Not specified"} onClick={() => setEditMode(true)} />
        <ProfileCard icon={<Thermometer size={20} className="text-orange-400" />} label="Weight" value={profile.weight ? `${profile.weight} kg` : "Not specified"} onClick={() => setEditMode(true)} />
        <ProfileCard icon={<Activity size={20} className="text-green-400" />} label="Height" value={profile.height ? `${profile.height} cm` : "Not specified"} onClick={() => setEditMode(true)} />
        <ProfileCard icon={<Activity size={20} className="text-indigo-400" />} label="BMI" value={profile.bmi || "Not calculated"} onClick={() => setEditMode(true)} />
        <ProfileCard icon={<Flame size={20} className="text-yellow-400" />} label="Daily Calories" value={profile.dailyCalories ? `${profile.dailyCalories} kcal` : "Not calculated"} onClick={() => setEditMode(true)} />
        <ProfileCard icon={<Target size={20} className="text-pink-400" />} label="Goals" value={profile.goalStatus || "Not specified"} onClick={() => setEditMode(true)} />
      </div>
      <div className="mt-6 p-4 bg-white/5 rounded-xl">
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Stethoscope size={18} className="text-red-400" /> Medical History
        </h4>
        <p className="text-white/80 p-3 bg-white/5 rounded-lg">
          {profile.medicalHistory || "No medical history provided. Click to add your medical information."}
        </p>
        <button 
          onClick={() => setEditMode(true)}
          className="mt-4 py-2 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Edit3 size={16} /> Update Medical Info
        </button>
      </div>
    </motion.div>
  );
}
