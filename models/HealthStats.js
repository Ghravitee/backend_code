import mongoose from "mongoose";

const healthStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    vitals: {
      bodyTemperature: { type: Number, required: false },
      pulseRate: { type: Number, required: false },
      respirationRate: { type: Number, required: false },
      bloodPressure: { type: String, required: false }, // Format: "120/80"
      bloodOxygen: { type: Number, required: false },
      weight: { type: Number, required: false },
      bloodGlucoseLevel: { type: Number, required: false },
    },
    exerciseLog: {
      walking: { type: Number, required: false }, // in km
      jogging: { type: Number, required: false }, // in km
      running: { type: Number, required: false }, // in km
      cycling: { type: Number, required: false }, // in km
      ropeSkipping: { type: Number, required: false }, // counts
      yoga: { type: Number, required: false }, // in minutes
      dance: { type: Number, required: false }, // in minutes
    },
  },
  { timestamps: true }
);

// Ensure userId and date combination is unique
healthStatsSchema.index({ userId: 1, date: 1 }, { unique: true });

const HealthStats = mongoose.model("HealthStats", healthStatsSchema);

export default HealthStats;

// import mongoose from "mongoose";

// const healthStatsSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     date: {
//       type: Date,
//       required: true,
//     },
//     vitals: {
//       bodyTemperature: { type: Number, required: false },
//       pulseRate: { type: Number, required: false },
//       respirationRate: { type: Number, required: false },
//       bloodPressure: { type: String, required: false }, // Format: "120/80"
//       bloodOxygen: { type: Number, required: false },
//       weight: { type: Number, required: false },
//       bloodGlucoseLevel: { type: Number, required: false },
//     },
//     exerciseLog: {
//       walking: { type: Number, required: false }, // in km
//       jogging: { type: Number, required: false }, // in km
//       running: { type: Number, required: false }, // in km
//       cycling: { type: Number, required: false }, // in km
//       ropeSkipping: { type: Number, required: false }, // counts
//       yoga: { type: Number, required: false }, // in minutes
//       dance: { type: Number, required: false }, // in minutes
//     },
//     symptoms: [
//       {
//         symptom: { type: String, required: true }, // e.g., "Headache"
//         severity: {
//           type: String,
//           enum: ["Mild", "Moderate", "Severe"],
//           required: false,
//         },
//         notes: { type: String, required: false }, // e.g., "Lasted for 3 hours"
//       },
//     ],
//   },
//   { timestamps: true }
// );

// // Ensure userId and date combination is unique
// healthStatsSchema.index({ userId: 1, date: 1 }, { unique: true });

// const HealthStats = mongoose.model("HealthStats", healthStatsSchema);

// export default HealthStats;
