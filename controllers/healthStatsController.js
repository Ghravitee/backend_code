import HealthStats from "../models/HealthStats.js";

export const createHealthStats = async (req, res) => {
  try {
    const { userId, date, vitals, exerciseLog } = req.body;

    // Normalize the date to only consider the date part (ignore the time)
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0); // Set to the start of the day

    // Check if the user has already logged stats for the given date
    const existingStats = await HealthStats.findOne({
      userId,
      date: {
        $gte: normalizedDate,
        $lt: new Date(normalizedDate).setUTCHours(23, 59, 59, 999),
      }, // Check for stats within the same day
    });

    // If the user already logged health stats for this date, respond with an error
    if (existingStats) {
      return res
        .status(400)
        .json({ message: "Stats for this date already exist for the user." });
    }

    // Create a new stats entry
    const newStats = new HealthStats({
      userId,
      date: normalizedDate,
      vitals,
      exerciseLog,
    });

    // Save the stats to the database
    await newStats.save();

    // Respond with the newly created stats
    res.status(201).json(newStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUserHealthStats = async (req, res) => {
  try {
    // Query the database to fetch all health stats
    const healthStats = await HealthStats.find(); // Fetches all documents in the HealthStat collection

    // Send the fetched data as a response
    return res.status(200).json(healthStats);
  } catch (error) {
    console.error("Error fetching health stats:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllHealthStats = async (req, res) => {
  try {
    // Fetch all health stats (remove user-specific filters)
    const healthStats = await HealthStats.find();

    if (!healthStats || healthStats.length === 0) {
      return res.status(404).json({ message: "No health stats found." });
    }

    res.status(200).json(healthStats);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching health stats.",
      error: error.message,
    });
  }
};

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

    // Query the database for health stats between startOfDay and endOfDay
    const stats = await HealthStats.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }, // Date range query
    });

    if (!stats) {
      return res.status(404).json({ message: "No stats found for this date." });
    }

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHealthStatsByRange = async (req, res) => {
  try {
    const { userId } = req.user;
    const { start, end } = req.params;

    const stats = await HealthStats.find({
      userId,
      date: { $gte: new Date(start), $lte: new Date(end) },
    });

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHealthStats = async (req, res) => {
  try {
    const { userId } = req.user;
    const { date } = req.params;
    const { vitals, exerciseLog } = req.body;

    const updatedStats = await HealthStats.findOneAndUpdate(
      { userId, date },
      { vitals, exerciseLog },
      { new: true, runValidators: true }
    );

    if (!updatedStats) {
      return res.status(404).json({ message: "No stats found for this date." });
    }

    res.status(200).json(updatedStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// import HealthStats from "../models/HealthStats.js";

// export const createHealthStats = async (req, res) => {
//   try {
//     const {
//       userId,
//       date,
//       vitals,
//       exerciseLog,
//       symptoms,
//       sleepPatterns,
//       mentalHealth,
//     } = req.body;

//     // Normalize the date to only consider the date part (ignore the time)
//     const normalizedDate = new Date(date);
//     normalizedDate.setUTCHours(0, 0, 0, 0); // Set to the start of the day

//     // Check if the user has already logged stats for the given date
//     const existingStats = await HealthStats.findOne({
//       userId,
//       date: {
//         $gte: normalizedDate,
//         $lt: new Date(normalizedDate).setUTCHours(23, 59, 59, 999),
//       },
//     });

//     // If the user already logged health stats for this date, respond with an error
//     if (existingStats) {
//       return res
//         .status(400)
//         .json({ message: "Stats for this date already exist for the user." });
//     }

//     // Create a new stats entry
//     const newStats = new HealthStats({
//       userId,
//       date: normalizedDate,
//       vitals,
//       exerciseLog,
//       symptoms,
//       sleepPatterns,
//       mentalHealth,
//     });

//     // Save the stats to the database
//     await newStats.save();

//     // Respond with the newly created stats
//     res.status(201).json(newStats);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getHealthStatsByDate = async (req, res) => {
//   try {
//     const { userId } = req.user; // userId is set by auth middleware
//     const { date } = req.params; // Expected in "YYYY-MM-DD" format

//     // Convert the date string to a Date object in UTC and normalize to the start of the day (00:00:00)
//     const startOfDay = new Date(date);
//     startOfDay.setUTCHours(0, 0, 0, 0);

//     // Set the end of the day to 23:59:59 to capture the whole day
//     const endOfDay = new Date(date);
//     endOfDay.setUTCHours(23, 59, 59, 999);

//     // Query the database for health stats between startOfDay and endOfDay
//     const stats = await HealthStats.findOne({
//       userId,
//       date: { $gte: startOfDay, $lte: endOfDay },
//     });

//     if (!stats) {
//       return res.status(404).json({ message: "No stats found for this date." });
//     }

//     res.status(200).json(stats);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getHealthStatsByRange = async (req, res) => {
//   try {
//     const { userId } = req.user;
//     const { start, end } = req.params;

//     const stats = await HealthStats.find({
//       userId,
//       date: { $gte: new Date(start), $lte: new Date(end) },
//     });

//     res.status(200).json(stats);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const updateHealthStats = async (req, res) => {
//   try {
//     const { userId } = req.user;
//     const { date } = req.params;
//     const { vitals, exerciseLog, symptoms, sleepPatterns, mentalHealth } =
//       req.body;

//     const updatedStats = await HealthStats.findOneAndUpdate(
//       { userId, date },
//       { vitals, exerciseLog, symptoms, sleepPatterns, mentalHealth },
//       { new: true, runValidators: true }
//     );

//     if (!updatedStats) {
//       return res.status(404).json({ message: "No stats found for this date." });
//     }

//     res.status(200).json(updatedStats);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
