const urls = [
  "https://api.apifreellm.com/v1/chat/completions",
  "https://apifreellm.com/v1/chat/completions",
  "https://api.apifreellm.vip/v1/chat/completions"
];

async function test() {
  for (const url of urls) {
    try {
      const r = await fetch(url, { method: "POST" });
      console.log(url, r.status);
    } catch (e) {
      console.log(url, e.message);
    }
  }
}
test();
