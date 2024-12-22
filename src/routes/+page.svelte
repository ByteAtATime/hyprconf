<script lang="ts">
	import { Command } from '@tauri-apps/plugin-shell';
	import { type Monitor, monitorSchema } from '$lib/monitors';
	import MonitorsDisplay from '$lib/components/MonitorsDisplay.svelte';
	import MonitorOptions from '$lib/components/MonitorOptions.svelte';

	let monitors = $state<Monitor[]>();
	let selectedMonitor = $state<Monitor | undefined>();

	const updateMonitors = async () => {
		const monitorData = await Command.create('hyprctl', ['monitors', '-j']).execute();
		monitors = monitorSchema.array().parse(JSON.parse(monitorData.stdout));
	};

	updateMonitors();
</script>

<main class="mx-auto max-w-screen-md px-4">
	<MonitorsDisplay monitors={monitors ?? []} bind:selectedMonitor />

	<div class="h-4"></div>

	{#if selectedMonitor}
		{#key selectedMonitor.id}
			<MonitorOptions monitor={selectedMonitor} {updateMonitors} />
		{/key}
	{:else}
		<p class="text-center text-gray-500">Select a monitor to view options</p>
	{/if}
</main>
