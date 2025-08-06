import { useMemo } from "react";
import { DateObject } from "react-multi-date-picker";
 
const ARABIC_INDIC_DIGITS: Record<string, string> = {
  "٠": "0","١": "1","٢": "2","٣": "3","٤": "4",
  "٥": "5","٦": "6","٧": "7","٨": "8","٩": "9"
};
function toAsciiDigits(input: string): string {
  return input.replace(/[٠-٩]/g, d => ARABIC_INDIC_DIGITS[d] || d);
}
 
const HIJRI_MONTHS: Record<string, string> = {
  "محرم": "01", "صفر": "02", "ربيع الأول": "03", "ربيع الآخر": "04",
  "جمادى الأولى": "05", "جمادى الآخرة": "06", "رجب": "07", "شعبان": "08",
  "رمضان": "09", "شوال": "10", "ذو القعدة": "11", "ذو الحجة": "12",
  "جما١": "05", "جما٢": "06"
};
 
function normalizeHijriString(str: string): string {
  let s = str;
  for (const [name, num] of Object.entries(HIJRI_MONTHS)) {
    s = s.replace(new RegExp(name, 'g'), num);
  }
  s = toAsciiDigits(s).replace(/[^0-9]/g, '');
  if (!/^\d{8}$/.test(s)) {
    throw new Error(`Cannot normalize Hijri "${str}" → "${s}"`);
  }
  return s;
}
 
export function toHijri_YYYYMMDD(
  dateString: string,
  friendlyFormat: boolean = false
): string {
  try {
    const raw = toAsciiDigits(dateString.trim());
    if (/^14\d{6}$/.test(raw)) {
      const Y = raw.slice(0,4), M = raw.slice(4,6), D = raw.slice(6);
      return friendlyFormat ? `${D}/${M}/${Y}` : `${Y}${M}${D}`;
    }
    const [d, m, y] = raw.split(/[\/\-\s]/).map(Number);
    if ([d,m,y].some(isNaN)) throw new Error('Invalid Gregorian input');
    const dt = new Date(Date.UTC(y, m-1, d));
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic', {
      year: 'numeric', month: '2-digit', day: '2-digit', numberingSystem: 'latn', timeZone: 'UTC'
    }).formatToParts(dt);
    const yp = parts.find(p => p.type==='year')?.value;
    const mp = parts.find(p => p.type==='month')?.value;
    const dp = parts.find(p => p.type==='day')?.value;
    if (yp && mp && dp) {
      return friendlyFormat ? `${dp}/${mp}/${yp}` : `${yp}${mp}${dp}`;
    }
    const arabic = new Intl.DateTimeFormat('ar-u-ca-islamic', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    }).format(dt);
    const norm = normalizeHijriString(arabic);
    const Y2 = norm.slice(0,4), M2 = norm.slice(4,6), D2 = norm.slice(6);
    return friendlyFormat ? `${D2}/${M2}/${Y2}` : `${Y2}${M2}${D2}`;
  } catch {
    return dateString;
  }
}
 
