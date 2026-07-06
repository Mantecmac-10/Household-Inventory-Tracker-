import { Worker } from "bullmq";
import nodemailer from "nodemailer";
import { config } from "../config/env";
import { connection } from "./queue";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

export const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { emails, itemName, expiryDate } = job.data;

    await Promise.all(
      emails.map((email: string) =>
        transporter.sendMail({
          from: config.SMTP_USER,
          to: email,
          subject: `${itemName} is expiring soon`,
          text: `Hi! Just a heads-up: ${itemName} in your household expires on ${expiryDate}. Use it before it's wasted!`,
        }),
      ),
    );

    console.log(
      `[EmailWorker] Sent expiry alerts for "${itemName}" to ${emails.length} member(s)`,
    );
  },
  { connection },
);

emailWorker.on("failed", (job, err) => {
  console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
});

emailWorker.on("completed", (job) => {
  console.log(`[EmailWorker] Job ${job.id} completed`);
});
