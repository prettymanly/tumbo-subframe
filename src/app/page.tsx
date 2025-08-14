"use client";

import React from "react";
import { DefaultPageLayout } from "@/components/subframe/ui/layouts/DefaultPageLayout";
import { FeatherCloud } from "@subframe/core";
import { DropdownMenu } from "@/components/subframe/ui/components/DropdownMenu";
import { FeatherFilePlus2 } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { FeatherPaperclip } from "@subframe/core";
import { IconButton } from "@/components/subframe/ui/components/IconButton";
import { TextFieldUnstyled } from "@/components/subframe/ui/components/TextFieldUnstyled";
import { FeatherArrowUp } from "@subframe/core";
import { FeatherLandmark } from "@subframe/core";
import { IconWithBackground } from "@/components/subframe/ui/components/IconWithBackground";
import { FeatherCheckCircle2 } from "@subframe/core";
import { FeatherShield } from "@subframe/core";
import { Accordion } from "@/components/subframe/ui/components/Accordion";
import { BoldFooter } from "@/components/subframe/ui/components/BoldFooter";

function TumboHome() {
  return (
    <DefaultPageLayout>
      <div className="flex w-full flex-col items-center justify-center bg-default-background">
        <div className="flex w-full flex-col items-center justify-center gap-8 bg-default-background px-6 pt-40 pb-24">
          <span className="max-w-[1024px] whitespace-pre-wrap font-['Lexend'] text-[95px] font-[900] leading-[84px] text-default-font text-center -tracking-[0.04em] mobile:font-['Montserrat'] mobile:text-[62px] mobile:font-[900] mobile:leading-[58px] mobile:tracking-normal">
            {"The best classes\naren't always \nthe best classes."}
          </span>
          <span className="max-w-[576px] whitespace-pre-wrap text-body font-body text-subtext-color text-center -tracking-[0.015em]">
             {
               "The perfect fit for your child might not have the biggest name, fanciest website, or the most trophies. Tümbo spots the hidden gems that align with how your child actually learns — the ones they\'ll stick with and love."
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
                  placeholder="Shy 6-year-old who loves dinosaurs"
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
              Tell Tümbo about your kid. We&apos;ll do the rest.
            </span>
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
            <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start justify-center gap-10 self-stretch">
              <div className="flex max-w-[448px] flex-col items-start justify-center gap-4">
                <span className="font-['Montserrat'] text-[30px] font-[700] leading-[34px] text-default-font -tracking-[0.025em]">
                  Okay but wth is a Tümbo?
                </span>
                <span className="whitespace-pre-wrap font-['Montserrat'] text-[18px] font-[400] leading-[26px] text-subtext-color -tracking-[0.01em]">
                  {
                    "Good question. It's an enrichment class directory that tries very hard to offer personalised and thoughtfully curated classes for your kid, 'cause where got time?\n\nAs for the name, it's a mispelling of tumbuh which means growth(sapling) in Melayu."
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-6 bg-default-background px-6 py-24">
          <span className="whitespace-pre-wrap text-heading-3 font-heading-3 text-default-font">
            {"How Tümbo works"}
          </span>
          <span className="whitespace-pre-wrap text-heading-1 font-heading-1 text-default-font">
            {"We scout for fit, so you&apos;re not lost in endless tabs."}
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
                    "Tired of bouncing between WhatsApp threads, forum rabbit holes, and that spreadsheet you swore you'd update? Tümbo puts every class in Singapore — yes, even the ones with tragic SEO — in one clean, searchable page. We read all the reviews (so you don't have to) and give you the TLDDR version: balanced, bite-sized, BS-free. So you can decide in minutes, not months."
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
                    "We don't stop at \"6 years old\" or \"likes art.\" We ask about how your kid warms up, focuses, and lights up. The result? A \"learning signature\" you can actually use — and a dashboard that quietly keeps track of their wins, wobbles, and growth spurts. Basically, a period tracker… but for childhood development."
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
                    "The best intel isn't on Google — it's from parents who've already tried the class. Tümbo shows you who's going, lets you swap notes, and makes it stupid-easy to share recs with your partner or friends. And we'll tell you straight if something's sponsored. No guesswork. No drama."
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
                <span className="w-full font-['Inter'] text-[48px] font-[700] leading-[48px] text-default-font text-center -tracking-[0.035em]">
                  FAQ
                </span>
                <span className="w-full whitespace-pre-wrap font-['Inter'] text-[24px] font-[500] leading-[32px] text-subtext-color text-center -tracking-[0.025em]">
                  {"All your questions, answered.\n"}
                </span>
              </div>
              <div className="flex w-full max-w-[576px] flex-col items-center justify-center gap-4">
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm">
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[28px] text-default-font -tracking-[0.01em]">
                          {"What is Subframe?\n"}
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                    defaultOpen={true}
                  >
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-3 py-2">
                      <span className="w-full whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[28px] text-subtext-color -tracking-[0.01em]">
                        {
                          "Subframe is an AI-powered design-to-code tool featuring a drag-and-drop visual editor, component library, and hundreds of templates.\n"
                        }
                      </span>
                    </div>
                  </Accordion>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm">
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[28px] text-default-font -tracking-[0.01em]">
                          {"What is Subframe?\n"}
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                  >
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-3 py-2">
                      <span className="w-full whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[28px] text-subtext-color -tracking-[0.01em]">
                        {
                          "Subframe is an AI-powered design-to-code tool featuring a drag-and-drop visual editor, component library, and hundreds of templates.\n"
                        }
                      </span>
                    </div>
                  </Accordion>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm">
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[28px] text-default-font -tracking-[0.01em]">
                          {"What is Subframe?\n"}
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                  >
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-3 py-2">
                      <span className="w-full whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[28px] text-subtext-color -tracking-[0.01em]">
                        {
                          "Subframe is an AI-powered design-to-code tool featuring a drag-and-drop visual editor, component library, and hundreds of templates.\n"
                        }
                      </span>
                    </div>
                  </Accordion>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm">
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[28px] text-default-font -tracking-[0.01em]">
                          {"What is Subframe?\n"}
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                  >
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-3 py-2">
                      <span className="w-full whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[28px] text-subtext-color -tracking-[0.01em]">
                        {
                          "Subframe is an AI-powered design-to-code tool featuring a drag-and-drop visual editor, component library, and hundreds of templates.\n"
                        }
                      </span>
                    </div>
                  </Accordion>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm">
                  <Accordion
                    trigger={
                      <div className="flex w-full items-center gap-2 px-3 py-2">
                        <span className="grow shrink-0 basis-0 whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[28px] text-default-font -tracking-[0.01em]">
                          {"What is Subframe?\n"}
                        </span>
                        <Accordion.Chevron />
                      </div>
                    }
                  >
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-3 py-2">
                      <span className="w-full whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[28px] text-subtext-color -tracking-[0.01em]">
                        {
                          "Subframe is an AI-powered design-to-code tool featuring a drag-and-drop visual editor, component library, and hundreds of templates.\n"
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
    </DefaultPageLayout>
  );
}

export default TumboHome;
