import { usePage } from "@/stores/usePage";
import { ReactNode } from "react";

/**
 * Occupies the entire viewport and is controlled by it's isActive prop.
 * @returns A Page component
 */
export const Page = ({
	title,
	children,
}: {
	title: string;
	children?: ReactNode;
}) => {
	const { activePageName } = usePage();

	if (activePageName !== title) return;

	return (
		<div className='inset-0 fixed border bg-background p-2 border'>
			{children}
		</div>
	);
};
