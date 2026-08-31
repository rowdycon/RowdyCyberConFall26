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
import clsx from "clsx";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectGroup,
} from "@/components/shadcn/ui/select";
import { Input } from "@/components/shadcn/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/shadcn/ui/radio-group";
import { Button } from "@/components/shadcn/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormGroupWrapper from "@/components/registration/FormGroupWrapper";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import c, { staticUploads } from "config";
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
import { useEffect, useCallback, useState, useRef } from "react";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { FileRejection, useDropzone } from "react-dropzone";
import { put } from "@/lib/utils/client/file-upload";
import { useAction } from "next-safe-action/hooks";
import {
	deleteResume,
	modifyRegistrationData,
} from "@/actions/user-profile-mod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { UserMetaData, User } from "db/types";
import {
	registrationSettingsFormValidator,
	registrationSettingsFormSchema,
} from "@/validators/settings";
import {
	AttendeeTypeOptionsType,
	HeardFromOptionsType,
	MajorOptionsType,
	ShirtSizeOptionsType,
	UniversityOptionsType,
	ClassificationOptionsType,
	OrganizerGroupOptionsType,
} from "@/lib/types/user";
import { formatRegistrationField } from "@/lib/utils/client/shared";

interface RegistrationFormSettingsProps {
	user: User;
	data: UserMetaData;
}

