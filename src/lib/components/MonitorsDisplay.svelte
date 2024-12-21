<script lang="ts">
	import { onMount } from 'svelte';
	import type { Monitor } from '$lib/monitors';
	import * as Card from '$lib/components/ui/card';

	type Props = {
		monitors: Monitor[];
	};

	const { monitors }: Props = $props();
	let container: HTMLDivElement | null = $state(null);
	let containerRect = $state({ width: 0, height: 0 });

	$inspect(containerRect);

	onMount(() => {
		if (!container) return;

		const resizeObserver = new ResizeObserver((entries) => {
			const entry = entries[0];
			containerRect = { width: entry.contentRect.width, height: entry.contentRect.height };
		});

		resizeObserver.observe(container);
		return () => resizeObserver.disconnect();
	});

	function getMonitorDimensions(monitor: Monitor) {
		const isRotated = monitor.transform % 2 === 1;
		return {
			width: isRotated ? monitor.height / monitor.scale : monitor.width / monitor.scale,
			height: isRotated ? monitor.width / monitor.scale : monitor.height / monitor.scale
		};
	}

	let bounds = $derived(
		monitors.reduce(
			(acc, m) => {
				const dims = getMonitorDimensions(m);
				return {
					minX: Math.min(acc.minX, m.x),
					minY: Math.min(acc.minY, m.y),
					maxX: Math.max(acc.maxX, m.x + dims.width),
					maxY: Math.max(acc.maxY, m.y + dims.height)
				};
			},
			{
				minX: Infinity,
				minY: Infinity,
				maxX: -Infinity,
				maxY: -Infinity
			}
		)
	);

	let containerWidth = $derived(bounds.maxX - bounds.minX);
	let containerHeight = $derived(bounds.maxY - bounds.minY);

	let displayScale = $derived(
		Math.min(
			containerRect.width / (containerWidth * 2),
			containerRect.height / (containerHeight * 2)
		)
	);

	let centerX = $derived(bounds.minX + containerWidth / 2);
	let centerY = $derived(bounds.minY + containerHeight / 2);

	let offsetX = $derived(containerRect.width / 2 - centerX * displayScale);
	let offsetY = $derived(containerRect.height / 2 - centerY * displayScale);
</script>

<Card.Root class="relative aspect-video" bind:ref={container}>
	{#each monitors as monitor}
		{@const dims = getMonitorDimensions(monitor)}
		<Card.Root
			class="absolute rounded"
			style="
        left: {((monitor.x * displayScale + offsetX) / containerRect.width) * 100}%;
        top: {((monitor.y * displayScale + offsetY) / containerRect.height) * 100}%;
        width: {((dims.width * displayScale) / containerRect.width) * 100}%;
        height: {((dims.height * displayScale) / containerRect.height) * 100}%;
      "
		>
			<Card.Header class="space-y-0 p-3">
				<Card.Title class="text-lg">{monitor.name}</Card.Title>
				<Card.Description>{monitor.width}x{monitor.height}</Card.Description>
			</Card.Header>
		</Card.Root>
	{/each}
</Card.Root>

<!-- this doesn't do anything but removing it breaks the build so it gets to stay -->
<style>
</style>
