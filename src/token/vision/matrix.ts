import { SR6Token } from '@/token/SR6Token';

export class MatrixVisionBackgroundVisionShader extends AmplificationBackgroundVisionShader {
	static COLOR_TINT: number[] = [0.15, 0.15, 0.88];

	static override defaultUniforms: object = {
		...super.defaultUniforms,
		colorTint: this.COLOR_TINT,
	};
}

export class MatrixVisionFilter extends AbstractBaseFilter {
	static override defaultUniforms = {
		luminanceThreshold: 0.5,
		alphaThreshold: 0.1,
	};

	/**
	 * fragment shader based on the following snippets:
	 * @link https://gitlab.com/peginc/swade/-/blob/develop/src/module/vision/InfravisionFilter.ts?ref_type=heads
	 */
	static override fragmentShader = `
  varying vec2 vTextureCoord;
  uniform sampler2D uSampler;
  uniform float luminanceThreshold;
  uniform float alphaThreshold;

  void main(void) {
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    float luminance = dot(vec3(0.30, 0.59, 0.11), texColor.rgb);
    if ( texColor.a > alphaThreshold ) {
      gl_FragColor = mix(vec4(0.1, 0.1, 0.5, 1.0), vec4(0.4, 0.4, 0.8, 1.0), (luminance - 0.5) * 2.0);;
      gl_FragColor.rgb *= 0.1 + 0.25 + 0.75 * pow( 16.0 * vTextureCoord.x * vTextureCoord.y * (1.0 - vTextureCoord.x) * (1.0 - vTextureCoord.y), 0.15 );
      gl_FragColor.a = texColor.a;
    } else {
      gl_FragColor = vec4(0.0);
    }
  }`;
}

export class MatrixVisionDetectionMode extends DetectionMode {
	static override getDetectionFilter(): PIXI.Filter | undefined {
		return MatrixVisionFilter.create();
	}

	override _canDetect(visionSource: VisionSource<Token>, target: SR6Token): boolean {
		console.log('MatrixVisionDetectionMode::_canDetect', visionSource, target, this);
		if (target.systemActor?.matrixWirelessActive()) {
			return true;
		}

		return false;
	}

	constructor(params: DetectionModeConstructionParams, context?: DocumentConstructionContext) {
		super(params, context);
	}
}

export function register(): void {
	CONFIG.Canvas.detectionModes.matrix = new MatrixVisionDetectionMode({
		id: 'matrix',
		label: 'SR6.Vision.Matrix',
		type: DetectionMode.DETECTION_TYPES.SIGHT,
	});
}
