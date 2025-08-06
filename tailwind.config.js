const { ParagraphSpacingIcon } = require("hugeicons-react");
const plugin = require("tailwindcss/plugin");
const generateScreens = (sizes) => {
  return Object.fromEntries(
    sizes.map((size, index) => [`${index + 2}xl`, `${size}px`])
  );
};
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    {
      pattern: /grid-cols-(1|2|3|4|5|6)/, 
    },
    {
      pattern: /col-span-(1|2|3|4|5|6)/, 
    },
    {
      pattern: /gap-(3xl|6)/,
    },
  ],
  theme: {
    extend: {
      fontFamily: {
				primary: ["IBM Plex Sans Arabic", "sans-serif"],
			},
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1920px", // Full HD (1080p)
        "4xl": "2560px", // 2K resolution
        "5xl": "3200px", // High-end ultra-wide
        "6xl": "3840px", // 4K resolution
        "7xl": "5120px", // 5K resolution
        "8xl": "7680px", // 8K resolution
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1rem",
          md: "2rem",
          lg: "3rem",
          xl: "4rem",
          "2xl": "5rem",
        },
        screens: {
          sm: "100%",
          md: "100%",
          lg: "100%",
          xl: "100%",
          "2xl": "100%",
          "3xl": "100%",
          "4xl": "100%",
          "5xl": "100%",
          "6xl": "100%",
          "7xl": "100%",
          "8xl": "100%",
        },
      },
      gap: {
        "2xs": "2px",
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "14px",
        "3xl": "16px",
        "4xl": "18px",
        "5xl": "20px",
        "6xl": "22px",
        "7xl": "24px",
        "8xl": "26px",
        "9xl": "28px",
        "10xl": "30px",
        "11xl": "32px",
        "12xl": "34px",
        "13xl": "36px",
        "14xl": "38px",
        "15xl": "40px",
        "16xl": "42px",
        "17xl": "45px",
      },
      borderRadius: {
        "2xs": "2px",
        xs: "4px",
        sl: "5px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "14px",
        "3xl": "16px",
        "4xl": "18px",
        "5xl": "20px",
        "6xl": "22px",
        "7xl": "24px",
        "8xl": "26px",
        "9xl": "28px",
        "10xl": "30px",
        "11xl": "32px",
        "12xl": "34px",
        "13xl": "36px",
        "14xl": "38px",
        "15xl": "40px",
      },
      padding: {
        "2xs": "2px",
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "14px",
        "3xl": "16px",
        "4xl": "18px",
        "5xl": "20px",
        "6xl": "22px",
        "7xl": "24px",
        "8xl": "26px",
        "9xl": "28px",
        "10xl": "30px",
        "11xl": "32px",
        "12xl": "34px",
        "13xl": "36px",
        "14xl": "38px",
        "15xl": "40px",
      },
      margin: {
        "2xs": "2px",
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "14px",
        "3xl": "16px",
        "4xl": "18px",
        "5xl": "20px",
        "6xl": "22px",
        "7xl": "24px",
        "8xl": "26px",
        "9xl": "28px",
        "10xl": "30px",
        "11xl": "32px",
        "12xl": "34px",
        "13xl": "36px",
        "14xl": "38px",
        "15xl": "40px",
      },
      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      fontSize: {
        "3xl": [
          "40px",
          {
            lineHeight: "36px",
          },
        ],
        "2xl": [
          "28px",
          {
            lineHeight: "36px",
          },
        ],
        "2436":[{
          lineHeight:'24px',
          letterSpacing: "36px",
        }],
        "1438":[{
          lineHeight:'12px',
          letterSpacing: "37px",
        }],
        "2lg": [
          "18px",
          {
            lineHeight: "100%",
          },
        ],
        sm:[
          "14px",
          {
            lineHeight:'16px',
            letterSpacing: "0%",
          }
        ],
        sm8:[
          "14px",
          {
            lineHeight:'24px',
          }
        ],
        sm28:[
          "14px",
          {
            lineHeight:'28px',
            letterSpacing: "0%",
          }
        ],
        sm20: [
          "14px",
          {
            lineHeight: "20px",
            letterSpacing: "0%", 
          },
        ],
        xl: [
          "20px",
          {
            lineHeight: "30px",
          },
        ],
        
        lg: [
          "18px",
          {
            lineHeight: "24px",
          },
        ],
        "1822":[
          "18px",{
            lineHeight: "22px",
          }
        ],
        "2lg": [
          "18px",
          {
            lineHeight: "100%",
          },
        ],
        "el": [
          "18px",
          {
            lineHeight: "28px",
          },
        ],
        md: [
          "16px",
          {
            lineHeight: "24px",
            letterSpacing: "0%",
          },
        ],
        "2md": [
          "16px",
          {
            lineHeight: "36px",
            letterSpacing: "0%",
          },
        ],
        xs: [
          "12px",
          {
            lineHeight: "18px",
          },
        ],
        xs20: [
          "12px",
          {
            lineHeight: "20px",
          },
        ],
        "2xs": [
          "10px",
          {
            lineHeight: "14px",
          },
        ],
      },
      colors: {
        default: "#ff0000",
        gray: {
          25: "#FCFCFD",
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D2D6DB",
          400: "#9DA4AE",
          500: "#6C737F",
          600: "#4D5761",
          700: "#384250",
          800: "#1F2A37",
          900: "#111927",
          930: "#E7E7E7",
          950: "#0D121C",
          960: "#F1F5F2",
          970: "#717171",
          980: "#F3F4F699",
          990: "#6C737F",
          1000:"#858585"
        },
        primary: {
          25: "#F7FDF9",
          50: "#F3FCF6",
          100: "#DFF6E7",
          200: "#B8EACB",
          300: "#88D8AD",
          400: "#54C08A",
          500: "#25935F",
          600: "#1B8354",
          700: "#166A45",
          800: "#14573A",
          900: "#104631",
          950: "#092A1E",
          960: "#397051",
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          25: "#FFFEF7",
          50: "#FFFEF2",
          100: "#FFFCE6",
          200: "#FCF3BD",
          300: "#FAE996",
          400: "#F7D54D",
          500: "#F5BD02",
          600: "#DBA102",
          700: "#B87B02",
          800: "#945C01",
          900: "#6E3C00",
          950: "#472400",
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        lavender: {
          25: "#FEFCFF",
          50: "#F9F5FA",
          100: "#F2E9F5",
          200: "#E1CCE8",
          300: "#CCADD9",
          400: "#A57BBA",
          500: "#80519F",
          600: "#6D428F",
          700: "#532D75",
          800: "#3D1D5E",
          900: "#281047",
          950: "#16072E",
        },
        error: {
          25: "#FFFBFA",
          50: "#FEF3F2",
          100: "#FEE4E2",
          200: "#FECDCA",
          300: "#FDA29B",
          400: "#F97066",
          500: "#F04438",
          600: "#D92D20",
          700: "#B42318",
          800: "#912018",
          900: "#7A271A",
          950: "#55160C",
        },
        warning: {
          25: "#FFFCF5",
          50: "#FFFAEB",
          100: "#FEF0C7",
          200: "#FEDF89",
          300: "#FEC84B",
          400: "#FDB022",
          500: "#F79009",
          600: "#DC6803",
          700: "#B54708",
          800: "#93370D",
          900: "#7A2E0E",
          950: "#4E1D09",
        },
        info: {
          25: "#F5FAFF",
          50: "#ECFDF3",
          100: "#D1E9FF",
          200: "#B2DDFF",
          300: "#84CAFF",
          400: "#53B1FD",
          500: "#2E90FA",
          600: "#1570EF",
          700: "#175CD3",
          800: "#1849A9",
          900: "#194185",
          950: "#102A56",
          960: "#B42418",
          980: "#EFF8FF",
        },
        success: {
          25: "#F6FEF9",
          50: "#ECFDF3",
          100: "#DCFAE6",
          200: "#ABFEC6",
          300: "#75E0A7",
          400: "#47CD89",
          500: "#17B26A",
          600: "#079455",
          700: "#067647",
          800: "#085D3A",
          900: "#074D31",
          950: "#053321",
          1000:"#ABEFC6"
        },
        sa: {
          500: "#25935F",
          600: "#1B8354",
          700: "#166A45",
          800: "#14573A",
          900: "#104631",
          950: "#092A1E",
        },
        light: {
          "alpha-white": "#FFFFFF",
          "alpha-white-70": "#FFFFFFB3",
          "alpha-white-60": "#FFFFFF99",
        },
        dark: {
          "gray-950": "#0D121C",
          "gray-700": "#384250",
          "gray-600": "#4D5761",
        },
        alphaWhite: {
          60: "rgba(255, 255, 255, 0.6)",
          70: "rgba(255, 255, 255, 0.7)",
          DEFAULT: "#FFFFFF",
        },
        "default-color": "#161616",
        "platforms-primary": "#0D212C",
        "platforms-secondary": "#384250",
        "platforms-tertiary": "#4D5761",
        "semantic-error": "#D92D20",
        "semantic-warning": "#DC6803",
        "semantic-success": "#1B8354",
        "semantic-info": "#1570EF",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },

      backgroundImage: {
        "gradient-sa-600": "linear-gradient(90deg, #1B8354, #25935F)",
        "gradient-sa-700": "linear-gradient(45deg, #166A45, #1B8354)",
        "gradient-sa-950": "linear-gradient(45deg, #092A1E, #1B8354)",
        "gradient-sa-800": "linear-gradient(90deg, #14573A, #1B8354)",
        "gradient-sa-900": "linear-gradient(45deg, #104631, #1B8354)",
      },
      boxShadow: {
        xz: "0 1px 2px 0 rgba(101, 82, 128, 0.05), 0 1px 3px 0 rgba(101, 82, 128, 0.10)",
        sm: "0 1px 2px 0 rgba(101, 82, 128, 0.06), 0 4px 8px -2px rgba(101, 82, 128, 0.10)",
        md: "0 2px 4px -2px rgba(101, 82, 128, 0.06), 0 12px[] 16px -6px rgba(101, 82, 128, 0.08)",
        lg: "0 4px 6px -2px rgba(101, 82, 128, 0.03), 0 20px 24px -4px rgba(101, 82, 128, 0.08)",
        xl: "0 8px 8px -4px rgba(101, 82, 128, 0.03)",
        "2xl": "0 24px 48px -12px rgba(101, 82, 128, 0.18)",
        "3xl": "0 32px 64px -12px rgba(101, 82, 128, 0.14)",
        100: "0px 4px 4px 0px #1018281A",
      },
      height: {
        100: "72px",
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents, addUtilities }) {
      addUtilities({
        ".b-radius": {
          border: ".25px solid #E5E7EB",
          borderRadius: "8px",
        },
        ".b-radius-4": {
          border: "1px solid #9DA4AE",
          borderRadius: "4px",
        },
        ".header-shadow": {
          boxShadow: "0px 4px 4px 0px #1018281A",
        },
        ".d-center": {
          display: "flex",
          justifyContent: "center", 
          alignItems: "center",
        },
        ".d-left": {
          display: "flex",
          justifyContent: "flex-start", 
          alignItems: "center",
        },
        ".d-right": {
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        },
      }),
        addComponents({
          h1: {
            fontSize: "72px",
            lineHeight: "90px",
            letterSpacing: "-2%",
          },
          h2: {
            fontSize: "60px",
            lineHeight: "72px",
            letterSpacing: "-2%",
          },
          h3: {
            fontSize: "48px",
            lineHeight: "60px",
            letterSpacing: "-2%",
          },
          h4: {
            fontSize: "36px",
            lineHeight: "44px",
            letterSpacing: "-2%",
          },
          h5: {
            fontSize: "30px",
            lineHeight: "38px",
          },
          h6: {
            fontSize: "24px",
            lineHeight: "32px",
          },

          p: {
            fontSize: "14px",
            lineHeight: "22px",
            letterSpacing: "0%",
          },
        });
    }),
    require("tailwindcss-animate"),
  ],
};
