/**
 * Converts a date from "YYYYMMDD" format to "DD/MM/YYYY".
 * Returns the original string if the format is invalid.
 */
export function formatDate(yyyymmdd: string): string {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;

  const year = yyyymmdd.substring(0, 4);
  const month = yyyymmdd.substring(4, 6);
  const day = yyyymmdd.substring(6, 8);

  return `${day}/${month}/${year}`;
}


export function setFormatDate(yyyymmdd: string): string {
  if (!yyyymmdd) return yyyymmdd;
  const data = yyyymmdd.split("/");

  return `${data[0]}${data[1]}${data[2]}`;
}