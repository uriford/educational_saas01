import "server-only";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

type SendEmailResult =
  | {
      success: true;
      id: string | undefined;
    }
  | {
      success: false;
      message: string;
    };

export class EmailService {
  static async send(
    input: SendEmailInput,
  ): Promise<SendEmailResult> {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.RESEND_FROM_EMAIL;

      if (!apiKey) {
        throw new Error(
          "RESEND_API_KEY is not configured.",
        );
      }

      if (!from) {
        throw new Error(
          "RESEND_FROM_EMAIL is not configured.",
        );
      }

      const { data, error } = await resend.emails.send({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        ...(input.text
          ? {
              text: input.text,
            }
          : {}),
      });

      if (error) {
        console.error(
          "RESEND EMAIL ERROR:",
          error,
        );

        return {
          success: false,
          message:
            error.message ||
            "Failed to send email.",
        };
      }

      return {
        success: true,
        id: data?.id,
      };
    } catch (error) {
      console.error(
        "EMAIL SERVICE ERROR:",
        error,
      );

      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to send email.",
      };
    }
  }

  static async sendText(
    to: string | string[],
    subject: string,
    text: string,
  ) {
    return this.send({
      to,
      subject,
      html: `<p>${text.replace(/\n/g, "<br />")}</p>`,
      text,
    });
  }
}
