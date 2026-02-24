import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL as string, // Use verified domain in prod, or resend.dev for testing
      to,
      subject,
      html,
    });

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

export const sendOTPEmail = async (
  to: string,
  otp: string,
  type: "REGISTER" | "LOGIN" | "RESET",
) => {
  const subjectMap = {
    REGISTER: "Verifikasi Pendaftaran - BootcampSewu",
    LOGIN: "Kode Login - BootcampSewu",
    RESET: "Reset Password - BootcampSewu",
  };

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>${subjectMap[type]}</h2>
      <p>Gunakan kode OTP berikut untuk melanjutkan:</p>
      <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
      <p>Kode ini berlaku selama 5 menit.</p>
      <p>Jika Anda tidak meminta kode ini, abaikan email ini.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: subjectMap[type],
    html,
  });
};
