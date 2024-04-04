import { ALL, BOARD, VIEW_LS_KEY } from "@/lib/consts";
import { UniqueIdentifier } from "@dnd-kit/core";
import { toast } from "sonner";
import { create } from "zustand";

type View = {
  itemId: UniqueIdentifier;
  itemType: string;
};

type ViewStore = {
  currentView: View;
  setView: (callback: ((current: View) => View) | View) => void;
  //   saveView: (view: View) => void;
};

const loadView = () => {
  const viewStr = localStorage.getItem(VIEW_LS_KEY);
  if (!viewStr) return { itemId: ALL, itemType: BOARD };
  try {
    // TODO add validation here
    return JSON.parse(viewStr) as View;
  } catch (e) {
    toast.error("An error occured! Check console for more info");
    console.log(
      "Something went wrong when parsing the current view from local storage",
    );
    console.log(e);
    return { itemId: ALL, itemType: BOARD };
  }
};

const saveView = async (view: View) => {
  return new Promise<void>((res) => {
    setTimeout(() => {
      localStorage.setItem(VIEW_LS_KEY, JSON.stringify(view));
      res();
    }, 0);
  });
};

export const useViewStore = create<ViewStore>()((set) => ({
  currentView: loadView(),
  setView: (callback) => {
    set((state) => {
      if (typeof callback !== "function") {
        const newState = {
          ...state,
          currentView: callback,
        };
        saveView(callback);
        return newState;
      }
      const { itemId, itemType } = callback(state.currentView) ?? {};
      const newState = {
        ...state,
        currentView: {
          itemId: itemId ?? ALL,
          itemType: itemType ?? BOARD,
        },
      };
      saveView(newState.currentView);
      return newState;
    });
  },
  //   saveView: (view) => {
  //     localStorage.setItem(VIEW_LS_KEY, JSON.stringify(view));
  //   },
}));
