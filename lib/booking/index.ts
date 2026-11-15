/**
 * מתאם אחיד למערכת ההזמנות של המפעילים.
 * בפיילוט – מערכת אחת: Booking Manager (MMK) או NauSYS (טרם הוחלט).
 * ממשק בלבד. אין מימוש ואין חיבור אמיתי בשלב הזה.
 */
export type BookingSystemName = "mmk" | "nausys";

export interface BookingSystemAdapter {
  readonly name: BookingSystemName;
}
