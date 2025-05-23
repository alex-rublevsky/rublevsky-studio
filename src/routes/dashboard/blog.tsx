import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/blog')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/blog"!</div>
}
