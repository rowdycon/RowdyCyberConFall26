"use client";

import { CalendarDate, type DateValue } from "@internationalized/date";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/client/cn";
import { Button } from "../button";
import { Input } from "../input";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Calendar } from "./calendar";

interface DateTimePickerProps {
	value: Date | null;
	onChange: (date: Date | null) => void;
	isDisabled?: boolean;
}

function DateTimePicker({ value, onChange, isDisabled }: DateTimePickerProps) {
	const [open, setOpen] = useState(false);

	const calendarValue = value
		? new CalendarDate(
				value.getFullYear(),
				value.getMonth() + 1,
				value.getDate(),
			)
		: null;

	const handleDateSelect = (date: DateValue) => {
		const newDate = value ? new Date(value) : new Date();
		newDate.setFullYear(date.year, date.month - 1, date.day);
		onChange(newDate);
	};

	const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const time = e.target.value; // "HH:mm"
		if (!time) return;
		const [hours, minutes] = time.split(":").map(Number);
		const newDate = value ? new Date(value) : new Date();
		newDate.setHours(hours, minutes, 0, 0);
		onChange(newDate);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					disabled={isDisabled}
					className={cn(
						"w-full justify-start bg-background text-left font-normal",
						!value && "text-muted-foreground",
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{value
						? format(value, "MMM d, yyyy, h:mm a")
						: "Pick a date & time"}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto bg-card" align="start">
				<div className="space-y-3">
					<Calendar
						value={calendarValue}
						onChange={handleDateSelect}
					/>
					<Input
						type="time"
						value={value ? format(value, "HH:mm") : ""}
						onChange={handleTimeChange}
						className="bg-background"
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export { DateTimePicker };
