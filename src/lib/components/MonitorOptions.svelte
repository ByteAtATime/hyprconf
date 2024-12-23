<script lang="ts">
	import type { Monitor } from '$lib/monitors';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Alert from '$lib/components/ui/alert';
	import { Switch } from '$lib/components/ui/switch';
	import { Settings2, Info, TriangleAlert } from 'lucide-svelte';
	import { Command } from '@tauri-apps/plugin-shell';

	type Props = {
		monitor: Monitor;
		updateMonitors: () => Promise<void>;
	};

	const { monitor, updateMonitors }: Props = $props();

	let width = $state(monitor.width);
	let height = $state(monitor.height);
	let refreshRate = $state(monitor.refreshRate);
	let scales = $state([monitor.scale]);
	let scale = $derived(scales[0]);

	let transformRotation = $state(monitor.transform & 0b11);
	let transformFlip = $state(monitor.transform & 0b100);

	const availableModes = monitor.availableModes.map((mode) => {
		const [resolution, rate] = mode.split('@');
		const [w, h] = resolution.split('x').map(Number);
		return { width: w, height: h, rate: parseFloat(rate) };
	});
	const currentResolutionRefreshRates = availableModes
		.filter((m) => m.width === width && m.height === height)
		.map((m) => m.rate);

	const transformLabels = {
		0: 'Normal',
		1: '90° Rotation',
		2: '180° Rotation',
		3: '270° Rotation'
	};

	const revertChanges = () => {
		width = monitor.width;
		height = monitor.height;
		refreshRate = monitor.refreshRate;
		scales = [monitor.scale];
		transformRotation = monitor.transform & 0b11;
		transformFlip = monitor.transform & 0b100;
	};

	const applyChanges = async () => {
		const transform = transformRotation | transformFlip;
		const value = `${monitor.name},${width}x${height}@${refreshRate.toFixed(2)},${monitor.x}x${monitor.y},${scale},transform,${transform}`;
		await Command.create('hyprctl', ['keyword', 'monitor', value]).execute();

		await updateMonitors();
	};
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-semibold leading-none tracking-tight">{monitor.name}</h2>
		<div class="flex flex-col items-end">
			<span class="text-sm text-muted-foreground">
				{monitor.width}x{monitor.height} @ {monitor.refreshRate}Hz
			</span>
			<span class="text-sm text-muted-foreground">
				{monitor.description}
			</span>
		</div>
	</div>

	<div class="w-full">
		<Tabs.Root value="basic" class="space-y-4">
			<Tabs.List class="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1">
				<Tabs.Trigger value="basic" class="inline-flex items-center gap-2">
					<Settings2 class="h-4 w-4" />
					<span>Display Settings</span>
				</Tabs.Trigger>
				<Tabs.Trigger value="info" class="inline-flex items-center gap-2">
					<Info class="h-4 w-4" />
					<span>Info</span>
				</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="basic">
				<Card.Root class="p-2">
					<Card.Header>
						<Card.Title>Display Settings</Card.Title>
					</Card.Header>

					<Card.Content class="space-y-8">
						<div>
							<div class="grid grid-cols-2 gap-6">
								<div class="space-y-2">
									<Label class="text-sm font-medium">Resolution</Label>
									<Select.Root
										type="single"
										value="{width}x{height}"
										onValueChange={(res) => {
											const [w, h] = res.split('x').map(Number);
											width = w;
											height = h;
										}}
									>
										<Select.Trigger class="w-full">
											<span class="flex items-center gap-2">
												{width}x{height}
											</span>
										</Select.Trigger>
										<Select.Content>
											{#each [...new Set(availableModes.map((m) => `${m.width}x${m.height}`))] as resolution}
												<Select.Item value={resolution}>{resolution}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</div>

								<div class="space-y-2">
									<Label class="text-sm font-medium">Refresh Rate</Label>
									<Select.Root
										type="single"
										value={refreshRate.toString()}
										onValueChange={(rate) => (refreshRate = parseFloat(rate))}
									>
										<Select.Trigger class="w-full">
											<span class="flex items-center gap-2">
												{refreshRate} Hz
											</span>
										</Select.Trigger>
										<Select.Content>
											{#each currentResolutionRefreshRates as rate}
												<Select.Item value={rate.toString()}>{rate} Hz</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</div>
							</div>
						</div>

						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<Label class="text-sm font-medium">Scale Factor</Label>
								<span class="text-sm font-medium">{scale}x</span>
							</div>
							<Slider
								bind:value={scales}
								min={0.5}
								max={3}
								step={0.25}
								class="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
							/>
							<p class="mt-1 text-xs text-muted-foreground">
								Effective resolution: {Math.round(width / scale)}x{Math.round(height / scale)}
							</p>

							{#if Math.round(width / scale) !== width / scale || Math.round(height / scale) !== height / scale}
								<Alert.Root>
									<TriangleAlert class="h-4 w-4" />
									<Alert.Title>Not an integer divisor!</Alert.Title>
									<Alert.Description>
										This scale factor will result in a non-integer resolution. This may cause visual
										artifacts. You will also have to set <code
											>debug:disable_scale_checks = true</code
										> in your Hyprland config.
									</Alert.Description>
								</Alert.Root>
							{/if}
						</div>

						<div>
							<div class="grid grid-cols-2 gap-6">
								<div class="space-y-2">
									<Label class="text-sm font-medium">Rotation</Label>
									<Select.Root
										type="single"
										value={transformRotation.toString()}
										onValueChange={(r) => (transformRotation = parseInt(r))}
									>
										<Select.Trigger class="w-full">
											<span class="flex items-center gap-2">
												{transformLabels[transformRotation]}
											</span>
										</Select.Trigger>
										<Select.Content>
											{#each Object.entries(transformLabels) as [value, label]}
												<Select.Item {value}>{label}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</div>

								<div class="space-y-2">
									<Label class="text-sm font-medium">Flip Display</Label>
									<div class="flex h-10 items-center space-x-2 rounded-md py-3">
										<Switch
											checked={transformFlip === 0b100}
											onCheckedChange={(c) => (transformFlip = c ? 0b100 : 0)}
										/>
										<span class="text-sm text-muted-foreground">
											{transformFlip === 0b100 ? 'Flipped' : 'Normal'}
										</span>
									</div>
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>

			<Tabs.Content value="info">
				<Card.Root class="p-2">
					<Card.Header>
						<Card.Title>Monitor Information</Card.Title>
					</Card.Header>

					<Card.Content class="space-y-8">
						<div>
							<div class="grid grid-cols-2 gap-6">
								<div class="space-y-2">
									<Label class="text-sm font-medium">Manufacturer</Label>
									<p class="font-bold">{monitor.make}</p>
								</div>

								<div class="space-y-2">
									<Label class="text-sm font-medium">Model</Label>
									<p class="font-bold">{monitor.model}</p>
								</div>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-6">
							<div class="space-y-2">
								<Label class="text-sm font-medium">Serial Number</Label>
								<p class="font-bold">{monitor.serial}</p>
							</div>

							<div class="space-y-2">
								<Label class="text-sm font-medium">Display Name</Label>
								<p class="font-bold">{monitor.name}</p>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-6">
							<div class="space-y-2">
								<Label class="text-sm font-medium">Resolution</Label>
								<p class="font-bold">{monitor.width}x{monitor.height}</p>
							</div>

							<div class="space-y-2">
								<Label class="text-sm font-medium">Refresh Rate</Label>
								<p class="font-bold">{monitor.refreshRate.toFixed(2)} Hz</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
		</Tabs.Root>

		<div class="mt-6 flex justify-end gap-3">
			<Button variant="outline" onclick={revertChanges}>Cancel</Button>
			<Button variant="default" onclick={applyChanges}>Apply Changes</Button>
		</div>
	</div>
</div>
