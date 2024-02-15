export const SR6StatusEffects: StatusEffect[] = [
	{
		id: 'dead',
		name: 'EFFECT.StatusDead',
		icon: 'icons/svg/skull.svg',
	},
	{
		id: 'unconscious',
		name: 'EFFECT.StatusUnconscious',
		icon: 'icons/svg/unconscious.svg',
	},
	{
		id: 'target',
		name: 'EFFECT.StatusTarget',
		icon: 'icons/svg/target.svg',
	},
	{
		id: 'linklocked',
		name: 'Link-locked',
		icon: 'systems/sr6/assets/matrix/lock.webp',
		flags: {
			sr6: {
				modifiers: {
					modifiers: [
						{
							class: 'BlockActionModifier',
							name: 'Link-locked',
							description: 'link locked lol',
							actions: ['Enter/Exit Host', 'Reboot Device', 'Switch Interface Mode'],
						},
					],
				},
			},
		},
	},
	// Cover
	{
		id: 'cover1',
		name: 'SR6.Effect.Cover1',
		icon: 'systems/sr6/assets/status/cover1.webp',
		flags: {
			sr6: {
				modifiers: {
					modifiers: [{ class: 'CoverModifier', name: 'Cover I', description: 'Cover lol', level: 1 }],
				},
			},
		},
	},
	{
		id: 'cover2',
		name: 'SR6.Effect.Cover2',
		icon: 'systems/sr6/assets/status/cover2.webp',
		flags: {
			sr6: {
				modifiers: {
					modifiers: [{ class: 'CoverModifier', name: 'Cover II', description: 'Cover lol', level: 2 }],
				},
			},
		},
	},
	{
		id: 'cover3',
		name: 'SR6.Effect.Cover3',
		icon: 'systems/sr6/assets/status/cover3.webp',
		flags: {
			sr6: {
				modifiers: {
					modifiers: [{ class: 'CoverModifier', name: 'Cover III', description: 'Cover lol', level: 3 }],
				},
			},
		},
	},
	{
		id: 'cover4',
		name: 'SR6.Effect.Cover4',
		icon: 'systems/sr6/assets/status/cover4.webp',
		flags: {
			sr6: {
				modifiers: {
					modifiers: [{ class: 'CoverModifier', name: 'Cover IV', description: 'Cover lol', level: 4 }],
				},
			},
		},
	},
	// Blinded
	{
		id: 'blind1',
		name: 'SR6.Effect.Blind1',
		icon: 'systems/sr6/assets/status/blind1.webp',
		flags: {
			sr6: {
				modifiers: {
					modifiers: [{ class: 'BlindedModifier', name: 'Blinded I', description: 'Blinded lol', level: 1 }],
				},
			},
		},
	},
	{
		id: 'blind2',
		name: 'SR6.Effect.Blind2',
		icon: 'systems/sr6/assets/status/blind2.webp',
		flags: {
			sr6: {
				modifiers: {
					modifiers: [{ class: 'BlindedModifier', name: 'Blinded II', description: 'Blinded lol', level: 2 }],
				},
			},
		},
	},
	{
		id: 'blind3',
		name: 'SR6.Effect.Blind3',
		icon: 'systems/sr6/assets/status/blind3.webp',
		flags: {
			sr6: {
				modifiers: {
					modifiers: [
						{ class: 'BlindedModifier', name: 'Blinded III', description: 'Blinded lol', level: 3 },
					],
				},
			},
		},
	},
	// Burning
	{
		id: 'burning1',
		name: 'SR6.Effect.Burning1',
		icon: 'systems/sr6/assets/status/burning1.webp',
		flags: {
			sr6: {
				effects: [
					{
						class: 'BurningEffect',
					},
				],
			},
		},
	},
	{
		id: 'burning2',
		name: 'SR6.Effect.Burning2',
		icon: 'systems/sr6/assets/status/burning2.webp',
		flags: {
			sr6: {},
		},
	},
	{
		id: 'burning3',
		name: 'SR6.Effect.Burning3',
		icon: 'systems/sr6/assets/status/burning3.webp',
		flags: {
			sr6: {},
		},
	},
	{
		id: 'burning4',
		name: 'SR6.Effect.Burning4',
		icon: 'systems/sr6/assets/status/burning4.webp',
		flags: {
			sr6: {},
		},
	},
	{
		id: 'burning5',
		name: 'SR6.Effect.Burning5',
		icon: 'systems/sr6/assets/status/burning5.webp',
		flags: {
			sr6: {},
		},
	},
];

