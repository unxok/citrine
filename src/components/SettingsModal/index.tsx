import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Theme, useTheme } from "../ThemeProvider";
import { toFirstUppercase } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";

export const SettingsModal = (props: {
	open: boolean;
	onOpenChange: (b: boolean) => void;
}) => {
	//
	if (!open) return;

	return (
		<Dialog {...props}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>
						Settings for your space. This applies to all pages.
					</DialogDescription>
				</DialogHeader>
				<div className='flex flex-col gap-3 w-full'>
					<Label className='text-md'>Theme</Label>
					<ThemeModeToggle />
				</div>
			</DialogContent>
		</Dialog>
	);
};

const ThemeModeToggle = () => {
	const { setTheme, theme } = useTheme();
	return (
		<Select onValueChange={(v) => setTheme(v as Theme)}>
			<SelectTrigger className='w-full'>
				<SelectValue
					defaultValue={theme}
					placeholder={toFirstUppercase(theme)}
				/>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value='light'>Light</SelectItem>
				<SelectItem value='dark'>Dark</SelectItem>
				<SelectItem value='system'>System</SelectItem>
			</SelectContent>
		</Select>
	);
	return;
};
