import { Resend } from "resend";

export const getResendClient = () => new Resend(process.env.RESEND_API_KEY);
