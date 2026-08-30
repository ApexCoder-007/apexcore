import SiteNav from "@/components/journey/site-nav"
import Hero from "@/components/journey/hero"
import Intro from "@/components/journey/intro"
import Experience from "@/components/journey/experience"
import FollowJourney from "@/components/journey/follow-journey"
import InvisibleVisible from "@/components/journey/invisible-visible"
import { FinalCta } from "@/components/journey/final-cta"
import { SiteFooter } from "@/components/journey/site-footer"

export default function Home() {
  return (
    <>
      <a
        href="#simulation"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to simulation
      </a>
      <SiteNav />
      <main>
        <Hero />
        <Intro />
        <Experience />
        <FollowJourney />
        <InvisibleVisible />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  )
}
