import { SR6Token, SR6TokenDocument } from '@/token/SR6Token';
import { register as registerVision } from '@/token/vision';

export function register(): void {
	CONFIG.Token.objectClass = SR6Token;
	CONFIG.Token.documentClass = SR6TokenDocument;

	registerVision();
}
