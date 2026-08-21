import "server-only";

import { Resend } from "resend";

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

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object"
  ) {
    const value = error as Record<string, unknown>;

    const parts = [
      value.name,
      value.message,
      value.statusCode,
      value.status,
      value.code,
      value.type,
    ]
      .filter(
        (item) =>
          item !== undefined &&
          item !== null &&
          String(item).trim() !== "",
      )
      .map(String);

    if (parts.length > 0) {
      return parts.join(" | ");
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown email provider error.";
    }
  }

  return String(error);
}

export class EmailService {
  static async send(
    input: SendEmailInput,
  ): Promise<SendEmailResult> {
    try {
      const apiKey =
        process.env.RESEND_API_KEY;

      const from =
        process.env.RESEND_FROM_EMAIL;

      console.log(
        "[EMAIL SERVICE] Runtime configuration:",
        {
          hasApiKey: Boolean(apiKey),
          apiKeyLength: apiKey?.length ?? 0,
          from: from ?? null,
          to: input.to,
          subject: input.subject,
        },
      );

      if (!apiKey) {
        throw new Error(
          "RESEND_API_KEY is not configured at runtime.",
        );
      }

      if (!from) {
        throw new Error(
          "RESEND_FROM_EMAIL is not configured at runtime.",
        );
      }

      /*
       * Create the client at request time instead of module load time.
       * This guarantees that the current Next.js server runtime
       * environment is used.
       */
      const resend = new Resend(apiKey);

      const response =
        await resend.emails.send({
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

      console.log(
        "[EMAIL SERVICE] Resend response:",
        {
          hasData: Boolean(response.data),
          id: response.data?.id,
          error: response.error
            ? describeError(response.error)
            : null,
          errorObject: response.error,
        },
      );

      if (response.error) {
        const message =
          describeError(response.error);

        console.error(
          "[EMAIL SERVICE] RESEND REJECTED:",
          message,
        );

        return {
          success: false,
          message,
        };
      }

      return {
        success: true,
        id: response.data?.id,
      };
    } catch (error) {
      const message =
        describeError(error);

      console.error(
        "[EMAIL SERVICE] EXCEPTION:",
        message,
      );

      console.error(
        "[EMAIL SERVICE] RAW ERROR:",
        error,
      );

      return {
        success: false,
        message,
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
