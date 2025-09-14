"use client";

import { useContext } from 'react';
import { RulesContext } from '@/contexts/rules-provider';

export const useRules = () => {
  const context = useContext(RulesContext);
  if (context === undefined) {
    throw new Error('useRules must be used within a RulesProvider');
  }
  return context;
};
