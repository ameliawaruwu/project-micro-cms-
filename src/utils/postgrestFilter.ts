/**
 * Pengaman nilai yang disisipkan ke filter `.or()` Supabase/PostgREST.
 *
 * `.or()` menerima string mentah (`kolom.op.nilai,kolom.op.nilai`). Bila nilai dari input pengguna
 * berisi `,` `(` `)` atau `.`, pengguna bisa menambah kondisi sendiri (mis. `x,id.neq.0`).
 * Nilai dibungkus tanda kutip ganda (sintaks resmi PostgREST) sehingga dibaca sebagai satu nilai.
 */
export function pgrstValue(value: string): string {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** Untuk operator `ilike`: wildcard (`*`, `%`) dibuang agar input tidak bisa mencocokkan semua baris. */
export function pgrstLikeValue(value: string): string {
  return pgrstValue(String(value).replace(/[*%]/g, ''));
}
