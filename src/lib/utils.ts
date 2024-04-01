import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toFirstUppercase = (str: string) => {
  const arr = str.split("");
  arr[0] = arr[0].toUpperCase();
  return arr.join("");
};

/**
 * Triggers a file download
 * @param content The content of the file
 * @param fileName The name of the file to download. Include the extension in the name (.txt, .csv, etc)
 * @param contentType The MIME type of the file. 'text/csv', 'application/json', etc.
 */
export const downloadToFile = (
  content: string,
  fileName: string,
  contentType: string,
) => {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });

  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(a.href);
};
