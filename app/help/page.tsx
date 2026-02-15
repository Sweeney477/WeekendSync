"use client";

import Link from "next/link";
import { useState } from "react";
import { HelpArticle } from "@/components/help/HelpArticle";
import { FAQItem } from "@/components/help/FAQItem";
import { Input } from "@/components/ui/Input";

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const faqs = [
        {
            q: "Is WeekendSync free?",
            a: "Yes! WeekendSync is currently in beta and completely free to use for all features.",
        },
        {
            q: "Do my friends need an account to join?",
            a: "Yes, everyone needs to sign in to vote and add items. This ensures we can track who added what and manage splitting costs fairly.",
        },
        {
            q: "Can I use the app offline?",
            a: "Yes! You can view your itinerary and add new items while offline. Changes will automatically sync when you reconnect to the internet.",
        },
        {
            q: "How do I invite people?",
            a: "Go to the 'People' tab in your trip or look for the 'Invite' button on the dashboard. You can copy a link or share the trip code directly.",
        },
        {
            q: "What happens if there's a tie in voting?",
            a: "WeekendSync highlights the top choices. If there's a strict tie, we recommend rock-paper-scissors! Ultimately, the organizer can make the final call.",
        },
    ];

    const filteredFaqs = faqs.filter(
        (f) =>
            f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.a.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background-light pb-20 pt-24 dark:bg-background-dark">
            <div className="mx-auto max-w-4xl px-4">
                <div className="mb-12 text-center">
                    <h1 className="mb-4 font-display text-4xl font-bold uppercase tracking-wider text-black dark:text-white md:text-6xl">
                        Help Center
                    </h1>
                    <p className="font-sans text-xl text-slate-600 dark:text-slate-300">
                        Guides, FAQs, and support for your weekend getaways.
                    </p>
                </div>

                <div className="mb-12">
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for help..."
                        className="h-14 text-lg"
                    />
                </div>

                <div className="grid gap-12">
                    {/* Getting Started */}
                    <section id="getting-started" className="scroll-mt-24">
                        <HelpArticle title="Getting Started">
                            <h3 className="text-lg font-bold">1. Create a Trip</h3>
                            <p className="mb-4">
                                Click &quot;Create New Trip&quot; on the homepage. You&apos;ll pick a city, dates, and a &quot;vibe&quot; (like Sports, Relaxing, or Party). This sets up your initial itinerary.
                            </p>
                            <h3 className="text-lg font-bold">2. Invite Friends</h3>
                            <p className="mb-4">
                                Share the invite link from your dashboard. Friends can join instantly.
                            </p>
                            <h3 className="text-lg font-bold">3. Plan Together</h3>
                            <p>
                                Anyone can add activities to the &quot;Plan&quot; tab. Use the &quot;Polls&quot; feature to decide on dates or activities if you&apos;re undecided.
                            </p>
                        </HelpArticle>
                    </section>

                    {/* Voting Guide */}
                    <section id="voting" className="scroll-mt-24">
                        <HelpArticle title="How Voting Works">
                            <p className="mb-4">
                                We use <strong>Ranked Choice Voting</strong> for big decisions like dates or destination.
                            </p>
                            <ul className="list-disc pl-5 mb-4 space-y-2">
                                <li><strong>Rank your options:</strong> Drag and drop choices to order them from favorite to least favorite.</li>
                                <li><strong>Instant Runoff:</strong> If no option gets &gt;50% first-choice votes, the last place option is eliminated, and those votes move to their second choice. This repeats until a winner is found.</li>
                            </ul>
                            <p>
                                This ensures the winning option is the one the most people correspond to being &quot;okay with&quot;, minimizing disappointment.
                            </p>
                        </HelpArticle>
                    </section>

                    {/* Costs Guide */}
                    <section id="costs" className="scroll-mt-24">
                        <HelpArticle title="Managing Costs">
                            <p className="mb-4">
                                Track shared expenses in the <strong>Costs</strong> tab to avoid awkward math later.
                            </p>
                            <h3 className="text-lg font-bold">Adding a Cost</h3>
                            <p className="mb-4">
                                Click &quot;Add Expense&quot;. Enter the amount and who paid. By default, it splits equally among everyone. You can uncheck &quot;Split equally&quot; to assign specific amounts to specific people.
                            </p>
                            <h3 className="text-lg font-bold">Who Owes Who?</h3>
                            <p className="mb-4">
                                We calculate a simple &quot;net balance&quot; for each person. Positive numbers mean you are owed money; negative means you owe the group.
                            </p>
                            <div className="bg-poster-yellow/20 p-4 border-l-4 border-poster-yellow mb-4">
                                <strong>Note:</strong> We don&apos;t process payments. Use Venmo, CashApp, or Zelle to settle up based on the final balances.
                            </div>
                        </HelpArticle>
                    </section>

                    {/* FAQs */}
                    <section id="faq" className="scroll-mt-24">
                        <h2 className="mb-6 font-display text-2xl font-bold uppercase tracking-wider text-black dark:text-white">
                            Frequently Asked Questions
                        </h2>
                        <div className="rounded-2xl border-2 border-black bg-white p-2 dark:border-white dark:bg-zinc-900">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq, i) => (
                                    <FAQItem key={i} question={faq.q} answer={faq.a} />
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    No results found for &quot;{searchQuery}&quot;
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Contact */}
                    <section id="contact" className="scroll-mt-24 mb-20 text-center">
                        <h2 className="mb-4 font-display text-2xl font-bold uppercase tracking-wider text-black dark:text-white">
                            Still need help?
                        </h2>
                        <p className="mb-6 text-slate-600 dark:text-slate-300">
                            Found a bug or have a feature request? We&apos;d love to hear from you.
                        </p>
                        <a
                            href="mailto:support@weekendsync.com"
                            className="inline-block rounded-full border-2 border-black bg-black px-8 py-3 font-display font-bold uppercase tracking-widest text-white transition-transform hover:scale-105 active:scale-95 dark:border-white dark:bg-white dark:text-black"
                        >
                            Contact Support
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
}
