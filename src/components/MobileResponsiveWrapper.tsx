import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileResponsiveWrapperProps {
  children: ReactNode;
  className?: string;
}

export const MobileResponsiveWrapper = ({ children, className = "" }: MobileResponsiveWrapperProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? 'px-2' : 'px-4'} ${className}`}>
      {children}
    </div>
  );
}; 