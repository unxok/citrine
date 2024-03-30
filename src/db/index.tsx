import { Card } from "@/components/Card";
import Dexie, { Table } from "dexie";

class MyDexie extends Dexie {
  cards!: Table<Card>;

  constructor() {
    super("database");
    this.version(1).stores({
      cards: "++id, orderId, title, lane",
    });
  }
}

export const db = new MyDexie();
