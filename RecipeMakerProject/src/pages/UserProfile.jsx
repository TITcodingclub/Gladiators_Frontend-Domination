import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Heart, Settings, User, Calendar, Phone, Activity, Thermometer, Droplet } from "lucide-react";
import { MdEmail, MdPhone, MdFavorite, MdFavoriteBorder } from "react-icons/md"; // ✅ New icons
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
  const [recentSearches, setRecentSearches] = useState([]);
  const [showAccountManagement, setShowAccountManagement] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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

  const [editForm, setEditForm] = useState({
    dob: "",
    gender: "",
    weight: "",
    height: "",
    phone: "",
    bloodGroup: "",
    medicalHistory: "",
    dailyCalories: "",
    goalStatus: "",
    notificationsEnabled: true,
    privacy: "public",
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
          bmi: p.bmi || "",
          dailyCalories: p.dailyCalories || "",
          goalStatus: p.goalStatus || "",
        });

        setEditForm({
          dob: p.dob || "",
          gender: p.gender || "",
          weight: p.weight || "",
          height: p.height || "",
          phone: p.phone || "",
          bloodGroup: p.bloodGroup || "",
          medicalHistory: p.medicalHistory || "",
          dailyCalories: p.dailyCalories || "",
          goalStatus: p.goalStatus || "",
          notificationsEnabled: typeof p.notificationsEnabled === 'boolean' ? p.notificationsEnabled : true,
          privacy: p.privacy || "public",
        });

        try {
          const recent = await axiosInstance.get('/api/users/searches/recent');
          setRecentSearches(recent.data?.searches || []);
          setFavorites((recent.data?.searches || []).filter((s) => s.isFavorite));
        } catch {}
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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const payload = {
        ...editForm,
        weight: editForm.weight ? Number(editForm.weight) : undefined,
        height: editForm.height ? Number(editForm.height) : undefined,
      };
      const { data } = await axiosInstance.put("/api/users/profile", payload);
      if (data && data.profile) {
        const p = data.profile;
        setProfile({
          age: p.age || "",
          gender: p.gender || "",
          weight: p.weight || "",
          height: p.height || "",
          phone: p.phone || "",
          bloodGroup: p.bloodGroup || "",
          medicalHistory: p.medicalHistory || "",
          bmi: p.bmi || "",
          dailyCalories: p.dailyCalories || "",
          goalStatus: p.goalStatus || "",
        });
        setEditMode(false);
      }
    } catch (error) {
      console.error("Failed to save profile", error);
    } finally {
      setSaving(false);
    }
  };

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
          <div className="text-center sm:text-left w-full">
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

        {/* Extended Profile Info (read-only) */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileCard icon={<Calendar size={20} />} label="Age" value={profile.age} />
          <ProfileCard icon={<User size={20} />} label="Gender" value={profile.gender} />
          <ProfileCard icon={<Droplet size={20} />} label="Blood Group" value={profile.bloodGroup} />
          <ProfileCard icon={<Thermometer size={20} />} label="Weight" value={profile.weight} />
          <ProfileCard icon={<Activity size={20} />} label="Height" value={profile.height} />
          <ProfileCard icon={<Activity size={20} />} label="BMI" value={profile.bmi} />
          <ProfileCard icon={<Activity size={20} />} label="Calories" value={profile.dailyCalories} />
          <ProfileCard icon={<Activity size={20} />} label="Goals" value={profile.goalStatus} />
          <ProfileCard icon={<Activity size={20} />} label="Medical History" value={profile.medicalHistory} />
        </motion.div>

        {/* Recent Searches */}
        <motion.div>
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
            Recent Searches
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSearches.length > 0 ? (
              recentSearches.map((s) => (
                <div key={s._id} className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3">
                  <img src={s.image || '/images/default.jpg'} alt={s.recipeTitle || s.query} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="text-white font-semibold truncate">{s.recipeTitle || s.query}</p>
                    <p className="text-white/60 text-sm truncate">{s.query}</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={async () => {
                      try {
                        if (s.isFavorite) {
                          await axiosInstance.delete(`/api/users/searches/${s._id}/favorite`);
                          setRecentSearches((prev) =>
                            prev.map((it) =>
                              it._id === s._id ? { ...it, isFavorite: false } : it
                            )
                          );
                          setFavorites((prev) => prev.filter((it) => it._id !== s._id));
                        } else {
                          await axiosInstance.post(`/api/users/searches/${s._id}/favorite`);
                          setRecentSearches((prev) =>
                            prev.map((it) =>
                              it._id === s._id ? { ...it, isFavorite: true } : it
                            )
                          );
                          setFavorites((prev) =>
                            prev.find((it) => it._id === s._id)
                              ? prev
                              : [...prev, { ...s, isFavorite: true }]
                          );
                        }
                      } catch (e) {
                        console.error("Favorite toggle failed", e);
                      }
                    }}
                    className="text-red-500 hover:text-red-600 transition"
                  >
                    {s.isFavorite ? (
                      <MdFavorite size={28} />
                    ) : (
                      <MdFavoriteBorder size={28} className="text-white" />
                    )}
                  </motion.button>

                </div>
              ))
            ) : (
              <p className="text-white/60">No recent searches.</p>
            )}
          </div>
        </motion.div>

        {/* Favorite Recipes */}
        <motion.div>
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
            <Heart size={24} className="text-red-500" /> Favorite Recipes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.length > 0 ? (
              favorites.map((recipe) => (
                <motion.div
                  key={recipe._id}
                  whileHover={{ scale: 1.05 }}
                  className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
                >
                  <img
                    src={recipe.image || "/images/default.jpg"}
                    alt={recipe.recipeTitle || recipe.title}
                    className="w-full h-40 object-cover group-hover:brightness-75 transition"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <p className="text-white font-bold text-lg text-center px-3">
                      {recipe.recipeTitle || recipe.title}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-white/60 col-span-full text-center">
                No favorite recipes yet.
              </p>
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
                className="overflow-hidden mt-4 p-6 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl flex flex-col gap-6"
              >
                {/* Title */}
                <h2 className="text-xl font-semibold text-white/90 tracking-wide">
                  Account Management
                </h2>
                <p className="text-white/70 text-sm">
                  Manage your account settings and preferences below:
                </p>

                {/* Edit Profile Toggle */}
                <button
                  onClick={() => setEditMode((v) => !v)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-black font-semibold hover:from-green-500 hover:to-green-600 transition-all shadow-md text-base"
                >
                  {editMode ? "Close Edit" : "Edit Profile"}
                </button>

                {/* Editable Fields */}
                {editMode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <EditField label="Date of Birth" name="dob" type="date" value={editForm.dob} onChange={handleEditChange} />
                    <EditField label="Phone" name="phone" value={editForm.phone} onChange={handleEditChange} />
                    <EditField label="Gender" name="gender" value={editForm.gender} onChange={handleEditChange} placeholder="Male/Female/Other" />
                    <EditField label="Blood Group" name="bloodGroup" value={editForm.bloodGroup} onChange={handleEditChange} placeholder="O+ / A- ..." />
                    <EditField label="Weight (kg)" name="weight" type="number" value={editForm.weight} onChange={handleEditChange} />
                    <EditField label="Height (cm)" name="height" type="number" value={editForm.height} onChange={handleEditChange} />
                    <EditField label="Daily Calories" name="dailyCalories" type="number" value={editForm.dailyCalories} onChange={handleEditChange} />
                    <EditField label="Goal Status" name="goalStatus" value={editForm.goalStatus} onChange={handleEditChange} />

                    {/* Medical History */}
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-white text-sm font-semibold">
                        Medical History
                      </label>
                      <textarea
                        name="medicalHistory"
                        value={editForm.medicalHistory}
                        onChange={handleEditChange}
                        className="w-full rounded-xl px-3 py-2 bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                        rows={3}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => setEditMode(false)}
                        type="button"
                        className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition shadow"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        type="button"
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-green-500 text-black font-semibold hover:from-green-500 hover:to-green-600 disabled:opacity-50 transition shadow"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Extra Account Options */}

                <div className="flex flex-col gap-4 mt-4">
                  {/* Notifications Toggle */}
                  <motion.div
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg"
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <span className="text-base font-medium">Notifications</span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={!!editForm.notificationsEnabled}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, notificationsEnabled: e.target.checked }))
                        }
                      />
                      <span className="w-12 h-6 bg-gray-400 rounded-full shadow-inner relative transition-all">
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                            editForm.notificationsEnabled ? "translate-x-6 bg-green-400" : ""
                          }`}
                        ></span>
                      </span>
                    </label>
                  </motion.div>

                  {/* Privacy Toggle */}
                  <motion.div
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg"
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <span className="text-base font-medium">Privacy</span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={editForm.privacy === "private"}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            privacy: e.target.checked ? "private" : "public",
                          }))
                        }
                      />
                      <span className="mr-3 text-sm font-medium text-gray-300">
                        {editForm.privacy === "private" ? "Private" : "Public"}
                      </span>
                      <span className="w-12 h-6 bg-gray-400 rounded-full shadow-inner relative transition-all">
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                            editForm.privacy === "private"
                              ? "translate-x-6 bg-blue-400"
                              : ""
                          }`}
                        ></span>
                      </span>
                    </label>
                  </motion.div>

                  {/* Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {/* Logout Button */}
                    <motion.button
                      onClick={() => setShowConfirmLogout(true)}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold shadow-md hover:from-red-500 hover:to-red-600 hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                        />
                      </svg>
                      Logout
                    </motion.button>

                    {/* Delete Account Button */}
                <motion.button
                      onClick={() => setShowConfirmDelete(true)}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete Account
                    </motion.button>
                  </div>
                </div>


                {/* Logout at Bottom */}
                {/* <motion.button
                  onClick={() => setShowConfirmLogout(true)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  className="mt-6 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg"
                >
                  <LogOut size={20} /> Logout
                </motion.button> */}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirm Logout Modal */}
          {showConfirmLogout && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-black rounded-2xl w-11/12 max-w-md p-6 text-white shadow-2xl">
                <h3 className="text-lg font-semibold mb-2">Confirm Logout</h3>
                <p className="text-sm text-gray-600 mb-6">Are you sure you want to log out?</p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowConfirmLogout(false)} className="px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-300">Cancel</button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Delete Account Modal */}
          {showConfirmDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-black rounded-2xl w-11/12 max-w-md p-6 text-white shadow-2xl">
                <h3 className="text-lg font-semibold mb-2">Delete Account</h3>
                <p className="text-md text-gray-700 mb-4">
                  This action is permanent and will remove your profile and data. Type DELETE to confirm.
                </p>
                <DeleteConfirmForm
                  onCancel={() => setShowConfirmDelete(false)}
                  onConfirm={async () => {
                    try {
                      await axiosInstance.delete('/api/users/account');
                      await signOut(auth);
                      navigate('/login', { replace: true });
                    } catch (e) {
                      console.error('Delete failed', e);
                    }
                  }}
                />
              </div>
            </div>
          )}

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

function EditField({ label, name, value, onChange, type = "text", placeholder }) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-white">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="rounded-xl px-3 py-2 bg-gray-200 text-black"
      />
    </div>
  );
}

function DeleteConfirmForm({ onCancel, onConfirm }) {
  const [value, setValue] = React.useState("");
  const canConfirm = value.trim().toUpperCase() === "DELETE";
  return (
    <div className="flex flex-col gap-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type DELETE to confirm"
        className="w-full rounded-xl px-3 py-2 bg-white text-black border border-gray-300"
      />
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-white/90 text-black hover:bg-white">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={!canConfirm}
          className={`px-4 py-2 rounded-lg ${canConfirm ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-300 text-white/70 cursor-not-allowed'}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
