"use client";

import { forwardRef } from "react";
import { Button } from "@/components/ui/Button";
import { useSound } from "@/hooks/useSound";
import type { SoundName } from "@/lib/sounds/audio-manager";
import type { ComponentProps } from "react";

interface SoundButtonProps extends ComponentProps<typeof Button> {
  sound?: SoundName;
}

/**
 * Wraps Button to play a sound effect on click.
 * Defaults to "pop" — pass `sound={false as any}` style or override.
 */
export const SoundButton = forwardRef<HTMLButtonElement, SoundButtonProps>(
  ({ sound = "pop", onClick, ...rest }, ref) => {
    const { play } = useSound();
    return (
      <Button
        ref={ref}
        onClick={(e) => {
          play(sound);
          onClick?.(e);
        }}
        {...rest}
      />
    );
  }
);

SoundButton.displayName = "SoundButton";
