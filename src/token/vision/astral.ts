export class AstralBackgroundVisionShader extends AmplificationBackgroundVisionShader {
	static COLOR_TINT: number[] = [1, 1, 0.8];

	static override defaultUniforms: object = {
		...super.defaultUniforms,
		colorTint: this.COLOR_TINT,
	};
}
export class AstralVisionFilter extends AbstractBaseFilter {
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

  #define RED vec4(0.8, 0.0, 0.0, 1.0)
  #define YELLOW vec4(0.8, 0.8, 0.0, 1.0)
  #define BLUE vec4(0.0, 0.0, 1.0, 1.0)
  #define GREEN vec4(0.0, 1.0, 0.0, 1.0)

  void main(void) {
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    float luminance = dot(vec3(0.30, 0.59, 0.11), texColor.rgb);
    if ( texColor.a > alphaThreshold ) {
      gl_FragColor = (luminance < luminanceThreshold) ? mix(RED, mix(YELLOW, vec4(0.2, 0.0, 0.0, 1.0), luminance / 0.5), luminance * 1.0 ) : mix(vec4(0.2, 0.0, 0.0, 1.0), YELLOW, (luminance - 0.5) * 3.0);
      gl_FragColor.rgb *= 0.1 + 0.25 + 0.75 * pow( 16.0 * vTextureCoord.x * vTextureCoord.y * (1.0 - vTextureCoord.x) * (1.0 - vTextureCoord.y), 0.15 );
      gl_FragColor.a = texColor.a;
    } else {
      gl_FragColor = vec4(0.0);
    }
  }`;
}

export class AstralPerceptionDetectionMode extends DetectionMode {
	_detectionFilter: AstralVisionFilter;
	static override getDetectionFilter(): AbstractBaseFilter {
		return this._detectionFilter;
	}

	override _canDetect(_visionSource: VisionSource<Token>, _target: PlaceableObject): boolean {
		/*
		const tgt = target?.document;
		const targetAstralActive =
			tgt instanceof TokenDocument && tgt.actor?.system.visibilityChecks.astral.astralActive;

		const targetHasAura = tgt instanceof TokenDocument && tgt.actor?.system.visibilityChecks.astral.hasAura;

		const targetAffectedBySpell = tgt.actor?.system.visibilityChecks.astral.affectedBySpell;

		const isAstralPerceiving = visionSource?.visionMode?.id === 'astralPerception';

		return (targetHasAura || targetAstralActive || targetAffectedBySpell) && isAstralPerceiving;

		 */
		return false;
	}

	constructor(params: DetectionModeConstructionParams, context?: DocumentConstructionContext) {
		super(params, context);
		this._detectionFilter = AstralVisionFilter.create();
	}
}

export function register(): void {
	CONFIG.Canvas.detectionModes.astralPerception = new AstralPerceptionDetectionMode({
		id: 'astralPerception',
		label: 'SR6.Vision.AstralPerception',
		type: DetectionMode.DETECTION_TYPES.SIGHT,
	});

	CONFIG.Canvas.visionModes.astralPerception = new VisionMode({
		id: 'astralPerception',
		label: 'SR6.Vision.AstralPerception',
		canvas: {
			shader: ColorAdjustmentsSamplerShader,
			uniforms: {
				saturation: 5,
				tint: AstralBackgroundVisionShader.COLOR_TINT,
			},
		},
		lighting: {
			background: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
			illumination: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
			coloration: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
		},
		vision: {
			darkness: { adaptive: false },
			background: { shader: AstralBackgroundVisionShader },
		},
	});
}
