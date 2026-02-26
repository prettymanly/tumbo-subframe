"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { FadeInUp } from "@/components/ui/fade-in-up";
import { FeatherArrowUp } from "@subframe/core";
import { FeatherLandmark } from "@subframe/core";
import { TextLoop } from "@/components/ui/text-loop";
import { IconWithBackground } from "@/components/subframe/ui/components/IconWithBackground";
import { FeatherCheckCircle2 } from "@subframe/core";
import { FeatherShield } from "@subframe/core";
import { Accordion } from "@/components/subframe/ui/components/Accordion";
import { BoldFooter } from "@/components/subframe/ui/components/BoldFooter";

function TumboHome() {
  // Search phrases for animated placeholder
  const searchPhrases = [
    "Shy 6‑year‑old who loves dinosaurs",
    "Weekend movement class near Bishan", 
    "Gentle teacher, small groups",
    "Prep for P1, without the stress",
    "Hands‑on STEM, not lecture‑y",
    "Creative exploration for a careful kid",
    "Calm art studio near Novena",
    "Nature‑based class, low noise"
  ];

  return (
    <ModernPageLayout>
      <div className="flex w-full flex-col items-center justify-center bg-default-background overflow-x-clip">
        <div className="flex w-full flex-col items-center justify-center gap-8 bg-default-background px-6 pt-40 pb-24 mobile:pt-24 mobile:pb-16">
          <FadeInUp delay={0} duration={0.8} offset={40}>
            <span className="max-w-[1024px] whitespace-pre-wrap font-['Lexend'] text-[95px] font-[900] leading-[84px] text-default-font text-center -tracking-[0.04em] mobile:font-['Montserrat'] mobile:text-[62px] mobile:font-[900] mobile:leading-[58px] mobile:tracking-normal">
              The best classes{"\n"}aren&apos;t always {"\n"}the <em>best</em> classes.
            </span>
          </FadeInUp>
          <FadeInUp delay={0.15} duration={0.7}>
            <span className="max-w-[576px] whitespace-pre-wrap text-body font-body text-subtext-color text-center -tracking-[0.015em]">
               {
                 "Tümbo surfaces the hidden gems that match your child's learning style and your family's values — not just the programs with the longest waitlists."
               }
            </span>
          </FadeInUp>
          <FadeInUp delay={0.3} duration={0.7}>
            <div className="flex w-full flex-col items-center justify-center gap-3 px-4 py-4">
              <Link
                href="/classes"
                className="flex h-14 w-full max-w-[768px] flex-none items-center justify-center gap-2 rounded-full bg-tumbo-cream px-2 py-2 no-underline hover:ring-2 hover:ring-[var(--tumbo-orange)]/20 transition-all duration-200 group/search"
              >
                <div className="h-auto grow shrink-0 basis-0 flex items-center pl-4">
                  <TextLoop interval={3} className="text-tumbo-muted">
                    {searchPhrases.map((text) => (
                      <span key={text}>{text}</span>
                    ))}
                  </TextLoop>
                </div>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-tumbo-orange text-white group-hover/search:scale-105 transition-transform duration-200"
                >
                  <FeatherArrowUp className="ml-1 h-5 w-5 flex-shrink-0" style={{ strokeWidth: '1.5px' }} />
                </div>
              </Link>
              <span className="text-caption font-caption text-subtext-color">
                Browse classes by learning style, location, and what matters to you.
              </span>
            </div>
          </FadeInUp>
        </div>
        <FadeInUp className="flex w-full flex-col items-center gap-6 bg-default-background px-6 py-24">
          <span className="whitespace-pre-wrap text-heading-3 font-heading-3 text-default-font">
            {"How Tümbo works"}
          </span>
          <span className="whitespace-pre-wrap text-heading-1 font-heading-1 text-default-font">
            {"We scout for fit, so you're not lost in endless tabs."}
          </span>
          <Image
            className="h-144 w-full max-w-[1280px] flex-none rounded-lg object-cover"
            src="https://res.cloudinary.com/subframe/image/upload/v1724690087/uploads/302/w2ra2yihpofsdy1h4uhy.png"
            alt="How Tumbo works — class discovery flow"
            width={1280}
            height={576}
          />
          <div className="flex w-full max-w-[1280px] flex-wrap items-center justify-center gap-12">
            <div className="flex min-w-[240px] grow shrink-0 basis-0 items-center gap-4">
              <IconWithBackground size="x-large" icon={<FeatherLandmark />} />
              <span className="whitespace-pre-wrap font-['Montserrat'] text-[16px] font-[500] leading-[24px] text-default-font -tracking-[0.01em]">
                 {
                   "Filter by what matters.\nNot just age or postcode — search by personality, learning style, and what matters to your family.\n"
                 }
              </span>
            </div>
            <div className="flex min-w-[240px] grow shrink-0 basis-0 items-center gap-4">
              <IconWithBackground
                size="x-large"
                icon={<FeatherCheckCircle2 />}
              />
              <span className="whitespace-pre-wrap font-['Montserrat'] text-[16px] font-[500] leading-[24px] text-default-font -tracking-[0.01em]">
                {
                  "We scout classes that fit.\nTümbo reads real reviews, checks vibes, and matches you with options that fit. No sponsored noise.\n"
                }
              </span>
            </div>
            <div className="flex min-w-[240px] grow shrink-0 basis-0 items-center gap-4">
              <IconWithBackground size="x-large" icon={<FeatherShield />} />
              <span className="whitespace-pre-wrap font-['Montserrat'] text-[16px] font-[500] leading-[24px] text-default-font -tracking-[0.01em]">
                {
                  "Get 3 recs... and breathe.\nNot a giant list. Just thoughtful suggestions and a nudge to help you decide.\n"
                }
              </span>
            </div>
          </div>
        </FadeInUp>
        <FadeInUp className="flex w-full flex-col items-center justify-center gap-4 px-6 py-12">
          <span className="whitespace-pre-wrap text-heading-1 font-heading-1 text-default-font">
            {"Every parent has a shortcut."}
          </span>
          <span className="w-full whitespace-pre-wrap text-body-bold font-body-bold text-default-font text-center -tracking-[0.01em]">
            {
              "Some call a friend, some trust a gut feeling, some open 12 tabs and wait for the answer to reveal itself. \nTümbo is your shortcut. Built to read the signals, spot the fit, and help you decide faster, with less noise."
            }
          </span>
        </FadeInUp>
        <div className="flex w-full max-w-[1280px] flex-wrap items-center justify-center gap-12">
          <div className="flex min-w-[240px] grow shrink-0 basis-0 items-center gap-4" />
        </div>
        <FadeInUp className="flex w-full flex-col items-center justify-center gap-2 px-6 py-24">
          <div className="flex w-full max-w-[1280px] grow shrink-0 basis-0 flex-wrap items-center justify-center gap-12">
            <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-center justify-center gap-10 self-stretch">
              <div className="flex flex-col items-start justify-center gap-4">
                <div className="flex flex-col items-start justify-center">
                  <span className="text-heading-2 font-heading-2 text-default-font -tracking-[0.025em]">
                    Everything in One Place, At a Glance
                  </span>
                  <span className="text-body-bold font-body-bold text-default-font -tracking-[0.025em]">
                    Because parenting is not a full-time research job.
                  </span>
                </div>
                <span className="whitespace-pre-wrap text-body font-body text-default-font -tracking-[0.01em]">
                  {
                    "Tired of bouncing between WhatsApp threads, forum rabbit holes, and that spreadsheet you swore you'd update?\n\nTümbo puts every class in Singapore — yes, even the ones with tragic SEO — in one clean, searchable page. We read all the reviews (so you don't have to) and give you the TLDR version: balanced, bite-sized, BS-free. Decide in minutes, not months."
                  }
                </span>
              </div>
            </div>
            <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch">
              <div className="flex h-144 w-full min-w-[240px] max-w-[576px] flex-none flex-col items-center justify-center gap-2 overflow-hidden rounded-lg">
                <Image
                  className="w-full grow shrink-0 basis-0 object-cover"
                  src="https://res.cloudinary.com/subframe/image/upload/v1724705524/uploads/302/l5oq75rpdkq2kowa2xkj.png"
                  alt="Everything in one place — Tumbo class directory"
                  width={576}
                  height={576}
                />
              </div>
            </div>
          </div>
        </FadeInUp>
        <FadeInUp className="flex w-full flex-col items-center justify-center gap-6 bg-default-background px-6 py-24">
          <div className="flex w-full max-w-[1280px] grow shrink-0 basis-0 flex-wrap items-center justify-center gap-12">
            <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch rounded-lg">
              <div className="flex h-144 w-full min-w-[240px] max-w-[576px] flex-none flex-col items-center justify-center gap-2 overflow-hidden rounded-lg">
                <Image
                  className="w-full grow shrink-0 basis-0 object-cover"
                  src="https://res.cloudinary.com/subframe/image/upload/v1724690133/uploads/302/tswlwr0qfwwhkgbjwplw.png"
                  alt="Your child's growth mapped — development tracking"
                  width={576}
                  height={576}
                />
              </div>
            </div>
            <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-center justify-center gap-10 self-stretch">
              <div className="flex flex-col items-start justify-center gap-4">
                <div className="flex flex-col items-start justify-center gap-1">
                  <span className="inline-flex items-center gap-2">
                    <span className="text-heading-2 font-heading-2 text-default-font -tracking-[0.025em]">
                      Your Child&apos;s Growth, Mapped
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--tumbo-orange)]/10 text-[var(--tumbo-orange)] text-[10px] font-bold uppercase tracking-wider">
                      Coming Soon
                    </span>
                  </span>
                  <span className="text-body-bold font-body-bold text-default-font -tracking-[0.025em]">
                    Finally, a profile that grows up with your kid.
                  </span>
                </div>
                <span className="whitespace-pre-wrap text-body font-body text-default-font -tracking-[0.01em]">
                  {
                    "We don't stop at \"6 years old\" or \"likes art.\" We dig into how your kid warms up, focuses, and lights up.\n\nThe result? A learning signature that actually guides decisions, plus a dashboard tracking their wins, wobbles, and growth spurts."
                  }
                </span>
              </div>
            </div>
          </div>
        </FadeInUp>
        <FadeInUp className="flex w-full flex-col items-center justify-center gap-6 bg-default-background px-6 py-24">
          <div className="flex w-full max-w-[1280px] grow shrink-0 basis-0 flex-wrap items-center justify-center gap-12">
            <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start justify-center gap-10 self-stretch">
              <div className="flex flex-col items-start justify-center gap-4">
                <div className="flex flex-col items-start justify-center gap-1">
                  <span className="inline-flex items-center gap-2">
                    <span className="text-heading-2 font-heading-2 text-default-font -tracking-[0.025em]">
                      Your Parent Group, Upgraded.
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--tumbo-orange)]/10 text-[var(--tumbo-orange)] text-[10px] font-bold uppercase tracking-wider">
                      Coming Soon
                    </span>
                  </span>
                  <span className="text-body-bold font-body-bold text-default-font -tracking-[0.025em]">
                    More useful than the WhatsApp chat.
                  </span>
                </div>
                <span className="whitespace-pre-wrap text-body font-body text-default-font -tracking-[0.01em]">
                  {
                    "The best intel isn't on Google. It's from parents who've already tried the class. Tümbo shows you who's going, lets you swap notes, and makes it stupid-easy to share recs with your partner or friends. And we'll tell you straight if something's sponsored.\n\nNo guesswork. No BS."
                  }
                </span>
              </div>
            </div>
            <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch rounded-full">
              <div className="flex h-144 w-full min-w-[240px] max-w-[576px] flex-none flex-col items-center justify-center gap-2 overflow-hidden rounded-lg">
                <Image
                  className="w-full grow shrink-0 basis-0 object-cover"
                  src="https://res.cloudinary.com/subframe/image/upload/v1724690142/uploads/302/fbkapcq4o1zsq98df0t6.png"
                  alt="Parent community — share recommendations with friends"
                  width={576}
                  height={576}
                />
              </div>
            </div>
          </div>
        </FadeInUp>
        <FadeInUp className="flex w-full grow shrink-0 basis-0 flex-col items-center justify-center gap-2 px-6 py-24">
          <div className="flex w-full flex-col items-center justify-center gap-12 bg-default-background px-4 py-32">
            <div className="flex w-full flex-col items-center justify-center gap-12">
              <div className="flex w-full max-w-[768px] flex-col items-center justify-center gap-2">
                <span className="w-full text-heading-1 font-heading-1 text-default-font text-center">
                  FAQ
                </span>
                <span className="w-full whitespace-pre-wrap text-heading-3 font-heading-3 text-subtext-color text-center">
                  {"Frequently Asked (and Sometimes Unasked) Questions\n"}
                </span>
              </div>
              <div className="flex w-full max-w-[576px] flex-col items-center justify-center gap-4">
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm hover:border-neutral-300 transition-colors duration-200">
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 whitespace-pre-wrap text-body-bold font-body-bold text-default-font">
                          {"Wth is a Tümbo, exactly?\n"}
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                    defaultOpen={true}
                  >
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-3 py-2">
                      <span className="w-full whitespace-pre-wrap text-body font-body text-subtext-color">
                        {
                          "An enrichment class directory that actually works for busy parents.\nWe pull in every class in Singapore, even the hidden gems with tragic SEO, and let you search them by what matters: teaching style, class vibe, and philosophy. No 12 tabs, no \"I'll update the spreadsheet later.\"\n\nAs for the name, it's a mispelling of tumbuh which means growth(sapling) in Melayu."
                        }
                      </span>
                    </div>
                  </Accordion>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm hover:border-neutral-300 transition-colors duration-200">
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 whitespace-pre-wrap text-body-bold font-body-bold text-default-font">
                          {"How does Tümbo know what's right for my child?\n"}
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                  >
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-3 py-2">
                      <span className="w-full whitespace-pre-wrap text-body font-body text-subtext-color">
                        {
                          "We tag every class with what actually matters — teaching style, class vibe, energy level, and philosophy. Browse and filter by what fits your child, not just what ranks on Google.\n\nSoon, a short onboarding will build your child's \"learning signature\" for personalised recs."
                        }
                      </span>
                    </div>
                  </Accordion>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm hover:border-neutral-300 transition-colors duration-200">
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 whitespace-pre-wrap text-body-bold font-body-bold text-default-font">
                          {"What kind of info do I get about each class?\n"}
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                  >
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-3 py-2">
                      <span className="w-full whitespace-pre-wrap text-body font-body text-subtext-color">
                        {
                          "• Class name, location, schedule, and age range\n• Review summaries (TLDDR) from multiple sources — balanced and BS-free\n• Context you can't get from a flyer — like class vibe or teacher style"
                        }
                      </span>
                    </div>
                  </Accordion>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm hover:border-neutral-300 transition-colors duration-200">
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 whitespace-pre-wrap text-body-bold font-body-bold text-default-font">
                          {"How do I know I can trust the listings?\n"}
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                  >
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-3 py-2">
                      <span className="w-full whitespace-pre-wrap text-body font-body text-subtext-color">
                        {
                          "If a listing is sponsored, we'll say so. If it's editorially \"qualified,\" it's been vetted by a human (often a parent) and backed by aggregated reviews from multiple places."
                        }
                      </span>
                    </div>
                  </Accordion>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm hover:border-neutral-300 transition-colors duration-200">
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 whitespace-pre-wrap text-body-bold font-body-bold text-default-font">
                          {"Can I connect with other parents?\n"}
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                  >
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-3 py-2">
                      <span className="w-full whitespace-pre-wrap text-body font-body text-subtext-color">
                        {
                          "Soon. We're building parent community features — you'll be able to see who else is in or eyeing a class, swap notes, and share recs in a couple of taps."
                        }
                      </span>
                    </div>
                  </Accordion>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm hover:border-neutral-300 transition-colors duration-200">
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 whitespace-pre-wrap text-body-bold font-body-bold text-default-font">
                          {"Do I have to use the chat to get recommendations?\n"}
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                  >
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-3 py-2">
                      <span className="w-full whitespace-pre-wrap text-body font-body text-subtext-color">
                        {
                          "Nope. The chat is coming soon, but you don't need it. Browse the directory, filter by what matters — learning style, location, class vibe — and find your fit."
                        }
                      </span>
                    </div>
                  </Accordion>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm hover:border-neutral-300 transition-colors duration-200">
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 whitespace-pre-wrap text-body-bold font-body-bold text-default-font">
                          {"Does it work on my phone?\n"}
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                  >
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-3 py-2">
                      <span className="w-full whitespace-pre-wrap text-body font-body text-subtext-color">
                        {
                          "Of course. Most parents aren't hunting for a weekend art class on a desktop."
                        }
                      </span>
                    </div>
                  </Accordion>
                </div>
              </div>
            </div>
          </div>
        </FadeInUp>
        <div className="flex w-full flex-col items-start">
          <BoldFooter />
        </div>
      </div>
    </ModernPageLayout>
  );
}

export default TumboHome;
