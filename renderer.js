document.getElementById('send-btn').addEventListener('click', () => {
    const query = document.getElementById('user-input').value;
    if (query.trim()) {
        const chat = document.getElementById('chat');
        chat.innerHTML += `<p>You: ${query}</p>`;
        window.electronAPI.sendQuery(query);
        document.getElementById('user-input').value = '';
    }
});

window.electronAPI.onResponse((response) => {
    const chat = document.getElementById('chat');
    chat.innerHTML += `<p>Bot: ${response}</p>`;
});
