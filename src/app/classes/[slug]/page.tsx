import React from "react";
import { DefaultPageLayout } from "@/components/subframe/ui/layouts/DefaultPageLayout";
import { Button } from "@/components/subframe/ui/components/Button";
import { FeatherPaintbrush } from "@subframe/core";
import { LargeBadge } from "@/components/subframe/ui/components/LargeBadge";
import { FeatherHandMetal } from "@subframe/core";
import { FeatherMountain } from "@subframe/core";
import { Accordion } from "@/components/subframe/ui/components/Accordion";
import { FilterBadge } from "@/components/subframe/ui/components/FilterBadge";
import { FeatherBedDouble } from "@subframe/core";
import { FeatherTv2 } from "@subframe/core";
import { FeatherCigarette } from "@subframe/core";
import { FeatherAccessibility } from "@subframe/core";
import { FeatherAirVent } from "@subframe/core";
import { Avatar } from "@/components/subframe/ui/components/Avatar";
import { FeatherStar } from "@subframe/core";
import { Badge } from "@/components/subframe/ui/components/Badge";
import { FeatherBookmark } from "@subframe/core";
import { IconButton } from "@/components/subframe/ui/components/IconButton";
import { Tags } from "@/components/subframe/ui/components/Tags";
import { FeatherVerified } from "@subframe/core";
import { FeatherHeart } from "@subframe/core";
import { FeatherFlag } from "@subframe/core";

