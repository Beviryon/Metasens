const express = require('express');
const app = express();
const port = 3000;

// Base de données simulée
let tasks = [
  { 
    id: 1, 
    name: "Exemple de tâche", 
    completed: false,
    createdAt: new Date(),
    dueDate: null,
    order: 0
  }
];

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes API
app.get('/tasks', (req, res) => {
  const sortedTasks = [...tasks].sort((a, b) => {
    // Si l'ordre est défini, utiliser l'ordre personnalisé
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    // Sinon, trier par date de création
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  res.json(sortedTasks);
});

app.post('/tasks', async (req, res) => {
  if (!req.body.name || req.body.name.trim() === '') {
    return res.status(400).json({ error: 'Le nom de la tâche est requis' });
  }
  
  const task = { 
    id: Date.now(), 
    name: req.body.name.trim(),
    completed: false,
    createdAt: new Date(),
    dueDate: req.body.dueDate || null,
    order: tasks.length
  };
  
  tasks.push(task);
  res.status(201).json(task);
});

app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Tâche non trouvée' });
  }

  if (req.body.completed !== undefined) {
    tasks[taskIndex].completed = req.body.completed;
  }
  
  if (req.body.name && req.body.name.trim() !== '') {
    tasks[taskIndex].name = req.body.name.trim();
  }

  if (req.body.dueDate !== undefined) {
    tasks[taskIndex].dueDate = req.body.dueDate;
  }

  if (req.body.order !== undefined) {
    tasks[taskIndex].order = req.body.order;
  }

  res.json(tasks[taskIndex]);
});

// Endpoint pour mettre à jour l'ordre des tâches
app.put('/tasks/reorder', (req, res) => {
  const { orderedIds } = req.body;
  
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'Format invalide' });
  }

  orderedIds.forEach((id, index) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.order = index;
    }
  });

  res.json(tasks);
});

app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Tâche non trouvée' });
  }

  tasks = tasks.filter(t => t.id !== id);
  res.status(204).send();
});

// Démarrage du serveur
app.listen(port, () => console.log(`Serveur démarré sur http://localhost:${port}`));
