// The list of keyboard shortcuts, shared by the "?" sheet and the Keyboard
// shortcuts page in Settings, so the two can never disagree.
import { copy } from '@/copy/en';

export function ShortcutsList() {
  return (
    <table className="w-full border-separate border-spacing-y-1 text-left">
      <thead className="sr-only">
        <tr>
          <th scope="col">{copy.shortcuts.keyLabel}</th>
          <th scope="col">{copy.shortcuts.actionLabel}</th>
        </tr>
      </thead>
      <tbody>
        {copy.shortcuts.list.map((row) => (
          <tr key={row.action}>
            <td className="w-0 whitespace-nowrap py-1 pr-4 align-top">
              <span className="flex gap-1">
                {row.keys.map((k) => (
                  <kbd key={k} className="min-w-8 rounded-input border-2 border-b-4 border-line bg-surface-2 px-2 text-center font-display font-extrabold">
                    {k}
                  </kbd>
                ))}
              </span>
            </td>
            <td className="py-1 align-top">{row.action}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
