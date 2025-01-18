import User from "../models/User.js"; // Import the User model
import HealthStats from "../models/HealthStats.js"; // Import the HealthStats model

// Create Health Stats (for a user)
export const createHealthStats = async (req, res) => {
  try {
    const { userId, date, vitals, exerciseLog } = req.body;

    // Normalize the date to only consider the date part (ignore the time)
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0); // Set to the start of the day

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the user already logged stats for the given date
    const existingStats = user.healthStats.find(
      (stats) => stats.date.getTime() === normalizedDate.getTime()
    );

    // If the user already logged health stats for this date, respond with an error
    if (existingStats) {
      return res.status(400).json({
        message: "Stats for this date already exist for the user.",
      });
    }

    // Create the health stats document in the HealthStats collection
    const healthStats = new HealthStats({
      userId,
      date: normalizedDate,
      vitals,
      exerciseLog,
    });

    // Save the new health stats document
    await healthStats.save();

    // Add the new health stats ObjectId to the user's healthStats array
    user.healthStats.push(healthStats._id);

    // Save the updated user document
    await user.save();

    res.status(201).json(healthStats); // Return the newly added health stats
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Health Stats for the Logged-in User
export const getAllHealthStats = async (req, res) => {
  try {
    const { userId } = req.user; // userId is set by auth middleware

    // Find the user by userId and fetch their healthStats
    const user = await User.findById(userId).select("healthStats");

    if (!user || !user.healthStats.length) {
      return res
        .status(404)
        .json({ message: "No health stats found for the user." });
    }

    res.status(200).json(user.healthStats);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching health stats.",
      error: error.message,
    });
  }
};

// Get Health Stats for All Users (Admin endpoint)
export const getAllUserHealthStats = async (req, res) => {
  try {
    // Query the database to fetch all users and their health stats
    const users = await User.find().select("fullName healthStats");

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    const allHealthStats = users.map((user) => ({
      fullName: user.fullName,
      healthStats: user.healthStats,
    }));

    res.status(200).json(allHealthStats);
  } catch (error) {
    console.error("Error fetching health stats:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Health Stats for a Specific Date
export const getHealthStatsByDate = async (req, res) => {
  try {
    const { userId } = req.user; // userId is set by auth middleware
    const { date } = req.params; // Expected in "YYYY-MM-DD" format

    // Convert the date string to a Date object in UTC and normalize to the start of the day (00:00:00)
    const startOfDay = new Date(date); // Create date object from string
    startOfDay.setUTCHours(0, 0, 0, 0); // Normalize to the start of the day (UTC)

    // Set the end of the day to 23:59:59 to capture the whole day
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999); // Normalize to the end of the day (UTC)

    // Find the user and search for health stats within the specified date range
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find health stats for the user on the specified date
    const stats = user.healthStats.find(
      (stats) => stats.date >= startOfDay && stats.date <= endOfDay
    );

    if (!stats) {
      return res.status(404).json({ message: "No stats found for this date." });
    }

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Health Stats by Date Range
export const getHealthStatsByRange = async (req, res) => {
  try {
    const { userId } = req.user;
    const { start, end } = req.params;

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Find the user by userId and get the health stats within the given range
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const stats = user.healthStats.filter(
      (stat) => stat.date >= startDate && stat.date <= endDate
    );

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Health Stats for a Specific Date
export const updateHealthStats = async (req, res) => {
  try {
    const { userId } = req.user;
    const { date } = req.params;
    const { vitals, exerciseLog } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find the health stats for the specified date
    const statsIndex = user.healthStats.findIndex(
      (stat) => stat.date.toISOString().split("T")[0] === date
    );

    if (statsIndex === -1) {
      return res.status(404).json({ message: "No stats found for this date." });
    }

    // Update the stats for that date
    user.healthStats[statsIndex].vitals = vitals;
    user.healthStats[statsIndex].exerciseLog = exerciseLog;

    // Save the updated user document
    await user.save();

    res.status(200).json(user.healthStats[statsIndex]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
