<script lang="ts">
	import { onMount } from 'svelte';
	import type { PlatformInfo } from '../types.js';

	interface Props {
		/** Platform information from detector */
		platform: PlatformInfo;
		/** Telegram bot username (without @) */
		botUsername: string;
		/** App name to display */
		appName: string;
		/** Auto-redirect after N seconds (0 = no auto-redirect) */
		autoRedirectDelay?: number;
		/** Custom redirect URL (defaults to t.me bot URL) */
		redirectUrl?: string;
		/** Theme color for the page */
		themeColor?: string;
	}

	let {
		platform,
		botUsername,
		appName,
		autoRedirectDelay = 5,
		redirectUrl,
		themeColor = '#0088cc'
	}: Props = $props();

	let countdown = $state(autoRedirectDelay);
	let redirecting = $state(false);

	// Generate Telegram deep link
	const telegramUrl = $derived(
		redirectUrl ||
			`https://t.me/${botUsername}?startapp=${encodeURIComponent(window.location.pathname)}`
	);

	function handleRedirect() {
		redirecting = true;
		window.location.href = telegramUrl;
	}

	onMount(() => {
		if (autoRedirectDelay > 0) {
			const timer = setInterval(() => {
				countdown--;
				if (countdown <= 0) {
					clearInterval(timer);
					handleRedirect();
				}
			}, 1000);

			return () => clearInterval(timer);
		}
	});
</script>

<div class="tma-redirect-container" style="--theme-color: {themeColor}">
	<div class="tma-redirect-card">
		<!-- Icon -->
		<div class="tma-redirect-icon">
			<svg
				width="64"
				height="64"
				viewBox="0 0 64 64"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle cx="32" cy="32" r="32" fill="var(--theme-color)" opacity="0.1" />
				<path
					d="M48 16L16 32L24 36L32 48L40 28L48 16Z"
					fill="var(--theme-color)"
					stroke="var(--theme-color)"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</div>

		<!-- Heading -->
		<h1 class="tma-redirect-title">
			Open in Telegram
		</h1>

		<!-- Description -->
		<p class="tma-redirect-description">
			This page is designed to work within <strong>Telegram Mini App</strong>.
			<br />
			Please open <strong>{appName}</strong> through the Telegram bot.
		</p>

		<!-- Platform info -->
		<div class="tma-redirect-info">
			<div class="info-row">
				<span class="info-label">Current platform:</span>
				<span class="info-value">{platform.type}</span>
			</div>
			<div class="info-row">
				<span class="info-label">Device:</span>
				<span class="info-value">{platform.device} / {platform.os}</span>
			</div>
			<div class="info-row">
				<span class="info-label">Domain:</span>
				<span class="info-value">{platform.domainMode}</span>
			</div>
		</div>

		<!-- Action button -->
		<button
			class="tma-redirect-button"
			class:redirecting
			onclick={handleRedirect}
			disabled={redirecting}
		>
			{#if redirecting}
				Opening Telegram...
			{:else if autoRedirectDelay > 0 && countdown > 0}
				Opening in {countdown}s...
			{:else}
				Open in Telegram
			{/if}
		</button>

		<!-- Help text -->
		<p class="tma-redirect-help">
			Don't have Telegram?
			<a href="https://telegram.org" target="_blank" rel="noopener noreferrer">Download here</a>
		</p>
	</div>
</div>

<style>
	.tma-redirect-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
			sans-serif;
	}

	.tma-redirect-card {
		background: white;
		border-radius: 1rem;
		padding: 2rem;
		max-width: 28rem;
		width: 100%;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		text-align: center;
	}

	.tma-redirect-icon {
		display: flex;
		justify-content: center;
		margin-bottom: 1.5rem;
	}

	.tma-redirect-title {
		font-size: 1.875rem;
		font-weight: 700;
		color: #1a202c;
		margin: 0 0 1rem 0;
	}

	.tma-redirect-description {
		font-size: 1rem;
		color: #4a5568;
		line-height: 1.625;
		margin: 0 0 1.5rem 0;
	}

	.tma-redirect-description strong {
		color: #2d3748;
		font-weight: 600;
	}

	.tma-redirect-info {
		background: #f7fafc;
		border-radius: 0.5rem;
		padding: 1rem;
		margin-bottom: 1.5rem;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
	}

	.info-row:not(:last-child) {
		border-bottom: 1px solid #e2e8f0;
	}

	.info-label {
		font-size: 0.875rem;
		color: #718096;
		font-weight: 500;
	}

	.info-value {
		font-size: 0.875rem;
		color: #2d3748;
		font-weight: 600;
		text-transform: capitalize;
	}

	.tma-redirect-button {
		width: 100%;
		padding: 0.875rem 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		color: white;
		background: var(--theme-color);
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
		margin-bottom: 1rem;
	}

	.tma-redirect-button:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
	}

	.tma-redirect-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.tma-redirect-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.tma-redirect-button.redirecting {
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	.tma-redirect-help {
		font-size: 0.875rem;
		color: #718096;
		margin: 0;
	}

	.tma-redirect-help a {
		color: var(--theme-color);
		text-decoration: none;
		font-weight: 600;
	}

	.tma-redirect-help a:hover {
		text-decoration: underline;
	}

	@media (max-width: 640px) {
		.tma-redirect-card {
			padding: 1.5rem;
		}

		.tma-redirect-title {
			font-size: 1.5rem;
		}

		.tma-redirect-description {
			font-size: 0.875rem;
		}
	}
</style>