/*
CONFIG.statusEffects = [
	{
		id: 'dead',
		name: 'EFFECT.StatusDead',
		icon: 'icons/svg/skull.svg',
	},
	{
		id: 'unconscious',
		name: 'EFFECT.StatusUnconscious',
		icon: 'icons/svg/unconscious.svg',
	},
	{
		id: 'sleep',
		name: 'EFFECT.StatusAsleep',
		icon: 'icons/svg/sleep.svg',
	},
	{
		id: 'stun',
		name: 'EFFECT.StatusStunned',
		icon: 'icons/svg/daze.svg',
	},
	{
		id: 'prone',
		name: 'EFFECT.StatusProne',
		icon: 'icons/svg/falling.svg',
	},
	{
		id: 'restrain',
		name: 'EFFECT.StatusRestrained',
		icon: 'icons/svg/net.svg',
	},
	{
		id: 'paralysis',
		name: 'EFFECT.StatusParalysis',
		icon: 'icons/svg/paralysis.svg',
	},
	{
		id: 'fly',
		name: 'EFFECT.StatusFlying',
		icon: 'icons/svg/wing.svg',
	},
	{
		id: 'blind',
		name: 'EFFECT.StatusBlind',
		icon: 'icons/svg/blind.svg',
	},
	{
		id: 'deaf',
		name: 'EFFECT.StatusDeaf',
		icon: 'icons/svg/deaf.svg',
	},
	{
		id: 'silence',
		name: 'EFFECT.StatusSilenced',
		icon: 'icons/svg/silenced.svg',
	},
	{
		id: 'fear',
		name: 'EFFECT.StatusFear',
		icon: 'icons/svg/terror.svg',
	},
	{
		id: 'burning',
		name: 'EFFECT.StatusBurning',
		icon: 'icons/svg/fire.svg',
	},
	{
		id: 'frozen',
		name: 'EFFECT.StatusFrozen',
		icon: 'icons/svg/frozen.svg',
	},
	{
		id: 'shock',
		name: 'EFFECT.StatusShocked',
		icon: 'icons/svg/lightning.svg',
	},
	{
		id: 'corrode',
		name: 'EFFECT.StatusCorrode',
		icon: 'icons/svg/acid.svg',
	},
	{
		id: 'bleeding',
		name: 'EFFECT.StatusBleeding',
		icon: 'icons/svg/blood.svg',
	},
	{
		id: 'disease',
		name: 'EFFECT.StatusDisease',
		icon: 'icons/svg/biohazard.svg',
	},
	{
		id: 'poison',
		name: 'EFFECT.StatusPoison',
		icon: 'icons/svg/poison.svg',
	},
	{
		id: 'curse',
		name: 'EFFECT.StatusCursed',
		icon: 'icons/svg/sun.svg',
	},
	{
		id: 'regen',
		name: 'EFFECT.StatusRegen',
		icon: 'icons/svg/regen.svg',
	},
	{
		id: 'degen',
		name: 'EFFECT.StatusDegen',
		icon: 'icons/svg/degen.svg',
	},
	{
		id: 'upgrade',
		name: 'EFFECT.StatusUpgrade',
		icon: 'icons/svg/upgrade.svg',
	},
	{
		id: 'downgrade',
		name: 'EFFECT.StatusDowngrade',
		icon: 'icons/svg/downgrade.svg',
	},
	{
		id: 'invisible',
		name: 'EFFECT.StatusInvisible',
		icon: 'icons/svg/invisible.svg',
	},
	{
		id: 'target',
		name: 'EFFECT.StatusTarget',
		icon: 'icons/svg/target.svg',
	},
	{
		id: 'eye',
		name: 'EFFECT.StatusMarked',
		icon: 'icons/svg/eye.svg',
	},
	{
		id: 'bless',
		name: 'EFFECT.StatusBlessed',
		icon: 'icons/svg/angel.svg',
	},
	{
		id: 'fireShield',
		name: 'EFFECT.StatusFireShield',
		icon: 'icons/svg/fire-shield.svg',
	},
	{
		id: 'coldShield',
		name: 'EFFECT.StatusIceShield',
		icon: 'icons/svg/ice-shield.svg',
	},
	{
		id: 'magicShield',
		name: 'EFFECT.StatusMagicShield',
		icon: 'icons/svg/mage-shield.svg',
	},
	{
		id: 'holyShield',
		name: 'EFFECT.StatusHolyShield',
		icon: 'icons/svg/holy-shield.svg',
	},
];*/
