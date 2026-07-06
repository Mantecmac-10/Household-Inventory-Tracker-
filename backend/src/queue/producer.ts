import { emailQueue } from "./queue";

type Emailpayload = {
  emails: string[];
  itemName: string;
  expiryDate: Date | string;
  itemId: string;
};

export const sendExpiryEmail = async (
  data: Emailpayload,
  options?: {
    delay?: number;
  },
) => {
  await emailQueue.add("send-email", data, {
    delay: options?.delay,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  });
};
