"use client";
/*
 * Documentation:
 * Default Page Layout — https://app.subframe.com/library?component=Default+Page+Layout_a57b1c43-310a-493f-b807-8cc88e2452cf
 * Topbar with tabs — https://app.subframe.com/library?component=Topbar+with+tabs_6da83a87-48a6-4316-a989-ea33ed7ff81e
 * Text Field — https://app.subframe.com/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 * Dropdown Menu — https://app.subframe.com/library?component=Dropdown+Menu_99951515-459b-4286-919e-a89e7549b43b
 * Avatar — https://app.subframe.com/library?component=Avatar_bec25ae6-5010-4485-b46b-cf79e3943ab2
 */

import React from "react";
import Link from "next/link";
import * as SubframeUtils from "../utils";
import { TopbarWithTabs } from "../components/TopbarWithTabs";
import { TextField } from "../components/TextField";
import { FeatherSearch } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import { DropdownMenu } from "../components/DropdownMenu";
import { FeatherSettings } from "@subframe/core";
import { FeatherLogOut } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { Avatar } from "../components/Avatar";

interface DefaultPageLayoutRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const DefaultPageLayoutRoot = React.forwardRef<HTMLDivElement, DefaultPageLayoutRootProps>(
  function DefaultPageLayoutRoot({ children, className, ...otherProps }: DefaultPageLayoutRootProps, ref) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex h-screen w-full flex-col items-center",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <TopbarWithTabs
          className="mobile:hidden"
          rightSlot={
            <>
              <TextField variant="filled" label="" helpText="" icon={<FeatherSearch />}>
                <TextField.Input placeholder="Search" />
              </TextField>
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <Avatar image="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif">A</Avatar>
                </SubframeCore.DropdownMenu.Trigger>
                <SubframeCore.DropdownMenu.Portal>
                  <SubframeCore.DropdownMenu.Content side="bottom" align="end" sideOffset={4} asChild={true}>
                    <DropdownMenu>
                      <DropdownMenu.DropdownItem icon={<FeatherUser />}>Profile</DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem icon={<FeatherSettings />}>Settings</DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem icon={<FeatherLogOut />}>Log out</DropdownMenu.DropdownItem>
                    </DropdownMenu>
                  </SubframeCore.DropdownMenu.Content>
                </SubframeCore.DropdownMenu.Portal>
              </SubframeCore.DropdownMenu.Root>
            </>
          }
          leftSlot={
            <>
              <Link href="/">
                <img className="h-6 flex-none object-cover cursor-pointer" src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png" />
              </Link>
              <div className="flex items-center gap-4 self-stretch">
                <TopbarWithTabs.NavItem selected={true}>Ask Tümbo</TopbarWithTabs.NavItem>
                <Link href="/classes" className="text-body-bold font-body-bold">
                  <TopbarWithTabs.NavItem>Browse Classes</TopbarWithTabs.NavItem>
                </Link>
                <Link href="/collections" className="text-body-bold font-body-bold">
                  <TopbarWithTabs.NavItem>Curated Collections</TopbarWithTabs.NavItem>
                </Link>
              </div>
            </>
          }
        />
        {children ? (
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 overflow-y-auto bg-default-background">
            <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
              {children}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
);

export const DefaultPageLayout = DefaultPageLayoutRoot;
