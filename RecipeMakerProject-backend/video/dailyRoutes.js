import express from "express";
import axios from "axios";

const router = express.Router();
const DAILY_API_KEY = process.env.DAILY_API_KEY;

router.post("/create-room", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.daily.co/v1/rooms",
      {
        properties: {
          enable_prejoin_ui: true,
          start_video_off: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
      }
    );

    res.status(200).json({ roomUrl: response.data.url });
  } catch (error) {
    console.error("Daily API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create room" });
  }
});

export default router;
