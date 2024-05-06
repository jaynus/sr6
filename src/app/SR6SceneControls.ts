import { GMPrompt } from '@/app/GMPrompt';
import { PartyPrompt } from '@/app/PartyPrompt';

export function getSceneControlButtons(controls: SceneControl[]): void {
	controls.push({
		activeTool: 'balls',
		name: 'sr6',
		icon: 'sr6logo-icon',
		title: 'balls',
		layer: 'sr6',
		visible: true,
		tools: [
			{
				name: 'Party',
				title: 'balls',
				icon: 'fas fa-user-alt',
				button: true,
				onClick: async () => {
					await new PartyPrompt().render(true);
					console.log('balls');
				},
			},
			{
				name: 'GM',
				title: 'balls',
				icon: 'fas fa-hammer',
				button: true,
				onClick: async () => {
					await new GMPrompt().render(true);
					console.log('balls');
				},
			},
		],
	});
}
