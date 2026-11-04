// Words for the Tasks board's v2.3 additions: the two board views and the
// quick filters (v2.3 spec 5, 7). They live apart from en.ts because Today
// never shows them, so they stay out of the first load of `/` (D144).
export const tasksCopy = {
  boardView: 'Board view',
  boardViews: { swipe: 'Swipe between columns', list: 'One list' },
  filtersLabel: 'Quick filters',
  filters: {
    dueToday: 'Due today',
    light: 'Light energy',
    oneThing: "Today's one thing",
  },
  clearFilters: 'Clear filters',
  noTasksMatch: 'No tasks match these filters.',
  // The column regions' names for screen readers ("In progress, 1 task").
  columnRegion: { one: '{status}, 1 task', many: '{status}, {count} tasks' },
  showGroup: 'Show {status}',
  hideGroup: 'Hide {status}',
} as const;
