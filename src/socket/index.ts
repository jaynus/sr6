export const SOCKET_NAME = 'system.sr6';

export enum SocketOperation {
	UpdateCombatTracker,
	EdgeModificationData,
}

export type CombatSocketBaseData = {
	combatId: string;
};

export type EdgeModificationData = {
	sourceActorId: ActorUUID;
	targetActorId: ActorUUID;
	value: number;
};

export type SocketPayload<T extends { [key: string]: unknown }> = {
	operation: SocketOperation;
	data?: T;
};

export function emit(operation: SocketOperation.UpdateCombatTracker, data: CombatSocketBaseData): void;
export function emit(operation: SocketOperation.EdgeModificationData, data: EdgeModificationData): void;
export function emit<T extends { [key: string]: unknown }>(operation: SocketOperation, data?: T): void {
	const payload: SocketPayload<T> = {
		operation,
		data,
	};

	game.socket.emit(SOCKET_NAME, payload);
}
