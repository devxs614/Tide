'use client';

// A ready-made message (to a friend, or to a TA about the stuck task) that
// Maya can edit and copy. Tide never sends anything: she pastes it into her
// own messaging app when she's ready.
import { useState } from 'react';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { Button } from '@/components/ui/button';
import type { ToolProps } from './types';

export function MessageTemplate({ strategy, taskTitle, onDone }: ToolProps) {
  const [text, setText] = useState(() => fill(strategy.template ?? '', { task: taskTitle ?? copy.tools.message.thisTask }));

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast(copy.toolkit.copied);
    } catch {
      // Some browsers block the clipboard; selecting the text still lets
      // Maya copy it by hand.
      document.getElementById('message-text')?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor="message-text" className="font-bold">
        {copy.tools.message.label}
      </label>
      <textarea
        id="message-text"
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-input border border-line bg-surface-2 p-3 text-body"
      />
      <Button onClick={() => void copyText()}>
        <Copy aria-hidden />
        {copy.toolkit.copy}
      </Button>
      <Button variant="secondary" onClick={onDone}>
        {copy.global.done}
      </Button>
    </div>
  );
}
