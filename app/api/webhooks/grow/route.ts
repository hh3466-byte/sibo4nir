// Webhook של Grow – ריק בכוונה. מחזיר 200 בלי שום לוגיקה ובלי לשמור את הגוף.
export async function POST() {
  return new Response(null, { status: 200 });
}
