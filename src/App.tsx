import { useEffect, useState } from "react";
import "./App.css";
import { Page } from "./components/Page";
import { Button } from "./components/ui/button";
import { usePage } from "./stores/usePage";
import { SettingsModal } from "./components/SettingsModal";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { ThemeProvider } from "./components/ThemeProvider";
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from "./components/ui/resizable";

function App() {
	const { setActivePageByName, activePageName } = usePage();
	const [isSettingsOpen, setSettingsOpen] = useState(false);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDonwn);

		return () => {
			window.removeEventListener("keydown", handleKeyDonwn);
		};
	}, []);

	useEffect(() => {
		const toastAlert = toast.success("Loaded Page: " + activePageName);
		// return () => {
		// 	toast.dismiss(toastAlert);
		// };
	}, [activePageName]);

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
				<Page title={"Home"}>
					I'm the home page!{" "}
					<Button
						variant={"destructive"}
						onClick={(_) => setActivePageByName("Second")}
					>
						Go Second
					</Button>
					<Resizable />
				</Page>
				<Page title={"Second"}>
					I'm the second page!{" "}
					<Button
						variant={"destructive"}
						onClick={(_) => setActivePageByName("Home")}
					>
						Go Home
					</Button>
				</Page>
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

const Resizable = () => {
	const [size, setSize] = useState({
		width: 200,
		height: 200,
	});
	const handleResize = ({
		size,
	}: {
		size: { width: number; height: number };
	}) => {
		setSize({ width: size.width, height: size.height });
	};
	return <div>hi</div>;
};
