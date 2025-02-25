import { FC } from "react";

const processCards = [
  {
    number: 1,
    title: "Check-in Call",
    content:
      "After defining your needs, I provide a timeline & budget estimate during our initial call. I also conduct a thorough audit of your current website.",
  },
  {
    number: 2,
    title: "Let's Go",
    content:
      "Once we've agreed on the project scope and terms, I begin the design and development process, keeping your vision and goals at the forefront.",
  },
  {
    number: 3,
    title: "Weekly Call",
    content:
      "We regroup once per week to present my progress and get your feedback, ensuring the project stays on track and aligns with your expectations.",
  },
  {
    number: 4,
    title: "Website Completion",
    content:
      "Once the initial build is complete, you have 5 business days to submit any final changes or adjustments to ensure your complete satisfaction.",
  },
  {
    number: 5,
    title: "Hand-off",
    content:
      "After all changes are complete, I transfer the website to your Webflow account, giving you full ownership. You and your team will then be trained on editing and maintaining the website's content.",
  },
];

const rotations = [-10, 5, -5, 10, -15];

export const ProcessSection: FC = () => {
  return (
    <>
      <div className="h-[10rem] bg-white" />
      <section className="section-features no-padding h-[500vh] relative">
        <h2 className="pl-4 sticky top-4 z-10" data-heading-reveal>
          Process
        </h2>
        <div className="features-wrapper h-screen">
          <div className="features-card-container h-4/5 flex flex-col items-center relative overflow-hidden">
            <div className="features-card-wrapper relative w-full h-full flex items-center justify-center">
              {processCards.map((card, index) => (
                <div
                  key={card.number}
                  className="features-card absolute w-full max-w-md bg-white rounded-lg shadow-lg p-6"
                  style={{
                    transform: `rotate(${rotations[index]}deg)`,
                    zIndex: index + 1,
                    boxShadow:
                      "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <div className="bg-[#ff6f61] text-white rounded-full inline-flex items-center justify-center mb-4 w-16 h-16">
                    <h4>{card.number}</h4>
                  </div>
                  <h4 className="font-medium mb-2">{card.title}</h4>
                  <p>{card.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
