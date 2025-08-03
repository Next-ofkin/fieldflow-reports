import { cn } from "@/lib/utils";
import "./floating-particles.css";

export function FloatingParticles({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 z-0 overflow-hidden", className)}>
      <div className="stars" />
      <div className="twinkling" />
      <div className="rainbow-glow" />
    </div>
  );
}