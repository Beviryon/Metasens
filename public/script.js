// Variables globales
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let currentFilter = 'all';
let currentSort = 'createdAt';
let currentDueFilter = 'all';
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let isOnline = navigator.onLine;

// Éléments DOM
const themeToggle = document.getElementById('themeToggle');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterAllBtn = document.getElementById('filterAll');
const filterActiveBtn = document.getElementById('filterActive');
const filterCompletedBtn = document.getElementById('filterCompleted');
const authContainer = document.getElementById('auth-container');
const app = document.getElementById('app');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const sortBySelect = document.getElementById('sortBy');
const dueDateFilter = document.getElementById('dueDateFilter');
const dueDateInput = document.getElementById('dueDateInput');

// Initialisation du thème
function initializeTheme() {
  if (isDarkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

// Toggle le thème
function toggleTheme() {
  isDarkMode = !isDarkMode;
  localStorage.setItem('darkMode', isDarkMode);
  initializeTheme();
}

// Écouteurs d'événements
themeToggle.addEventListener('click', toggleTheme);
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

filterAllBtn.addEventListener('click', () => setFilter('all'));
filterActiveBtn.addEventListener('click', () => setFilter('active'));
filterCompletedBtn.addEventListener('click', () => setFilter('completed'));

// Gestion de l'authentification
function checkAuth() {
  const token = localStorage.getItem('authToken');
  if (token) {
    authContainer.classList.add('hidden');
    app.classList.remove('hidden');
    loadTasks();
  } else {
    authContainer.classList.remove('hidden');
    app.classList.add('hidden');
  }
}

// Gestion de la connexion
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username === 'Metasens' && password === 'test') {
    localStorage.setItem('authToken', 'demo-token');
    localStorage.setItem('username', username);
    checkAuth();
    showNotification('Connexion réussie', 'success');
  } else {
    showNotification('Identifiants incorrects', 'error');
  }
});

// Gestion de la déconnexion
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('username');
  checkAuth();
  showNotification('Déconnexion réussie', 'info');
});

// Fonctions
function loadTasks() {
  tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  displayTasks(tasks);
  updateFilterButtons();
}

function updateFilterButtons() {
  filterAllBtn.classList.toggle('active', currentFilter === 'all');
  filterActiveBtn.classList.toggle('active', currentFilter === 'active');
  filterCompletedBtn.classList.toggle('active', currentFilter === 'completed');
}

function displayTasks(tasks) {
  taskList.innerHTML = '';
  const filteredTasks = filterTasks(tasks);
  
  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    
    const taskContainer = document.createElement('div');
    taskContainer.className = 'task-container';
    
    const statusSpan = document.createElement('span');
    statusSpan.textContent = task.completed ? '✓' : '✗';
    statusSpan.className = `status-icon ${task.completed ? 'completed' : ''}`;
    
    const taskText = document.createElement('span');
    taskText.textContent = task.name;
    taskText.className = task.completed ? 'completed' : '';
    taskText.addEventListener('dblclick', () => startEditing(task.id, taskText));
    
    const dueDateSpan = document.createElement('span');
    dueDateSpan.className = 'due-date';
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDateSpan.textContent = dueDate.toLocaleDateString();
      if (dueDate < today && !task.completed) {
        dueDateSpan.classList.add('overdue');
      }
    }
    
    const completeBtn = document.createElement('button');
    completeBtn.textContent = task.completed ? 'Terminée' : 'En cours';
    completeBtn.className = `complete-btn ${task.completed ? 'completed' : ''}`;
    completeBtn.addEventListener('click', () => toggleTask(task.id));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Supprimer';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    taskContainer.appendChild(statusSpan);
    taskContainer.appendChild(taskText);
    if (task.dueDate) {
      taskContainer.appendChild(dueDateSpan);
    }
    taskContainer.appendChild(completeBtn);
    taskContainer.appendChild(deleteBtn);
    li.appendChild(taskContainer);
    
    taskList.appendChild(li);
  });
}

function startEditing(taskId, taskElement) {
  const currentText = taskElement.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentText;
  input.className = 'task-editable';
  
  taskElement.textContent = '';
  taskElement.appendChild(input);
  input.focus();
  
  input.addEventListener('blur', () => finishEditing(taskId, input, taskElement));
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      input.blur();
    }
  });
}

function finishEditing(taskId, input, taskElement) {
  const newName = input.value.trim();
  if (!newName) {
    taskElement.textContent = tasks.find(t => t.id === taskId).name;
    showNotification('Le nom de la tâche ne peut pas être vide', 'warning');
    return;
  }
  
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].name = newName;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    taskElement.textContent = newName;
    showNotification('Tâche modifiée avec succès', 'success');
  }
}

function filterTasks(tasks) {
  let filteredTasks = [...tasks];

  switch (currentFilter) {
    case 'active':
      filteredTasks = filteredTasks.filter(task => !task.completed);
      break;
    case 'completed':
      filteredTasks = filteredTasks.filter(task => task.completed);
      break;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  switch (currentDueFilter) {
    case 'today':
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      });
      break;
    case 'week':
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate <= weekEnd;
      });
      break;
    case 'overdue':
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < today && !task.completed;
      });
      break;
  }

  filteredTasks.sort((a, b) => {
    switch (currentSort) {
      case 'dueDate':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return filteredTasks;
}

function setFilter(filter) {
  currentFilter = filter;
  loadTasks();
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notif => notif.remove());
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 2000);
}

function deleteTask(id) {
  const taskElement = document.querySelector(`li[data-id="${id}"]`);
  if (taskElement) {
    taskElement.classList.add('removing');
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      showNotification('Tâche supprimée avec succès', 'success');
      loadTasks();
    }, 300);
  }
}

function addTask() {
  const name = taskInput.value.trim();
  const dueDate = dueDateInput.value;

  if (!name) {
    showNotification('Veuillez entrer une tâche', 'warning');
    return;
  }

  const task = {
    id: Date.now(),
    name,
    completed: false,
    createdAt: new Date(),
    dueDate: dueDate || null
  };

  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  
  taskInput.value = '';
  dueDateInput.value = '';
  showNotification('Tâche ajoutée avec succès', 'success');
  loadTasks();
}

function toggleTask(id) {
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    showNotification(`Tâche marquée comme ${tasks[taskIndex].completed ? 'terminée' : 'en cours'}`);
    loadTasks();
  }
}

// Écouteurs d'événements pour les filtres
sortBySelect.addEventListener('change', () => {
  currentSort = sortBySelect.value;
  displayTasks(tasks);
});

dueDateFilter.addEventListener('change', () => {
  currentDueFilter = dueDateFilter.value;
  displayTasks(tasks);
});

// Initialisation de l'application
function initializeApp() {
  initializeTheme();
  checkAuth();
}

// Démarrage de l'application
initializeApp();
  