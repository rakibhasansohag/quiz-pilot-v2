import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DialogTitle } from '@radix-ui/react-dialog';

export default function ConfirmDeleteModal({
	open,
	onClose,
	onConfirm,
	title,
}) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>{title}</DialogHeader>
				<DialogTitle></DialogTitle>
				<DialogFooter>
					<Button variant='secondary' onClick={onClose}>
						Cancel
					</Button>
					<Button variant='destructive' onClick={onConfirm}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
