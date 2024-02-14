import { register as registerAstral } from '@/token/vision/astral';
import { register as registerMatrix } from '@/token/vision/matrix';
import { register as registerBasic } from '@/token/vision/basic';

export function register(): void {
	registerBasic();
	registerMatrix();
	registerAstral();
}
