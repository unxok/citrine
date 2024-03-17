import { useEffect, useState } from "react";
import "./App.css";
import { Page } from "./components/Page";
import { Button } from "./components/ui/button";
import { usePage } from "./stores/usePage";
import { SettingsModal } from "./components/SettingsModal";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { ThemeProvider } from "./components/ThemeProvider";
import { useLiveQuery } from "dexie-react-hooks";
import { PageSchema, db } from "./db";

function App() {
	const { isMounted } = useMount();
	const { setActivePage, activePage, pages, setPages } = usePage();
	const [isSettingsOpen, setSettingsOpen] = useState(false);
	/**
	 * Reads data from indexedDb and loads it into the stores
	 */
	const loadStoresFromDb = async () => {
		// get data for page table
		// load data into usePage store
		const dbPages = await db.pages.toArray();
		if (!dbPages || !dbPages.length)
			return console.log("no pages in db: ", dbPages);
		console.log("dbPages: ", dbPages);
		setPages((prev) => ({
			...prev,
			pages: dbPages,
		}));
	};

	useEffect(() => {
		console.log("mounted? ", isMounted);
		if (!isMounted) {
			console.log("trying to load from db...");
			loadStoresFromDb();
		}
		console.log("pages from store: ", pages);
	}, [pages, isMounted]);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDonwn);

		return () => {
			window.removeEventListener("keydown", handleKeyDonwn);
		};
	}, []);

	useEffect(() => {
		const toastAlert = toast.success("Loaded Page: " + activePage);
		// return () => {
		// 	toast.dismiss(toastAlert);
		// };
	}, [activePage]);

	const handleKeyDonwn = (e: KeyboardEvent) => {
		if (e.ctrlKey && e.key === ".") {
			setSettingsOpen((b) => !b);
		}
	};

	return (
		<ThemeProvider
			defaultTheme='dark'
			storageKey='vite-ui-theme'
		>
			<div className=''>
				<Toaster
					richColors
					toastOptions={{}}
				/>
				{/* <Page
					id={1}
					title={"Home"}
				>
					I'm the home page!
				</Page> */}
				{pages?.map((p) => (
					<Page
						key={"page-" + p.id}
						id={p.id || -1}
						title={p.title}
					>
						I'm the {p.title} page!
					</Page>
				))}
				{/* <Page title={"Second"}>
					I'm the second page!{" "}
					<Button
						variant={"destructive"}
						onClick={(_) => setActivePageByName("Home")}
					>
						Go Home
					</Button>
				</Page> */}
				{isSettingsOpen && (
					<SettingsModal
						open={isSettingsOpen}
						onOpenChange={setSettingsOpen}
					/>
				)}
			</div>
		</ThemeProvider>
	);
}

export default App;

const Section = () => {
	/******* TODO LIST *******/
	// Start as a ResizablePanel
	// Context menu on right click with option to split panel
	// splitting panel can be done horizontally or vertically
	// 'splitting' causes the panel to turn into a ResizablePanelGroup with two ResizablePanels separated by a ResizableHandle
	return <div>I'm a section</div>;
};

const useMount = () => {
	const [isMounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, [isMounted]);

	return { isMounted, setMounted };
};
