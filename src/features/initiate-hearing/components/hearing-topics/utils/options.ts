// import { Option } from "@/shared/components/form/form.types";

// export const ensureOption = (
//   opts: Option[],
//   code?: unknown,
//   fallbackLabel?: string
// ): Option | null => {
//   if (code == null) return null;
//   const str = String(code);

//   const hit = opts?.find(o =>
//     typeof o === "string" ? o === str : String(o.value) === str
//   );

//   if (!hit) return { value: str, label: fallbackLabel ?? str };
//   return typeof hit === "string" ? { value: hit, label: hit } : hit;
// };
