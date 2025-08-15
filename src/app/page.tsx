"use client";

import React from "react";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { FeatherCloud } from "@subframe/core";
import { DropdownMenu } from "@/components/subframe/ui/components/DropdownMenu";
import { FeatherFilePlus2 } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { FeatherPaperclip } from "@subframe/core";
import { IconButton } from "@/components/subframe/ui/components/IconButton";
import { TextFieldUnstyled } from "@/components/subframe/ui/components/TextFieldUnstyled";
import { FeatherArrowUp } from "@subframe/core";
import { FeatherLandmark } from "@subframe/core";
import { useAnimatedPlaceholder } from "@/components/AnimatedSearchPlaceholder";
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

  const animatedPlaceholder = useAnimatedPlaceholder(searchPhrases, {
    typingSpeed: 80,
    deletingSpeed: 40,
    pauseTime: 3000
  });

  return (
    <ModernPageLayout>
      <div className="flex w-full flex-col items-center justify-center bg-default-background">
        <div className="flex w-full flex-col items-center justify-center gap-8 bg-default-background px-6 pt-40 pb-24">
          <span className="max-w-[1024px] whitespace-pre-wrap font-['Lexend'] text-[95px] font-[900] leading-[84px] text-default-font text-center -tracking-[0.04em] mobile:font-['Montserrat'] mobile:text-[62px] mobile:font-[900] mobile:leading-[58px] mobile:tracking-normal">
            The best classes{"\n"}aren't always {"\n"}the <em>best</em> classes.
          </span>
          <span className="max-w-[576px] whitespace-pre-wrap text-body font-body text-subtext-color text-center -tracking-[0.015em]">
             {
               "The best classes aren't always the \"best\" classes. Tümbo finds hidden gems that match both your child's learning style and your family's values, rather than just the programs with the longest waitlists."
             }
          </span>
          <div className="flex w-full flex-col items-center justify-center gap-3 px-4 py-4">
            <div className="flex h-14 w-full max-w-[768px] flex-none items-center justify-center gap-2 rounded-full bg-neutral-100 px-2 py-2">
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <IconButton
                    size="large"
                    icon={<FeatherPaperclip />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  />
                </SubframeCore.DropdownMenu.Trigger>
                <SubframeCore.DropdownMenu.Portal>
                  <SubframeCore.DropdownMenu.Content
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    asChild={true}
                  >
                    <DropdownMenu>
                      <DropdownMenu.DropdownItem icon={<FeatherCloud />}>
                        Connect to Google Drive
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem icon={<FeatherFilePlus2 />}>
                        Upload from computer
                      </DropdownMenu.DropdownItem>
                    </DropdownMenu>
                  </SubframeCore.DropdownMenu.Content>
                </SubframeCore.DropdownMenu.Portal>
              </SubframeCore.DropdownMenu.Root>
              <TextFieldUnstyled className="h-auto grow shrink-0 basis-0">
                <TextFieldUnstyled.Input
                  placeholder={animatedPlaceholder}
                  value=""
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                />
              </TextFieldUnstyled>
              <IconButton
                disabled={true}
                size="large"
                icon={<FeatherArrowUp />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
            <span className="text-caption font-caption text-subtext-color">
              Tell Tümbo about your kid. We'll do the rest.
            </span>
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-6 bg-default-background px-6 py-24">
          <span className="whitespace-pre-wrap text-heading-3 font-heading-3 text-default-font">
            {"How Tümbo works"}
          </span>
          <span className="whitespace-pre-wrap text-heading-1 font-heading-1 text-default-font">
            {"We scout for fit, so you're not lost in endless tabs."}
          </span>
          <img
            className="h-144 w-full max-w-[1280px] flex-none rounded-lg object-cover"
            src="https://res.cloudinary.com/subframe/image/upload/v1724690087/uploads/302/w2ra2yihpofsdy1h4uhy.png"
          />
          <div className="flex w-full max-w-[1280px] flex-wrap items-center justify-center gap-12">
            <div className="flex min-w-[240px] grow shrink-0 basis-0 items-center gap-4">
              <IconWithBackground size="x-large" icon={<FeatherLandmark />} />
              <span className="whitespace-pre-wrap font-['Montserrat'] text-[16px] font-[500] leading-[24px] text-default-font -tracking-[0.01em]">
                 {
                   "Tell us what your kid\'s like.\nNot just age or postcode. we ask about personality, learning style, and what matters to your family.\n"
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
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-4 px-12 py-12">
          <span className="whitespace-pre-wrap text-heading-1 font-heading-1 text-default-font">
            {"Every parent has a shortcut."}
          </span>
          <span className="w-full whitespace-pre-wrap text-body-bold font-body-bold text-default-font text-center -tracking-[0.01em]">
            {
              "Some call a friend, some trust a gut feeling, some open 12 tabs and wait for the answer to reveal itself. \nTümbo is your shortcut. Built to read the signals, spot the fit, and help you decide faster, with less noise."
            }
          </span>
        </div>
        <div className="flex w-full max-w-[1280px] flex-wrap items-center justify-center gap-12">
          <div className="flex min-w-[240px] grow shrink-0 basis-0 items-center gap-4" />
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-2 px-6 py-24">
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
                <img
                  className="w-full grow shrink-0 basis-0 object-cover"
                  src="https://res.cloudinary.com/subframe/image/upload/v1724705524/uploads/302/l5oq75rpdkq2kowa2xkj.png"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-6 bg-default-background px-6 py-24">
          <div className="flex w-full max-w-[1280px] grow shrink-0 basis-0 flex-wrap items-center justify-center gap-12">
            <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch rounded-lg">
              <div className="flex h-144 w-full min-w-[240px] max-w-[576px] flex-none flex-col items-center justify-center gap-2 overflow-hidden rounded-lg">
                <img
                  className="w-full grow shrink-0 basis-0 object-cover"
                  src="https://res.cloudinary.com/subframe/image/upload/v1724690133/uploads/302/tswlwr0qfwwhkgbjwplw.png"
                />
              </div>
            </div>
            <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-center justify-center gap-10 self-stretch">
              <div className="flex flex-col items-start justify-center gap-4">
                <div className="flex flex-col items-start justify-center">
                  <span className="text-heading-2 font-heading-2 text-default-font -tracking-[0.025em]">
                    Your Child's Growth, Mapped
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
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-6 bg-default-background px-6 py-24">
          <div className="flex w-full max-w-[1280px] grow shrink-0 basis-0 flex-wrap items-center justify-center gap-12">
            <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start justify-center gap-10 self-stretch">
              <div className="flex flex-col items-start justify-center gap-4">
                <div className="flex flex-col items-start justify-center">
                  <span className="text-heading-2 font-heading-2 text-default-font -tracking-[0.025em]">
                    Your Parent Group, Upgraded.
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
                <img
                  className="w-full grow shrink-0 basis-0 object-cover"
                  src="https://res.cloudinary.com/subframe/image/upload/v1724690142/uploads/302/fbkapcq4o1zsq98df0t6.png"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-center justify-center gap-2 px-6 py-24">
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
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm">
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
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm">
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
                          "We ask the questions Google won't.\nA short onboarding builds your child's \"learning signature\" — the stuff beyond age and subject. From there, we can spot the classes they'll actually stick with."
                        }
                      </span>
                    </div>
                  </Accordion>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm">
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
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm">
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
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm">
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
                          "Yes. You'll be able to see who else is in or eyeing a class, swap notes, and share recs in a couple of taps."
                        }
                      </span>
                    </div>
                  </Accordion>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm">
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
                          "Nope. Browse like a directory, filter for what you want, or dig into our curated collections."
                        }
                      </span>
                    </div>
                  </Accordion>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm">
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
        </div>
        <div className="flex w-full flex-col items-start">
          <BoldFooter />
        </div>
      </div>
    </ModernPageLayout>
  );
}

export default TumboHome;
