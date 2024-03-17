import Dexie, { Table } from "dexie";

export type PageSchema = {
	id?: number;
	title: string;
};

class TypedDexie extends Dexie {
	pages!: Table<PageSchema>;

	constructor() {
		super("panelOfflineDatabase");
		this.version(1).stores({
			pages: "++id, title",
		});
	}
}

export const db = new TypedDexie();
