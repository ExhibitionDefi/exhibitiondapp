'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizardStore, wizardActions } from '@/hooks/wizard';
import { step6Schema, type Step6Data } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function WizardStep6() {
  const { form } = useWizardStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step6Data>({
    resolver:      zodResolver(step6Schema),
    defaultValues: form.step6,
  });

  const vestingEnabled        = watch('vestingEnabled');
  const initialReleasePercent = watch('initialReleasePercent');
  const cliffDays             = watch('cliffDays');
  const durationDays          = watch('durationDays');
  const intervalDays          = watch('intervalDays');

  const onSubmit = (data: Step6Data) => {
    wizardActions.updateStep6(data);
    wizardActions.nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground">Vesting</h3>
        <p className="text-xs text-muted-foreground">
          Optionally lock contributor tokens on a vesting schedule.
        </p>
      </div>

      {/* ── Vesting Toggle ────────────────────────────── */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-foreground">
            Enable Vesting
          </span>
          <span className="text-[11px] text-muted-foreground">
            Contributors receive tokens gradually over time
          </span>
        </div>
        <button
          type="button"
          onClick={() => setValue('vestingEnabled', !vestingEnabled, { shouldValidate: true })}
          className={cn(
            'relative h-5 w-9 rounded-full transition-colors',
            vestingEnabled ? 'bg-neon-blue' : 'bg-muted'
          )}
        >
          <span className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
            vestingEnabled ? 'translate-x-4' : 'translate-x-0.5'
          )} />
        </button>
      </div>

      {/* ── Vesting Fields ────────────────────────────── */}
      {vestingEnabled && (
        <div className="flex flex-col gap-4">

          {/* ── Initial Release ─────────────────────── */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Initial Release
              </Label>
              <span className="text-xs font-medium text-neon-blue">
                {initialReleasePercent ?? 0}%
              </span>
            </div>
            <input
              {...register('initialReleasePercent', { valueAsNumber: true })}
              type="range"
              min={0}
              max={99}
              step={1}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-neon-blue"
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>99%</span>
            </div>
            {errors.initialReleasePercent && (
              <p className="text-[11px] text-destructive">
                {errors.initialReleasePercent.message}
              </p>
            )}
          </div>

          {/* ── Cliff / Duration / Interval grid ─────── */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Cliff</Label>
              <div className="relative">
                <Input
                  {...register('cliffDays', { valueAsNumber: true })}
                  type="number"
                  min={0}
                  placeholder="0"
                  className={cn(
                    'pr-10 bg-muted/30 border-border text-sm',
                    errors.cliffDays && 'border-destructive'
                  )}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                  days
                </span>
              </div>
              {errors.cliffDays && (
                <p className="text-[11px] text-destructive">
                  {errors.cliffDays.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Duration</Label>
              <div className="relative">
                <Input
                  {...register('durationDays', { valueAsNumber: true })}
                  type="number"
                  min={1}
                  placeholder="30"
                  className={cn(
                    'pr-10 bg-muted/30 border-border text-sm',
                    errors.durationDays && 'border-destructive'
                  )}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                  days
                </span>
              </div>
              {errors.durationDays && (
                <p className="text-[11px] text-destructive">
                  {errors.durationDays.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Interval</Label>
              <div className="relative">
                <Input
                  {...register('intervalDays', { valueAsNumber: true })}
                  type="number"
                  min={1}
                  placeholder="7"
                  className={cn(
                    'pr-10 bg-muted/30 border-border text-sm',
                    errors.intervalDays && 'border-destructive'
                  )}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                  days
                </span>
              </div>
              {errors.intervalDays && (
                <p className="text-[11px] text-destructive">
                  {errors.intervalDays.message}
                </p>
              )}
            </div>
          </div>

          {/* ── Vesting preview bar ───────────────────── */}
          {durationDays > 0 && (
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 px-3 py-3">
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                {/* Initial release */}
                <div
                  className="absolute left-0 top-0 h-full bg-neon-orange/70"
                  style={{ width: `${initialReleasePercent ?? 0}%` }}
                />
                {/* Cliff marker */}
                {cliffDays > 0 && (
                  <div
                    className="absolute top-0 h-full w-0.5 bg-neon-blue"
                    style={{
                      left: `${(initialReleasePercent ?? 0) + ((cliffDays / durationDays) * (100 - (initialReleasePercent ?? 0)))}%`,
                    }}
                  />
                )}
                {/* Vesting fill */}
                <div
                  className="absolute top-0 h-full bg-neon-blue/40"
                  style={{
                    left:  `${initialReleasePercent ?? 0}%`,
                    width: `${100 - (initialReleasePercent ?? 0)}%`,
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">Initial</span>
                  <span className="font-medium text-neon-orange">
                    {initialReleasePercent ?? 0}%
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">Cliff</span>
                  <span className="font-medium text-foreground">
                    {cliffDays ?? 0}d
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">Interval</span>
                  <span className="font-medium text-foreground">
                    every {intervalDays ?? 0}d
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── No vesting note ───────────────────────────── */}
      {!vestingEnabled && (
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-3 text-[11px] text-muted-foreground">
          Without vesting, contributors can claim all tokens immediately after the launch succeeds.
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
          Review
        </Button>
      </div>
    </form>
  );
}