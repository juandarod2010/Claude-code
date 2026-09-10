/**
 * Número legible del informe: INFORME-YYYYMMDD-XXXX.
 * El sufijo sale del identificador del informe, así que es estable: el mismo
 * informe enseña siempre el mismo número, en pantalla y en el PDF.
 */
export function buildReportReference(createdAt: string, id: string): string {
  const date = new Date(createdAt);
  const stamp = Number.isNaN(date.getTime())
    ? '00000000'
    : `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(
        date.getDate(),
      ).padStart(2, '0')}`;
  const suffix = (id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4) || '0000').toUpperCase();
  return `INFORME-${stamp}-${suffix}`;
}
