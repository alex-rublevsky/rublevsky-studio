import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/brands')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/brands"!</div>
}
