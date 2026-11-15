/**
 * שכבת שליחה אחידה לוואטסאפ.
 * ספק ראשון: Green API. בהמשך אפשר להחליף ל-WhatsApp Cloud API בלי לשנות את שאר הקוד.
 * ממשק בלבד. אין מימוש ואין שליחה בשלב הזה.
 */
export type MessagingProviderName = "green-api" | "whatsapp-cloud-api";

export interface MessagingProvider {
  readonly name: MessagingProviderName;
}
