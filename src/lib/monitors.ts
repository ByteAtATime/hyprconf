import { z } from 'zod';

export const monitorSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string(),
	make: z.string(),
	model: z.string(),
	serial: z.string(),
	width: z.number(),
	height: z.number(),
	refreshRate: z.number(),
	x: z.number(),
	y: z.number(),
	activeWorkspace: z.object({ id: z.number(), name: z.string() }),
	specialWorkspace: z.object({ id: z.number(), name: z.string() }),
	reserved: z.array(z.number()),
	scale: z.number(),
	transform: z.number(),
	focused: z.boolean(),
	dpmsStatus: z.boolean(),
	vrr: z.boolean(),
	solitary: z.string(),
	activelyTearing: z.boolean(),
	disabled: z.boolean(),
	currentFormat: z.string(),
	mirrorOf: z.string(),
	availableModes: z.array(z.string())
});
export type Monitor = z.infer<typeof monitorSchema>;
