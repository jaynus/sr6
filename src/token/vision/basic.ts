import { SR6Token } from '@/token/SR6Token';

export class SR6DetectionModeBasicSight extends DetectionModeBasicSight {
	override _canDetect(visionSource: VisionSource<SR6Token>, target: SR6Token): boolean {
		console.log('SR6DetectionModeBasicSight::_canDetect', visionSource, target, this);
		if (target.actor?.type === 'matrix_host') {
			return false;
		}
		return super._canDetect(visionSource, target);
	}

	constructor(params: DetectionModeConstructionParams, context?: DocumentConstructionContext) {
		super(params, context);
	}
}

export function register(): void {
	CONFIG.Canvas.detectionModes.basicSight = new SR6DetectionModeBasicSight({
		id: 'basicSight',
		label: 'DETECTION.BasicSight',
		type: DetectionMode.DETECTION_TYPES.SIGHT,
	});
}
