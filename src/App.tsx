import "./App.css";
import { Button } from "./components/ui/button";

function App() {
	return (
		<div className='bg-neutral-900 text-white inset-0 fixed flex items-center justify-center gap-3'>
			Hello world!
			<Button variant={"destructive"}>Im a button!</Button>
		</div>
	);
}

export default App;
