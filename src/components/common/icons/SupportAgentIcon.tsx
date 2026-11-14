import { createLucideIcon } from 'lucide-react';

/**
 * Ikon resmi fitur Tiket Bantuan: orang memakai headset (CS/agen bantuan).
 * Dibuat dengan createLucideIcon agar bisa dipakai di mana pun ikon lucide
 * dipakai (props className, size, strokeWidth, tipe LucideIcon).
 */
export const SupportAgentIcon = createLucideIcon('support-agent', [
  ['circle', { cx: '12', cy: '9.5', r: '3.5', key: 'head' }],
  ['path', { d: 'M5.5 10a6.5 6.5 0 0 1 13 0', key: 'band' }],
  ['rect', { x: '4', y: '9', width: '2.75', height: '4.5', rx: '1.25', key: 'cup-l' }],
  ['rect', { x: '17.25', y: '9', width: '2.75', height: '4.5', rx: '1.25', key: 'cup-r' }],
  ['path', { d: 'M18.6 13.5v.25a2.75 2.75 0 0 1-2.75 2.75H14', key: 'mic' }],
  ['path', { d: 'M5 21.5a7 5 0 0 1 14 0', key: 'body' }],
]);
