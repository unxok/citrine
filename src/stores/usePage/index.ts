import { PageSchema } from "@/db";
import { create } from "zustand";

type PageState = {
	pages: PageSchema[];
	setPages: (
		partial:
			| PageState
			| Partial<PageState>
			| ((state: PageState) => PageState | Partial<PageState>),
		replace?: boolean | undefined
	) => void;
	addPage: (title: string) => void;
	deletePage: (id: number | undefined) => void;
	resetPages: () => void;
	activePage: number;
	setActivePage: (id: number) => void;
};

// const defaultPages = ["Home"];

export const usePage = create<PageState>((set, get) => ({
	pages: [{ id: 1, title: "Home" }],
	setPages: set,
	addPage: (title) => {
		return set((state) => ({
			...state,
			pages: [...state.pages, { title: title }],
		}));
	},
	deletePage: (pageId) => {
		return set((state) => {
			return {
				...state,
				pages: state.pages.filter(({ id }) => id !== pageId),
			};
		});
	},
	resetPages: () => {
		return set((state) => {
			return {
				...state,
				pages: [{ title: "Home" }],
			};
		});
	},
	activePage: 1,
	setActivePage: (id: number) => {
		return set((state) => {
			return {
				...state,
				activePageName: id,
			};
		});
	},
}));
