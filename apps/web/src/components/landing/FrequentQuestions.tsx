"use client";
import { useState } from "react";

interface FAQ {
	question: string;
	answer: string | JSX.Element;
}

const faqs: FAQ[] = [
	{
		question: "What activities will be there?",
		answer: "There will be workshops, Capture the Flag, a beginner CTF competition, free food, free swag, and the ability to network with students and industry professionals.",
	},
	{
		question: "Who can attend RowdyCyberCon?",
		answer: (
			<>
				RowdyCyberCon is open to all students attending San
				Antonio-based universities and colleges, regardless of major or
				skill level. If you attend an online degree program that is
				based in San Antonio, you are eligible to participate. We
				welcome anyone interested in learning more about cybersecurity.
				We have workshops and opportunities accessible for every level
				including beginners! Volunteers not fitting those qualifications
				are welcomed and can sign up{" "}
				<a
					href="https://forms.gle/G8t8UQxiQLGbFLVE9"
					target="_blank"
					rel="noopener noreferrer"
					className="text-primary underline"
				>
					here
				</a>
				.
			</>
		),
	},
	{
		question: "How much does it cost?",
		answer: "RowdyCyberCon is free to all San Antonio-based students! Breakfast, lunch, dinner, and snacks will be served, so come hungry!",
	},
	{
		question: "Do I need experience to attend?",
		answer: "Nope! We have something for anyone and everyone. There are plenty of workshops that will help you learn new skills during the conference!",
	},
	{
		question: "How do we get to San Pedro I at and where should we park?",
		answer: "San Pedro I is located at UTSA's downtown campus at 506 Dolorosa St, San Antonio, TX 78204. We recommend driving, carpooling, or taking the VIA. All UTSA students get a free, unlimited bus pass that can be accessed here. There are multiple convenient pickup/drop off points. There is student parking available under the bridge, D1, D2, and D3 or paid parking in the downtown garage or the Bexar County garage. A map of UTSA's downtown campus can be found here and UTSA's weekend parking rules can be found here.",
	},
	{
		question: "What if I can't attend in-person?",
		answer: "All good! We have certain events available online. The CTF will also be fully available online. If you win/place, we can ship your prize to you! Make sure to enter number 47 on the registration form to note you are attending online.",
	},
	{
		question: "What is the event schedule and what time should I show up?",
		answer: (
			<>
				The schedule can be found{" "}
				<a
					href="https://docs.google.com/spreadsheets/d/19yuormuJRxJL-zdw5Uc7rLdvCFTpus9dUlTM72Xiorg/edit?gid=0#gid=0"
					target="_blank"
					rel="noopener noreferrer"
					className="text-primary underline"
				>
					here
				</a>
			</>
		),
	},
	{
		question: "What should I bring?",
		answer: "Bring your college ID, identification showing you are over 18 years old, a laptop, a charger, and anything else you may need. Popular items include monitors, power strips, and blankets! Items such as weapons, alcohol, and illegal drugs are not allowed.",
	},
	{
		question: "Still have questions?",
		answer: "Feel free reach out to publicly or privately on the discord channel or email us at director@rowdycybercon.org!",
	},
];

export default function FrequentQuestions() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const toggleFAQ = (index: number) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<section className="mb-12 w-full py-16" id="FAQ">
			<div className="mx-auto max-w-3xl px-4">
				{/* Section title */}
				<div className="mb-10 flex flex-col items-center">
					<h2
						className="text-center text-3xl font-bold text-white md:text-4xl"
						style={{ textShadow: "0 2px 6px rgba(0,60,110,0.45)" }}
					>
						Frequently Asked Questions
					</h2>
					<div
						className="mt-3 h-1 w-24 rounded-full"
						style={{
							background:
								"linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
						}}
					/>
				</div>

				{/* Free-floating glass accordion capsules */}
				<div className="space-y-4">
					{faqs.map((faq, index: number) => (
						<div
							key={index}
							className="aero-glass transition-all duration-300"
						>
							<button
								className="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-left"
								onClick={() => toggleFAQ(index)}
								aria-expanded={openIndex === index}
							>
								<span className="text-sm font-bold md:text-base">
									{faq.question}
								</span>
								<span
									className={`ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base font-bold text-white transition-transform duration-300 ${openIndex === index ? "rotate-45" : ""}`}
									style={{
										background:
											"linear-gradient(180deg, rgba(120,210,255,0.95) 0%, rgba(9,130,205,0.95) 100%)",
										boxShadow:
											"inset 0 1px 0 rgba(255,255,255,0.6)",
									}}
								>
									+
								</span>
							</button>

							{/* Answer */}
							{openIndex === index && (
								<div className="px-6 pb-5">
									<div className="border-t border-white/60 pt-4 text-sm leading-relaxed">
										{faq.answer}
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
