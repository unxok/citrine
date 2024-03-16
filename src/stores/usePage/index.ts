import { create } from "zustand";

type PageState = {
	pages: string[];
	addPage: (title: string) => void;
	deletePage: (title: string) => void;
	resetPages: () => void;
	activePageName: string;
	setActivePageByName: (title: string) => void;
};

export const usePage = create<PageState>((set, get) => ({
	pages: ["Home", "Second"],
	addPage: (title) => {
		return set((state) => {
			const isDuplicate = !!state.pages.find((p) => p === title);
			if (isDuplicate) {
				// TODO toast for duplicate?
				return state;
			}
			return { ...state, pages: [...state.pages, title] };
		});
	},
	deletePage: (title) => {
		return set((state) => {
			return {
				...state,
				pages: state.pages.filter((p) => p !== title),
			};
		});
	},
	resetPages: () => {
		return set((state) => {
			return {
				...state,
				pages: ["Home"],
			};
		});
	},
	activePageName: "Home",
	setActivePageByName: (title) => {
		return set((state) => {
			return {
				...state,
				activePageName: title,
			};
		});
	},
}));
