import { EnumAttribute } from '@/actor/data';
import LifeformDataModel from '@/actor/data/LifeformDataModel';
import SkillDataModel from '@/item/data/feature/SkillDataModel';
import SR6Item from '@/item/SR6Item';

export default abstract class KnowledgeDataModel extends SkillDataModel {
	override get pool(): number {
		const actor = this.actor! as unknown as SR6Item<LifeformDataModel>;

		return (
			actor.systemData.attribute(EnumAttribute.logic).value +
			actor.systemData.attribute(EnumAttribute.intuition).value
		);
	}
}
