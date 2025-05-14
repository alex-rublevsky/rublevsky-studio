import { createFileRoute } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { brandingProjects } from "~/data/brandingProjects";
import ImageGallery from "~/components/ui/shared/ImageGallery";
import { markdownComponents } from "~/components/ui/shared/MarkdownComponents";

export const Route = createFileRoute("/branding/$brandingId")({
  component: BrandingProjectPage,
  loader: async ({ params }) => {
    return {
      brandingId: params.brandingId,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: ({ error }) => <div>Error: {error.message}</div>,
});

function BrandingProjectPage() {
  const { brandingId } = Route.useLoaderData();

  // Find the specific project that matches the current ID
  const currentProject = brandingProjects.find(
    (project) => project.id === parseInt(brandingId)
  );

  if (!currentProject) return <div>Project not found</div>;

  return (
    <main className="min-h-screen flex flex-col lg:h-screen lg:overflow-hidden">
      <div className="grow flex items-start justify-center">
        <div className="w-full h-full flex flex-col lg:flex-row gap-0 lg:gap-10 items-start">
          {/* Image gallery */}
          <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col lg:flex-row gap-2 lg:h-full self-start">
            {currentProject.images && currentProject.images.length > 0 && (
              <ImageGallery
                images={currentProject.images}
                alt={currentProject.name}
                className="lg:pl-4 lg:pt-4 lg:pb-4"
              />
            )}
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-2/5 xl:w-1/3 px-4 lg:px-0 lg:h-[100dvh] lg:overflow-y-auto pt-4 pb-20 lg:pr-4 scrollbar-none">
            <div className="space-y-6 w-full ">
              <h3>{currentProject.name}</h3>

              {/* Product description */}
              <div className="prose max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {currentProject.description || ""}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
