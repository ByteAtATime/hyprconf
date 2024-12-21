<script lang="ts">
	import { Command } from '@tauri-apps/plugin-shell';
	import { type Monitor, monitorSchema } from '$lib/monitors';
	import MonitorsDisplay from '$lib/components/MonitorsDisplay.svelte';

	let monitors = $state<Monitor[]>();

	Command.create('hyprctl', ['monitors', '-j'])
		.execute()
		.then((res) => {
			monitors = monitorSchema.array().parse(JSON.parse(res.stdout));
		});
</script>

<main class="mx-auto max-w-screen-md px-4">
	<MonitorsDisplay monitors={monitors ?? []} />

	<pre>{JSON.stringify(monitors, null, 2)}</pre>
</main>