async function ClassDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // TODO: Fetch class data from Supabase using params.slug
  // For now, using static data as placeholder
  
  return (
    <DefaultPageLayout>
      <div className="flex w-full flex-col items-start gap-8">
        <div className="flex w-full flex-col items-center gap-8">
          <div className="flex w-full max-w-[1024px] flex-col items-start gap-4 bg-default-background py-12">
            <div className="flex w-full flex-col items-start gap-8">
              <div className="flex w-full flex-col items-start gap-8">
                <div className="w-full items-start gap-2 overflow-hidden rounded-md relative grid grid-cols-2 mobile:flex-col mobile:flex-nowrap mobile:gap-2">
                  <Button
                    className="absolute right-4 bottom-4"
                    variant="neutral-secondary"
                  >
                    Show all photos
                  </Button>
                  <div className="flex items-center justify-center gap-2">
                    <img
                      className="grow shrink-0 basis-0 self-stretch object-cover bg-cover bg-center bg-no-repeat"
                      src="https://res.cloudinary.com/subframe/image/upload/v1723780559/uploads/302/tkyvdicnwbc5ftuyysc0.png"
                    />
                  </div>
                  <div className="items-start gap-2 grid grid-cols-2 grid-rows-2">
                    <img
                      className="grow shrink-0 basis-0 self-stretch object-cover bg-cover bg-center bg-no-repeat"
                      src="https://res.cloudinary.com/subframe/image/upload/v1723780871/uploads/302/h25wathcuwiid5ulpu1i.png"
                    />
                    <img
                      className="grow shrink-0 basis-0 self-stretch object-cover bg-cover bg-center bg-no-repeat"
                      src="https://res.cloudinary.com/subframe/image/upload/v1723780696/uploads/302/hxk01sckxtlsjxi4n2dv.png"
                    />
                    <img
                      className="grow shrink-0 basis-0 self-stretch object-cover bg-cover bg-center bg-no-repeat"
                      src="https://res.cloudinary.com/subframe/image/upload/v1723780878/uploads/302/mdjcme9tm4svgmkjv4zf.png"
                    />
                    <img
                      className="grow shrink-0 basis-0 self-stretch object-cover bg-cover bg-center bg-no-repeat"
                      src="https://res.cloudinary.com/subframe/image/upload/v1723780730/uploads/302/bfoixbupgy9opiv7ljrb.png"
                    />
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col items-start gap-12">
                <div className="flex flex-wrap items-start gap-16">
                  <div className="flex grow shrink-0 basis-0 flex-col items-start gap-6">
                    <div className="flex flex-col items-start gap-10">
                      <div className="flex w-full flex-col items-start gap-8">
                        <div className="flex w-full flex-col items-start gap-4">
                          <span className="w-full text-heading-1 font-heading-1 text-default-font">
                            Creative Little Artists
                          </span>
                          <div className="flex w-full flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                              <LargeBadge icon={<FeatherPaintbrush />}>
                                Creative Expression
                              </LargeBadge>
                              <LargeBadge icon={<FeatherHandMetal />}>
                                Fine Motor Skills
                              </LargeBadge>
                              <LargeBadge icon={<FeatherMountain />}>
                                Confidence Building
                              </LargeBadge>
                            </div>
                          </div>
                          <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background shadow-sm">
                            <Accordion
                              trigger={
                                <div className="flex w-full items-center gap-2 px-6 py-6">
                                  <span className="grow shrink-0 basis-0 text-heading-2 font-heading-2 text-default-font">
                                    Where creativity meets confidence
                                  </span>
                                </div>
                              }
                              defaultOpen={true}
                            >
                              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 border-t border-solid border-neutral-border px-6 py-6">
                                <span className="text-body font-body text-default-font">
                                  Creative Little Artists introduces young children
                                  to the joy of artistic expression through
                                  structured yet playful art activities. Each
                                  session explores different mediums - from
                                  watercolor painting to clay sculpture - allowing
                                  children to discover their creative voice while
                                  developing essential fine motor skills and
                                  visual-spatial awareness.
                                </span>
                              </div>
                            </Accordion>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-6">
                        <span className="w-full whitespace-pre-wrap text-heading-2 font-heading-2 text-default-font">
                          {"Overheard Online\n"}
                        </span>
                        <span className="whitespace-pre-wrap text-body font-body text-default-font">
                          {
                            'Parents are consistently impressed with how this class builds both confidence and creativity in young children. Multiple families mention their kids coming home excited to show off their artwork and asking when they can go back. The small group size gets frequent praise for allowing personalized attention, while the instructor\'s patience and encouragement help even shy children open up and express themselves.\n\nThe hands-on approach and "mess-friendly" environment seem to be major hits with both kids and parents. Several reviews highlight how children who were initially hesitant about art became confident creators, with one parent noting their child went from shy observer to enthusiastic artist in just a few sessions.'
                          }
                        </span>
                        <span className="whitespace-pre-wrap text-monospace-body font-monospace-body text-default-font">
                          {"Written based on these sources\n"}
                        </span>
                        <div className="flex items-center gap-2">
                          <FilterBadge label="r/ParentingAdvice" count="3" />
                          <FilterBadge label={"Family Connect SG\n"} count="3" />
                          <FilterBadge label="Google" count="3" />
                          <FilterBadge label="KiasuParents" count="3" />
                        </div>
                      </div>
                      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-300" />
                      <div className="flex flex-col items-start gap-6">
                        <span className="w-full whitespace-pre-wrap text-heading-2 font-heading-2 text-default-font">
                          {"Why Emma Might Thrive Here\n"}
                        </span>
                        <span className="whitespace-pre-wrap text-body font-body text-default-font">
                          {
                            "There's something magical about how Emma approaches creative challenges — with that quiet focus and gentle persistence that tells you she's truly absorbing every detail. Her visual learning style means she'll thrive in an environment where she can see, touch, and transform materials with her own hands, building confidence through each colorful creation.\n\nPicture Emma with paint-covered fingers, completely absorbed as she watches colors blend and transform on paper. This hands-on exploration gives her the immediate, tactile feedback her curious mind craves, where every brushstroke teaches her something new about texture, color, and the joy of making something uniquely hers.\n\nThe gentle, growth-focused environment celebrates Emma's natural inclination to take her time and really understand her materials. Here, there's no rush to perfection — just the encouragement to explore, experiment, and discover her own creative voice through patient, loving guidance that honors her methodical approach.\n\nEmma's love for storytelling and building will find perfect expression through mixed media art projects that let her create visual narratives. She'll develop fine motor skills while exploring color theory and composition, learning techniques that will enhance her natural gift for seeing beauty in the world around her."
                          }
                        </span>
                      </div>
                      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-300" />
                      <div className="flex w-full flex-col items-start gap-6">
                        <span className="w-full text-heading-2 font-heading-2 text-default-font">
                          What to expect
                        </span>
                        <div className="flex w-full items-start gap-6 mobile:flex-col mobile:flex-nowrap mobile:gap-4">
                          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4">
                            <div className="flex w-full items-start gap-4">
                              <FeatherBedDouble className="text-heading-2 font-heading-2 text-default-font" />
                              <span className="text-body font-body text-default-font">
                                Welcome circle and art introduction
                              </span>
                            </div>
                            <div className="flex w-full items-start gap-4">
                              <FeatherTv2 className="text-heading-2 font-heading-2 text-default-font" />
                              <span className="text-body font-body text-default-font">
                                Clean-up and sharing circle 
                              </span>
                            </div>
                            <div className="flex w-full items-start gap-4">
                              <FeatherCigarette className="text-heading-2 font-heading-2 text-default-font" />
                              <span className="text-body font-body text-default-font">
                                Independent creative time
                              </span>
                            </div>
                          </div>
                          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4">
                            <div className="flex w-full items-start gap-4">
                              <FeatherAccessibility className="text-heading-2 font-heading-2 text-default-font" />
                              <span className="text-body font-body text-default-font">
                                Take-home artwork and progress notes
                              </span>
                            </div>
                            <div className="flex w-full items-start gap-4">
                              <FeatherAirVent className="text-heading-2 font-heading-2 text-default-font" />
                              <span className="text-body font-body text-default-font">
                                Guided art exploration with teacher support
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-300" />
                      <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4">
                        <span className="w-full text-heading-2 font-heading-2 text-default-font">
                          About the instructors
                        </span>
                        <div className="flex items-center gap-4">
                          <Avatar
                            size="large"
                            image="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif"
                          >
                            A
                          </Avatar>
                          <div className="flex flex-col items-start gap-1">
                            <span className="whitespace-pre-wrap text-body-bold font-body-bold text-default-font">
                              {"Sarah Chen\n"}
                            </span>
                            <span className="whitespace-pre-wrap text-body font-body text-subtext-color">
                              {"8+ years in art education\n"}
                            </span>
                          </div>
                        </div>
                        <span className="w-full whitespace-pre-wrap text-body font-body text-default-font">
                          {
                            "Sarah has been working with young children for over 8 years, specializing in early childhood art education and creative development.\n"
                          }
                        </span>
                      </div>
                      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-300" />
                      <div className="flex w-full flex-col items-start gap-6">
                        <span className="whitespace-pre-wrap text-heading-2 font-heading-2 text-default-font">
                          {"In The Neighbourhood\n"}
                        </span>
                        <span className="whitespace-pre-wrap text-monospace-body font-monospace-body text-default-font">
                          {"Pulled from Google Maps"}
                        </span>
                        <div className="flex w-full items-center gap-2">
                          <Button>Cafes</Button>
                          <Button variant="brand-secondary">Gyms</Button>
                          <Button variant="brand-secondary">Parks</Button>
                          <Button variant="brand-secondary">Shopping</Button>
                          <Button variant="brand-secondary">Libraries</Button>
                        </div>
                        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-6">
                          <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm">
                            <div className="flex w-full items-center gap-4">
                              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                                <span className="w-full text-heading-3 font-heading-3 text-default-font">
                                  The Coastal Settlement
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-caption font-caption text-default-font">
                                    5.0
                                  </span>
                                  <div className="flex items-center">
                                    <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                    <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                    <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                    <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                    <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                  </div>
                                  <Badge variant="neutral">
                                    5 Changi Business Park Central 1, #01-72/73
                                  </Badge>
                                </div>
                              </div>
                              <Avatar
                                size="x-large"
                                image="https://res.cloudinary.com/dnkpdfdai/image/upload/v1717804047/uploads/1/if24ckber8tix9mpgook.png"
                                square={true}
                              >
                                A
                              </Avatar>
                            </div>
                            <div className="flex w-full flex-col items-start gap-4">
                              <span className="text-body font-body text-default-font">
                                More bubble tea than espresso bar, but a solid
                                option for a quick pick-me-up. Try their matcha oat
                                latte or go full sugar with a brown sugar boba.
                                Often quiet in the mid-afternoons.
                              </span>
                            </div>
                          </div>
                          <div className="flex w-full grow shrink-0 basis-0 items-start gap-4">
                            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm">
                              <div className="flex w-full items-center gap-4">
                                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                                  <span className="w-full text-heading-3 font-heading-3 text-default-font">
                                    Chock Full of Beans
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-caption font-caption text-default-font">
                                      5.0
                                    </span>
                                    <div className="flex items-center">
                                      <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                      <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                      <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                      <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                      <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                    </div>
                                    <Badge variant="neutral">
                                      351 Cranwell Road
                                    </Badge>
                                  </div>
                                </div>
                                <Avatar
                                  size="x-large"
                                  image="https://res.cloudinary.com/dnkpdfdai/image/upload/v1717804056/uploads/1/zc0uqczcflx9bajj6dih.png"
                                  square={true}
                                >
                                  A
                                </Avatar>
                              </div>
                              <div className="flex w-full flex-col items-start gap-4">
                                <span className="whitespace-pre-wrap text-body font-body text-default-font">
                                  {
                                    "A cosy corner cafe with rustic walls and the smell of fresh bakes in the air. Great for winding down while your kid's in class — their flat white and banana bread are a quiet hit.\n"
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm">
                            <div className="flex w-full items-center gap-4">
                              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                                <span className="w-full text-heading-3 font-heading-3 text-default-font">
                                  Dandelions
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-caption font-caption text-default-font">
                                    5.0
                                  </span>
                                  <div className="flex items-center">
                                    <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                    <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                    <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                    <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                    <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                  </div>
                                  <Badge variant="neutral">
                                    4 Changi Village Rd, #01-2090
                                  </Badge>
                                </div>
                              </div>
                              <Avatar
                                size="x-large"
                                image="https://res.cloudinary.com/dnkpdfdai/image/upload/v1717804047/uploads/1/if24ckber8tix9mpgook.png"
                                square={true}
                              >
                                A
                              </Avatar>
                            </div>
                            <div className="flex w-full flex-col items-start gap-4">
                              <span className="text-body font-body text-default-font">
                                Casual and kid-friendly with lots of natural light.
                                Serves reliable brunch favourites, easy sandwiches,
                                and decent coffee. Bonus: plenty of plug points if
                                you're sneaking in a bit of work.
                              </span>
                            </div>
                          </div>
                          <div className="flex w-full grow shrink-0 basis-0 items-start gap-4">
                            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm">
                              <div className="flex w-full items-center gap-4">
                                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                                  <span className="w-full text-heading-3 font-heading-3 text-default-font">
                                    BLVD (Changi)
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-caption font-caption text-default-font">
                                      5.0
                                    </span>
                                    <div className="flex items-center">
                                      <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                      <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                      <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                      <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                      <FeatherStar className="text-monospace-body font-monospace-body text-default-font" />
                                    </div>
                                    <Badge variant="neutral">
                                      02-24A, 5, Changi Business Park Central 1
                                    </Badge>
                                  </div>
                                </div>
                                <Avatar
                                  size="x-large"
                                  image="https://res.cloudinary.com/dnkpdfdai/image/upload/v1717804056/uploads/1/zc0uqczcflx9bajj6dih.png"
                                  square={true}
                                >
                                  A
                                </Avatar>
                              </div>
                              <div className="flex w-full flex-col items-start gap-4">
                                <span className="text-body font-body text-default-font">
                                  Tucked just around the bend, this dessert cafe
                                  feels like a treat. Try their yuzu cheesecake or
                                  floral tea blends. Popular with parents waiting
                                  out a class — calm, clean, and comfy.
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-300" />
                        <div className="flex w-full flex-col items-start gap-6">
                          <span className="whitespace-pre-wrap text-heading-2 font-heading-2 text-default-font">
                            {"Featured in Curated Picks\n"}
                          </span>
                          <div className="flex w-full flex-col items-start gap-4 overflow-hidden">
                            <div className="flex w-full flex-col items-center justify-center gap-24 overflow-hidden rounded-md relative">
                              <IconButton
                                className="absolute right-2 top-2"
                                variant="inverse"
                                icon={<FeatherBookmark />}
                              />
                              <img
                                className="h-60 w-full flex-none object-cover"
                                src="/photos/collections/Big Energy Gentle Guidance.png"
                              />
                            </div>
                            <div className="flex w-full flex-col items-start gap-2">
                              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2">
                                <span className="line-clamp-2 w-full text-heading-3 font-heading-3 text-default-font">
                                  Big Energy, Gentle Guidance
                                </span>
                                <span className="line-clamp-2 w-full text-body font-body text-default-font">
                                  For kids who bounce off the walls — and just need
                                  the right walls.
                                </span>
                                <div className="flex items-center gap-2">
                                  <Tags>Emotional regulation</Tags>
                                  <Tags>High-movement</Tags>
                                  <Badge>Calm mentors</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex w-full flex-col items-start gap-4 overflow-hidden">
                            <div className="flex w-full flex-col items-center justify-center gap-24 overflow-hidden rounded-md relative">
                              <IconButton
                                className="absolute right-2 top-2"
                                variant="inverse"
                                icon={<FeatherBookmark />}
                              />
                              <img
                                className="h-60 w-full flex-none object-cover"
                                src="/photos/collections/Quiet Kids Loud Ideas.png"
                              />
                            </div>
                            <div className="flex w-full flex-col items-start gap-2">
                              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2">
                                <span className="line-clamp-2 w-full text-heading-3 font-heading-3 text-default-font">
                                  Quiet Kids, Loud Ideas
                                </span>
                                <span className="line-clamp-2 w-full text-body font-body text-default-font">
                                  For introverted kids who speak volumes — just not
                                  with their voice.
                                </span>
                                <div className="flex items-center gap-2">
                                  <Tags>Emotional regulation</Tags>
                                  <Tags>High-movement</Tags>
                                  <Badge>Calm mentors</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex min-w-[288px] max-w-[384px] grow shrink-0 basis-0 flex-col items-center gap-6 mobile:h-auto mobile:min-w-[288px] mobile:grow mobile:shrink-0 mobile:basis-0">
                    <div className="flex w-full flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-lg">
                      <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-8 px-8 pt-12 pb-8">
                        <div className="flex w-full items-center gap-6">
                          <Avatar
                            size="x-large"
                            image="https://res.cloudinary.com/subframe/image/upload/v1718919568/uploads/3102/mmfbvgi9hwpewyqglgul.png"
                          >
                            A
                          </Avatar>
                          <div className="flex grow shrink-0 basis-0 items-center gap-4">
                            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                              <span className="text-heading-2 font-heading-2 text-default-font">
                                Art Studio Kids
                              </span>
                              <div className="flex items-center gap-1 rounded-full bg-brand-100 pl-2 pr-3 py-1.5">
                                <FeatherVerified className="text-heading-2 font-heading-2 text-brand-700" />
                                <span className="whitespace-nowrap text-body-bold font-body-bold text-brand-700">
                                  Verified
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full items-center gap-2">
                          <Button size="large">Follow</Button>
                          <Button variant="brand-secondary" size="large">Message</Button>
                          <Button variant="brand-secondary" size="large">Website</Button>
                        </div>
                      </div>
                      <div className="flex w-full flex-col items-start gap-4">
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-body text-default-font">
                            PRICE PER CLASS
                          </span>
                          <span className="text-body font-body text-default-font">
                            $25
                          </span>
                        </div>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-body text-default-font">
                            AGE GROUP
                          </span>
                          <span className="text-body font-body text-default-font">
                            3-6 years
                          </span>
                        </div>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-body text-default-font">
                            PRICE
                          </span>
                          <span className="text-body font-body text-default-font">
                            $38/class
                          </span>
                        </div>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-body text-default-font">
                            SCHEDULE
                          </span>
                          <span className="whitespace-pre-wrap text-body font-body text-default-font text-right">
                            {
                              "Tuesdays 10:00 AM - 10:45 AM\nThursdays 2:30 PM - 3:15 PM\nSaturdays 9:00 AM - 9:45 AM"
                            }
                          </span>
                        </div>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-body text-default-font">
                            DURATION
                          </span>
                          <span className="text-body font-body text-default-font">
                            45 minutes
                          </span>
                        </div>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-body text-default-font">
                            GROUP SIZE
                          </span>
                          <span className="text-body font-body text-default-font">
                            6-8 children
                          </span>
                        </div>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-body text-default-font">
                            CONTACT
                          </span>
                          <span className="text-body font-body text-default-font">
                            +65 1234 5678
                          </span>
                        </div>
                      </div>
                      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-300" />
                      <Button
                        className="h-10 w-full flex-none"
                        size="large"
                        icon={<FeatherHeart />}
                      >
                        Add to Favorites
                      </Button>
                    </div>
                    <Button
                      variant="neutral-tertiary"
                      icon={<FeatherFlag />}
                    >
                      Report this listing
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default ClassDetailPage;