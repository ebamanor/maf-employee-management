import { cn } from "@/lib/utils";

const tones = [
  "bg-amber-300 text-amber-900",
  "bg-yellow-300 text-yellow-900",
  "bg-lime-300 text-lime-900",
  "bg-orange-300 text-orange-900",
  "bg-emerald-300 text-emerald-900",
];

export function Avatar({
  name,
  image,
  className,
}: {
  name: string;
  image?: string;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const tone = tones[name.length % tones.length];

  return (
    <div
      className={cn(
        "relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-xs font-bold",
        !image ? tone : "",
        className
      )}
    >
      {image ? (
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        initials || "U"
      )}
    </div>
  );
}
