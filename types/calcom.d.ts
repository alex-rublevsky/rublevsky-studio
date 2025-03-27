declare module '@calcom/embed-react' {
  import { ComponentProps } from 'react';

  export interface CalProps extends ComponentProps<'div'> {
    calLink: string;
    config?: {
      name?: string;
      email?: string;
      notes?: string;
      guests?: string[];
      theme?: 'dark' | 'light' | 'auto';
      hideEventTypeDetails?: boolean;
      layout?: 'month_view' | 'week_view' | 'column_view';
    };
  }

  export interface CalApiConfig {
    theme?: 'dark' | 'light' | 'auto';
    hideEventTypeDetails?: boolean;
    layout?: 'month_view' | 'week_view' | 'column_view';
  }

  export type CalApi = {
    (action: 'ui', arg: CalApiConfig): void;
    (action: string, arg?: any): void;
  }

  export function getCalApi(): Promise<CalApi>;

  export default function Cal(props: CalProps): JSX.Element;
} 