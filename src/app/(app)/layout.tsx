// Layout for the tab screens (Today, Tasks, Toolkit, Patterns) and the pages
// reached from the menu. The Focus block and onboarding live outside this
// group because they deliberately hide the tab bar.
import { AppShell } from '@/components/shell/AppShell';

export default function TabsLayout({ children }: LayoutProps<'/'>) {
  return <AppShell>{children}</AppShell>;
}
