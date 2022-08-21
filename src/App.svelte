<script>
	import Modal from "./Modal.svelte";
	import Hoverable from "./Hoverable.svelte";
	import Cookies from "js-cookie";

	let currentAnime;
	let completedAnime;
	let showLinkModal = false;
	let showEditModal = false;
	let animeIndex = 0;
	let tempAnimeLink = "";
	let tempAnimeScore = 0;
	let tempAnimeProgress = 0;
	let tempAnimeStatus = "";
	let AnimeStatus = [
		{ value: "COMPLETED", text: "Completed" },
		{ value: "CURRENT", text: "Current" },
		{ value: "PAUSED", text: "Paused" },
		{ value: "DROPPED", text: "Dropped" },
	];

	async function request(url = "", method, data, headers) {
		const response = await fetch(url, {
			method: method,
			mode: "cors",
			headers: headers,
			body: data,
			credentials: "include",
		});
		return response.json();
	}

	let animePromise = Promise.resolve([]);

	console.log(Cookies.get("token"));
	// slight optimization to store data in local storage and compare with anilist before making big request and link matching etc.
	// before making request to anilist for anime, make request for user last updated
	// update last updated date when changes are made on site
	// only make full request to anilist if date last updated > sites date last updated
	// or add a button to "sync" with anilist in cases where changes are made through anilist while site is open and a change is made on site which overwrites the date change
	// matt- consider polling or double queries
	if (Cookies.get("token")) {
		animePromise = request(`SERVER_HOST/animeSchedule`, "GET").then(
			(animeRes) => {
				console.log(animeRes);
				currentAnime = animeRes.current.lists[0];
				completedAnime = animeRes.completed.lists[0];
				return animeRes;
			}
		);
	}

	const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Other"];
</script>

