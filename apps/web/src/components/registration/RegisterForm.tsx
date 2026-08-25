"use client";
import { useForm } from "react-hook-form";
import {
	Form,
	FormItem,
	FormControl,
	FormDescription,
	FormMessage,
	FormLabel,
	FormField,
} from "@/components/shadcn/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectGroup,
} from "@/components/shadcn/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/shadcn/ui/radio-group";
import { Input } from "@/components/shadcn/ui/input";
import { Button } from "@/components/shadcn/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import FormGroupWrapper from "./FormGroupWrapper";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import c from "config";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/shadcn/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
	PopoverClose,
} from "@/components/shadcn/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/client/cn";
import { useEffect, useCallback, useState } from "react";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FileRejection, useDropzone } from "react-dropzone";
import { put } from "@/lib/utils/client/file-upload";
import CreatingRegistration from "./CreatingRegistration";
import { staticUploads } from "config";
import {
	registrationFormSchema,
	registrationFormValidator,
	registrationValidatorLocalStorage,
	registrationResumeValidator,
} from "@/validators/registration";
import { formatRegistrationField } from "@/lib/utils/client/shared";
import clsx from "clsx";
import RegistrationFeedbackAlert from "./RegistrationFeedbackAlert";
import { registerHacker } from "@/actions/registration";
import { useAction } from "next-safe-action/hooks";
import type {
	HeardFromOptionsType,
	ShirtSizeOptionsType,
	AttendeeTypeOptionsType,
} from "@/lib/types/user";
import z from "zod";
import {
	HACKER_REGISTRATION_STORAGE_KEY,
	HACKER_REGISTRATION_RESUME_STORAGE_KEY,
} from "@/lib/constants";
import {
	encodeFileAsBase64,
	decodeBase64AsFile,
} from "@/lib/utils/shared/files";
import { useDebouncedCallback } from "use-debounce";

