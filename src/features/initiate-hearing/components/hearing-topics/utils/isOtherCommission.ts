import { Option } from "@/shared/components/form/form.types";

export const isOtherCommission = (opt?: Option | null) =>
  !!opt &&
  (["CT4", "OTHER", "3"].includes(String(opt.value)) ||
    (opt.label ?? "").toLowerCase().includes("other"));
