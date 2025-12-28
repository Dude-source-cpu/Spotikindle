let TOKEN = null;

function loadToken() {
  const code = prompt("Enter login code:");
  TOKEN = localStorage.getItem("kindlify_" + code);
}

loadToken();

function headers() {
  return { Authorization: `Bearer ${TOKEN}` };
}

async function api(endpoint, method = "POST") {
  await fetch(
    `https://api.spotify.com/v1/me/player/${endpoint}`,
    { method, headers: headers() }
  );
}

function togglePlay() {
  api("play");
}

function next() {
  api("next");
}

function previous() {
  api("previous");
}

function shuffle() {
  api("shuffle?state=true", "PUT");
}

async function update() {
  const res = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    { headers: headers() }
  );
  if (!res.ok) return;

  const data = await res.json();
  if (!data || !data.item) return;

  albumArt.src = data.item.album.images[0].url;
  title.textContent = data.item.name;
  artist.textContent =
    data.item.artists.map(a => a.name).join(", ");
}

setInterval(update, 10000);
update();
