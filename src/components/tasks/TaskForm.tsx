'use client';

// "Add task": a short form in a sheet. Only the title is required; type,
// energy and due date have quick taps instead of typing. "Break it down for
// me" skips straight to a first step for a task that already feels too big.
// Given a task, the same form edits it (v2.1 F-03): prefilled, with an
// optional first step, saved in place.
import { useState } from 'react';
import { Info } from 'lucide-react';
import { copy } from '@/copy/en';
import { TASK_TYPES } from '@/data/taskTypes';
import { now } from '@/lib/clock';
import { addTask } from '@/lib/repo/tasks';
import { editTask } from '@/lib/repo/taskEdits';
import { addDays, toISODate } from '@/lib/time';
import { useUnstickSheet } from '@/lib/ui';
import type { Task, TaskType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CheckboxRow } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { LeaveConfirm } from '@/components/checkin/LeaveConfirm';
import { ToggleChip } from '@/components/checkin/ToggleChip';

type DueChoice = 'none' | 'today' | 'tomorrow' | 'pick';

function initialDue(task?: Task): DueChoice {
  if (!task?.due) return 'none';
  if (task.due === toISODate(now())) return 'today';
  if (task.due === toISODate(addDays(now(), 1))) return 'tomorrow';
  return 'pick';
}

export function TaskForm({ open, onOpenChange, task }: { open: boolean; onOpenChange: (open: boolean) => void; task?: Task }) {
  const { openUnstick } = useUnstickSheet();
  const editing = !!task;
  const [title, setTitle] = useState(task?.title ?? '');
  const [type, setType] = useState<TaskType>(task?.type ?? 'other');
  const [energy, setEnergy] = useState<1 | 2 | 3>(task?.energyCost ?? 1);
  const [due, setDue] = useState<DueChoice>(initialDue(task));
  const [picked, setPicked] = useState(task?.due ?? '');
  const [firstStep, setFirstStep] = useState(task?.firstStep ?? '');
  const [breakDown, setBreakDown] = useState(false);
  const [showError, setShowError] = useState(false);
  // v2.1 F-08: closing with changes asks first; untouched, it just closes.
  const [confirmLeave, setConfirmLeave] = useState(false);
  const dirty = task
    ? title !== task.title || type !== task.type || energy !== task.energyCost || firstStep !== (task.firstStep ?? '') || due !== initialDue(task)
    : title.trim().length > 0;

  const reset = () => {
    setTitle('');
    setType('other');
    setEnergy(1);
    setDue('none');
    setPicked('');
    setBreakDown(false);
    setShowError(false);
  };

  const dueValue = () => {
    if (due === 'today') return toISODate(now());
    if (due === 'tomorrow') return toISODate(addDays(now(), 1));
    if (due === 'pick' && picked) return picked;
    return undefined;
  };

  const save = async () => {
    if (!title.trim()) return setShowError(true);
    if (task) {
      await editTask(task.id, { title, type, energyCost: energy, due: dueValue(), firstStep });
      onOpenChange(false);
      return;
    }
    const added = await addTask({ title, type, energyCost: energy, due: dueValue() });
    reset();
    onOpenChange(false);
    if (breakDown) openUnstick({ taskId: added.id, reason: 'too_big' });
  };

  return (
    <Sheet open={open} onOpenChange={(next) => (next || !dirty ? onOpenChange(next) : setConfirmLeave(true))}>
      <SheetContent aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>{editing ? copy.taskEdit.editTitle : copy.taskForm.title}</SheetTitle>
        </SheetHeader>
        <form
          className="flex flex-col gap-5 px-5 pt-4 pb-6"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="task-title" className="font-bold">
              {copy.taskForm.titleLabel}
            </label>
            <input
              id="task-title"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={showError && !title.trim()}
              aria-describedby={showError && !title.trim() ? 'task-title-error' : undefined}
              className="min-h-12 rounded-input border border-line bg-surface-2 px-3 text-body"
            />
            {showError && !title.trim() && (
              <p id="task-title-error" className="flex items-center gap-2 text-notice">
                <Info className="size-4 shrink-0" aria-hidden />
                {editing ? copy.taskEdit.titleError : copy.taskForm.titleNeeded}
              </p>
            )}
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-bold">{copy.taskForm.typeLabel}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TASK_TYPES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={type === id}
                  onClick={() => setType(id)}
                  className={`flex min-h-12 items-center gap-2 rounded-input border px-3 ${type === id ? 'border-primary bg-primary text-on-primary' : 'border-line bg-surface'}`}
                >
                  <Icon className="size-5" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-bold">{copy.taskForm.energyLabel}</legend>
            <div className="flex flex-wrap gap-2">
              {copy.tasks.energyLevels.map((label, i) => (
                <ToggleChip key={label} label={label} pressed={energy === i + 1} onToggle={() => setEnergy((i + 1) as 1 | 2 | 3)} />
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-bold">{copy.taskForm.dueLabel}</legend>
            <div className="flex flex-wrap gap-2">
              <ToggleChip label={copy.taskForm.noDate} pressed={due === 'none'} onToggle={() => setDue('none')} />
              <ToggleChip label={copy.taskForm.today} pressed={due === 'today'} onToggle={() => setDue('today')} />
              <ToggleChip label={copy.taskForm.tomorrow} pressed={due === 'tomorrow'} onToggle={() => setDue('tomorrow')} />
              <ToggleChip label={copy.taskForm.pickDate} pressed={due === 'pick'} onToggle={() => setDue('pick')} />
            </div>
            {due === 'pick' && (
              <label htmlFor="task-date" className="flex flex-col gap-1">
                <span>{copy.taskForm.dateLabel}</span>
                <input
                  id="task-date"
                  type="date"
                  value={picked}
                  onChange={(e) => setPicked(e.target.value)}
                  className="min-h-12 rounded-input border border-line bg-surface-2 px-3"
                />
              </label>
            )}
          </fieldset>
          {editing ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="task-first-step" className="font-bold">
                {copy.taskEdit.firstStepLabel}
              </label>
              <input
                id="task-first-step"
                value={firstStep}
                maxLength={200}
                onChange={(e) => setFirstStep(e.target.value)}
                className="min-h-12 rounded-input border border-line bg-surface-2 px-3 text-body"
              />
            </div>
          ) : (
            <CheckboxRow id="break-down" label={copy.tasks.breakItDown} checked={breakDown} onCheckedChange={setBreakDown} />
          )}
          <Button type="submit" size="block" data-demo-id={editing ? 'task-edit-save' : undefined}>
            {editing ? copy.global.save : copy.taskForm.save}
          </Button>
        </form>
        <LeaveConfirm
          open={confirmLeave}
          onKeep={() => setConfirmLeave(false)}
          onLeave={() => {
            setConfirmLeave(false);
            if (!editing) reset();
            onOpenChange(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
