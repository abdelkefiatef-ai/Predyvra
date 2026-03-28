fetch("https://api.openai.com/v1/chat/completions").then(r => console.log(r.status)).catch(e => console.log(e.message));
