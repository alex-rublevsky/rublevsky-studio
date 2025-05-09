import { Image } from "~/components/ui/shared/Image";
function skillLogo({
  name,
  alt,
  link,
  wideLogo = false,
}: {
  name: string;
  alt: string;
  link: string;
  wideLogo?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6 group transition-all">
      <div className="flex-1 w-full flex items-center justify-center">
        <div
          className={`relative flex items-center justify-center ${
            wideLogo ? "w-24 md:w-28 h-12 md:h-14" : "w-14 h-14 md:h-22"
          }`}
        >
          <Image
            src={link}
            alt={alt}
            width={100}
            height={100}
            className="group-hover:opacity-70 transition-opacity md:scale-125 object-contain"
          />
        </div>
      </div>
      <p className="text-center text-sm md:text-base font-medium whitespace-nowrap text-muted-foreground">
        {name}
      </p>
    </div>
  );
}
export default skillLogo;
