'use client';

import { useTheme } from 'next-themes';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EmojiPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (emoji: string) => void;
}

export const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({
  open,
  onOpenChange,
  onSelect,
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  // Keep latest callbacks in refs so the mount effect below doesn't re-run
  // (and tear down/rebuild the emoji-mart picker) just because the parent
  // re-rendered and passed new function identities for onSelect/onOpenChange.
  const onSelectRef = useRef(onSelect);
  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onSelectRef.current = onSelect;
    onOpenChangeRef.current = onOpenChange;
  }, [onSelect, onOpenChange]);

  useEffect(() => {
    if (!open || !pickerRef.current) return;

    let picker: { remove: () => void } | null = null;

    const init = async () => {
      // biome-ignore lint/suspicious/noExplicitAny: third-party emoji-mart has no TS types for React 19
      const EmojiPicker = (await import('@emoji-mart/react')).default as React.ComponentType<any>;
      const data = (await import('@emoji-mart/data')).default;

      if (!pickerRef.current) return;

      // Dynamically render the picker into the div
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(pickerRef.current);
      root.render(
        <EmojiPicker
          data={data}
          theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
          onEmojiSelect={(emoji: { native: string; shortcodes?: string }) => {
            onSelectRef.current(emoji.shortcodes ?? emoji.native);
            onOpenChangeRef.current(false);
          }}
          previewPosition="none"
          skinTonePosition="none"
        />,
      );

      picker = { remove: () => root.unmount() };
    };

    init();

    return () => {
      picker?.remove();
    };
  }, [open, resolvedTheme]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="text-sm">Insert Emoji</DialogTitle>
        </DialogHeader>
        <div ref={pickerRef} className="[&>em-emoji-picker]:w-full [&>em-emoji-picker]:border-0" />
      </DialogContent>
    </Dialog>
  );
};
