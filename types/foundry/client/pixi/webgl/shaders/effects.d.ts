export {};

declare global {
	class AdaptiveLightingShader extends AbstractBaseShader {}

	class AdaptiveVisionShader extends AdaptiveLightingShader {}

	class BackgroundVisionShader extends AdaptiveVisionShader {
		/**
		 * Shader final
		 * @type {string}
		 */
		static FRAGMENT_END: string;

		/**
		 * Incorporate falloff if a attenuation uniform is requested
		 * @type {string}
		 */
		static FALLOFF: string;

		/**
		 * Memory allocations for the Adaptive Background Shader
		 * @type {string}
		 */
		static SHADER_HEADER: string;

		/** @inheritdoc */
		static fragmentShader: string;

		/** @inheritdoc */
		static defaultUniforms: object;
		/**
		 * Flag whether the background shader is currently required.
		 * If key uniforms are at their default values, we don't need to render the background container.
		 * @type {boolean}
		 */
		get isRequired(): boolean;
	}

	class AmplificationBackgroundVisionShader extends BackgroundVisionShader {}
}