export default function RegisterForm({
	defaultEmail,
}: {
	defaultEmail: string;
}) {
	const { isLoaded: isAuthLoaded } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const router = useRouter();

	const form = useForm<z.infer<typeof registrationFormValidator>>({
		resolver: zodResolver(registrationFormValidator),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: defaultEmail,
			age: 0,
			hackerTag: "",
			firstTimeAttendingRCC: true,
			attendeeType: "" as AttendeeTypeOptionsType,
			isPresenting: false,
			shirtSize: "" as ShirtSizeOptionsType,
			dietRestrictions: [],
			accommodationNote: "",
			company: "",
			title: "",
			presentationName: "",
			heardFrom: "" as HeardFromOptionsType,
			acknowledgement: false,
		},
	});

	useEffect(() => {
		const userFormData = localStorage.getItem(
			HACKER_REGISTRATION_STORAGE_KEY,
		);
		if (userFormData) {
			try {
				const parsed = JSON.parse(userFormData);
				const res = registrationValidatorLocalStorage.safeParse(parsed);
				if (res.success) {
					const {
						attendeeType,
						university,
						major,
						classification,
						universityEmail,
						company,
						title,
						organizerGroup,
						shirtSize,
						isPresenting,
						presentationName,
						heardFrom,
						dietRestrictions,
						...remainingData
					} = res.data;

					form.reset({
						...form.formState.defaultValues,
						attendeeType: attendeeType as AttendeeTypeOptionsType,
						shirtSize: shirtSize as ShirtSizeOptionsType,
						heardFrom: heardFrom as HeardFromOptionsType,
						dietRestrictions:
							dietRestrictions as (typeof c.registration.dietaryRestrictionOptions)[number][],
						...remainingData,
					});
				} else {
					console.log(
						"Error schema parsing hacker registration data: ",
						res.error,
					);
				}
			} catch (e) {
				console.error(
					"Error parsing hacker registration JSON data: ",
					e,
				);
			}
		}
	}, []);

	// seperate useffect for getting the resume file
	useEffect(() => {
		const dataString = localStorage.getItem(
			HACKER_REGISTRATION_RESUME_STORAGE_KEY,
		);

		if (dataString) {
			try {
				const parsedValue = JSON.parse(dataString);
				const schemaParsedRes =
					registrationResumeValidator.safeParse(parsedValue);
				if (schemaParsedRes.success) {
					const { fileString, fileName } = schemaParsedRes.data;
					decodeBase64AsFile(fileString, fileName).then((file) => {
						setUploadedFile(file);
					});
				} else {
					console.error(
						"Error parsing resume data: ",
						schemaParsedRes.error,
					);
				}
			} catch (e) {
				console.error("Error parsing resume data: ", e);
			}
		}
	}, []);

	const debouncedLocalStorageWrite = useDebouncedCallback(
		// function
		() => {
			localStorage.setItem(
				HACKER_REGISTRATION_STORAGE_KEY,
				JSON.stringify({
					...form.getValues(),
				}),
			);
		},
		1000,
	);

	form.watch(() => {
		debouncedLocalStorageWrite();
	});

	// use action logic
	const { execute: runRegisterUser, reset: resetRegisterUser } = useAction(
		registerHacker,
		{
			onSuccess: ({ data }) => {
				if (data?.success) {
					setHasSuccess(true);
					// clear the local storage
					localStorage.removeItem(HACKER_REGISTRATION_STORAGE_KEY);
					localStorage.removeItem(
						HACKER_REGISTRATION_RESUME_STORAGE_KEY,
					);
					setTimeout(() => {
						router.push("/dash");
					}, 200);
				} else {
					setIsLoading(false);
					console.error("onSuccess Error data:", data);
					setErrorMessage(
						data?.message ?? "Unexpected error occured",
					);
				}
			},
			onError: ({ error }) => {
				setIsLoading(false);
				console.log("onError Error is: ", error);
				resetRegisterUser();
			},
		},
	);

	const { isSubmitSuccessful, isSubmitted } = form.formState;

	const hasErrors = !isSubmitSuccessful && isSubmitted;

	const [hasSuccess, setHasSuccess] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const attendeeType = form.watch("attendeeType");
	const isPresentor = form.watch("isPresenting");
	const hasAcknowledged = form.watch("acknowledgement");

	async function onSubmit(data: z.infer<typeof registrationFormValidator>) {
		setIsLoading(true);
		setErrorMessage(null);
		if (!isAuthLoaded) {
			setErrorMessage(
				`Auth has not loaded yet. Please try again! If this is a repeating issue, please contact us at ${c.issueEmail}.`,
			);
			return;
		}

		let resume: string = c.noResumeProvidedURL;
		if (uploadedFile) {
			// test what happens when an error is thrown
			const uploadedFileUrl = await put(
				staticUploads.bucketResumeBaseUploadUrl,
				uploadedFile,
				{
					presignHandlerUrl: "/api/upload/resume/register",
				},
			);

			resume = uploadedFileUrl;
		}
		runRegisterUser({ ...data, resume });
	}

	const onDrop = useCallback(
		async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
			if (fileRejections.length > 0) {
				alert(
					`The file you uploaded was rejected with the reason "${fileRejections[0].errors[0].message}". Please try again.`,
				);
			}
			if (acceptedFiles.length > 0) {
				const file = acceptedFiles[0];
				setUploadedFile(file);
				const fileName = file.name;
				const inputs = {
					fileName,
					fileString: await encodeFileAsBase64(file),
				};
				localStorage.setItem(
					HACKER_REGISTRATION_RESUME_STORAGE_KEY,
					JSON.stringify(inputs),
				);
			}
		},
		[],
	);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		multiple: false,
		accept: { "application/pdf": [".pdf"] },
		maxSize: c.maxResumeSizeInBytes,
		noClick: uploadedFile != null,
		noDrag: uploadedFile != null,
	});

	return (
		<>
			{isLoading || hasSuccess ? (
				<CreatingRegistration
					hasSuccess={hasSuccess}
					isLoading={isLoading}
				/>
			) : (
				<div className="relative rounded-md bg-panel p-6">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-6"
						>
							<FormGroupWrapper title="General">
								<div className="grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-2">
									<FormField
										control={form.control}
										name="firstName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													{formatRegistrationField(
														"First Name",
														registrationFormSchema.shape[
															field.name
														].isOptional(),
													)}
												</FormLabel>
												<FormControl>
													<Input
														placeholder="John"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="lastName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													{formatRegistrationField(
														"Last Name",
														registrationFormSchema.shape[
															field.name
														].isOptional(),
													)}
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Doe"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													{formatRegistrationField(
														"Email",
														registrationFormSchema.shape[
															field.name
														].isOptional(),
													)}
												</FormLabel>
												<FormControl>
													<Input
														readOnly={
															defaultEmail.length >
															0
														}
														{...field}
														disabled
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="hackerTag"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													{formatRegistrationField(
														"HackerTag",
														registrationFormSchema.shape[
															field.name
														].isOptional(),
													)}
												</FormLabel>
												<FormControl>
													<div className="flex">
														<div className="flex h-10 w-10 items-center justify-center rounded-l bg-card text-lg font-light text-primary">
															@
														</div>
														<Input
															className="rounded-l-none"
															placeholder={`${c.hackathonName.toLowerCase()}`}
															{...field}
														/>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="age"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													{formatRegistrationField(
														"Age",
														registrationFormSchema.shape[
															field.name
														].isOptional(),
													)}
												</FormLabel>
												<FormControl>
													<Input
														type="number"
														{...field}
													/>
												</FormControl>
												<FormLabel>
													Note: Valid government ID
													will be required at
													check-in. You will not be
													allowed to enter if under 18
												</FormLabel>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="heardFrom"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													{formatRegistrationField(
														`Where did you hear about ${c.hackathonName}?`,
														registrationFormSchema.shape[
															field.name
														].isOptional(),
													)}
												</FormLabel>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger className="w-full bg-background">
															<div
																className={clsx(
																	"flex w-[95%] justify-start",
																	{
																		"text-muted-foreground":
																			!field.value,
																	},
																)}
															>
																<p className="overflow-hidden text-ellipsis whitespace-nowrap">
																	{field.value ||
																		`Select an Option`}
																</p>
															</div>
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectGroup className="max-h-[400px] w-[var(--radix-select-trigger-width)]">
															{c.registration.heardFromOptions.map(
																(option) => (
																	<SelectItem
																		value={
																			option
																		}
																		key={
																			option
																		}
																	>
																		{option}
																	</SelectItem>
																),
															)}
														</SelectGroup>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="isPresenting"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													{formatRegistrationField(
														"Are you presenting?",
														registrationFormSchema.shape[
															field.name
														].isOptional(),
													)}
												</FormLabel>

												<FormControl>
													<RadioGroup
														value={
															field.value ===
															undefined
																? undefined
																: field.value
																	? "yes"
																	: "no"
														}
														onValueChange={(
															value,
														) => {
															field.onChange(
																value === "yes",
															);
														}}
														className="flex gap-6"
													>
														<div className="flex items-center gap-2">
															<RadioGroupItem
																value="yes"
																id="presenting-yes"
															/>
															<FormLabel htmlFor="presenting-yes">
																Yes
															</FormLabel>
														</div>

														<div className="flex items-center gap-2">
															<RadioGroupItem
																value="no"
																id="presenting-no"
															/>
															<FormLabel htmlFor="presenting-no">
																No
															</FormLabel>
														</div>
													</RadioGroup>
												</FormControl>

												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="firstTimeAttendingRCC"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													{formatRegistrationField(
														"First Time Attending RCC?",
														registrationFormSchema.shape[
															field.name
														].isOptional(),
													)}
												</FormLabel>

												<FormControl>
													<RadioGroup
														value={
															field.value ===
															undefined
																? undefined
																: field.value
																	? "yes"
																	: "no"
														}
														onValueChange={(
															value,
														) => {
															field.onChange(
																value === "yes",
															);
														}}
														className="flex gap-6"
													>
														<div className="flex items-center gap-2">
															<RadioGroupItem
																value="yes"
																id="first-time-yes"
															/>
															<FormLabel htmlFor="first-time-yes">
																Yes
															</FormLabel>
														</div>

														<div className="flex items-center gap-2">
															<RadioGroupItem
																value="no"
																id="first-time-no"
															/>
															<FormLabel htmlFor="first-time-no">
																No
															</FormLabel>
														</div>
													</RadioGroup>
												</FormControl>

												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{isPresentor && (
									<FormField
										control={form.control}
										name="presentationName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													{formatRegistrationField(
														"Presentation Name",
														registrationFormSchema.shape[
															field.name
														].isOptional(),
													)}
												</FormLabel>
												<FormControl>
													<Input
														placeholder="something"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}

								<FormField
									control={form.control}
									name="attendeeType"
									render={({ field }) => (
										<FormItem
											className={`col-span-2 flex flex-col md:col-span-1 lg:col-span-3`}
										>
											<FormLabel>
												{formatRegistrationField(
													"Attendee Type",
													registrationFormSchema.shape[
														field.name
													].isOptional(),
												)}
											</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger className="w-full bg-background">
														<div
															className={clsx(
																"flex w-[95%] justify-start",
																{
																	"text-muted-foreground":
																		!field.value,
																},
															)}
														>
															<p className="overflow-hidden text-ellipsis whitespace-nowrap">
																{field.value ||
																	`Select an Option`}
															</p>
														</div>
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectGroup className="max-h-[400px] w-[calc(var(--radix-select-trigger-width)+10rem)] overflow-y-scroll">
														{c.registration.attendeeTypes.map(
															(atType) => (
																<SelectItem
																	value={
																		atType
																	}
																	key={atType}
																>
																	{atType}
																</SelectItem>
															),
														)}
													</SelectGroup>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</FormGroupWrapper>

							{attendeeType === "University Student" && (
								<FormGroupWrapper title="University Info">
									<div
										className={`grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-4 lg:grid-cols-6`}
									>
										<FormField
											control={form.control}
											name="university"
											render={({ field }) => (
												<FormItem
													className={`col-span-2 flex flex-col lg:col-span-3`}
												>
													<FormLabel>
														{formatRegistrationField(
															"University",
															registrationFormSchema.shape[
																field.name
															].isOptional(),
														)}
													</FormLabel>
													<Popover>
														<FormControl>
															<PopoverTrigger
																asChild
															>
																<Button
																	variant="outline"
																	role="combobox"
																	className={cn(
																		"w-full justify-between",
																		!field.value &&
																			"text-muted-foreground",
																	)}
																>
																	<p className="truncate whitespace-nowrap">
																		{field.value
																			? c.registration.schools.find(
																					(
																						school,
																					) =>
																						school ===
																						field.value,
																				)
																			: "Select a University"}
																	</p>
																	<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
																</Button>
															</PopoverTrigger>
														</FormControl>
														<PopoverContent
															className="no-scrollbar max-h-[400px] w-[--radix-popover-trigger-width] overflow-y-auto p-0"
															onFocusOutside={() =>
																console.log(
																	"closing",
																)
															}
														>
															<Command>
																<CommandInput placeholder="Search university..." />
																<CommandList>
																	<CommandEmpty>
																		No
																		university
																		found.
																	</CommandEmpty>
																	<PopoverClose
																		asChild
																	>
																		<CommandGroup>
																			{c.registration.schools.map(
																				(
																					school,
																				) => (
																					<CommandItem
																						value={
																							school
																						}
																						key={
																							school
																						}
																						onSelect={(
																							value,
																						) => {
																							field.onChange(
																								value,
																							);
																						}}
																						className="cursor-pointer"
																					>
																						<Check
																							className={`mr-2 h-4 w-4 ${
																								school.toLowerCase() ===
																								field.value
																									? "block"
																									: "hidden"
																							} `}
																						/>
																						{
																							school
																						}
																					</CommandItem>
																				),
																			)}
																		</CommandGroup>
																	</PopoverClose>
																</CommandList>
															</Command>
														</PopoverContent>
													</Popover>
													<FormDescription>
														If you are not currently
														a student, please select
														the most recent
														university you attended.
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="classification"
											render={({ field }) => (
												<FormItem
													className={`col-span-2 flex flex-col md:col-span-1 lg:col-span-3`}
												>
													<FormLabel>
														{formatRegistrationField(
															"Classification",
															registrationFormSchema.shape[
																field.name
															].isOptional(),
														)}
													</FormLabel>
													<Select
														onValueChange={
															field.onChange
														}
														defaultValue={
															field.value
														}
													>
														<FormControl>
															<SelectTrigger className="w-full bg-background">
																<div
																	className={clsx(
																		"flex w-[95%] justify-start",
																		{
																			"text-muted-foreground":
																				!field.value,
																		},
																	)}
																>
																	<p className="overflow-hidden text-ellipsis whitespace-nowrap">
																		{field.value ||
																			`Select an Option`}
																	</p>
																</div>
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectGroup className="max-h-[400px] w-[calc(var(--radix-select-trigger-width)+10rem)] overflow-y-scroll">
																{c.registration.classifications.map(
																	(
																		classification,
																	) => (
																		<SelectItem
																			value={
																				classification
																			}
																			key={
																				classification
																			}
																		>
																			{
																				classification
																			}
																		</SelectItem>
																	),
																)}
															</SelectGroup>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="major"
											render={({ field }) => (
												<FormItem
													className={`col-span-2 flex flex-col md:col-span-2 lg:col-span-2`}
												>
													<FormLabel>
														{formatRegistrationField(
															"Major",
															registrationFormSchema.shape[
																field.name
															].isOptional(),
														)}
													</FormLabel>
													<Popover>
														<PopoverTrigger asChild>
															<FormControl>
																<Button
																	variant="outline"
																	role="combobox"
																	className={cn(
																		"w-full justify-between",
																		!field.value &&
																			"text-muted-foreground",
																	)}
																>
																	<p className="truncate whitespace-nowrap">
																		{field.value
																			? c.registration.majors.find(
																					(
																						major,
																					) =>
																						major ===
																						field.value,
																				)
																			: "Select a Major"}
																	</p>

																	<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
																</Button>
															</FormControl>
														</PopoverTrigger>
														<PopoverContent className="no-scrollbar max-h-[400px] w-[250px] overflow-y-auto p-0">
															<Command>
																<CommandInput placeholder="Search major..." />
																<CommandList className="">
																	<CommandEmpty>
																		No major
																		found.
																	</CommandEmpty>
																	<PopoverClose
																		asChild
																	>
																		<CommandGroup>
																			{c.registration.majors.map(
																				(
																					major,
																				) => (
																					<CommandItem
																						value={
																							major
																						}
																						key={
																							major
																						}
																						onSelect={(
																							value,
																						) => {
																							field.onChange(
																								value,
																							);
																						}}
																						className="cursor-pointer"
																					>
																						<Check
																							className={`mr-2 h-4 w-4 overflow-hidden ${
																								major.toLowerCase() ===
																								field.value
																									? "block"
																									: "hidden"
																							} `}
																						/>
																						{
																							major
																						}
																					</CommandItem>
																				),
																			)}
																		</CommandGroup>
																	</PopoverClose>
																</CommandList>
															</Command>
														</PopoverContent>
													</Popover>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="universityEmail"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{formatRegistrationField(
															"University Email",
															registrationFormSchema.shape[
																field.name
															].isOptional(),
														)}
													</FormLabel>
													<FormControl>
														<Input
															placeholder="john@my.utsa.edu"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</FormGroupWrapper>
							)}

							{attendeeType === "Cyber Professional" && (
								<FormGroupWrapper title="Company Info">
									<div
										className={`grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-4 lg:grid-cols-6`}
									>
										<FormField
											control={form.control}
											name="company"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{formatRegistrationField(
															"Company Name",
															registrationFormSchema.shape[
																field.name
															].isOptional(),
														)}
													</FormLabel>
													<FormControl>
														<Input
															placeholder="UTSA"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="title"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{formatRegistrationField(
															"Title or Position",
															registrationFormSchema.shape[
																field.name
															].isOptional(),
														)}
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Cyber Analyst"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</FormGroupWrapper>
							)}

							{attendeeType === "Student Organizer" && (
								<FormGroupWrapper title="Organizer Info">
									<div
										className={`grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-4 lg:grid-cols-6`}
									>
										<FormField
											control={form.control}
											name="organizerGroup"
											render={({ field }) => (
												<FormItem
													className={`col-span-2 flex flex-col md:col-span-1 lg:col-span-3`}
												>
													<FormLabel>
														{formatRegistrationField(
															"Organizer Group",
															registrationFormSchema.shape[
																field.name
															].isOptional(),
														)}
													</FormLabel>
													<Select
														onValueChange={
															field.onChange
														}
														defaultValue={
															field.value
														}
													>
														<FormControl>
															<SelectTrigger className="w-full bg-background">
																<div
																	className={clsx(
																		"flex w-[95%] justify-start",
																		{
																			"text-muted-foreground":
																				!field.value,
																		},
																	)}
																>
																	<p className="overflow-hidden text-ellipsis whitespace-nowrap">
																		{field.value ||
																			`Select an Option`}
																	</p>
																</div>
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectGroup className="max-h-[400px] w-[calc(var(--radix-select-trigger-width)+10rem)] overflow-y-scroll">
																{c.registration.organizerGroups.map(
																	(group) => (
																		<SelectItem
																			value={
																				group
																			}
																			key={
																				group
																			}
																		>
																			{
																				group
																			}
																		</SelectItem>
																	),
																)}
															</SelectGroup>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</FormGroupWrapper>
							)}

							<FormGroupWrapper title="Day of Event">
								<div className="mt-0 grid grid-cols-1 gap-x-4 gap-y-2 pb-20 md:grid-cols-2 md:gap-y-0">
									<FormField
										control={form.control}
										name="shirtSize"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													{formatRegistrationField(
														"Shirt Size",
														registrationFormSchema.shape[
															field.name
														].isOptional(),
													)}
												</FormLabel>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger className="w-full bg-background">
															<div
																className={clsx(
																	"flex w-[95%] justify-start",
																	{
																		"text-muted-foreground":
																			!field.value,
																	},
																)}
															>
																<p className="overflow-hidden text-ellipsis whitespace-nowrap">
																	{field.value ||
																		`Select a Shirt Size`}
																</p>
															</div>
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectGroup>
															{c.registration.shirtSizeOptions.map(
																(option) => (
																	<SelectItem
																		value={
																			option
																		}
																		key={
																			option
																		}
																	>
																		{option}
																	</SelectItem>
																),
															)}
														</SelectGroup>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="dietRestrictions"
										render={({ field }) => (
											<FormItem className="row-span-2">
												<div className="mb-4">
													<FormLabel className="text-base">
														{formatRegistrationField(
															"Dietary Restrictions",
															registrationFormSchema.shape[
																field.name
															].isOptional(),
														)}
													</FormLabel>
													<FormDescription>
														Please select which
														dietary restrictions you
														have so we can best
														accommodate you at the
														event!
													</FormDescription>
												</div>
												{c.registration.dietaryRestrictionOptions.map(
													(item) => (
														<FormField
															key={item}
															control={
																form.control
															}
															name="dietRestrictions"
															render={({
																field,
															}) => {
																return (
																	<FormItem
																		key={
																			item
																		}
																		className="flex flex-row items-start space-x-3 space-y-0"
																	>
																		<FormControl>
																			<Checkbox
																				checked={field.value?.includes(
																					item,
																				)}
																				onCheckedChange={(
																					checked,
																				) => {
																					return checked
																						? field.onChange(
																								[
																									...(field?.value ??
																										[]),
																									item,
																								],
																							)
																						: field.onChange(
																								field.value?.filter(
																									(
																										value: string,
																									) =>
																										value !==
																										item,
																								),
																							);
																				}}
																			/>
																		</FormControl>
																		<FormLabel className="font-normal">
																			{
																				item
																			}
																		</FormLabel>
																	</FormItem>
																);
															}}
														/>
													),
												)}
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="accommodationNote"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													{formatRegistrationField(
														"Anything else we can do to better accommodate you at our hackathon?",
														registrationFormSchema.shape[
															field.name
														].isOptional(),
													)}
												</FormLabel>
												<FormControl>
													<Textarea
														placeholder="List any accessibility concerns here..."
														className="h-[80%] resize-none bg-background"
														{...field}
														value={field.value}
														onChange={
															field.onChange
														}
													/>
												</FormControl>
												<FormDescription>
													<span
														className={
															(field.value
																?.length ?? 0) >
															c.registration
																.maxaccommodationNoteSize
																? "text-red-800"
																: ""
														}
													>
														{field.value?.length ??
															0}{" "}
														/{" "}
														{
															c.registration
																.maxaccommodationNoteSize
														}{" "}
														{""}
														Characters
													</span>
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</FormGroupWrapper>

							<FormGroupWrapper title="Career Info">
								<FormField
									name="resume"
									control={form.control}
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{formatRegistrationField(
													"Resume",
													registrationFormSchema.shape[
														field.name
													].isOptional(),
												)}
											</FormLabel>
											<FormControl>
												<div
													{...getRootProps()}
													className={`border-2${
														uploadedFile
															? ""
															: "cursor-pointer"
													} flex min-h-[200px] flex-col items-center justify-center rounded-lg border-dashed border-white bg-background`}
												>
													<input
														type="file"
														{...getInputProps()}
													/>
													<p className="p-2 text-center">
														{uploadedFile
															? `${uploadedFile.name} (${Math.round(uploadedFile.size / 1024)}kb)`
															: isDragActive
																? "Drop your resume here..."
																: "Drag 'n' drop your resume here, or click to select a file"}
													</p>
													{uploadedFile && (
														<Button
															className="mt-4"
															onClick={() =>
																setUploadedFile(
																	null,
																)
															}
														>
															Remove
														</Button>
													)}
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</FormGroupWrapper>

							<FormGroupWrapper title="Acknowledgement">
								<FormField
									control={form.control}
									name="acknowledgement"
									render={({ field }) => (
										<FormItem className="row-span-2">
											<div className="mb-4">
												<FormDescription>
													By checking below, you agree
													to follow the Rowdy CyberCon
													Community Guidelines found
													<a
														href=""
														className="text-blue-500"
													>
														{" "}
														here
													</a>
													. If you break these rules,
													we reserve the right to
													remove you from the event
													and block you from future
													RCC or ACM events.
												</FormDescription>
											</div>

											<FormControl>
												<Checkbox
													checked={
														field.value ?? false
													}
													onCheckedChange={
														field.onChange
													}
												/>
											</FormControl>

											<FormMessage />
										</FormItem>
									)}
								/>
							</FormGroupWrapper>

							<Button type="submit" disabled={!hasAcknowledged}>
								Submit
							</Button>
							{hasErrors && (
								<p className="text-red-800">
									Something doesn't look right. Please check
									your inputs.
								</p>
							)}
						</form>
					</Form>
				</div>
			)}
			<div className="relative">
				{!!errorMessage && !hasSuccess && (
					<RegistrationFeedbackAlert
						hasError={hasErrors}
						messasge={errorMessage}
						setErrorMessage={setErrorMessage}
					/>
				)}
			</div>
		</>
	);
}
