// ==========================================================================
// МГНОВЕННЫЙ РЕДИРЕКТ ИЗ URL СТАРОГО РЕПОЗИТОРИЯ
// ==========================================================================
(function checkUrlMigration() {
    if (window.location.href.includes('notepad-helper-2')) {
        const newUrl = window.location.href.replace('notepad-helper-2', 'oracle-notepad');
        window.location.replace(newUrl);
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const projectName = document.getElementById('project-name');
    const btnSettings = document.getElementById('btn-settings');
    const exportMenu = document.getElementById('export-menu');
    const btnExit = document.getElementById('btn-exit');

    const gridLayout = document.querySelector('.grid-layout');
    const panelInfo = document.getElementById('panel-info');
    const btnDockLeft = document.getElementById('btn-dock-left');
    const btnChatMenu = document.getElementById('btn-chat-menu');

    const codeEditor = document.getElementById('code-editor');
    const toggleKeyboard = document.getElementById('toggle-keyboard');
    const codingKeyboard = document.getElementById('coding-keyboard');
    const toggleHints = document.getElementById('toggle-hints');

    const btnToggleNotes = document.getElementById('btn-toggle-notes');
    const btnCloseNotes = document.getElementById('btn-close-notes');
    const notesPanel = document.getElementById('notes-panel');
    const notesEditor = document.getElementById('notes-editor');
    
    const oracleInput = document.getElementById('oracle-input');
    const sendBtn = document.getElementById('send-btn');
    const chatFlow = document.getElementById('chat-flow');
    const welcomeBlock = document.getElementById('welcome-block');
    const pinZone = document.getElementById('pin-zone');
    const pinUpload = document.getElementById('pin-upload');

    const metaName = document.getElementById('meta-name');
    const metaAuthor = document.getElementById('meta-author');

    // ДОКИНГ И ШТОРКИ
    btnDockLeft.addEventListener('click', () => {
        if (window.innerWidth >= 1024) {
            gridLayout.classList.toggle('left-docked');
            panelInfo.classList.toggle('docked');
        } else {
            panelInfo.classList.remove('mobile-open');
        }
    });

    btnExit.addEventListener('click', () => {
        if (window.innerWidth < 1024) {
            panelInfo.classList.add('mobile-open');
        } else {
            if(confirm("Выйти из Notepad Helper?")) alert("Выход выполнен успешно.");
        }
    });

    btnChatMenu.addEventListener('click', () => {
        if (window.innerWidth < 1024) document.getElementById('panel-oracle').classList.toggle('mobile-open');
    });

    btnSettings.addEventListener('click', (e) => {
        e.stopPropagation();
        exportMenu.classList.toggle('active');
    });
    document.addEventListener('click', () => exportMenu.classList.remove('active'));

    btnToggleNotes.addEventListener('click', () => notesPanel.classList.add('active'));
    btnCloseNotes.addEventListener('click', () => notesPanel.classList.remove('active'));

    // МОБИЛЬНАЯ КЛАВИАТУРА CODING
    const codingKeys = ['{', '}', '[', ']', '(', ')', ';', '"', "'", '=', '<', '>', '/', '$', '_', 'Tab'];
    codingKeys.forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'key-btn';
        btn.textContent = key;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (navigator.vibrate) navigator.vibrate(15);
            insertAtCursor(codeEditor, key === 'Tab' ? '    ' : key);
        });
        codingKeyboard.appendChild(btn);
    });

    toggleKeyboard.addEventListener('click', () => {
        codingKeyboard.classList.toggle('active');
        toggleKeyboard.classList.toggle('active');
    });

    toggleHints.addEventListener('click', () => {
        toggleHints.classList.toggle('active');
        if (toggleHints.classList.contains('active')) alert("Легкие подсказки активированы.");
    });

    function insertAtCursor(textarea, text) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentVal = textarea.value;
        textarea.value = currentVal.substring(0, start) + text + currentVal.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
        saveState();
    }

    // ИИ ОРАКУЛ И АГЕНТ
    const modeToggle = document.getElementById('mode-toggle');
    const modeLabel = document.getElementById('mode-label');
    let oracleMode = 'dialogue'; 
    let agentAttempts = 20;

    modeToggle.addEventListener('click', () => {
        oracleMode = (oracleMode === 'dialogue') ? 'agent' : 'dialogue';
        modeLabel.textContent = oracleMode === 'agent' ? `Агент (${agentAttempts})` : 'Диалог';
        modeToggle.classList.toggle('agent-active');
    });

    oracleInput.addEventListener('input', () => {
        oracleInput.style.height = 'auto';
        oracleInput.style.height = Math.min(oracleInput.scrollHeight, 120) + 'px';
    });

    function appendBubble(htmlContent, sender) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender === 'user' ? 'user-bubble' : 'ai-bubble'}`;
        bubble.innerHTML = htmlContent;
        chatFlow.appendChild(bubble);
        chatFlow.scrollTop = chatFlow.scrollHeight;
    }

    function sendToOracle() {
        const text = oracleInput.value.trim();
        if (!text) return;

        if (oracleMode === 'agent' && agentAttempts <= 0) {
            alert("Лимит попыток Агента исчерпан. Переход в режим Диалога.");
            oracleMode = 'dialogue';
            modeLabel.textContent = 'Диалог';
            modeToggle.classList.remove('agent-active');
        }

        if (welcomeBlock) welcomeBlock.classList.add('hidden');
        appendBubble(text, 'user');
        oracleInput.value = '';
        oracleInput.style.height = 'auto';

        setTimeout(() => {
            if (oracleMode === 'agent') {
                agentAttempts--;
                modeLabel.textContent = `Агент (${agentAttempts})`;
                
                const isCodeReq = text.toLowerCase().includes('код') || text.toLowerCase().includes('функц') || text.toLowerCase().includes('сделай');
                let aiContent = `<div>🤖 <strong>Агент:</strong> Запрос принят.</div>`;
                
                if (isCodeReq) {
                    aiContent += `
                        <div style="margin-top:8px; font-family:monospace; font-size:12px; background:rgba(0,0,0,0.35); padding:8px; border-radius:8px; color: #a8ffb2;">
                            // Сгенерированный патч кода...
                        </div>
                        <button class="agent-action-btn" onclick="applyAgentCode()">
                            <span class="material-symbols-rounded" style="font-size:18px;">done_all</span> Применить к коду
                        </button>`;
                } else {
                    aiContent += `<div style="margin-top:6px;">Анализ завершен. Ожидаю задачу по коду.</div>`;
                }
                appendBubble(aiContent, 'ai');
            } else {
                appendBubble(`💬 <strong>Оракул:</strong> Слушаю тебя. Работаем в режиме свободного диалога.`, 'ai');
            }
        }, 600);
    }

    window.applyAgentCode = function() {
        if(confirm("Разрешить Агенту внедрить патч в редактор?")) {
            codeEditor.value = `// [Агент: патч внедрен]\n` + codeEditor.value;
            alert("Код применен.");
            saveState();
        }
    };

    sendBtn.addEventListener('click', sendToOracle);
    oracleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendToOracle(); }
    });

    pinZone.addEventListener('click', () => pinUpload.click());
    pinUpload.addEventListener('change', (e) => {
        if(e.target.files.length > 0) {
            pinZone.style.borderColor = 'var(--primary)';
            pinZone.querySelector('span:last-child').textContent = `Прикреплено: ${e.target.files[0].name}`;
        }
    });

    // ИМПОРТ И ЭКСПОРТ
    document.getElementById('btn-import-pack').addEventListener('click', () => {
        const fileSelector = document.createElement('input');
        fileSelector.type = 'file';
        fileSelector.accept = '.json, .worldpack, .txt';
        fileSelector.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    if(parsed.projectName) projectName.value = parsed.projectName;
                    if(parsed.metaName) metaName.value = parsed.metaName;
                    if(parsed.metaAuthor) metaAuthor.value = parsed.metaAuthor;
                    if(parsed.code) codeEditor.value = parsed.code;
                    if(parsed.notes) notesEditor.innerHTML = parsed.notes;
                    
                    if (welcomeBlock) welcomeBlock.classList.add('hidden');
                    appendBubble(`📥 Пак "${file.name}" загружен. Контекст системы обновлен.`, 'ai');
                    saveState();
                } catch(err) {
                    codeEditor.value = event.target.result;
                    alert("Загружен текстовый массив.");
                }
            };
            reader.readAsText(file);
        };
        fileSelector.click();
    });

    window.exportData = function(type) {
        const state = { projectName: projectName.value, metaName: metaName.value, metaAuthor: metaAuthor.value, code: codeEditor.value, notes: notesEditor.innerHTML };
        let dataStr = type === 'txt' ? `Проект: ${state.projectName}\n\n=== КОД ===\n${state.code}` : JSON.stringify(state, null, type === 'json' ? 2 : 0);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const a = document.createElement('a');
        a.href = dataUri;
        a.download = `${state.projectName || 'pack'}.${type}`;
        a.click();
    };

    // АВТОСОХРАНЕНИЕ
    function saveState() {
        const state = { projectName: projectName.value, metaName: metaName.value, metaAuthor: metaAuthor.value, code: codeEditor.value, notes: notesEditor.innerHTML };
        localStorage.setItem('notepad_helper_2_5_3', JSON.stringify(state));
    }

    function loadState() {
        const saved = localStorage.getItem('notepad_helper_2_5_3');
        if (!saved) return;
        try {
            const state = JSON.parse(saved);
            projectName.value = state.projectName || 'Name_01';
            metaName.value = state.metaName || '';
            metaAuthor.value = state.metaAuthor || '';
            codeEditor.value = state.code || '';
            notesEditor.innerHTML = state.notes || '';
        } catch(e) {}
    }

    [projectName, metaName, metaAuthor, codeEditor].forEach(el => el.addEventListener('input', saveState));
    notesEditor.addEventListener('input', saveState);
    loadState();
});
// ==========================================================================
// СИСТЕМА МИГРАЦИИ РЕПОЗИТОРИЯ (МОДАЛЬНОЕ ОКНО)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('migrationModal');
    const repoInput = document.getElementById('repo-input');
    const btnTry = document.getElementById('btn-try-migration');
    const redirectHint = document.getElementById('redirect-hint');

    // Проверяем, нажимал ли пользователь кнопку "Попробовать" ранее
    const isMigrationAccepted = localStorage.getItem('oracle_notepad_migrated');

    if (!isMigrationAccepted) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }

    // Умный перехват ввода: если вводит старое имя, перенаправляем на новое
    repoInput.addEventListener('input', () => {
        let val = repoInput.value.trim().toLowerCase();
        
        if (val.includes('notepad-helper-2') || val === 'notepad') {
            redirectHint.classList.add('visible');
            setTimeout(() => {
                repoInput.value = 'oracle-notepad';
                redirectHint.classList.remove('visible');
            }, 400);
        }
    });

    // Кнопка подтверждения "Попробовать"
    btnTry.addEventListener('click', () => {
        // Фиксируем выбор в localStorage, чтобы модалка больше не донимала
        localStorage.setItem('oracle_notepad_migrated', 'true');
        modal.classList.add('hidden');
        
        // Дополнительное действие: обновляем имя проекта, если поле пустое или старое
        const projectName = document.getElementById('project-name');
        if (projectName && (projectName.value === 'Name_01' || projectName.value === 'notepad-helper-2')) {
            projectName.value = 'oracle-notepad';
        }
        
        alert("Добро пожаловать в репозиторий oracle-notepad!");
    });
});
