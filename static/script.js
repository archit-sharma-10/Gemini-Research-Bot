const historyList = document.getElementById('historyList');
const chatBox = document.getElementById('chatBox');

function addHistoryItem(text) {
	const item = document.createElement('div');
	item.className = 'history-item';
	item.innerText = text;
	item.onclick = () => alert('Feature coming soon: Load this conversation.');
	historyList.appendChild(item);
}

function sendMessage() {
	const input = document.getElementById('userInput');
	const text = input.value.trim();
	if (!text) return;

	const userMsg = document.createElement('div');
	userMsg.className = 'message user';
	userMsg.innerText = text;
	chatBox.appendChild(userMsg);
	input.value = '';

	addHistoryItem(text);

	fetch('/chat', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ message: text }),
	})
		.then((res) => res.json())
		.then((data) => {
			const botMsg = document.createElement('div');
			botMsg.className = 'message assistant';
			botMsg.innerText = data.response;
			chatBox.appendChild(botMsg);
			chatBox.scrollTop = chatBox.scrollHeight;
		})
		.catch((err) => {
			const botMsg = document.createElement('div');
			botMsg.className = 'message assistant';
			botMsg.innerText = '⚠️ Oops, something went wrong.';
			chatBox.appendChild(botMsg);
		});
}

document.getElementById('userInput').addEventListener('keydown', function (e) {
	if (e.key === 'Enter') sendMessage();
});
