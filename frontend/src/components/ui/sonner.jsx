import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const theme = "dark";

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast liquid-glass group-[.toaster]:bg-black/80 group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl rounded-2xl p-4 font-body",
          description: "group-[.toast]:text-white/50",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-black rounded-full px-4 py-2",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-white rounded-full px-4 py-2",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
