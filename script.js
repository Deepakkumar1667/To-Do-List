const STORAGE_KEY = 'taskflow-tasks';

const taskForm = document.querySelector('#add-task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const emptyStateTitle = document.querySelector('#empty-state-title');
const emptyStateMessage = document.querySelector('#empty-state-message');
const clearCompletedButton = document.querySelector('#clear-completed');
const filterButtons = document.querySelectorAll('.filter-button');
const totalCount = document.querySelector('#total-count');
const activeCount = document.querySelector('#active-count');
const completedCount = document.querySelector('#completed-count');

let tasks = loadTasks();
let currentFilter = 'all';

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTask(title) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    title,
    completed: false,
  };
}

function getVisibleTasks() {
  if (currentFilter === 'active') {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === 'completed') {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  taskList.replaceChildren();

  visibleTasks.forEach((task) => {
    const taskItem = document.createElement('article');
    taskItem.className = `task-item${task.completed ? ' is-completed' : ''}`;
    taskItem.dataset.taskId = task.id;

    const checkbox = document.createElement('input');
    checkbox.className = 'task-checkbox';
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark ${task.title} as complete`);
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const title = document.createElement('p');
    title.className = 'task-title';
    title.textContent = task.title;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', `Delete ${task.title}`);
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    taskItem.append(checkbox, title, deleteButton);
    taskList.append(taskItem);
  });

  updateEmptyState(visibleTasks.length);
  updateStatistics();
}

function updateEmptyState(visibleTaskCount) {
  const hasNoVisibleTasks = visibleTaskCount === 0;
  emptyState.hidden = !hasNoVisibleTasks;

  if (tasks.length === 0) {
    emptyStateTitle.textContent = 'Your list is clear';
    emptyStateMessage.textContent = 'Add a task above to start shaping your day.';
  } else if (currentFilter === 'active') {
    emptyStateTitle.textContent = 'All caught up';
    emptyStateMessage.textContent = 'There are no active tasks right now.';
  } else {
    emptyStateTitle.textContent = 'Nothing completed yet';
    emptyStateMessage.textContent = 'Completed tasks will appear here.';
  }
}

function updateStatistics() {
  const completedTasks = tasks.filter((task) => task.completed).length;
  totalCount.textContent = tasks.length;
  activeCount.textContent = tasks.length - completedTasks;
  completedCount.textContent = completedTasks;
  clearCompletedButton.disabled = completedTasks === 0;
}

function addTask(event) {
  event.preventDefault();
  const title = taskInput.value.trim();

  if (!title) {
    taskInput.focus();
    return;
  }

  tasks.unshift(createTask(title));
  saveTasks();
  taskForm.reset();
  renderTasks();
  taskInput.focus();
}

function toggleTask(taskId) {
  tasks = tasks.map((task) => task.id === taskId
    ? { ...task, completed: !task.completed }
    : task);
  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  renderTasks();
}

taskForm.addEventListener('submit', addTask);
clearCompletedButton.addEventListener('click', clearCompletedTasks);
filterButtons.forEach((button) => {
  button.addEventListener('click', () => setFilter(button.dataset.filter));
});

renderTasks();
