const chatBox = document.getElementById('chat-window');
const historyList = document.getElementById('historyList');

function addHistoryItem(text) {
	const item = document.createElement('div');
	item.className = 'history-item';
	item.innerText = text;
	item.onclick = () => {
		document.getElementById('userInput').value = text;
		sendMessage();
	};
	historyList.appendChild(item);
}

function sendMessage() {
	const input = document.getElementById('userInput');
	const text = input.value.trim();
	if (!text) return;

	// Display user's message
	const userMsg = document.createElement('div');
	userMsg.className = 'message user';
	userMsg.innerText = text;
	chatBox.appendChild(userMsg);
	input.value = '';

	addHistoryItem(text);

	// Show 'Brainstorming...' immediately
	const botMsg = document.createElement('div');
	botMsg.className = 'message bot';
	botMsg.innerText = '⌛ Brainstorming...';
	chatBox.appendChild(botMsg);
	chatBox.scrollTop = chatBox.scrollHeight;

	// Start fetching the response
	fetch('/chat', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ message: text }),
	})
		.then((res) => res.json())
		.then((data) => {
			// Clear 'Brainstorming...'
			// botMsg.innerText = '';
			// botMsg.innerHTML = `<img src="static/bot.png" alt="Bot" class="bot-icon">`;

			// let i = 0;
			// function typeBotText() {
			// 	if (i < data.response.length) {
			// 		botMsg.textContent += data.response.charAt(i);
			// 		i++;
			// 		chatBox.scrollTop = chatBox.scrollHeight;
			// 		setTimeout(typeBotText, 20);
			// 	}
			// }
			botMsg.innerHTML = `
	<img src="/static/bot.png" alt="Bot" class="bot-icon">
	<span class="bot-text"></span>
`;
			const botTextSpan = botMsg.querySelector('.bot-text');

			let i = 0;
			function typeBotText() {
				if (i < data.response.length) {
					botTextSpan.textContent += data.response.charAt(i);
					i++;
					chatBox.scrollTop = chatBox.scrollHeight;
					setTimeout(typeBotText, 20);
				}
			}
			typeBotText();
		})
		.catch(() => {
			botMsg.innerText = '⚠️ Oops, something went wrong.';
		});
}

function toggleSidebar() {
	const sidebar = document.getElementById('sidebar');
	sidebar.classList.toggle('hidden');

	const main = document.querySelector('.main');
	if (sidebar.classList.contains('hidden')) {
		main.style.marginLeft = '0';
	} else {
		main.style.marginLeft = '250px';
	}
}

document.getElementById('userInput').addEventListener('keydown', function (e) {
	if (e.key === 'Enter') sendMessage();
});

window.onload = () => {
	const welcome = document.getElementById('welcomeOverlay');
	const main = document.getElementById('mainContent');

	setTimeout(() => {
		welcome.style.opacity = '0';
		setTimeout(() => {
			welcome.style.display = 'none';
			main.style.display = 'block';
		}, 1000);
	}, 3000);
};
