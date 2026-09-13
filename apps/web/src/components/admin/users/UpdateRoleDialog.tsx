"use client";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/shadcn/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/shadcn/ui/select";
import { Button } from "@/components/shadcn/ui/button";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { updateRole } from "@/actions/admin/user-actions";
import { useState } from "react";
import { Badge } from "@/components/shadcn/ui/badge";
import { titleCase } from "@/lib/utils/shared/string";

interface UpdateRoleDialogProps {
	userID: string;
	name: string;
	currentRoleId: number;
	roles: { id: number; name: string }[];
}

export default function UpdateRoleDialog({
	userID,
	currentRoleId,
	name,
	roles,
}: UpdateRoleDialogProps) {
	const [roleToSet, setRoleToSet] = useState(currentRoleId);
	const [open, setOpen] = useState(false);

	const getRoleName = (roleId: number) => {
		return titleCase(
			roles.find((r) => r.id === roleId)?.name.replace("_", " ") || "",
		);
	};

	const { execute } = useAction(updateRole, {
		async onSuccess() {
			toast.dismiss();
			toast.success("Role updated successfully!");
		},
		async onError(e) {
			toast.dismiss();
			toast.error("An error occurred while updating the role.");
			console.error(e);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant={"outline"}
					size={"sm"}
					className="w-full border-panel"
				>
					Change Role
				</Button>
			</DialogTrigger>
			<DialogContent className="rounded-xl border border-panel bg-white/60 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_32px_rgba(2,84,145,0.15)] backdrop-blur-md sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>Update {name}'s Role</DialogTitle>
					<DialogDescription>
						Update the role of any user on HackKit.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="flex">
						<Select onValueChange={(v) => setRoleToSet(Number(v))}>
							<SelectTrigger className="w-full bg-panel">
								<SelectValue
									placeholder={getRoleName(currentRoleId)}
								/>
							</SelectTrigger>
							<SelectContent>
								{roles.map(({ id, name }) => {
									return (
										<SelectItem
											key={id}
											value={String(id)}
											className="hover:bg-accent hover:text-white"
										>
											{titleCase(name.replace("_", " "))}
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					{roleToSet !== currentRoleId ? (
						<div className="flex h-full w-full items-center justify-center gap-x-2 self-end sm:justify-start">
							<Badge>{getRoleName(currentRoleId)}</Badge>
							<span>&rarr;</span>
							<Badge>{getRoleName(roleToSet)}</Badge>
						</div>
					) : null}
					<Button
						onClick={() => {
							if (roleToSet === currentRoleId) {
								return toast.warning(
									"The user already has this role.",
								);
							}
							toast.loading("Updating role...", { duration: 0 });
							execute({
								roleIdToSet: roleToSet,
								userIDToUpdate: userID,
							});
							setOpen(false);
						}}
						type="submit"
					>
						<span className="text-nowrap">Update Role</span>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
