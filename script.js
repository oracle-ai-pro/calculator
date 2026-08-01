// ==========================================================================
// 0. МГНОВЕННЫЙ РЕДИРЕКТ ИЗ URL СТАРОГО РЕПОЗИТОРИЯ
// ==========================================================================
(function checkUrlMigration() {
    if (window.location.href.includes('notepad-helper-2')) {
        const newUrl = window.location.href.replace('notepad-helper-2', 'oracle-notepad');
        window.location.replace(newUrl);
    }
})();

// ==========================================================================
// 1. ЕДИНАЯ ИНИЦИАЛИЗАЦИЯ И СИСТЕМА
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Навигация и Хедер
    const projectName = document.getElementById('project-name');
    const btnSettings = document.getElementById('btn-settings');
    const exportMenu = document.getElementById('export-menu');
    const btnExit = document.getElementById('btn-exit');

    // Панели и Сетка
    const gridLayout = document.querySelector('.grid-layout');
    const panelInfo = document.getElementById('panel-info');
    const btnDockLeft = document.getElementById('btn-dock-left');
    const btnChatMenu = document.getElementById('btn-chat-menu');

    // Зона Кодинга
    const codeEditor = document.getElementById('code-editor');
    const toggleKeyboard = document.getElementById('toggle-keyboard');
    const codingKeyboard = document.getElementById('coding-keyboard');
    const toggleHints = document.getElementById('toggle-hints');

    // Оракул и Заметки
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

    // Метаданные
    const metaName = document.getElementById('meta-name');
    const metaAuthor = document.getElementById('meta-author');

    // Модалка миграции
    const modal = document.getElementById('migrationModal');
    const repoInput = document.getElementById('repo-input');
    const btnTry = document.getElementById('btn-try-migration');
    const redirectHint = document.getElementById('redirect-hint');

    // ==========================================================================
    // 2. АВТОСОХРАНЕНИЕ И СОСТОЯНИЕ
    // ==========================================================================
    function saveState() {
        const state = { 
            projectName: projectName ? projectName.value : 'Name_01', 
            metaName: metaName ? metaName.value : '', 
            metaAuthor: metaAuthor ? metaAuthor.value : '', 
            code: codeEditor ? codeEditor.value : '', 
            notes: notesEditor ? notesEditor.innerHTML : '' 
        };
        localStorage.setItem('oracle_notepad_v2.5.3_storage', JSON.stringify(state));
    }

    function loadState() {
        const saved = localStorage.getItem('oracle_notepad_v2.5.3_storage');
        if (!saved) return;
        try {
            const state = JSON.parse(saved);
            if (projectName) projectName.value = state.projectName || 'Name_01';
            if (metaName) metaName.value = state.metaName || '';
            if (metaAuthor) metaAuthor.value = state.metaAuthor || '';
            if (codeEditor) codeEditor.value = state.code || '';
            if (notesEditor) notesEditor.innerHTML = state.notes || '';
        } catch(e) {
            console.error("Ошибка загрузки состояния", e);
        }
    }

    // ==========================================================================
    // 3. ЛОГИКА МИГРАЦИИ (МОДАЛЬНОЕ ОКНО)
    // ==========================================================================
    const isMigrationAccepted = localStorage.getItem('oracle_notepad_migrated');

    if (!isMigrationAccepted && modal) {
        modal.classList.remove('hidden');
    } else if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }

    if (repoInput) {
        repoInput.addEventListener('input', () => {
            let val = repoInput.value.trim().toLowerCase();
            if (val.includes('notepad-helper-2') || val === 'notepad') {
                if (redirectHint) redirectHint.classList.add('visible');
                setTimeout(() => {
                    repoInput.value = 'oracle-notepad';
                    if (redirectHint) redirectHint.classList.remove('visible');
                }, 400);
            }
        });
    }

    if (btnTry) {
        btnTry.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem('oracle_notepad_migrated', 'true');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
            
            if (projectName && (projectName.value === 'Name_01' || projectName.value === 'notepad-helper-2')) {
                projectName.value = 'oracle-notepad';
                saveState();
            }
        });
    }

    // ==========================================================================
    // 4. ДОКИНГ И ШТОРКИ
    // ==========================================================================
    if (btnDockLeft) {
        btnDockLeft.addEventListener('click', () => {
            if (window.innerWidth >= 1024) {
                if (gridLayout) gridLayout.classList.toggle('left-docked');
                if (panelInfo) panelInfo.classList.toggle('docked');
            } else {
                if (panelInfo) panelInfo.classList.remove('mobile-open');
            }
        });
    }

    if (btnExit) {
        btnExit.addEventListener('click', () => {
            if (window.innerWidth < 1024) {
                if (panelInfo) panelInfo.classList.add('mobile-open');
            } else {
                if(confirm("Выйти из Oracle Notepad?")) alert("Выход выполнен успешно.");
            }
        });
    }

    if (btnChatMenu) {
        btnChatMenu.addEventListener('click', () => {
            if (window.innerWidth < 1024) {
                const panelOracle = document.getElementById('panel-oracle');
                if (panelOracle) panelOracle.classList.toggle('mobile-open');
            }
        });
    }

    if (btnSettings && exportMenu) {
        btnSettings.addEventListener('click', (e) => {
            e.stopPropagation();
            exportMenu.classList.toggle('active');
        });
        document.addEventListener('click', () => exportMenu.classList.remove('active'));
    }

    if (btnToggleNotes && notesPanel) btnToggleNotes.addEventListener('click', () => notesPanel.classList.add('active'));
    if (btnCloseNotes && notesPanel) btnCloseNotes.addEventListener('click', () => notesPanel.classList.remove('active'));

    // ==========================================================================
    // 5. МОБИЛЬНАЯ КЛАВИАТУРА CODING
    // ==========================================================================
    const codingKeys = ['{', '}', '[', ']', '(', ')', ';', '"', "'", '=', '<', '>', '/', '$', '_', 'Tab'];
    if (codingKeyboard) {
        codingKeys.forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'key-btn';
            btn.textContent = key;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (navigator.vibrate) navigator.vibrate(15);
                if (codeEditor) insertAtCursor(codeEditor, key === 'Tab' ? '    ' : key);
            });
            codingKeyboard.appendChild(btn);
        });
    }

    if (toggleKeyboard && codingKeyboard) {
        toggleKeyboard.addEventListener('click', () => {
            codingKeyboard.classList.toggle('active');
            toggleKeyboard.classList.toggle('active');
        });
    }

    if (toggleHints) {
        toggleHints.addEventListener('click', () => {
            toggleHints.classList.toggle('active');
            if (toggleHints.classList.contains('active')) alert("Подсказки активированы.");
        });
    }

    function insertAtCursor(textarea, text) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentVal = textarea.value;
        textarea.value = currentVal.substring(0, start) + text + currentVal.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
        saveState();
    }

    // ==========================================================================
    // 6. ИИ ОРАКУЛ И АГЕНТ
    // ==========================================================================
    const modeToggle = document.getElementById('mode-toggle');
    const modeLabel = document.getElementById('mode-label');
    let oracleMode = 'dialogue'; 
    let agentAttempts = 20;

    if (modeToggle && modeLabel) {
        modeToggle.addEventListener('click', () => {
            oracleMode = (oracleMode === 'dialogue') ? 'agent' : 'dialogue';
            modeLabel.textContent = oracleMode === 'agent' ? `Агент (${agentAttempts})` : 'Диалог';
            modeToggle.classList.toggle('agent-active');
        });
    }

    if (oracleInput) {
        oracleInput.addEventListener('input', () => {
            oracleInput.style.height = 'auto';
            oracleInput.style.height = Math.min(oracleInput.scrollHeight, 120) + 'px';
        });
    }

    function appendBubble(htmlContent, sender) {
        if (!chatFlow) return;
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender === 'user' ? 'user-bubble' : 'ai-bubble'}`;
        bubble.innerHTML = htmlContent;
        chatFlow.appendChild(bubble);
        chatFlow.scrollTop = chatFlow.scrollHeight;
    }

    function sendToOracle() {
        if (!oracleInput) return;
        const text = oracleInput.value.trim();
        if (!text) return;

        if (oracleMode === 'agent' && agentAttempts <= 0) {
            alert("Лимит попыток Агента исчерпан. Переход в режим Диалога.");
            oracleMode = 'dialogue';
            if (modeLabel) modeLabel.textContent = 'Диалог';
            if (modeToggle) modeToggle.classList.remove('agent-active');
        }

        if (welcomeBlock) welcomeBlock.classList.add('hidden');
        appendBubble(text, 'user');
        oracleInput.value = '';
        oracleInput.style.height = 'auto';

        setTimeout(() => {
            if (oracleMode === 'agent') {
                agentAttempts--;
                if (modeLabel) modeLabel.textContent = `Агент (${agentAttempts})`;
                
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
        if (confirm("Разрешить Агенту внедрить патч в редактор?")) {
            if (codeEditor) {
                codeEditor.value = `// [Агент: патч внедрен]\n` + codeEditor.value;
                saveState();
            }
            alert("Код применен.");
        }
    };

    if (sendBtn) sendBtn.addEventListener('click', sendToOracle);
    if (oracleInput) {
        oracleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendToOracle(); }
        });
    }

    if (pinZone && pinUpload) {
        pinZone.addEventListener('click', () => pinUpload.click());
        pinUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                pinZone.style.borderColor = 'var(--primary)';
                const label = pinZone.querySelector('span:last-child');
                if (label) label.textContent = `Прикреплено: ${e.target.files[0].name}`;
            }
        });
    }

    // ==========================================================================
    // 7. ИМПОРТ И ЭКСПОРТ
    // ==========================================================================
    const btnImport = document.getElementById('btn-import-pack');
    if (btnImport) {
        btnImport.addEventListener('click', () => {
            const fileSelector = document.createElement('input');
            fileSelector.type = 'file';
            fileSelector.accept = '.json, .worldpack, .txt';
            fileSelector.onchange = e => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = event => {
                    try {
                        const parsed = JSON.parse(event.target.result);
                        if (parsed.projectName && projectName) projectName.value = parsed.projectName;
                        if (parsed.metaName && metaName) metaName.value = parsed.metaName;
                        if (parsed.metaAuthor && metaAuthor) metaAuthor.value = parsed.metaAuthor;
                        if (parsed.code && codeEditor) codeEditor.value = parsed.code;
                        if (parsed.notes && notesEditor) notesEditor.innerHTML = parsed.notes;
                        
                        if (welcomeBlock) welcomeBlock.classList.add('hidden');
                        appendBubble(`📥 Пак "${file.name}" загружен. Контекст системы обновлен.`, 'ai');
                        saveState();
                    } catch(err) {
                        if (codeEditor) codeEditor.value = event.target.result;
                        alert("Загружен текстовый массив.");
                    }
                };
                reader.readAsText(file);
            };
            fileSelector.click();
        });
    }

    window.exportData = function(type) {
        const state = { 
            projectName: projectName ? projectName.value : 'Name_01', 
            metaName: metaName ? metaName.value : '', 
            metaAuthor: metaAuthor ? metaAuthor.value : '', 
            code: codeEditor ? codeEditor.value : '', 
            notes: notesEditor ? notesEditor.innerHTML : '' 
        };
        let dataStr = type === 'txt' ? `Проект: ${state.projectName}\n\n=== КОД ===\n${state.code}` : JSON.stringify(state, null, type === 'json' ? 2 : 0);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const a = document.createElement('a');
        a.href = dataUri;
        a.download = `${state.projectName || 'pack'}.${type}`;
        a.click();
    };

    // Слушатели автосохранения
    [projectName, metaName, metaAuthor, codeEditor].forEach(el => {
        if (el) el.addEventListener('input', saveState);
    });

    document.addEventListener('DOMContentLoaded', () => {
    // 1. Управление модальным окном профиля (Штаб ЛМСХ)
    const profileBtn = document.getElementById('btn-profile-menu');
    const profileModal = document.getElementById('profileModal');
    const closeProfileBtn = document.getElementById('btn-close-profile');

    if (profileBtn && profileModal) {
        profileBtn.addEventListener('click', () => {
            profileModal.style.display = 'flex';
        });
    }

    if (closeProfileBtn && profileModal) {
        closeProfileBtn.addEventListener('click', () => {
            profileModal.style.display = 'none';
        });
    }

    // 2. Логика переключения проектов в селекторе
    const projectSwitcher = document.getElementById('project-switcher');
    const projectNameInput = document.getElementById('project-name');

    if (projectSwitcher && projectNameInput) {
        projectSwitcher.addEventListener('change', (e) => {
            const selectedText = e.target.options[e.target.selectedIndex].text;
            projectNameInput.value = e.target.value;
            console.لlog(`Переключено на проект: ${selectedText}`);
            // Здесь можно добавить загрузку данных выбранного проекта из репозитория
        });
    }

    // 3. Динамическая кнопка в поле ввода: Live Chat (если пусто) / Отправить (если есть текст)
    const oracleInput = document.getElementById('oracle-input');
    const sendBtn = document.getElementById('send-btn');

    if (oracleInput && sendBtn) {
        oracleInput.addEventListener('input', function() {
            // Автоматическое изменение высоты без скачков
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';

            const iconSpan = sendBtn.querySelector('.material-symbols-rounded');
            
            if (this.value.trim().length > 0) {
                // Есть текст -> превращаем в кнопку отправки
                sendBtn.title = "Отправить";
                if (iconSpan) iconSpan.textContent = "send";
                sendBtn.classList.add('active-send');
            } else {
                // Пусто -> превращаем в Live Chat
                sendBtn.title = "Live Chat";
                if (iconSpan) iconSpan.textContent = "graphic_eq"; // Иконка аудиоволн для Live
                sendBtn.classList.remove('active-send');
            }
        });

        // Клик по динамической кнопке
        sendBtn.addEventListener('click', () => {
            if (oracleInput.value.trim().length > 0) {
                console.log("Отправка сообщения:", oracleInput.value);
                oracleInput.value = '';
                oracleInput.style.height = 'auto';
                sendBtn.querySelector('.material-symbols-rounded').textContent = "graphic_eq";
            } else {
                console.log("Запуск Live Chat...");
                // Логика запуска голосового Live-общения
            }
        });
    }
});
    if (notesEditor) notesEditor.addEventListener('input', saveState);

    // Первичная загрузка
    loadState();
});
