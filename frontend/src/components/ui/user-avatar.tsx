import { getInitials } from "@/lib/formatters";

type UserAvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
};

export function UserAvatar({ name, size = "md" }: UserAvatarProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-brand text-center font-bold text-white shadow-[0_10px_24px_rgba(23,56,36,0.18)] ${sizes[size]}`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
