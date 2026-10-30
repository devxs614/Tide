'use client';

// Coach marks for the very first check-in during onboarding (v2 spec 11.2):
// a short hint at the text box, the feeling words and the "what do you
// need" step. Outside onboarding the context is off and nothing renders, so
// every other check-in looks exactly as before.
import { createContext, useContext, type ReactNode } from 'react';
import { CoachMark } from '@/components/ui/coach-mark';

export const CoachContext = createContext(false);

export function CheckInCoach({ children }: { children: ReactNode }) {
  return useContext(CoachContext) ? <CoachMark>{children}</CoachMark> : null;
}
