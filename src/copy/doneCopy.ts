// The words for finished tasks leaving the board (v2.1 F-05): "Clear", the
// link to Completed, and the Completed archive. The Tasks screen isn't part
// of Today's first load, so these live outside en.ts. Same rules as
// en.ts: no guilt, nothing about "old" or "overdue" work.
export const doneCopy = {
  clear: 'Clear',
  clearLabel: 'Clear finished tasks from the board',
  cleared: 'Finished tasks cleared. They rest in Completed.',
  completedEarlier: 'Completed earlier ({n})',
  emptyRecent: {
    '24h': 'Nothing finished in the last day.',
    '3d': 'Nothing finished in the last 3 days.',
    '7d': 'Nothing finished in the last week.',
    forever: 'Nothing finished yet.',
  },
  seeAll: "See everything you've finished",

  title: 'Completed',
  back: 'Back to Tasks',
  search: 'Search finished tasks',
  noMatch: 'Nothing matches "{q}".',
  empty: 'Finished tasks will rest here.',
  finishedAt: 'Finished at {time}',
  onShore: 'On your shore',
  moveBack: 'Move back to In progress',
  delete: 'Delete',
  select: 'Select',
  cancelSelect: 'Cancel',
  selectTask: 'Select {title}',
  deleteSelected: 'Delete selected ({n})',
};
