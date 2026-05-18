'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizardStore, wizardActions } from '@/hooks/wizard';
import { step4Schema, type Step4Data } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';


export function WizardStep4() {
  const { form } = useWizardStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step4Data>({
    resolver:      zodResolver(step4Schema),
    defaultValues: form.step4,
  });

  const startDays     = watch('startDays')     ?? 0;
  const startHours    = watch('startHours')    ?? 0;
  const startMins     = watch('startMins')     ?? 0;
  const durationDays  = watch('durationDays')  ?? 0;
  const durationHours = watch('durationHours') ?? 0;

  // ── Estimated dates preview ───────────────────────────
  const now        = Date.now();
  const startMs    = (startDays * 86_400_000) + (startHours * 3_600_000) + (startMins * 60_000);
  const durationMs = (durationDays * 86_400_000) + (durationHours * 3_600_000);

  const startDate = startMs > 0
    ? new Date(now + startMs).toLocaleString('en-US', {
        month:  'short',
        day:    'numeric',
        year:   'numeric',
        hour:   '2-digit',
        minute: '2-digit',
      })
    : null;

  const endDate = startMs > 0 && durationMs > 0
    ? new Date(now + startMs + durationMs).toLocaleString('en-US', {
        month:  'short',
        day:    'numeric',
        year:   'numeric',
        hour:   '2-digit',
        minute: '2-digit',
      })
    : null;

  const onSubmit = (data: Step4Data) => {
    wizardActions.updateStep4(data);
    wizardActions.nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground">Timeline</h3>
        <p className="text-xs text-muted-foreground">
          Set when your launch starts and how long it runs.
        </p>
      </div>

      {/* ── Start Delay ───────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">
          Start Delay (from now)
        </Label>
        <div className="grid grid-cols-3 gap-2">
          <div className="relative">
            <Input
              {...register('startDays', { valueAsNumber: true })}
              type="number"
              min={0}
              placeholder="0"
              className={cn(
                'pr-12 bg-muted/30 border-border text-sm',
                errors.startDays && 'border-destructive'
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              days
            </span>
          </div>
          <div className="relative">
            <Input
              {...register('startHours', { valueAsNumber: true })}
              type="number"
              min={0}
              max={23}
              placeholder="0"
              className={cn(
                'pr-12 bg-muted/30 border-border text-sm',
                errors.startHours && 'border-destructive'
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              hrs
            </span>
          </div>
          <div className="relative">
            <Input
              {...register('startMins', { valueAsNumber: true })}
              type="number"
              min={0}
              max={59}
              placeholder="0"
              className={cn(
                'pr-12 bg-muted/30 border-border text-sm',
                errors.startMins && 'border-destructive'
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              mins
            </span>
          </div>
        </div>
        {(errors.startDays || errors.startHours || errors.startMins) && (
          <p className="text-[11px] text-destructive">
            {errors.startDays?.message ?? errors.startHours?.message ?? errors.startMins?.message}
          </p>
        )}
        {startDate && (
          <p className="text-[11px] text-neon-blue">Starts ~ {startDate}</p>
        )}
      </div>

      {/* ── Duration ──────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">
          Duration
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <Input
              {...register('durationDays', { valueAsNumber: true })}
              type="number"
              min={0}
              max={365}
              placeholder="3"
              className={cn(
                'pr-12 bg-muted/30 border-border text-sm',
                errors.durationDays && 'border-destructive'
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              days
            </span>
          </div>
          <div className="relative">
            <Input
              {...register('durationHours', { valueAsNumber: true })}
              type="number"
              min={0}
              max={23}
              placeholder="0"
              className={cn(
                'pr-12 bg-muted/30 border-border text-sm',
                errors.durationHours && 'border-destructive'
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              hrs
            </span>
          </div>
        </div>
        {errors.durationDays && (
          <p className="text-[11px] text-destructive">{errors.durationDays.message}</p>
        )}
        {endDate && (
          <p className="text-[11px] text-neon-blue">Ends ~ {endDate}</p>
        )}
      </div>

      {/* ── Timeline preview ──────────────────────────── */}
      {startDate && endDate && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 px-3 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Launch Start</span>
            <span className="font-medium text-foreground">{startDate}</span>
          </div>
          <div className="h-0.5 w-full bg-border" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Launch End</span>
            <span className="font-medium text-foreground">{endDate}</span>
          </div>
          <div className="h-0.5 w-full bg-border" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total Duration</span>
            <span className="font-medium text-neon-blue">
              {durationDays}d {durationHours}h
            </span>
          </div>
        </div>
      )}

      {/* ── Navigation ────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={wizardActions.prevStep}
          className="border-border text-muted-foreground hover:text-foreground"
        >
          Back
        </Button>
        <Button
          type="submit"
          className="border border-neon-blue/40 bg-neon-blue-tone text-neon-blue hover:bg-neon-blue/20"
        >
          Next
        </Button>
      </div>
    </form>
  );
}