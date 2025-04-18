const chatBox = document.getElementById('chat-window');

// Optional: Add conversation history on side (if you use a panel later)
function addHistoryItem(text) {
	const item = document.createElement('div');
	item.className = 'history-item';
	item.innerText = text;
	item.onclick = () => alert('Feature coming soon: Load this conversation.');
	// document.getElementById('historyList')?.appendChild(item);
}

function sendMessage() {
	const input = document.getElementById('userInput');
	const text = input.value.trim();
	if (!text) return;

	// Show user message
	const userMsg = document.createElement('div');
	userMsg.className = 'message user';
	userMsg.innerText = text;
	chatBox.appendChild(userMsg);
	input.value = '';

	addHistoryItem(text);

	// Send to backend
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

function sendSuggestion(text) {
	document.getElementById('userInput').value = text;
	sendMessage();
}

document.getElementById('userInput').addEventListener('keydown', function (e) {
	if (e.key === 'Enter') sendMessage();
});
