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
