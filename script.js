document.addEventListener('DOMContentLoaded', () => {
    const APP_VERSION = '2.6';
    const whatsNewModal = document.getElementById('whatsNewModal');
    const btnCloseWhatsNew = document.getElementById('btn-close-whats-new');
    const savedVersion = localStorage.getItem('oracle_notepad_version');

    if (whatsNewModal && savedVersion !== APP_VERSION) {
        whatsNewModal.style.display = 'flex';
    }

    if (btnCloseWhatsNew && whatsNewModal) {
        btnCloseWhatsNew.addEventListener('click', () => {
            whatsNewModal.style.display = 'none';
            localStorage.setItem('oracle_notepad_version', APP_VERSION);
        });
    }

    // ЭЛЕМЕНТЫ
    const btnSettings = document.getElementById('btn-settings');
    const exportMenu = document.getElementById('export-menu');

    const gridLayout = document.querySelector('.grid-layout');
    const panelInfo = document.getElementById('panel-info');
    const btnDockLeft = document.getElementById('btn-dock-left');
    const dockLeftIcon = document.getElementById('dock-left-icon');

    const codeEditor = document.getElementById('code-editor');
    const toggleKeyboard = document.getElementById('toggle-keyboard');
    const codingKeyboard = document.getElementById('coding-keyboard');

    const btnToggleNotes = document.getElementById('btn-toggle-notes');
    const notesIcon = document.getElementById('notes-icon');
    const viewAi = document.getElementById('view-ai');
    const viewNotes = document.getElementById('view-notes');
    const notesEditor = document.getElementById('notes-editor');
    
    const oracleInput = document.getElementById('oracle-input');
    const sendBtn = document.getElementById('send-btn');
    const chatFlow = document.getElementById('chat-flow');
    const welcomeBlock = document.getElementById('welcome-block');

    const metaName = document.getElementById('meta-name');
    const toast = document.getElementById('toast-notification');
    const autoSaveToggle = document.getElementById('auto-save-toggle');
    const btnSaveLocal = document.getElementById('btn-save-local');

    // КНОПКИ ПРИКРЕПЛЕНИЯ ФАЙЛА И МИКРОФОНА В ЧАТЕ
    const btnAttach = document.getElementById('btn-attach');
    const attachFileInput = document.getElementById('attach-file-input');
    const voiceBtn = document.getElementById('voice-btn');

    // МОБИЛЬНЫЕ ВКЛАДКИ
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    const panels = [document.getElementById('panel-info'), document.getElementById('panel-coding'), document.getElementById('panel-oracle')];

    mobileNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            mobileNavItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            panels.forEach(p => {
                if (p) {
                    if (p.id === targetId) {
                        p.classList.add('mobile-active');
                    } else {
                        p.classList.remove('mobile-active');
                    }
                }
            });
        });
    });

    // TOAST
    function showToast(text = 'Сохранено в Данных') {
        if (!toast) return;
        toast.querySelector('span:last-child').textContent = text;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }

    // 1. СВОРАЧИВАНИЕ ЛЕВОЙ ПАНЕЛИ
    if (btnDockLeft) {
        btnDockLeft.addEventListener('click', () => {
            if (window.innerWidth >= 1024) {
                const isDocked = gridLayout.classList.toggle('left-docked');
                panelInfo.classList.toggle('docked');
                if (dockLeftIcon) {
                    dockLeftIcon.textContent = isDocked ? 'dock_to_right' : 'dock_to_left';
                }
            }
        });
    }

    // 2. ИМПОРТ ИЗОБРАЖЕНИЯ И КОНТЕКСТНОЕ МЕНЮ
    const btnAddProjectIcon = document.getElementById('btn-add-project-icon');
    const projectIconInput = document.getElementById('project-icon-input');
    const projectIconPreviewWrapper = document.getElementById('project-icon-preview-wrapper');
    const projectIconImg = document.getElementById('project-icon-img');
    const btnIconMenu = document.getElementById('btn-icon-menu');
    const iconContextMenu = document.getElementById('icon-context-menu');
    const btnChangeIcon = document.getElementById('btn-change-icon');
    const btnRemoveIcon = document.getElementById('btn-remove-icon');

    let currentProjectIconBase64 = '';

    if (btnAddProjectIcon && projectIconInput) {
        btnAddProjectIcon.addEventListener('click', () => projectIconInput.click());
    }

    if (btnChangeIcon && projectIconInput) {
        btnChangeIcon.addEventListener('click', () => {
            if (iconContextMenu) iconContextMenu.classList.remove('active');
            projectIconInput.click();
        });
    }

    if (btnIconMenu && iconContextMenu) {
        btnIconMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            iconContextMenu.classList.toggle('active');
        });
        document.addEventListener('click', () => iconContextMenu.classList.remove('active'));
    }

    if (projectIconInput) {
        projectIconInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    currentProjectIconBase64 = event.target.result;
                    renderProjectIcon();
                    handleAutoSaveInput();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (btnRemoveIcon) {
        btnRemoveIcon.addEventListener('click', () => {
            if (iconContextMenu) iconContextMenu.classList.remove('active');
            currentProjectIconBase64 = '';
            renderProjectIcon();
            handleAutoSaveInput();
        });
    }

    function renderProjectIcon() {
        if (currentProjectIconBase64) {
            if (projectIconImg) projectIconImg.src = currentProjectIconBase64;
            if (projectIconPreviewWrapper) projectIconPreviewWrapper.classList.remove('hidden');
            if (btnAddProjectIcon) btnAddProjectIcon.classList.add('hidden');
        } else {
            if (projectIconImg) projectIconImg.src = '';
            if (projectIconPreviewWrapper) projectIconPreviewWrapper.classList.add('hidden');
            if (btnAddProjectIcon) btnAddProjectIcon.classList.remove('hidden');
        }
    }

    // МОДАЛЬНЫЕ ОКНА
    const alertModal = document.getElementById('alertModal');
    const alertTitle = document.getElementById('alertModalTitle');
    const alertMsg = document.getElementById('alertModalMessage');
    const btnCloseAlert = document.getElementById('btn-close-alert');

    const confirmModal = document.getElementById('confirmModal');
    const confirmTitle = document.getElementById('confirmModalTitle');
    const confirmMsg = document.getElementById('confirmModalMessage');
    const btnCancelConfirm = document.getElementById('btn-cancel-confirm');
    const btnAcceptConfirm = document.getElementById('btn-accept-confirm');
    let onConfirmCallback = null;

    const inputModal = document.getElementById('inputModal');
    const inputTitle = document.getElementById('inputModalTitle');
    const inputLabel = document.getElementById('inputModalLabel');
    const customInputValue = document.getElementById('customInputValue');
    const btnCancelInput = document.getElementById('btn-cancel-input');
    const btnConfirmInput = document.getElementById('btn-confirm-input');
    let onInputCallback = null;

    window.showAlert = function(message, title = 'Уведомление') {
        if (!alertModal) return;
        alertTitle.textContent = title;
        alertMsg.textContent = message;
        alertModal.style.display = 'flex';
    };
    if (btnCloseAlert) btnCloseAlert.addEventListener('click', () => alertModal.style.display = 'none');

    window.showConfirm = function(message, onConfirm, title = 'Подтверждение') {
        if (!confirmModal) return;
        confirmTitle.textContent = title;
        confirmMsg.textContent = message;
        onConfirmCallback = onConfirm;
        confirmModal.style.display = 'flex';
    };
    if (btnCancelConfirm) btnCancelConfirm.addEventListener('click', () => confirmModal.style.display = 'none');
    if (btnAcceptConfirm) {
        btnAcceptConfirm.addEventListener('click', () => {
            confirmModal.style.display = 'none';
            if (typeof onConfirmCallback === 'function') onConfirmCallback();
        });
    }

    window.showInput = function(title, label, defaultValue, onConfirm) {
        if (!inputModal) return;
        inputTitle.textContent = title;
        inputLabel.textContent = label;
        customInputValue.value = defaultValue || '';
        onInputCallback = onConfirm;
        inputModal.style.display = 'flex';
        setTimeout(() => customInputValue.focus(), 100);
    };
    if (btnCancelInput) btnCancelInput.addEventListener('click', () => inputModal.style.display = 'none');
    if (btnConfirmInput) {
        btnConfirmInput.addEventListener('click', () => {
            const val = customInputValue.value.trim();
            inputModal.style.display = 'none';
            if (typeof onInputCallback === 'function') onInputCallback(val);
        });
    }

    // 3. WORLDS & ROOMS
    let worlds = [
        { id: 'world_1', name: 'World 1', rooms: [{ id: 'room_1', name: 'Room 1' }] }
    ];

    const btnCreateWorld = document.getElementById('btn-create-world');
    const btnCreateRoom = document.getElementById('btn-create-room');
    const explorerContainer = document.getElementById('explorer');

    const roomModal = document.getElementById('roomModal');
    const roomModalTitle = document.getElementById('roomModalTitle');
    const roomWorldSelect = document.getElementById('roomWorldSelect');
    const roomNameInput = document.getElementById('roomNameInput');
    const btnCancelRoom = document.getElementById('btn-cancel-room');
    const btnConfirmRoom = document.getElementById('btn-confirm-room');

    let editingRoomContext = null;

    if (btnCreateWorld) {
        btnCreateWorld.addEventListener('click', () => {
            showInput('Новый Мир', 'Введите имя Мира:', `World ${worlds.length + 1}`, (worldName) => {
                if (worldName) {
                    worlds.push({
                        id: 'world_' + Date.now(),
                        name: worldName,
                        rooms: []
                    });
                    renderExplorer();
                    handleAutoSaveInput();
                }
            });
        });
    }

    function populateWorldSelect(selectedWorldId = null) {
        if (!roomWorldSelect) return;
        roomWorldSelect.innerHTML = '';
        worlds.forEach(w => {
            const opt = document.createElement('option');
            opt.value = w.id;
            opt.textContent = w.name;
            if (selectedWorldId && w.id === selectedWorldId) opt.selected = true;
            roomWorldSelect.appendChild(opt);
        });
    }

    if (btnCreateRoom) {
        btnCreateRoom.addEventListener('click', () => {
            if (worlds.length === 0) {
                showAlert('Сначала создайте хотя бы один Мир!');
                return;
            }
            editingRoomContext = null;
            if (roomModalTitle) roomModalTitle.textContent = 'Создание комнаты';
            populateWorldSelect();
            if (roomNameInput) roomNameInput.value = '';
            if (roomModal) roomModal.style.display = 'flex';
        });
    }

    if (btnCancelRoom && roomModal) {
        btnCancelRoom.addEventListener('click', () => roomModal.style.display = 'none');
    }

    if (btnConfirmRoom) {
        btnConfirmRoom.addEventListener('click', () => {
            const targetWorldId = roomWorldSelect.value;
            const targetWorld = worlds.find(w => w.id === targetWorldId);
            if (!targetWorld) return;

            let finalName = roomNameInput ? roomNameInput.value.trim() : '';

            if (editingRoomContext) {
                const { worldId, roomId } = editingRoomContext;
                const sourceWorld = worlds.find(w => w.id === worldId);
                const roomIndex = sourceWorld ? sourceWorld.rooms.findIndex(r => r.id === roomId) : -1;

                if (sourceWorld && roomIndex !== -1) {
                    const roomObj = sourceWorld.rooms[roomIndex];
                    if (!finalName) {
                        const count = targetWorld.rooms.length + 1;
                        finalName = `Room #${count}`;
                    }
                    roomObj.name = finalName;

                    if (worldId !== targetWorldId) {
                        sourceWorld.rooms.splice(roomIndex, 1);
                        targetWorld.rooms.push(roomObj);
                    }
                }
            } else {
                if (!finalName) {
                    const count = targetWorld.rooms.length + 1;
                    finalName = `Room #${count}`;
                }
                targetWorld.rooms.push({
                    id: 'room_' + Date.now(),
                    name: finalName
                });
            }

            if (roomModal) roomModal.style.display = 'none';
            renderExplorer();
            handleAutoSaveInput();
        });
    }

    function renderExplorer() {
        if (!explorerContainer) return;
        explorerContainer.innerHTML = '';

        worlds.forEach(world => {
            const group = document.createElement('div');
            group.className = 'world-group';

            const worldDiv = document.createElement('div');
            worldDiv.className = 'explorer-item world-item';
            worldDiv.innerHTML = `
                <div class="item-title">
                    <span class="material-symbols-rounded">language</span> ${escapeHtml(world.name)}
                </div>
                <div class="item-actions">
                    <span class="material-symbols-rounded" onclick="editWorldName('${world.id}')" title="Переименовать Мир">edit</span>
                    <span class="material-symbols-rounded" style="color: var(--accent-red);" onclick="deleteWorldPrompt('${world.id}')" title="Удалить Мир">close</span>
                </div>
            `;
            group.appendChild(worldDiv);

            world.rooms.forEach(room => {
                const roomDiv = document.createElement('div');
                roomDiv.className = 'explorer-item room-item';
                roomDiv.innerHTML = `
                    <div class="item-title">
                        <span class="material-symbols-rounded">meeting_room</span> ${escapeHtml(room.name)}
                    </div>
                    <div class="item-actions">
                        <span class="material-symbols-rounded" onclick="openEditRoomModal('${world.id}', '${room.id}')" title="Редактировать / Переместить">edit</span>
                        <span class="material-symbols-rounded" style="color: var(--accent-red);" onclick="deleteRoomPrompt('${world.id}', '${room.id}')" title="Удалить">close</span>
                    </div>
                `;
                group.appendChild(roomDiv);
            });

            explorerContainer.appendChild(group);
        });
    }

    window.editWorldName = function(worldId) {
        const world = worlds.find(w => w.id === worldId);
        if (!world) return;
        showInput('Редактировать Мир', 'Имя мира:', world.name, (newName) => {
            if (newName) {
                world.name = newName;
                renderExplorer();
                handleAutoSaveInput();
            }
        });
    };

    window.deleteWorldPrompt = function(worldId) {
        const world = worlds.find(w => w.id === worldId);
        if (!world) return;
        showConfirm(`Вы уверены, что хотите удалить Мир "${world.name}" и все его комнаты?\nДействие нельзя будет отменить или восстановить!`, () => {
            worlds = worlds.filter(w => w.id !== worldId);
            renderExplorer();
            handleAutoSaveInput();
        }, 'Удаление Мира');
    };

    window.openEditRoomModal = function(worldId, roomId) {
        const world = worlds.find(w => w.id === worldId);
        if (!world) return;
        const room = world.rooms.find(r => r.id === roomId);
        if (!room) return;

        editingRoomContext = { worldId, roomId };
        if (roomModalTitle) roomModalTitle.textContent = 'Редактирование комнаты';
        populateWorldSelect(worldId);
        if (roomNameInput) roomNameInput.value = room.name;
        if (roomModal) roomModal.style.display = 'flex';
    };

    window.deleteRoomPrompt = function(worldId, roomId) {
        const world = worlds.find(w => w.id === worldId);
        if (!world) return;
        const room = world.rooms.find(r => r.id === roomId);
        if (!room) return;

        showConfirm(`Удалить комнату "${room.name}"?\nВосстановить её будет невозможно!`, () => {
            world.rooms = world.rooms.filter(r => r.id !== roomId);
            renderExplorer();
            handleAutoSaveInput();
        }, 'Удаление комнаты');
    };

    // ПРОЕКТЫ
    let projects = JSON.parse(localStorage.getItem('oracle_projects_list')) || [
        { id: 'name_01', name: 'Name_01' },
        { id: 'project_alpha', name: 'Проект Альфа' }
    ];

    let activeProjectId = localStorage.getItem('oracle_active_project_id') || 'name_01';

    const projectsModal = document.getElementById('projectsModal');
    const btnOpenProjects = document.getElementById('btn-open-projects');
    const btnCloseProjects = document.getElementById('btn-close-projects-modal');
    const btnCreateProject = document.getElementById('btn-create-project');
    const projectsListContainer = document.getElementById('projects-list');
    const currentProjectDisplay = document.getElementById('current-project-name-display');

    if (btnOpenProjects && projectsModal) {
        btnOpenProjects.addEventListener('click', () => {
            renderProjectsList();
            projectsModal.style.display = 'flex';
        });
    }

    if (btnCloseProjects && projectsModal) {
        btnCloseProjects.addEventListener('click', () => projectsModal.style.display = 'none');
    }

    function renderProjectsList() {
        if (!projectsListContainer) return;
        projectsListContainer.innerHTML = '';
        const activeProj = projects.find(p => p.id === activeProjectId) || projects[0];
        if (currentProjectDisplay) currentProjectDisplay.textContent = activeProj.name;

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = `project-card-item ${project.id === activeProjectId ? 'active-project' : ''}`;
            card.innerHTML = `
                <div class="project-info-click" onclick="switchProject('${project.id}')">
                    <span class="material-symbols-rounded">folder</span>
                    <span class="project-card-title">${escapeHtml(project.name)}</span>
                    ${project.id === activeProjectId ? '<span class="project-card-badge">Активный</span>' : ''}
                </div>
                <div class="project-card-actions">
                    <button class="icon-btn" title="Изменить" onclick="editProjectInfo('${project.id}')">
                        <span class="material-symbols-rounded" style="font-size: 18px;">edit</span>
                    </button>
                    <button class="icon-btn" title="Удалить" onclick="deleteProject('${project.id}')">
                        <span class="material-symbols-rounded" style="font-size: 18px; color: var(--accent-red);">delete</span>
                    </button>
                </div>
            `;
            projectsListContainer.appendChild(card);
        });
    }

    window.switchProject = function(id) {
        activeProjectId = id;
        localStorage.setItem('oracle_active_project_id', activeProjectId);
        renderProjectsList();
        loadState();
        projectsModal.style.display = 'none';
    };

    if (btnCreateProject) {
        btnCreateProject.addEventListener('click', () => {
            showInput('Новый проект', 'Введите название нового проекта:', '', (newName) => {
                if (newName) {
                    const newId = 'proj_' + Date.now();
                    projects.push({ id: newId, name: newName });
                    saveProjectsToStorage();
                    switchProject(newId);
                }
            });
        });
    }

    window.editProjectInfo = function(id) {
        const project = projects.find(p => p.id === id);
        if (!project) return;
        showInput('Редактировать проект', 'Новое название:', project.name, (updatedName) => {
            if (updatedName) {
                project.name = updatedName;
                saveProjectsToStorage();
                renderProjectsList();
                if (id === activeProjectId && currentProjectDisplay) currentProjectDisplay.textContent = updatedName;
            }
        });
    };

    window.deleteProject = function(id) {
        if (projects.length <= 1) {
            showAlert('Нельзя удалить единственный проект!');
            return;
        }
        const project = projects.find(p => p.id === id);
        showConfirm(`Удалить проект "${project.name}"?\nВсе данные этого проекта будут потеряны.`, () => {
            projects = projects.filter(p => p.id !== id);
            if (activeProjectId === id) {
                activeProjectId = projects[0].id;
                localStorage.setItem('oracle_active_project_id', activeProjectId);
                loadState();
            }
            localStorage.removeItem(`oracle_notepad_storage_${id}`);
            saveProjectsToStorage();
            renderProjectsList();
        }, 'Удаление проекта');
    };

    function saveProjectsToStorage() {
        localStorage.setItem('oracle_projects_list', JSON.stringify(projects));
    }

    // СОХРАНЕНИЕ / АВТОСОХРАНЕНИЕ В LOCALSTORAGE
    let autoSaveTimer = null;

    function saveState(triggerToast = false) {
        const activeProj = projects.find(p => p.id === activeProjectId) || projects[0];
        const state = { 
            projectName: activeProj.name, 
            metaName: metaName ? metaName.value : '', 
            code: codeEditor ? codeEditor.value : '', 
            notes: notesEditor ? notesEditor.innerHTML : '',
            projectIcon: currentProjectIconBase64,
            worlds: worlds
        };
        localStorage.setItem(`oracle_notepad_storage_${activeProjectId}`, JSON.stringify(state));
        if (triggerToast) showToast();
    }

    function handleAutoSaveInput() {
        if (autoSaveToggle && autoSaveToggle.checked) {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                saveState(true);
            }, 800);
        }
    }

    if (btnSaveLocal) {
        btnSaveLocal.addEventListener('click', () => {
            saveState(true);
            if (exportMenu) exportMenu.classList.remove('active');
        });
    }

    function loadState() {
        const saved = localStorage.getItem(`oracle_notepad_storage_${activeProjectId}`);
        const activeProj = projects.find(p => p.id === activeProjectId) || projects[0];
        if (currentProjectDisplay) currentProjectDisplay.textContent = activeProj.name;

        if (!saved) {
            if (metaName) metaName.value = 'Ламирк';
            if (codeEditor) codeEditor.value = '';
            if (notesEditor) notesEditor.innerHTML = '';
            currentProjectIconBase64 = '';
            worlds = [{ id: 'world_1', name: 'World 1', rooms: [{ id: 'room_1', name: 'Room 1' }] }];
            renderProjectIcon();
            renderExplorer();
            return;
        }

        try {
            const state = JSON.parse(saved);
            if (metaName) metaName.value = state.metaName || 'Ламирк';
            if (codeEditor) codeEditor.value = state.code || '';
            if (notesEditor) notesEditor.innerHTML = state.notes || '';
            currentProjectIconBase64 = state.projectIcon || '';
            worlds = state.worlds || [{ id: 'world_1', name: 'World 1', rooms: [{ id: 'room_1', name: 'Room 1' }] }];

            renderProjectIcon();
            renderExplorer();
        } catch(e) {
            console.error("Ошибка загрузки состояния", e);
        }
    }

    // БУРГЕР-МЕНЮ ЧАТОВ
    const btnChatMenu = document.getElementById('btn-chat-menu');
    const chatDrawer = document.getElementById('chatDrawer');
    const chatDrawerOverlay = document.getElementById('chatDrawerOverlay');
    const btnCloseDrawer = document.getElementById('btn-close-drawer');

    if (btnChatMenu) btnChatMenu.addEventListener('click', () => {
        if (chatDrawerOverlay && chatDrawer) {
            chatDrawerOverlay.style.display = 'block';
            setTimeout(() => {
                chatDrawerOverlay.classList.add('active');
                chatDrawer.classList.add('active');
            }, 10);
        }
    });

    if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', () => {
        if (chatDrawerOverlay && chatDrawer) {
            chatDrawerOverlay.classList.remove('active');
            chatDrawer.classList.remove('active');
            setTimeout(() => chatDrawerOverlay.style.display = 'none', 300);
        }
    });

    // ПЕРЕКЛЮЧЕНИЕ ИИ / KEEPS
    let activeRightView = 'ai';
    if (btnToggleNotes && viewAi && viewNotes) {
        btnToggleNotes.addEventListener('click', () => {
            if (activeRightView === 'ai') {
                activeRightView = 'notes';
                viewAi.classList.remove('active');
                viewNotes.classList.add('active');
                if (notesIcon) notesIcon.textContent = 'smart_toy';
            } else {
                activeRightView = 'ai';
                viewNotes.classList.remove('active');
                viewAi.classList.add('active');
                if (notesIcon) notesIcon.textContent = 'sticky_note_2';
            }
        });
    }

    // ПРОФИЛЬ
    const profileBtn = document.getElementById('btn-profile-menu');
    const profileModal = document.getElementById('profileModal');
    const closeProfileBtn = document.getElementById('btn-close-profile');
    if (profileBtn && profileModal) profileBtn.addEventListener('click', () => profileModal.style.display = 'flex');
    if (closeProfileBtn && profileModal) closeProfileBtn.addEventListener('click', () => profileModal.style.display = 'none');

    // КЛАВИАТУРА И КОД
    const codingKeys = ['{', '}', '[', ']', '(', ')', ';', '"', "'", '=', '<', '>', '/', '$', '_', 'Tab'];
    if (codingKeyboard) {
        codingKeys.forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'key-btn';
            btn.textContent = key;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
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

    function insertAtCursor(textarea, text) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentVal = textarea.value;
        textarea.value = currentVal.substring(0, start) + text + currentVal.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
        handleAutoSaveInput();
    }

    if (codeEditor) {
        codeEditor.addEventListener('input', handleAutoSaveInput);
    }
    if (metaName) {
        metaName.addEventListener('input', handleAutoSaveInput);
    }
    if (notesEditor) {
        notesEditor.addEventListener('input', handleAutoSaveInput);
    }

    // ОБРАБОТЧИКИ: ПРИКРЕПЛЕНИЕ ФАЙЛА
    if (btnAttach && attachFileInput) {
        btnAttach.addEventListener('click', () => attachFileInput.click());
        attachFileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                const names = files.map(f => f.name).join(', ');
                if (oracleInput) {
                    oracleInput.value += ` [Прикреплено: ${names}]`;
                    oracleInput.dispatchEvent(new Event('input'));
                }
            }
        });
    }

    // ОБРАБОТЧИКИ: ГОЛОСОВОЙ ВВОД (МИКРОФОН)
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                if (window.showAlert) showAlert('Ваш браузер не поддерживает распознавание речи');
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.lang = 'ru-RU';
            recognition.interimResults = false;

            voiceBtn.style.color = 'var(--accent-red, #ff5555)';

            recognition.onstart = () => {
                showToast('Идет запись...');
            };

            recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                if (oracleInput) {
                    oracleInput.value += (oracleInput.value ? ' ' : '') + transcript;
                    oracleInput.dispatchEvent(new Event('input'));
                }
            };

            recognition.onerror = () => {
                voiceBtn.style.color = '';
            };

            recognition.onend = () => {
                voiceBtn.style.color = '';
            };

            recognition.start();
        });
    }

    // ИИ ОРАКУЛ & ДИНАМИЧЕСКАЯ КНОПКА ОТПРАВКИ
    if (oracleInput && sendBtn) {
        oracleInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            
            if (this.value.trim().length > 0) {
                sendBtn.classList.add('active');
            } else {
                sendBtn.classList.remove('active');
            }
        });

        const sendToOracle = () => {
            const text = oracleInput.value.trim();
            if (!text) return;
            if (welcomeBlock) welcomeBlock.classList.add('hidden');
            appendBubble(escapeHtml(text), 'user');
            oracleInput.value = '';
            oracleInput.style.height = 'auto';
            sendBtn.classList.remove('active');

            setTimeout(() => {
                appendBubble(`💬 <strong>Оракул:</strong> Принято! Ответ сгенерирован.`, 'ai');
            }, 600);
        };

        sendBtn.addEventListener('click', sendToOracle);
        oracleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                sendToOracle(); 
            }
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

    if (btnSettings && exportMenu) {
        btnSettings.addEventListener('click', (e) => {
            e.stopPropagation();
            exportMenu.classList.toggle('active');
        });
        document.addEventListener('click', () => exportMenu.classList.remove('active'));
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    window.exportData = function(format) {
        const activeProj = projects.find(p => p.id === activeProjectId) || projects[0];
        const data = {
            projectName: activeProj.name,
            metaName: metaName ? metaName.value : '',
            code: codeEditor ? codeEditor.value : '',
            notes: notesEditor ? notesEditor.innerText : '',
            worlds: worlds
        };

        let content = '';
        let mimeType = 'text/plain';
        let extension = 'txt';

        if (format === 'json' || format === 'worldpack') {
            content = JSON.stringify(data, null, 2);
            mimeType = 'application/json';
            extension = format === 'worldpack' ? 'worldpack' : 'json';
        } else {
            content = `Проект: ${data.projectName}\nАвтор: ${data.metaName}\n\n--- КОД ---\n${data.code}\n\n--- ЗАМЕТКИ ---\n${data.notes}`;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeProj.name.toLowerCase().replace(/\s+/g, '_')}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    loadState();
});
