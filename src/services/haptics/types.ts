import type { ServiceMode } from '@/config/services';

export interface HapticsService {
  readonly mode: ServiceMode;
  /** Light tap feedback, e.g. on button press. Never throws. */
  tap(): void;
  /** Success feedback, e.g. after a purchase. Never throws. */
  success(): void;
}
