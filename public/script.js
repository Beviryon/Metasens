// Variables globales
let isDarkMode = localStorage.getItem('darkMode') === 'true'; 
let currentFilter = 'all'; 
let currentSort = 'createdAt'; 
let currentDueFilter = 'all';
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]'); 
let isOnline = navigator.onLine; 

// On récupère tous les éléments de la page dont on a besoin
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

// Fonction pour mettre en place le thème (clair ou sombre)
function initializeTheme() {
  if (isDarkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

// Fonction pour changer le thème
function toggleTheme() {
  isDarkMode = !isDarkMode;
  localStorage.setItem('darkMode', isDarkMode);
  initializeTheme();
}

// On écoute les actions de l'utilisateur
themeToggle.addEventListener('click', toggleTheme);
addTaskBtn.addEventListener('click', addTask); 
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

// Filtres pour les tâches
filterAllBtn.addEventListener('click', () => setFilter('all'));
filterActiveBtn.addEventListener('click', () => setFilter('active'));
filterCompletedBtn.addEventListener('click', () => setFilter('completed'));

// Vérifie si l'utilisateur est connecté
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

  // Vérification simple des identifiants
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

// Charge les tâches depuis le stockage local
function loadTasks() {
  tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  displayTasks(tasks);
  updateFilterButtons();
}

// Met à jour l'apparence des boutons de filtre
function updateFilterButtons() {
  filterAllBtn.classList.toggle('active', currentFilter === 'all');
  filterActiveBtn.classList.toggle('active', currentFilter === 'active');
  filterCompletedBtn.classList.toggle('active', currentFilter === 'completed');
}

// Affiche les tâches dans la liste
function displayTasks(tasks) {
  taskList.innerHTML = '';
  const filteredTasks = filterTasks(tasks);
  
  filteredTasks.forEach(task => {
    const li = createTaskElement(task);
    taskList.appendChild(li);
  });
}

// Fonction pour créer un élément de tâche
function createTaskElement(task) {
    const li = document.createElement('li');
    li.draggable = true;
    li.dataset.id = task.id;

    const taskContainer = document.createElement('div');
    taskContainer.className = 'task-container';

    // Icône de statut
    const statusIcon = document.createElement('div');
    statusIcon.className = `status-icon ${task.completed ? 'completed' : ''}`;
    statusIcon.textContent = task.completed ? '✓' : '!';
    statusIcon.title = task.completed ? 'Tâche terminée' : 'Tâche en cours';

    // Texte de la tâche
    const taskText = document.createElement('span');
    taskText.className = `task-text ${task.completed ? 'completed' : ''}`;
    taskText.textContent = task.name;

    // Date d'échéance
    const dueDate = document.createElement('span');
    dueDate.className = `due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}`;
    dueDate.textContent = formatDate(task.dueDate);

    // Conteneur des boutons
    const taskButtons = document.createElement('div');
    taskButtons.className = 'task-buttons';

    // Bouton de complétion
    const completeBtn = document.createElement('button');
    completeBtn.className = `complete-btn ${task.completed ? 'completed' : ''}`;
    completeBtn.innerHTML = task.completed ? '✓ Terminé' : 'Terminer';
    completeBtn.onclick = () => toggleTaskCompletion(task.id);

    // Bouton d'édition
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.innerHTML = '✎ Modifier';
    editBtn.onclick = () => editTask(task.id);

    // Bouton de suppression
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '✕ Supprimer';
    deleteBtn.onclick = () => deleteTask(task.id);

    // Ajout des boutons au conteneur
    taskButtons.appendChild(completeBtn);
    taskButtons.appendChild(editBtn);
    taskButtons.appendChild(deleteBtn);

    // Ajout des éléments au conteneur de tâche
    taskContainer.appendChild(statusIcon);
    taskContainer.appendChild(taskText);
    taskContainer.appendChild(dueDate);
    taskContainer.appendChild(taskButtons);

    // Ajout du conteneur à la liste
    li.appendChild(taskContainer);
    return li;
}

// Fonction pour éditer une tâche
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskElement = document.querySelector(`li[data-id="${taskId}"]`);
    const taskText = taskElement.querySelector('.task-text');
    const taskButtons = taskElement.querySelector('.task-buttons');

    // Créer un champ de saisie
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-editable';
    input.value = task.name;
    input.placeholder = 'Modifier la tâche...';

    taskText.replaceWith(input);
    input.focus();
    taskButtons.style.display = 'none';

    // Fonction pour sauvegarder les modifications
    const saveEdit = () => {
        const newText = input.value.trim();
        if (newText) {
            task.name = newText;
            saveTasks();
            showNotification('Tâche modifiée avec succès', 'success');
        }
        // Restaurer l'affichage normal
        const newTaskText = document.createElement('span');
        newTaskText.className = `task-text ${task.completed ? 'completed' : ''}`;
        newTaskText.textContent = task.name;
        input.replaceWith(newTaskText);
        taskButtons.style.display = 'flex';
    };

    // Sauvegarder lors de la pression sur Entrée
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });

    // Sauvegarder lors de la perte de focus
    input.addEventListener('blur', saveEdit);
}

// Filtre les tâches selon les critères choisis
function filterTasks(tasks) {
  let filteredTasks = [...tasks];

  // Filtre par statut (toutes, en cours, terminées)
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

  // Filtre par date
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

  // Trie les tâches
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

// Change le filtre actuel
function setFilter(filter) {
  currentFilter = filter;
  loadTasks();
}

// Affiche une notification à l'écran
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

// Supprime une tâche
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

// Ajoute une nouvelle tâche
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

// Change le statut d'une tâche (terminée/en cours)
function toggleTaskCompletion(id) {
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    showNotification(`Tâche marquée comme ${tasks[taskIndex].completed ? 'terminée' : 'en cours'}`);
    loadTasks();
  }
}

// Sauvegarde les tâches dans le localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  loadTasks();
}

// Écouteurs pour les filtres
sortBySelect.addEventListener('change', () => {
  currentSort = sortBySelect.value;
  displayTasks(tasks);
});

dueDateFilter.addEventListener('change', () => {
  currentDueFilter = dueDateFilter.value;
  displayTasks(tasks);
});

// Initialise l'application
function initializeApp() {
  initializeTheme();
  checkAuth();
}

// Démarre l'application
initializeApp();

// Fonction pour vérifier si une tâche est en retard
function isOverdue(dueDate) {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

// Fonction pour formater la date
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}
  