import { proxy, useSnapshot } from 'valtio';
import type { WizardFormData } from '@/types/project';
import { USDX_ADDRESS } from '@/lib/constants';

type WizardStage = 'intro' | 'wizard' | 'submitting' | 'success';

interface WizardStore {
  stage:       WizardStage;
  currentStep: number;
  isOpen:      boolean;
  form:        WizardFormData;
}

const defaultForm: WizardFormData = {
  step1: {
    tokenName:   '',
    tokenSymbol: '',
    totalSupply: '',
    logoURI:     '',
  },
  step2: {
    fundingGoal:       '',
    softCap:           '',
    minContribution:   '',
    maxContribution:   '',
    contributionToken: USDX_ADDRESS as `0x${string}`,
  },
  step3: {
    tokenPrice:          '',
    amountTokensForSale: '',
  },
  step4: {
    startDays:     0,
    startHours:    1,
    startMins:     10,
    durationDays:  3,
    durationHours: 0,
  },
  step5: {
    liquidityPercentage: 70,
    lockDurationDays:    180,
  },
  step6: {
    vestingEnabled:        false,
    cliffDays:             0,
    durationDays:          0,
    intervalDays:          0,
    initialReleasePercent: 0,
  },
};

export const wizardStore = proxy<WizardStore>({
  stage:       'intro',
  currentStep: 1,
  isOpen:      false,
  form:        { ...defaultForm },
});

export const wizardActions = {
  open:  ()  => { wizardStore.isOpen = true;  wizardStore.stage = 'intro'; },
  close: ()  => {
    wizardStore.isOpen      = false;
    wizardStore.stage       = 'intro';
    wizardStore.currentStep = 1;
    wizardStore.form        = { ...defaultForm };
  },
  goToWizard:    () => { wizardStore.stage = 'wizard'; },
  nextStep:      () => { wizardStore.currentStep += 1; },
  prevStep:      () => { wizardStore.currentStep -= 1; },
  goToStep:      (step: number) => {
    wizardStore.currentStep = step;
    wizardStore.stage       = 'wizard';
  },
  setSubmitting: () => { wizardStore.stage = 'submitting'; },
  setSuccess:    () => { wizardStore.stage = 'success'; },
  updateStep1:   (data: WizardFormData['step1']) => { wizardStore.form.step1 = data; },
  updateStep2:   (data: WizardFormData['step2']) => { wizardStore.form.step2 = data; },
  updateStep3:   (data: WizardFormData['step3']) => { wizardStore.form.step3 = data; },
  updateStep4:   (data: WizardFormData['step4']) => { wizardStore.form.step4 = data; },
  updateStep5:   (data: WizardFormData['step5']) => { wizardStore.form.step5 = data; },
  updateStep6:   (data: WizardFormData['step6']) => { wizardStore.form.step6 = data; },
};

export function useWizardStore() {
  return useSnapshot(wizardStore);
}