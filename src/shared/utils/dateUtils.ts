export const formatDateToYYYYMMDD = (dateStr: string | undefined): string | undefined => {
  if (!dateStr) return undefined;
  return dateStr.replace(/[\/\-]/g, '');
};

export const formatDateFromYYYYMMDD = (dateStr: string | undefined, separator: string = "/"): string | undefined => {
  if (!dateStr || dateStr.length !== 8) return undefined;
  return `${dateStr.slice(0, 4)}${separator}${dateStr.slice(4, 6)}${separator}${dateStr.slice(6, 8)}`;
}; 