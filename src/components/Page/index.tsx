import { usePage } from "@/stores/usePage";
import { ReactNode } from "react";

/**
 * Occupies the entire viewport and is controlled by it's isActive prop.
 * @returns A Page component
 */
export const Page = ({
	title,
	id,
	children,
}: {
	title: string;
	id: number;
	children?: ReactNode;
}) => {
	const { activePage } = usePage();

	if (activePage !== id) return;

	return (
		<div className='inset-0 fixed border bg-background p-2'>
			Hello?{children}
		</div>
	);
};
