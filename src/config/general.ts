export const APP_TITLE = 'Weddi App Frontend';


export const PHONE_PATTERNS: Record<string, { pattern: RegExp; placeholder: string }> =
  {
    // UAE
    "+971": {
      pattern: /^(?:\+971|0)?(?:50|51|52|53|54|55|56|58|59)\d{7}$/,
      placeholder: "50xxxxxxx",
    },
    // India
    "+91": {
      pattern: /^(?:\+91)?[6789]\d{9}$/,
      placeholder: "98xxxxxx21",
    },
    // US/Canada
    "+1": {
      pattern: /^(?:\+1)?[2-9]\d{9}$/,
      placeholder: "2015550123",
    },
    // UK
    "+44": {
      pattern: /^(?:\+44)?[1-9]\d{8,9}$/,
      placeholder: "20xxxxxx45",
    },
    // Default pattern (10-14 digits)
    DEFAULT: {
      pattern: /^(?:\+?\d{1,3})?[0-9]{9,14}$/,
      placeholder: "Enter phone number",
    },
  };