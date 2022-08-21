<script>
	import { createEventDispatcher, onDestroy } from "svelte";

	const dispatch = createEventDispatcher();
	const close = () => dispatch("close");

	let modal;

	const handle_keydown = (e) => {
		if (e.key === "Escape") {
			close();
			return;
		}

		if (e.key === "Tab") {
			// trap focus
			const nodes = modal.querySelectorAll("*");
			const tabbable = Array.from(nodes).filter((n) => n.tabIndex >= 0);

			let index = tabbable.indexOf(document.activeElement);
			if (index === -1 && e.shiftKey) index = 0;

			index += tabbable.length + (e.shiftKey ? -1 : 1);
			index %= tabbable.length;

			tabbable[index].focus();
			e.preventDefault();
		}
	};

	const previously_focused =
		typeof document !== "undefined" && document.activeElement;

	if (previously_focused) {
		onDestroy(() => {
			previously_focused.focus();
		});
	}
</script>

<svelte:window on:keydown={handle_keydown} />

<div
	class="fixed top-0 left-0 w-screen h-screen bg-opacity-50 bg-black flex items-center justify-center z-20"
	on:mousedown|self={close}
>
	<div
		class="container w-auto h-auto overflow-auto p-4 rounded-lg bg-gray-800 text-white m-8"
		role="dialog"
		aria-modal="true"
		bind:this={modal}
	>
		<slot />
	</div>
</div>
