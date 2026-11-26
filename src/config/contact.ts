/** Alamat email bantuan LapakQ yang ditampilkan di landing page. */
export const SUPPORT_EMAIL = 'lapakq2@gmail.com';

/** Tautan mailto ke email bantuan dengan subjek yang sudah terisi. */
export const supportMailtoLink = (subject: string) =>
  `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
