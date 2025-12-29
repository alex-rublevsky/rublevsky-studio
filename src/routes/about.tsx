import { createFileRoute } from "@tanstack/react-router";
import { Link } from "~/components/ui/shared/Link";
import ExperienceTimelineSection from "~/components/ui/studio/ExperienceTimelineSection";
import experienceTimelineCss from "~/components/ui/studio/experienceTimeline.css?url";
import { ASSETS_BASE_URL } from "~/constants/urls";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/about")({
	component: AboutPage,
	head: () => ({
		meta: [
			...seo({
				title: "About - Rublevsky Studio",
				description:
					"Learn about Alex Rublevsky - Graphic designer and web developer from Russia, by way of New Zealand, now working in Canada",
			}),
		],
		links: [
			// Load CSS as blocking stylesheet to prevent FOUC
			{ rel: "stylesheet", href: experienceTimelineCss, media: "all" },
		],
	}),
});

function AboutPage() {
	return (
		<main>
			<section className="mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-6">
					<span
						style={{
							viewTransitionName: "page-title-about",
							display: "inline-block",
						}}
					>
						About Me
					</span>
				</h1>
				<div className="space-y-4 text-lg">
					<p>
						I come from Russia 🇷🇺, by way of New Zealand 🇳🇿, to Canada 🇨🇦 where
						I work right now.
					</p>
				</div>
			</section>

			<ExperienceTimelineSection />

			<section className="mx-auto px-4 py-8 mb-8">
				<h2 className="text-2xl font-semibold mb-2">Music</h2>
				<p className="text-muted-foreground mb-6">
					I don't really make music, but rather create DJ mixes.
				</p>

				<div className="mb-8">
					<iframe
						width="100%"
						height="300"
						scrolling="no"
						frameBorder="no"
						allow="autoplay"
						src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A2219710013&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
						className="rounded-lg"
						title="SoundCloud track preview - ephemeral ether"
					/>
				</div>

				<div>
					<h3 className="text-xl font-semibold mb-4">Playlists</h3>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-6">
						<Link
							href="https://t.me/sound_meta"
							target="_blank"
							rel="noopener noreferrer"
							className="w-full rounded-lg bg-muted border border-border overflow-hidden hover:opacity-80 transition-opacity flex flex-col"
							cursorType="visitPlaylist"
							blurOnHover={false}
						>
							<div className="w-full aspect-square relative">
								<img
									src={`${ASSETS_BASE_URL}/about/meta.webp`}
									alt="sound_meta playlist"
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="p-4 flex flex-col items-center">
								<h4 className="font-semibold text-center mb-1">meta</h4>
								<p className="text-muted-foreground text-sm text-center">
									shit I listen to 24/7
								</p>
							</div>
						</Link>
						<Link
							href="https://t.me/ceremonial_vibrations"
							target="_blank"
							rel="noopener noreferrer"
							className="w-full rounded-lg bg-muted border border-border overflow-hidden hover:opacity-80 transition-opacity flex flex-col"
							cursorType="visitPlaylist"
							blurOnHover={false}
						>
							<div className="w-full aspect-square relative">
								<img
									src={`${ASSETS_BASE_URL}/about/ceremonial.webp`}
									alt="ceremonial_vibrations playlist"
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="p-4 flex flex-col items-center">
								<h4 className="font-semibold text-center mb-1">ceremonial</h4>
								<p className="text-muted-foreground text-sm text-center">
									gong fu cha vibrations
								</p>
							</div>
						</Link>
						<Link
							href="https://t.me/sound_420"
							target="_blank"
							rel="noopener noreferrer"
							className="w-full rounded-lg bg-muted border border-border overflow-hidden hover:opacity-80 transition-opacity flex flex-col"
							cursorType="visitPlaylist"
							blurOnHover={false}
						>
							<div className="w-full aspect-square relative">
								<img
									src={`${ASSETS_BASE_URL}/about/420.webp`}
									alt="sound_420 playlist"
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="p-4 flex flex-col items-center">
								<h4 className="font-semibold text-center mb-1">420</h4>
								<p className="text-muted-foreground text-sm text-center">
									geeked
								</p>
							</div>
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
