// export function isValidApiResponse(
//   data: any,
//   requiredFields: string[] = ["ServiceStatus", "SuccessCode"]
// ): boolean {
//   if (!data || typeof data !== "object") return false;
//   for (const field of requiredFields) {
//     if (!(field in data)) return false;
//   }
//   return true;
// } 