export default function RegisterFormSettings({
	user,
	data: originalData,
}: RegistrationFormSettingsProps) {
	const form = useForm<z.infer<typeof registrationSettingsFormValidator>>({
		resolver: zodResolver(registrationSettingsFormValidator),
		defaultValues: {
			age: user.age,
			firstTimeAttendingRCC: user.firstTimeAttendingRCC,
			attendeeType: user.attendeeType as AttendeeTypeOptionsType,
			university:
				(originalData.university as UniversityOptionsType) || "",
			major: (originalData.major as MajorOptionsType) || "",
			classification:
				(originalData.classification as ClassificationOptionsType) ||
				"",
			universityEmail: originalData.universityEmail || "",
			company: originalData.company || "",
			title: originalData.title || "",
			organizerGroup:
				originalData.organizerGroup as OrganizerGroupOptionsType,
			shirtSize: user.shirtSize as ShirtSizeOptionsType,
			isPresenting: user.isPresenting,
			presentationName: originalData.presentationName || "",
			heardFrom: originalData.heardFrom as HeardFromOptionsType,
			dietRestrictions: user.dietRestrictions as any,
			accommodationNote: user.accommodationNote || "",
		},
	});

	const { isSubmitSuccessful, isSubmitted, isDirty } = form.formState;

	// const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	// const [isOldFile, setIsOldFile] = useState(true);
	const [hasDataChanged, setHasDataChanged] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const hasErrors = !isSubmitSuccessful && isSubmitted;
	const attendeeType = form.watch("attendeeType");
	const isPresentor = form.watch("isPresenting");
	// const oldResumeLink = useRef(originalData.resume);
	// let f = new File(
	// 	[originalData.resume],
	// 	oldResumeLink.current.split("/").pop()!,
	// );
	// let newResumeLink: string = originalData.resume;

	// used to prevent infinite re-renders
	// useEffect(() => {
	// 	if (oldResumeLink.current === c.noResumeProvidedURL)
	// 		setUploadedFile(null);
	// 	else setUploadedFile(f);
	// }, []);

	useEffect(() => {
		setHasDataChanged(isDirty);
		// setHasDataChanged(
		// 	isDirty ||
		// 		(uploadedFile != null && !isOldFile) ||
		// 		(oldResumeLink.current !== c.noResumeProvidedURL &&
		// 			uploadedFile == null),
		// );
	}, [isDirty]);
	// }, [isDirty, uploadedFile, isOldFile, oldResumeLink.current]);

	async function onSubmit(
		data: z.infer<typeof registrationSettingsFormValidator>,
	) {
		if (!hasDataChanged) {
			toast.error("Please change something before updating");
			return;
		}
		setIsLoading(true);
		// if (uploadedFile && !isOldFile) {
		// 	console.log("uploading file...");
		// 	const newBlob = await put(
		// 		staticUploads.bucketResumeBaseUploadUrl,
		// 		uploadedFile,
		// 		{
		// 			presignHandlerUrl: "/api/upload/resume/register",
		// 		},
		// 	);
		// newResumeLink = newBlob;
		// } else {
		// 	newResumeLink =
		// 		uploadedFile == null
		// 			? c.noResumeProvidedURL
		// 			: originalData.resume;
		// }
		// oldResumeLink.current = newResumeLink;
		// const oldResume = originalData.resume;
		if (hasDataChanged) {
			console.log("running modify registration data...");
			runModifyRegistrationData({
				...data,
				// uploadedFile: newResumeLink,
			});
		}
		// runDeleteResume({ oldFileLink: oldResume });
		setIsLoading(false);
	}

	const { execute: runModifyRegistrationData, status: loadingState } =
		useAction(modifyRegistrationData, {
			onSuccess: async () => {
				toast.dismiss();
				toast.success("Data updated successfully!", {
					duration: 2000,
				});
				form.reset({
					...form.getValues(),
				});
				setHasDataChanged(false);
				// setIsOldFile(true);
			},
			onError: async () => {
				// if (newResumeLink !== c.noResumeProvidedURL)
				// runDeleteResume({ oldFileLink: newResumeLink });
				// If error, delete the blob write (of the attempted new resume)
				setIsLoading(false);
				toast.dismiss();
				toast.error(
					`An error occurred. Please contact ${c.issueEmail} for help.`,
				);
			},
		});
	// const { execute: runDeleteResume } = useAction(deleteResume);

	// const onDrop = useCallback(
	// 	(acceptedFiles: File[], fileRejections: FileRejection[]) => {
	// 		if (fileRejections.length > 0) {
	// 			alert(
	// 				`The file you uploaded was rejected with the reason "${fileRejections[0].errors[0].message}". Please try again.`,
	// 			);
	// 		}
	// 		if (acceptedFiles.length > 0) {
	// 			setUploadedFile(acceptedFiles[0]);
	// 			setIsOldFile(false);
	// 			setHasDataChanged(true);
	// 		} else {
	// 			setUploadedFile(null);
	// 		}
	// 	},
	// 	[],
	// );

	// const { getRootProps, getInputProps, isDragActive } = useDropzone({
	// 	onDrop,
	// 	multiple: false,
	// 	accept: { "application/pdf": [".pdf"] },
	// 	maxSize: c.maxResumeSizeInBytes,
	// 	noClick: uploadedFile != null,
	// 	noDrag: uploadedFile != null,
	// });

	return (
		<div className="rounded-2xl border border-white/70 bg-white/60 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_32px_rgba(2,84,145,0.15)] backdrop-blur-md">
			<Form {...form}>
				<form
					className="space-y-6"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<FormGroupWrapper title="General">
						<div className="grid grid-cols-1 gap-x-2 gap-y-4">
							<FormField
								control={form.control}
								name="age"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{formatRegistrationField(
												"Age",
												registrationSettingsFormSchema.shape[
													field.name
												].isOptional(),
											)}
										</FormLabel>
										<FormControl>
											<Input type="number" {...field} />
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
												"First Time Attending RCC",
												registrationSettingsFormSchema.shape[
													field.name
												].isOptional(),
											)}
										</FormLabel>

										<FormControl>
											<RadioGroup
												value={
													field.value === undefined
														? undefined
														: field.value
															? "yes"
															: "no"
												}
												onValueChange={(value) => {
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
							<FormField
								control={form.control}
								name="attendeeType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{formatRegistrationField(
												"Attendee Type",
												registrationSettingsFormSchema.shape[
													field.name
												].isOptional(),
											)}
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
											disabled
										>
											<FormControl>
												<SelectTrigger className="w-full bg-background">
													<div
														className={clsx(
															"flex w-[95%] justify-start",
															{
																"text-muted-foreground/50":
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
													{c.registration.attendeeTypes.map(
														(atType) => (
															<SelectItem
																value={atType}
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
							<FormField
								control={form.control}
								name="isPresenting"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{formatRegistrationField(
												"Are you presenting?",
												registrationSettingsFormSchema.shape[
													field.name
												].isOptional(),
											)}
										</FormLabel>

										<FormControl>
											<RadioGroup
												value={
													field.value === undefined
														? undefined
														: field.value
															? "yes"
															: "no"
												}
												onValueChange={(value) => {
													field.onChange(
														value === "yes",
													);
												}}
												className="flex"
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
								name="heardFrom"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{formatRegistrationField(
												`Where did you hear about ${c.hackathonName}?`,
												registrationSettingsFormSchema.shape[
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
													<SelectValue placeholder="Heard From..." />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectGroup className="max-h-[400px] w-[var(--radix-select-trigger-width)]">
													{c.registration.heardFromOptions.map(
														(option) => (
															<SelectItem
																value={option}
																key={option}
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
												registrationSettingsFormSchema.shape[
													field.name
												].isOptional(),
											)}
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Get started in Cyber..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
					</FormGroupWrapper>

					{attendeeType === "University Student" && (
						<FormGroupWrapper title="University Info">
							<div
								className={
									"grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-2"
								}
							>
								<FormField
									control={form.control}
									name="university"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{formatRegistrationField(
													"University",
													registrationSettingsFormSchema.shape[
														field.name
													].isOptional(),
												)}
											</FormLabel>
											<Popover>
												<FormControl>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															role="combobox"
															className={cn(
																"w-full justify-between",
																!field.value &&
																	"text-muted-foreground/50",
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
														console.log("closing")
													}
												>
													<Command>
														<CommandInput placeholder="Search university..." />
														<CommandList>
															<CommandEmpty>
																No university
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
												If you are not currently a
												student, please select the most
												recent university you attended.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="classification"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{formatRegistrationField(
													"Classification",
													registrationSettingsFormSchema.shape[
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
																	"text-muted-foreground/50":
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
										<FormItem>
											<FormLabel>
												{formatRegistrationField(
													"Major",
													registrationSettingsFormSchema.shape[
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
																	"text-muted-foreground/50",
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
																No major found.
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
													registrationSettingsFormSchema.shape[
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
								className={
									"grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-2"
								}
							>
								<FormField
									control={form.control}
									name="company"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{formatRegistrationField(
													"Company Name",
													registrationSettingsFormSchema.shape[
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
													registrationSettingsFormSchema.shape[
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
								className={
									"grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-2"
								}
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
													registrationSettingsFormSchema.shape[
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
																	"text-muted-foreground/50":
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
														{c.registration.organizerGroups.map(
															(group) => (
																<SelectItem
																	value={
																		group
																	}
																	key={group}
																>
																	{group}
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
												registrationSettingsFormSchema.shape[
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
													<SelectValue placeholder="Shirt Size" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="S">
														S
													</SelectItem>
													<SelectItem value="M">
														M
													</SelectItem>
													<SelectItem value="L">
														L
													</SelectItem>
													<SelectItem value="XL">
														XL
													</SelectItem>
													<SelectItem value="2XL">
														2XL
													</SelectItem>
													<SelectItem value="3XL">
														3XL
													</SelectItem>
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
													registrationSettingsFormSchema.shape[
														field.name
													].isOptional(),
												)}
											</FormLabel>
											<FormDescription>
												Please select which dietary
												restrictions you have so we can
												best accommodate you at the
												event!
											</FormDescription>
										</div>
										{c.registration.dietaryRestrictionOptions.map(
											(item) => (
												<FormField
													key={item}
													control={form.control}
													name="dietRestrictions"
													render={({ field }) => {
														return (
															<FormItem
																key={item}
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
																	{item}
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
												"Anything else we can do to better accommodate you at the event?",
												registrationSettingsFormSchema.shape[
													field.name
												].isOptional(),
											)}
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="List any accessibility concerns here..."
												className="resize-none bg-background"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</FormGroupWrapper>

					<Button
						type={"submit"}
						disabled={
							!hasDataChanged ||
							isLoading ||
							loadingState === "executing"
						}
					>
						{isLoading || loadingState === "executing" ? (
							<>
								<Loader2
									className={"mr-2 h-4 w-4 animate-spin"}
								/>
								<div>Updating</div>
							</>
						) : (
							"Update"
						)}
					</Button>

					{hasErrors && (
						<p className={"text-red-800"}>
							Something doesn't look right. Please check your
							inputs.
						</p>
					)}
				</form>
			</Form>
		</div>
	);
}
