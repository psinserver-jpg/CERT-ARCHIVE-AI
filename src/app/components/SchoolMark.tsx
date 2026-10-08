import Image from "next/image";

type SchoolMarkProps = {
  variant?: "header" | "auth";
};

export default function SchoolMark({ variant = "header" }: SchoolMarkProps) {
  return (
    <span className={`school-mark school-mark--${variant}`} aria-hidden="true">
      <Image
        src="/school-emblem.png"
        alt=""
        width={354}
        height={341}
        className="school-mark-image"
      />
    </span>
  );
}
