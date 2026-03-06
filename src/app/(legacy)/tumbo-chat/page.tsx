"use client";

import React from "react";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { FadeInUp } from "@/components/ui/fade-in-up";
import { FeatherPenSquare } from "@subframe/core";
import { IconButton } from "@/components/subframe/ui/components/IconButton";
import { TextField } from "@/components/subframe/ui/components/TextField";
import { FeatherSearch } from "@subframe/core";
import { ChatList } from "@/components/subframe/ui/components/ChatList";
import { FeatherPuzzle } from "@subframe/core";
import { FeatherTrees } from "@subframe/core";
import { FeatherCrosshair } from "@subframe/core";
import { FeatherMap } from "@subframe/core";
import { FeatherMountain } from "@subframe/core";
import { FeatherRainbow } from "@subframe/core";
import { FeatherPlusCircle } from "@subframe/core";
import { FeatherImage } from "@subframe/core";
import { FeatherSmile } from "@subframe/core";
import { TextFieldUnstyled } from "@/components/subframe/ui/components/TextFieldUnstyled";
import { FeatherSend } from "@subframe/core";

function MessengerChatInbox2() {
  return (
    <ModernPageLayout>
      <div className="flex h-full w-full items-start bg-default-background mobile:flex-col mobile:flex-nowrap mobile:gap-0">
        <div className="flex max-w-[384px] grow shrink-0 basis-0 flex-col items-start self-stretch border-r border-solid border-neutral-border mobile:h-auto mobile:w-full mobile:flex-none">
          <div className="flex w-full flex-col items-center gap-1 px-4 pt-4 pb-2">
            <div className="flex w-full items-center gap-4">
              <div className="flex grow shrink-0 basis-0 items-center gap-4 px-2 py-2">
                <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
                  Tumbo Chat
                </span>
              </div>
              <IconButton
                variant="brand-tertiary"
                icon={<FeatherPenSquare />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
            <div className="flex w-full flex-col items-center gap-4 px-2 py-2">
              <TextField
                className="h-auto w-full flex-none"
                variant="filled"
                label=""
                helpText=""
                icon={<FeatherSearch />}
              >
                <TextField.Input
                  placeholder="Search"
                  value=""
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                />
              </TextField>
            </div>
          </div>
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 px-4 py-4 overflow-auto">
            <ChatList>
              <ChatList.ChatListItem
                avatar="https://res.cloudinary.com/subframe/image/upload/v1713909352/uploads/279/rsam5v66hcvpj96fr5hc.avif"
                name=""
                message="New chat"
                timestamp="Just now"
                unread={true}
                selected={true}
              />
              <ChatList.ChatListItem
                avatar="https://res.cloudinary.com/subframe/image/upload/v1713909352/uploads/279/rsam5v66hcvpj96fr5hc.avif"
                name=""
                message="Just sent the reports, take a look"
                timestamp="1 hour ago"
              />
              <ChatList.ChatListItem
                avatar="https://res.cloudinary.com/subframe/image/upload/v1713909352/uploads/279/rsam5v66hcvpj96fr5hc.avif"
                name=""
                message="Just sent the reports, take a look"
                timestamp="Yesterday"
                unread={true}
              />
              <ChatList.ChatListItem
                avatar="https://res.cloudinary.com/subframe/image/upload/v1713909352/uploads/279/rsam5v66hcvpj96fr5hc.avif"
                name=""
                message="Just sent the reports, take a look"
                timestamp="1 hour ago"
                unread={true}
              />
            </ChatList>
          </div>
        </div>
        <div className="flex grow shrink-0 basis-0 flex-col items-center justify-end self-stretch overflow-auto">
          <div className="container max-w-none flex w-full grow shrink-0 basis-0 flex-col items-center justify-center gap-4 py-12 overflow-auto">
            <div className="flex flex-col items-center justify-center gap-12">
              <img
                className="h-12 w-12 flex-none object-cover"
                src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
              />
              <div className="flex flex-wrap items-center justify-center gap-4">
                <FadeInUp delay={0.05}>
                  <div className="flex w-40 flex-none flex-col items-start gap-4 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm card-hover cursor-pointer">
                    <FeatherPuzzle className="text-heading-3 font-heading-3 text-brand-700" />
                    <span className="w-full whitespace-pre-wrap text-body font-body text-subtext-color">
                      {"Which recent class felt like a perfect fit?\n"}
                    </span>
                  </div>
                </FadeInUp>
                <FadeInUp delay={0.1}>
                  <div className="flex w-40 flex-none flex-col items-start gap-4 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm card-hover cursor-pointer">
                    <FeatherTrees className="text-heading-3 font-heading-3 text-success-700" />
                    <span className="w-full whitespace-pre-wrap text-body font-body text-subtext-color">
                      {
                        "If you could nurture just one trait in your child this year, what would it be?\n"
                      }
                    </span>
                  </div>
                </FadeInUp>
                <FadeInUp delay={0.15}>
                  <div className="flex w-40 flex-none flex-col items-start gap-4 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm card-hover cursor-pointer">
                    <FeatherCrosshair className="text-heading-3 font-heading-3 text-warning-500" />
                    <span className="w-full whitespace-pre-wrap text-body font-body text-subtext-color">
                      {
                        "Are you focusing more on skills for now or life-long interests?\n"
                      }
                    </span>
                  </div>
                </FadeInUp>
                <FadeInUp delay={0.2}>
                  <div className="flex w-40 flex-none flex-col items-start gap-4 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm card-hover cursor-pointer">
                    <FeatherMap className="text-heading-3 font-heading-3 text-subtext-color" />
                    <span className="w-full whitespace-pre-wrap text-body font-body text-subtext-color">
                      {"Want to see what kids like yours are loving this month?"}
                    </span>
                  </div>
                </FadeInUp>
                <FadeInUp delay={0.25}>
                  <div className="flex w-40 flex-none flex-col items-start gap-4 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm card-hover cursor-pointer">
                    <FeatherMountain className="text-heading-3 font-heading-3 text-subtext-color" />
                    <span className="w-full whitespace-pre-wrap text-body font-body text-subtext-color">
                      {"Looking for holiday workshops?\n"}
                    </span>
                  </div>
                </FadeInUp>
                <FadeInUp delay={0.3}>
                  <div className="flex w-40 flex-none flex-col items-start gap-4 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm card-hover cursor-pointer">
                    <FeatherRainbow className="text-heading-3 font-heading-3 text-error-700" />
                    <span className="w-full whitespace-pre-wrap text-body font-body text-subtext-color">
                      {"Need rainy day activities nearby?\n"}
                    </span>
                  </div>
                </FadeInUp>
              </div>
            </div>
          </div>
          <div className="flex w-full items-center gap-2 border-t border-solid border-neutral-border px-6 py-6">
            <div className="flex items-end">
              <IconButton
                variant="brand-tertiary"
                icon={<FeatherPlusCircle />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
              <IconButton
                variant="brand-tertiary"
                icon={<FeatherImage />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
              <IconButton
                variant="brand-tertiary"
                icon={<FeatherSmile />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
            <TextFieldUnstyled className="h-auto grow shrink-0 basis-0">
              <TextFieldUnstyled.Input
                placeholder="Ask a question"
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
              />
            </TextFieldUnstyled>
            <IconButton
              variant="brand-primary"
              icon={<FeatherSend />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            />
          </div>
        </div>
      </div>
    </ModernPageLayout>
  );
}

export default MessengerChatInbox2;


