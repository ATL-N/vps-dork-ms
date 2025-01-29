// smsConfig.js
export const createSMSConfig = () => ({
  apiKey: process.env.ARKESEL_API_KEY,
  isSandbox: process.env.NODE_ENV !== "production",
  // Specify sender ID type for one-way messaging
  senderConfig: {
    id: process.env.SENDER_ID || "YOURAPP", // Max 11 chars
    type: "one-way",
    schedule: "immediate",
  },
});

export default createSMSConfig;