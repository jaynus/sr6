/**
 *
 * @author jaynus
 * @file Central point of registration for all game settings.
 */

import { register as registerCampaignSettings } from './campaign';
import { register as registerStoryPoints } from './storyPoints';
import { register as registerUser } from './user';

import { register as registerAlpha } from './alpha';

/**
 * Namespace used to access system settings from {@link Game.settings}.
 */
export const NAMESPACE = 'sr6';

/**
 * Register all system settings.
 */
export function register(): void {
	registerCampaignSettings(NAMESPACE);
	registerStoryPoints(NAMESPACE);
	registerUser(NAMESPACE);

	registerAlpha(NAMESPACE);
}
