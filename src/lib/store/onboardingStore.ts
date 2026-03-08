'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CallDirection = 'inbound' | 'outbound';

export interface OnboardingState {
  // Wizard navigation
  currentStep: number;
  animDirection: 1 | -1; // Animation slide direction (renamed from 'direction')

  // Step 1: Number Selection
  direction: CallDirection;
  selectedCountry: string;       // 'US' | 'GB' | 'CA'
  areaCode: string;
  selectedNumber: string | null; // E.164 from search results
  selectedLocality: string | null; // City for display

  // Step 2: Payment & Provisioning
  businessName: string;
  paymentComplete: boolean;
  phoneNumber: string | null;       // Provisioned E.164
  vapiPhoneId: string | null;       // Vapi phone UUID
  provisioningInProgress: boolean;

  // Step 3: Telecom Routing
  routingConfigured: boolean;

  // Step 4: Agent Personality
  agentName: string;
  agentId: string | null;           // DB agent UUID
  vapiAssistantId: string | null;   // Vapi assistant UUID

  // Step 5: Sync
  syncComplete: boolean;

  // Shared / Pre-fetched
  voiceList: Array<{ id: string; name: string }>;
  sessionId: string;

  // Pricing plan selected from marketing site ('starter' | 'business' | 'enterprise' | null)
  plan: string | null;

  // Actions
  setDirection: (d: CallDirection) => void;
  setSelectedCountry: (country: string) => void;
  setAreaCode: (code: string) => void;
  setSelectedNumber: (number: string | null, locality?: string | null) => void;
  setBusinessName: (name: string) => void;
  setPaymentComplete: (complete: boolean) => void;
  setPhoneNumber: (number: string) => void;
  setVapiPhoneId: (id: string) => void;
  setProvisioningInProgress: (inProgress: boolean) => void;
  setRoutingConfigured: (configured: boolean) => void;
  setAgentName: (name: string) => void;
  setAgentId: (id: string) => void;
  setVapiAssistantId: (id: string) => void;
  setSyncComplete: (complete: boolean) => void;
  setVoiceList: (voices: Array<{ id: string; name: string }>) => void;
  setPlan: (plan: string | null) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetFromStep: (step: number) => void;
  reset: () => void;
}

function generateSessionId(): string {
  return `obs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const TOTAL_STEPS = 5;

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 0,
      animDirection: 1 as 1 | -1,

      // Step 1
      direction: 'inbound' as CallDirection,
      selectedCountry: 'US',
      areaCode: '',
      selectedNumber: null,
      selectedLocality: null,

      // Step 2
      businessName: '',
      paymentComplete: false,
      phoneNumber: null,
      vapiPhoneId: null,
      provisioningInProgress: false,

      // Step 3
      routingConfigured: false,

      // Step 4
      agentName: '',
      agentId: null,
      vapiAssistantId: null,

      // Step 5
      syncComplete: false,

      // Shared
      voiceList: [],
      sessionId: generateSessionId(),

      // Pricing plan from marketing site
      plan: null,

      // Actions
      setDirection: (d) => set({ direction: d }),
      setSelectedCountry: (country) => set({ selectedCountry: country }),
      setAreaCode: (code) => set({ areaCode: code.replace(/\D/g, '').slice(0, 3) }),
      setSelectedNumber: (number, locality) =>
        set({ selectedNumber: number, selectedLocality: locality ?? null }),
      setBusinessName: (name) => set({ businessName: name }),
      setPaymentComplete: (complete) => set({ paymentComplete: complete }),
      setPhoneNumber: (number) => set({ phoneNumber: number }),
      setVapiPhoneId: (id) => set({ vapiPhoneId: id }),
      setProvisioningInProgress: (inProgress) => set({ provisioningInProgress: inProgress }),
      setRoutingConfigured: (configured) => set({ routingConfigured: configured }),
      setAgentName: (name) => set({ agentName: name }),
      setAgentId: (id) => set({ agentId: id }),
      setVapiAssistantId: (id) => set({ vapiAssistantId: id }),
      setSyncComplete: (complete) => set({ syncComplete: complete }),
      setVoiceList: (voices) => set({ voiceList: voices }),
      setPlan: (plan) => set({ plan }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS - 1),
          animDirection: 1,
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
          animDirection: -1,
        })),

      goToStep: (step) =>
        set((state) => ({
          currentStep: Math.max(0, Math.min(step, TOTAL_STEPS - 1)),
          animDirection: step > state.currentStep ? 1 : -1,
        })),

      // Clears all state from step N onward (prevents stale data when user navigates back)
      resetFromStep: (step) =>
        set((state) => {
          const cleared: Partial<OnboardingState> = {};
          if (step <= 1) {
            // Reset Step 2+ state
            cleared.paymentComplete = false;
            cleared.phoneNumber = null;
            cleared.vapiPhoneId = null;
            cleared.provisioningInProgress = false;
          }
          if (step <= 2) {
            cleared.routingConfigured = false;
          }
          if (step <= 3) {
            cleared.agentName = '';
            cleared.agentId = null;
            cleared.vapiAssistantId = null;
          }
          if (step <= 4) {
            cleared.syncComplete = false;
          }
          return cleared;
        }),

      reset: () =>
        set({
          currentStep: 0,
          animDirection: 1,
          direction: 'inbound',
          selectedCountry: 'US',
          areaCode: '',
          selectedNumber: null,
          selectedLocality: null,
          businessName: '',
          paymentComplete: false,
          phoneNumber: null,
          vapiPhoneId: null,
          provisioningInProgress: false,
          routingConfigured: false,
          agentName: '',
          agentId: null,
          vapiAssistantId: null,
          syncComplete: false,
          voiceList: [],
          sessionId: generateSessionId(),
          plan: null,
        }),
    }),
    {
      name: 'barpel-onboarding',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        direction: state.direction,
        selectedCountry: state.selectedCountry,
        areaCode: state.areaCode,
        selectedNumber: state.selectedNumber,
        selectedLocality: state.selectedLocality,
        businessName: state.businessName,
        paymentComplete: state.paymentComplete,
        phoneNumber: state.phoneNumber,
        vapiPhoneId: state.vapiPhoneId,
        routingConfigured: state.routingConfigured,
        agentName: state.agentName,
        agentId: state.agentId,
        vapiAssistantId: state.vapiAssistantId,
        syncComplete: state.syncComplete,
        voiceList: state.voiceList,
        sessionId: state.sessionId,
        plan: state.plan,
      }),
    }
  )
);
