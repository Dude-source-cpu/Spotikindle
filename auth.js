const CLIENT_ID = "YOUR_SPOTIFY_CLIENT_ID";
const REDIRECT = location.origin + location.pathname;
const SCOPES =
  "user-read-playback-state user-modify-playback-state";

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function login() {
  const verifier = crypto.randomUUID();
  sessionStorage.setItem("verifier", verifier);

  const challenge = await sha256(verifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT,
    code_challenge_method: "S256",
    code_challenge: challenge
  });

  location.href =
    "https://accounts.spotify.com/authorize?" + params;
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function handleRedirect() {
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  if (!code) return;

  const verifier = sessionStorage.getItem("verifier");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT,
      code_verifier: verifier
    })
  });

  const data = await res.json();
  const shortCode = generateCode();

  localStorage.setItem("kindlify_" + shortCode, data.access_token);
  document.getElementById("code").textContent =
    "Enter this code on your Kindle: " + shortCode;
}

handleRedirect();
