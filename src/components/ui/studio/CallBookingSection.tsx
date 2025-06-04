import { AnimatedGroup } from "~/components/motion_primitives/AnimatedGroup";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

function CallBookingSection() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        hideEventTypeDetails: true,
        layout: "month_view",
        theme: "dark",
      });
    })();
  }, []);

  return (
    <section
      className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 relative w-full bg-background pb-20 [grid-template-areas:'content''calendar''info'] lg:[grid-template-areas:'content_calendar''info_calendar']"
      id="booking"
    >
      <AnimatedGroup className="[grid-area:content] flex flex-col justify-start space-y-4">
        <h1 className="max-w-[21ch] pt-12">
          See if Rublevsky Studio is the right fit for you&nbsp;
          <span className="text-muted-foreground">(it totally is)</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Schedule a quick, 15 minute guided tour through Rublevsky Studio.
        </p>
      </AnimatedGroup>

      <div className="[grid-area:calendar] md:min-w-[30rem]">
        <Cal
          calLink="rublevsky/virtual-meeting"
          style={{
            width: "100%",
            height: "100%",
            minHeight: "600px",
            overflow: "scroll",
          }}
          config={{
            layout: "month_view",
            // hideEventTypeDetails: true,
            theme: "dark",
          }}
        />
      </div>

      <AnimatedGroup className="[grid-area:info] flex flex-col justify-end space-y-4">
        <p className="text-muted-foreground">
          Headquartered in Hamilton, Ontario
        </p>
      </AnimatedGroup>
    </section>
  );
}

export default CallBookingSection;
