// import HeroSection from "~/components/ui/studio/HeroSection";
// import MembershipBenefitsSection from "~/components/ui/studio/MembershipBenefitsSection";
// import SubscriptionSection from "~/components/ui/studio/SubscriptionSection";

// import TestimonialsSection from "~/components/ui/studio/testimonial/TestimonialSection";
// import FaqSection from "~/components/ui/studio/FaqSection";
// import ServicesOffered from "~/components/ui/studio/ServicesSection";
// import { SkillsSection } from "~/components/ui/studio/SkillsSection";
// import ExperienceTimelineSection from "~/components/ui/studio/ExperienceTimelineSection";
// import WebProjectsSection from "~/components/ui/studio/web/WebSection";
// import BrandingSection from "~/components/ui/studio/branding/BrandingSection";
// import GallerySection from "~/components/ui/studio/gallery/GallerySection";
// import CallBookingSection from "~/components/ui/studio/CallBookingSection";
// import SmoothScroll from "~/components/SmoothScroll";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/shared/Button";
import { Link } from "~/components/ui/shared/Link";
import {
	ASSETS_BASE_URL,
	EMAIL_DOMAIN,
	TELEGRAM_CHANNEL_URL,
} from "~/constants/urls";
import { usePrefetch } from "~/hooks/usePrefetch";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/")({
	component: App,
	head: () => ({
		meta: [
			...seo({
				title: "Rublevsky Studio",
				description: "Web Development, Graphic Design, Tea Reviews",
			}),
		],
	}),
});

function App() {
	const { prefetchBlog, prefetchStore } = usePrefetch();

	return (
		<div className="min-h-screen flex flex-col">
			<main className="flex-1 flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-md space-y-6 text-center">
					<section className="!p-0 !static">
						<h1 className="text-2xl!">Greetings, I'm Alex.</h1>
						<p>
							Currently working at{" "}
							<Link href="https://urbancustomz.com/">Urban Customz</Link> as a
							graphic designer & print specialist.{" "}
							<Link href="/about">
								<span
									style={{
										viewTransitionName: "page-title-about",
										display: "inline",
									}}
								>
									Read about me
								</span>
							</Link>
							.
						</p>
						<nav aria-label="Main navigation" className="space-y-3 mt-6">
							<Button
								to="/web"
								centered
								variant="secondary"
								className="w-full max-w-lg"
								description="I design and code web experiences — from blogs to ecommerce solutions"
							>
								<span
									style={{
										viewTransitionName: "page-title-websites",
										display: "inline-block",
									}}
								>
									Websites
								</span>
							</Button>
							<Button
								to="/design"
								centered
								variant="secondary"
								className="w-full max-w-lg"
								description="Includes branding, packaging, posters, photomanipulations,"
							>
								<span
									style={{
										viewTransitionName: "page-title-graphic-design",
										display: "inline-block",
									}}
								>
									Graphic Design
								</span>
							</Button>
							<Button
								to="/blog"
								centered
								variant="secondary"
								className="w-full max-w-lg"
								description="I study, drink, compare and analyse traditional chinese tea, as well as conduct tea ceremonies"
								onMouseEnter={prefetchBlog}
							>
								<span
									style={{
										viewTransitionName: "page-title-tea-blog",
										display: "inline-block",
									}}
								>
									Tea Blog
								</span>
							</Button>
							<Button
								to="/store"
								centered
								variant="secondary"
								className="w-full max-w-lg"
								description="I sell tea, handmade clothing prints, posters and stickers"
								onMouseEnter={prefetchStore}
							>
								Tea Store
							</Button>
							<Button
								to="/photos"
								centered
								variant="secondary"
								className="w-full max-w-lg"
								description="Some portraits and animal pics "
							>
								<span
									style={{
										viewTransitionName: "page-title-photography",
										display: "inline-block",
									}}
								>
									Photography
								</span>
							</Button>
						</nav>
					</section>
				</div>
			</main>

			<footer className="flex flex-col items-center justify-center">
				<p className="text-center">Let's level up your business together!</p>
				<div className="flex flex-wrap gap-2 justify-center pb-4 pt-2 border-t border-gray-200/20">
					<Button
						href={`${ASSETS_BASE_URL}/PDF/Resume%20Alexander%20Rublevsky.pdf`}
						target="_blank"
						variant="secondary"
					>
						Resume
					</Button>
					<Button
						href={TELEGRAM_CHANNEL_URL}
						target="_blank"
						variant="secondary"
					>
						Telegram
					</Button>
					<Button href={`mailto:alex@${EMAIL_DOMAIN}`} variant="secondary">
						Email
					</Button>
				</div>
			</footer>
		</div>

		// TODO: things that are no longer used:

		//     <HeroSection />
		//     <MembershipBenefitsSection />
		//     <SubscriptionSection />
		//     <TestimonialsSection />
		//     <FaqSection />
		//     <ServicesOffered />
		//     <CallBookingSection />

		// </SmoothScroll>
	);
}
