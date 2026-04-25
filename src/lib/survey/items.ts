import { ITEM_DEFINITIONS } from '../scoring/constants';
import type { ItemDefinition, ItemId } from '../scoring/types';

// PLACEHOLDER question text + answer labels. See INSTRUMENT-LICENSE.md.
// The verbatim VEINES-QOL/Sym text + validated translations are added once
// LSHTM permission lands. This file ships English placeholders that preserve
// the answer scale + reverse-scoring shape so the survey UI is fully testable.

export interface AnswerOption {
  value: number;
  label: string;
}

export interface SurveyItem extends ItemDefinition {
  prompt: string;
  helpText?: string;
  options: AnswerOption[];
}

const FREQ_6 = ['Every day', 'Most days', 'Sometimes', 'Rarely', 'Almost never', 'Never'];
const CHANGE_5 = ['Much better', 'Somewhat better', 'About the same', 'Somewhat worse', 'Much worse'];
const LIMIT_5 = ['Not limited', 'Slightly limited', 'Moderately limited', 'Very limited', 'Extremely limited'];

function optionsFor(range: readonly [number, number]): AnswerOption[] {
  const [min, max] = range;
  const span = max - min + 1;
  const labels = (() => {
    if (span === 5 && range[1] === 5) return LIMIT_5;
    if (span === 6) return FREQ_6;
    if (span === 5) return CHANGE_5;
    // Generic fallback
    return Array.from({ length: span }, (_, i) => `Option ${min + i}`);
  })();
  return labels.map((label, i) => ({ value: min + i, label }));
}

const PROMPTS: Record<ItemId, string> = {
  // Q1: 9 leg-symptom frequencies — placeholder prompts
  'Q1.1': '[PLACEHOLDER] How often did you have heavy legs in the past 4 weeks?',
  'Q1.2': '[PLACEHOLDER] How often did you have aching legs in the past 4 weeks?',
  'Q1.3': '[PLACEHOLDER] How often did you have leg swelling in the past 4 weeks?',
  'Q1.4': '[PLACEHOLDER] How often did you have leg cramps at night in the past 4 weeks?',
  'Q1.5': '[PLACEHOLDER] How often did you have a heat or burning sensation in your legs in the past 4 weeks?',
  'Q1.6': '[PLACEHOLDER] How often did you have restless legs in the past 4 weeks?',
  'Q1.7': '[PLACEHOLDER] How often did you have throbbing in your legs in the past 4 weeks?',
  'Q1.8': '[PLACEHOLDER] How often did you have itching legs in the past 4 weeks?',
  'Q1.9': '[PLACEHOLDER] How often did you have tingling in your legs in the past 4 weeks?',
  // Q3: change over past year (reverse-scored)
  'Q3': '[PLACEHOLDER] Over the past year, your leg problems have:',
  // Q4: 11 daily-activity limitations
  'Q4.1': '[PLACEHOLDER] Daily activities at work — limited by leg problems?',
  'Q4.2': '[PLACEHOLDER] Daily activities at home — limited by leg problems?',
  'Q4.3': '[PLACEHOLDER] Social or leisure activities — limited by leg problems?',
  'Q4.4': '[PLACEHOLDER] Standing for long periods — limited?',
  'Q4.5': '[PLACEHOLDER] Sitting for long periods — limited?',
  'Q4.6': '[PLACEHOLDER] Walking up stairs — limited?',
  'Q4.7': '[PLACEHOLDER] Walking on level ground — limited?',
  'Q4.8': '[PLACEHOLDER] Bending or kneeling — limited?',
  'Q4.9': '[PLACEHOLDER] Light housework — limited?',
  'Q4.10': '[PLACEHOLDER] Heavy housework — limited?',
  'Q4.11': '[PLACEHOLDER] Travel or commuting — limited?',
  // Q5: depressed
  'Q5': '[PLACEHOLDER] In the past 4 weeks, how often did your leg problems make you feel depressed?',
  // Q6: worried about appearance (reverse-scored)
  'Q6': '[PLACEHOLDER] In the past 4 weeks, how often did you feel worried about the appearance of your legs?',
  // Q7: irritable (reverse-scored, both subscales)
  'Q7': '[PLACEHOLDER] In the past 4 weeks, how often did your leg problems make you feel irritable?',
  // Q8: interfered with social activities
  'Q8': '[PLACEHOLDER] In the past 4 weeks, how often did your leg problems interfere with your social life?',
};

export const SURVEY_ITEMS: SurveyItem[] = ITEM_DEFINITIONS.map((def) => ({
  ...def,
  prompt: PROMPTS[def.id] ?? `[PLACEHOLDER] Item ${def.id}`,
  options: optionsFor(def.scaleRange),
}));

export function itemById(id: ItemId): SurveyItem | undefined {
  return SURVEY_ITEMS.find((i) => i.id === id);
}
