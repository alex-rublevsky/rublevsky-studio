import { createFileRoute } from '@tanstack/react-router'
import GallerySection from '~/components/ui/studio/gallery/GallerySection'

export const Route = createFileRoute('/photos/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <main><GallerySection type="photos" /></main>
}