<!-- possibly make a "guest" which can view my current anime without the ability to update anything -->
{#if !Cookies.get("token")}
	<main>
		<!-- 1 -->
		<a
			href={`https://anilist.co/api/v2/oauth/authorize?client_id=CLIENT_ID&redirect_uri=SERVER_HOST/login&response_type=code`}
			>test</a
		>
	</main>
{:else}
	{#await animePromise}
		<main>
			<h1 class="text-white">Loading...</h1>
		</main>
	{:then animes}
		{#if animes == "Account has no anime" || animes == "Account has no currently watching anime"}
			<main>
				<h1 class="text-white">{animes}</h1>
			</main>
		{:else}
			<div
				class="flex flex-row space-x-2 w-10/12 mx-auto sticky top-5 z-10 bg-gray-700 p-2 rounded-lg shadow-xl"
			>
				{#each days as day, k}
					<h2 class="font-bold text-white text-center w-full">
						{day}
					</h2>
				{/each}
			</div>
			<div class="flex flex-row space-x-2 w-10/12 mx-auto mt-5">
				{#each days as day, k}
					<div class="flex flex-col space-y-2 w-1/8 items-center">
						{#each currentAnime.entries as anime, i}
							{#if (anime.media.nextAiringEpisode && new Date(anime.media.nextAiringEpisode.airingAt * 1000).getDay() == k) || (!anime.media.nextAiringEpisode && k == 7)}
								<Hoverable let:hovering={active}>
									<!-- overflow-hidden -->
									<div
										class="w-full rounded-xl shadow-md overflow-hidden relative"
									>
										<a href={anime.link} target="_blank">
											<img
												class="w-full"
												src={anime.media.coverImage
													.extraLarge}
												alt="{anime.media.title
													.english} coverimage"
											/>
										</a>
										<div
											class="bg-white w-full h-10 absolute transition transform duration-300 ease-in-out bg-opacity-80 flex items-center justify-around"
											class:-translate-y-10={active}
										>
											<button
												class="border-2 text-red-600 border-red-600 rounded-md inline-block h-7 w-7 text-center hover:bg-red-600 hover:text-white"
												on:click={() => {
													anime.progress -= 1;
													request(
														`SERVER_HOST/updateAnime`,
														"POST",
														JSON.stringify({
															id: anime.id,
															progress:
																anime.progress,
															status: anime.status,
															score: anime.score,
														}),
														{
															"Content-Type":
																"application/json",
															Accept: "application/json",
														}
													);
												}}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-6 w-6"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M20 12H4"
													/>
												</svg>
											</button>
											<p class="text-lg">
												{anime.progress}
												/
												{#if anime.media.episodes == null}
													?
												{:else}
													{anime.media.episodes}
												{/if}
											</p>
											<button
												class="border-2 text-green-600 border-green-600 rounded-md inline-block h-7 w-7 text-center hover:bg-green-600 hover:text-white"
												on:click={() => {
													if (
														anime.progress + 1 ==
														anime.media.episodes
													) {
														animeIndex = i;
														tempAnimeLink =
															anime.link;
														tempAnimeScore =
															anime.score;
														// passing the updated info rather than changing it on click since the user might click off and the info should not stick
														tempAnimeProgress =
															anime.progress + 1;
														tempAnimeStatus =
															"COMPLETED";
														showEditModal = true;
													} else {
														anime.progress += 1;
														request(
															`SERVER_HOST/updateAnime`,
															"POST",
															JSON.stringify({
																id: anime.id,
																progress:
																	anime.progress,
																status: anime.status,
																score: anime.score,
															}),
															{
																"Content-Type":
																	"application/json",
																Accept: "application/json",
															}
														);
													}
												}}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-6 w-6"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M12 6v6m0 0v6m0-6h6m-6 0H6"
													/>
												</svg>
											</button>
										</div>
										<div
											class="bg-white w-10 h-16 space-y-1 absolute transition transform duration-300 ease-in-out bg-opacity-80 -top-16 right-0 rounded-bl-xl flex flex-col items-center justify-center"
											class:translate-y-16={active}
										>
											<button
												class="border-0 h-6 w-6"
												on:click={() => {
													showEditModal = true;
													animeIndex = i;
													tempAnimeLink = anime.link;
													tempAnimeScore =
														anime.score;
													tempAnimeProgress =
														anime.progress;
													tempAnimeStatus =
														anime.status;
												}}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-6 w-6 text-yellow-600"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
													/>
												</svg>
											</button>
											<button
												class="border-0 h-6 w-6"
												on:click={() => {
													showLinkModal = true;
													animeIndex = i;
													tempAnimeLink = anime.link;
												}}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-6 w-6 text-blue-600"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
													/>
												</svg>
											</button>
										</div>
										{#if !anime.media.nextAiringEpisode}
											<div
												class="bg-white w-8 h-8 absolute bg-opacity-80 top-0 left-0 rounded-br-xl flex items-center justify-center shadow-2xl"
											>
												<p
													class="text-red-600 font-bold"
												>
													{anime.media.episodes -
														anime.progress}
												</p>
											</div>
										{:else if anime.media.nextAiringEpisode.episode - 1 > anime.progress}
											<div
												class="bg-white w-8 h-8 absolute bg-opacity-80 top-0 left-0 rounded-br-xl flex items-center justify-center shadow-2xl"
											>
												<p
													class="text-red-600 font-bold"
												>
													{anime.media
														.nextAiringEpisode
														.episode -
														anime.progress -
														1}
												</p>
											</div>
										{/if}
									</div>
								</Hoverable>
							{/if}
						{/each}
					</div>
				{/each}
			</div>
			{#if showLinkModal}
				<Modal on:close={() => (showLinkModal = false)}>
					<form
						class="flex space-x-2 items-center justify-center mx-auto"
						on:submit|preventDefault={() => {
							currentAnime.entries[animeIndex].link =
								tempAnimeLink;
							request(
								`SERVER_HOST/setAnimeLink`,
								"POST",
								JSON.stringify({
									id: currentAnime.entries[animeIndex]
										.mediaId,
									link: currentAnime.entries[animeIndex].link,
								}),
								{
									"Content-Type": "application/json",
									Accept: "application/json",
								}
							);
							showLinkModal = false;
						}}
					>
						<label for="animeLink">Link:</label>
						<input
							class="w-96 p-2 border-none rounded-lg bg-gray-700 "
							type="text"
							id="animeLink"
							name="animeLink"
							bind:value={tempAnimeLink}
						/>
						<button
							class="border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-700 py-2 px-3 rounded-lg"
							>Submit</button
						>
					</form>
				</Modal>
			{/if}
			{#if showEditModal == true}
				<Modal on:close={() => (showEditModal = false)}>
					<div class="flex flex-row w-240 h-172">
						<form
							class="flex flex-row w-full h-full"
							on:submit|preventDefault={() => {
								currentAnime.entries[animeIndex].score =
									tempAnimeScore;
								currentAnime.entries[animeIndex].status =
									tempAnimeStatus;
								currentAnime.entries[animeIndex].progress =
									tempAnimeProgress;

								// if status == completed
								// create request to delete link in my db
								// remove anime entry in array

								request(
									`SERVER_HOST/updateAnime`,
									"POST",
									JSON.stringify({
										id: currentAnime.entries[animeIndex].id,
										progress:
											currentAnime.entries[animeIndex]
												.progress,
										status: currentAnime.entries[animeIndex]
											.status,
										score: currentAnime.entries[animeIndex]
											.score,
									}),
									{
										"Content-Type": "application/json",
										Accept: "application/json",
									}
								);
								showEditModal = false;
							}}
						>
							<div class="flex flex-col w-1/2">
								<img
									class="w-full rounded-lg shadow-xl"
									src={currentAnime.entries[animeIndex].media
										.coverImage.extraLarge}
									alt="{currentAnime.entries[animeIndex].media
										.title.english} coverimage"
								/>
							</div>
							<div class="flex flex-col w-1/2 p-4 space-y-2">
								<h2 class="text-2xl">
									{currentAnime.entries[animeIndex].media
										.title.english}
								</h2>
								<div class="flex flex-row">
									<h2 class="p-2">Status:</h2>
									<select
										class="p-2 border-none rounded-lg bg-gray-700 mr-auto w-auto"
										bind:value={tempAnimeStatus}
									>
										{#each AnimeStatus as status}
											<option value={status.value}
												>{status.text}</option
											>
										{/each}
									</select>
								</div>
								<div class="flex flex-row">
									<h2 class="p-2">Episodes:</h2>
									<input
										class="p-2 border-none rounded-lg bg-gray-700 w-16"
										type="number"
										bind:value={tempAnimeProgress}
										min="0"
										max={currentAnime.entries[animeIndex]
											.media.episodes}
										step="1"
									/>
									<p class="p-2">
										/ {currentAnime.entries[animeIndex]
											.media.episodes}
									</p>
								</div>
								<div class="flex flex-row mr-auto w-auto">
									<h2 class="p-2">Score:</h2>
									<input
										class="p-2 border-none rounded-lg bg-gray-700"
										type="number"
										bind:value={tempAnimeScore}
										min="0"
										max="10"
										step="1"
									/>
								</div>
								<button
									class="ml-auto border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-700 py-2 px-3 rounded-lg"
									>Submit</button
								>
								<div
									class="grid grid-flow-row grid-cols-3 overflow-y-auto overscroll-none gap-4 h-4/6 p-2"
								>
									{#if animes.length === 1}
										<h2>
											Add completed anime to your anilist
											for score comparisons.
										</h2>
									{:else}
										{#each completedAnime.entries as anime}
											{#if anime.score == tempAnimeScore * 10}
												<img
													class="w-full rounded-lg"
													src={anime.media.coverImage
														.extraLarge}
													alt="{anime.media.title
														.english} coverimage"
												/>
											{/if}
										{/each}
									{/if}
								</div>
							</div>
						</form>
					</div>
				</Modal>
			{/if}
		{/if}
	{/await}
{/if}

<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>