export const getEnvVar = <T extends string | number | boolean>(
  key: string,
  defaultValue?: T
): T => {
  const value = import.meta.env[key];
  if (value == null) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Env var ${key} required but missing`);
  }
  if (typeof defaultValue === 'number') return Number(value) as T;
  if (typeof defaultValue === 'boolean') return (value === 'true') as T;
  return value as T;
};
 
export function isObjectWithData(value: unknown): value is Record<string, unknown> {
  return typeof value==='object' && value!=null && !Array.isArray(value) && Object.keys(value).length>0;
}
export function isObjectEmpty(value: unknown): boolean {
  return typeof value==='object' && value!=null && !Array.isArray(value) && Object.keys(value).length===0;
}
export function isArrayWithData(value: unknown): value is Array<unknown> { return Array.isArray(value)&&value.length>0; }
export function isArray(value: unknown): value is Array<unknown> { return Array.isArray(value); }
export function isNotArray(value: unknown): boolean { return !Array.isArray(value); }
 
export type OptionMapperParams = { data?: any[]; valueKey?: string; labelKey?: string };
export const mapToOptions = ({ data=[], valueKey='ElementKey', labelKey='ElementValue' }: OptionMapperParams) =>
  data.map(item => ({ value: item[valueKey], label: item[labelKey] }));
 
interface BaseFieldProps { name: string; label: string; readOnly?: boolean; }
interface InputFieldProps extends BaseFieldProps { placeholder?: string; inputType?: string; validation?: any; }
interface AutocompleteFieldProps extends BaseFieldProps { options: any[]; value: any; onChange: (v:any)=>void; }
const getFieldType=(def:string,ro?:boolean)=>ro?'readonly':def;
export const createInputField = ({ name, label, placeholder, inputType='text', validation={}, readOnly=false }: InputFieldProps) => ({
  type: getFieldType(inputType==='dateOfBirth'?'readonly':'input',readOnly), name, label, placeholder, inputType, validation, readOnly
});
export const createAutocompleteField = ({ name, label, options, value, onChange, readOnly=false }: AutocompleteFieldProps) => ({
  type: getFieldType('autocomplete', readOnly), name, label, options, value, onChange, readOnly
});
 
export function useLoadingStates<T extends Record<string,boolean>>(states:T):T {
  return useMemo(() => states, Object.values(states));
}
 
export function formatHijriDate(compact:string):string {
  if (!compact||compact.length!==8) return compact;
  const y=compact.slice(0,4), m=compact.slice(4,6), d=compact.slice(6);
  return `${y}/${m}/${d}`;
}
 
export function formatDateToYYYYMMDD(dateString: string | undefined): string | undefined {
  if (!dateString) return undefined;
  return dateString.replace(/[\/\-]/g, '');
}
 
export function formatDateFromYYYYMMDD(dateString: string | undefined, separator: string = '/'): string | undefined {
  if (!dateString || dateString.length !== 8) return undefined;
  return `${dateString.slice(0, 4)}${separator}${dateString.slice(4, 6)}${separator}${dateString.slice(6)}`;
}
 
export function formatDateGMT(inputDate: string | null | undefined): string {
  if (!inputDate) return '---:---';
  const year=inputDate.slice(0,4), month=inputDate.slice(4,6), day=inputDate.slice(6,8);
  const hour=inputDate.slice(9,11), minute=inputDate.slice(11,13);
  const dt=new Date(`${year}-${month}-${day}T${hour}:${minute}:00.000Z`);
  return dt.toLocaleString('en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'GMT',timeZoneName:'short'});
}
 
export const formatDateString = (raw: string | undefined | null): string => {
  if (!raw || raw.length !== 8) return "";
  const year = raw.slice(0, 4);
  const month = raw.slice(4, 6);
  const day = raw.slice(6, 8);
  return `${year}/${month}/${day}`;
};

export function toWesternDigits(str: string): string {
  return typeof str === 'string' ? str.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()) : str;
}

/**
 * Process AttachmentKey to handle special characters properly
 * @param attachmentKey - The raw attachment key from the API
 * @returns Processed attachment key ready for API calls
 */
export const processAttachmentKey = (attachmentKey: string): string => {
  if (!attachmentKey) return attachmentKey;
  
  // If the key contains URL-encoded characters, decode them
  if (attachmentKey.includes('%')) {
    try {
      return decodeURIComponent(attachmentKey);
    } catch (error) {
      console.warn('Failed to decode AttachmentKey:', error);
      // Keep original if decoding fails
      return attachmentKey;
    }
  }
  
  // If the key contains + characters (URL-encoded spaces), decode them
  if (attachmentKey.includes('+')) {
    try {
      return attachmentKey.replace(/\+/g, ' ');
    } catch (error) {
      console.warn('Failed to decode + characters in AttachmentKey:', error);
      return attachmentKey;
    }
  }
  
  return attachmentKey;
};

/**
 * Check if a Hijri date is in the future
 * @param hijriDate - Date in YYYYMMDD format
 * @returns true if the date is in the future, false otherwise
 */
export const isHijriDateInFuture = (hijriDate: string): boolean => {
  if (!hijriDate || hijriDate.length !== 8) return false;
  
  try {
    const DateObject = require("react-multi-date-picker").DateObject;
    const hijriCalendar = require("react-date-object/calendars/arabic").default;
    const hijriLocale = require("react-date-object/locales/arabic_en").default;
    
    const date = new DateObject({
      date: `${hijriDate.slice(0, 4)}/${hijriDate.slice(4, 6)}/${hijriDate.slice(6)}`,
      calendar: hijriCalendar,
      locale: hijriLocale,
      format: "YYYY/MM/DD",
    });
    
    const today = new DateObject({
      calendar: hijriCalendar,
      locale: hijriLocale,
    });
    
    return date.toDate() > today.toDate();
  } catch (error) {
    return false; // If there's an error parsing the date, assume it's not in the future
  }
};
