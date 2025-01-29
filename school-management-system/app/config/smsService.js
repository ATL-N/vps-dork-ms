// smsService.js
import axios from "axios";

const ARKESEL_ENDPOINTS = {
  sandbox: "https://sandbox.arkesel.com/sms/api",
  production: "https://sms.arkesel.com/sms/api",
};

const sendOneWaySMS = async ({ recipients, message }, config) => {
  // Validate sender ID length
  if (config.senderConfig.id.length > 11) {
    return {
      success: false,
      error: "Sender ID must not exceed 11 characters",
    };
  }

  // Format phone numbers
  const formattedRecipients = recipients.map((phone) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.startsWith("0") ? `+233${cleaned.slice(1)}` : cleaned;
  });

  // Sandbox response
  if (config.isSandbox) {
    return {
      success: true,
      message: `Sandbox: One-way message from ${config.senderConfig.id}`,
      messageId: `SANDBOX_${Date.now()}`,
      details: {
        sender: config.senderConfig.id,
        type: "one-way",
        recipients: formattedRecipients,
        content: message,
      },
    };
  }

  try {
    const response = await axios.post(ARKESEL_ENDPOINTS.production, {
      api_key: config.apiKey,
      sender: config.senderConfig.id,
      message,
      recipients: formattedRecipients,
      // Specify one-way messaging parameters
      options: {
        message_type: "one-way",
        allow_reply: false,
      },
    });

    return {
      success: true,
      messageId: response.data.message_id,
      sender: config.senderConfig.id,
      details: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};
