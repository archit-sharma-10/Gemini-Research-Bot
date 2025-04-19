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
			botMsg.className = 'message bot';
			botMsg.innerText = data.response;
			chatBox.appendChild(botMsg);
			chatBox.scrollTop = chatBox.scrollHeight;
		})
		.catch(() => {
			const botMsg = document.createElement('div');
			botMsg.className = 'message bot';
			botMsg.innerText = '⚠️ Oops, something went wrong.';
			chatBox.appendChild(botMsg);
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
