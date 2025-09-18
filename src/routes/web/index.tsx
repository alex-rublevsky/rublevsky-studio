import { createFileRoute } from '@tanstack/react-router'
import ExperienceTimelineSection from '~/components/ui/studio/ExperienceTimelineSection'
import WebProjectsSection from '~/components/ui/studio/web/WebSection'
import { SkillsSection } from '~/components/ui/studio/SkillsSection'

export const Route = createFileRoute('/web/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <main><WebProjectsSection />
  <SkillsSection />
  <ExperienceTimelineSection />
  </main>
}
