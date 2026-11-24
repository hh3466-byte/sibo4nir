// נתיב מים בין שתי עצירות.
// פיתוח: קו ישר (עלול לחצות יבשה). לפני הדגמה: להחליף בניתוב מים אמיתי (מנוע שלנו מעל נתוני מים),
// בלי לשנות את הקוראים – החתימה נשארת זהה.
export type LngLat = [number, number];

export function waterPath(from: LngLat, to: LngLat): LngLat[] {
  return [from, to];
}
