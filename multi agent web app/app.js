/**
 * Smart Task Manager - Backend Logic
 * Core task management logic, state mutations, local storage persistence, and reactive rendering.
 */

// --- State Model ---
const state = {
  tasks: [],
  filter: 'all',          // 'all' | 'pending' | 'completed'
  searchQuery: '',        // String for filter matching
  priorityFilter: 'all',  // 'all' | 'low' | 'medium' | 'high'
  theme: 'dark'           // 'light' | 'dark'
};

// --- Helper Functions ---

/**
 * Escapes special HTML characters to prevent XSS.
 * @param {string} str 
 * @returns {string}
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

/**
 * Parses a YYYY-MM-DD date string using local time zones to avoid timezone shift.
 * @param {string} dateStr 
 * @returns {Date}
 */
function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats a YYYY-MM-DD string into a friendly date representation (e.g. "June 15, 2026").
 * @param {string} dateStr 
 * @returns {string}
 */
function formatFriendlyDate(dateStr) {
  if (!dateStr) return '';
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Checks if a task's due date is overdue compared to today (at midnight).
 * @param {string} dueDateStr 
 * @returns {boolean}
 */
function isOverdue(dueDateStr) {
  if (!dueDateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = parseLocalDate(dueDateStr);
  return dueDate < today;
}

/**
 * Calculates overdue duration or returns formatted due date label.
 * @param {string} dueDateStr 
 * @returns {string}
 */
function getDueDateLabel(dueDateStr) {
  if (!dueDateStr) return '';
  const formatted = formatFriendlyDate(dueDateStr);
  if (isOverdue(dueDateStr)) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = parseLocalDate(dueDateStr);
    const diffTime = today - dueDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const dayLabel = diffDays === 1 ? 'day' : 'days';
    return `Due: ${formatted} (${diffDays} ${dayLabel} ago)`;
  }
  return `Due: ${formatted}`;
}

// --- Persistence & Demo Data ---

/**
 * Populates the state with 5 premium mockup tasks.
 */
function loadDemoData() {
  state.tasks = [
    {
      id: 'task-mock-1',
      title: 'Review Q3 Budget Proposal & Allocations',
      completed: false,
      priority: 'high',
      dueDate: '2026-06-15',
      completedDate: null
    },
    {
      id: 'task-mock-2',
      title: 'Design Landing Page Hero Section Layout',
      completed: false,
      priority: 'medium',
      dueDate: '2026-06-22',
      completedDate: null
    },
    {
      id: 'task-mock-3',
      title: 'Update Project Node Packages & Dependencies',
      completed: false,
      priority: 'low',
      dueDate: '2026-06-28',
      completedDate: null
    },
    {
      id: 'task-mock-4',
      title: 'Setup Daily Cloud Database Automated Backups',
      completed: true,
      priority: 'high',
      dueDate: '2026-06-18',
      completedDate: '2026-06-18'
    },
    {
      id: 'task-mock-5',
      title: 'Draft Weekly Internal Team Status Email',
      completed: true,
      priority: 'low',
      dueDate: '2026-06-19',
      completedDate: '2026-06-19'
    }
  ];
  saveState();
  render();
}

/**
 * Loads tasks and theme preference from local storage.
 */
function loadState() {
  const storedTasks = localStorage.getItem('tasks');
  if (storedTasks) {
    try {
      state.tasks = JSON.parse(storedTasks);
      if (!Array.isArray(state.tasks)) {
        state.tasks = [];
      }
    } catch (e) {
      console.error('Error parsing tasks from local storage:', e);
      state.tasks = [];
    }
  }
  
  // If no tasks found, load the default demo tasks
  if (state.tasks.length === 0) {
    state.tasks = [
      {
        id: 'task-mock-1',
        title: 'Review Q3 Budget Proposal & Allocations',
        completed: false,
        priority: 'high',
        dueDate: '2026-06-15',
        completedDate: null
      },
      {
        id: 'task-mock-2',
        title: 'Design Landing Page Hero Section Layout',
        completed: false,
        priority: 'medium',
        dueDate: '2026-06-22',
        completedDate: null
      },
      {
        id: 'task-mock-3',
        title: 'Update Project Node Packages & Dependencies',
        completed: false,
        priority: 'low',
        dueDate: '2026-06-28',
        completedDate: null
      },
      {
        id: 'task-mock-4',
        title: 'Setup Daily Cloud Database Automated Backups',
        completed: true,
        priority: 'high',
        dueDate: '2026-06-18',
        completedDate: '2026-06-18'
      },
      {
        id: 'task-mock-5',
        title: 'Draft Weekly Internal Team Status Email',
        completed: true,
        priority: 'low',
        dueDate: '2026-06-19',
        completedDate: '2026-06-19'
      }
    ];
    saveState();
  }

  // Load theme (default to dark if not set)
  state.theme = localStorage.getItem('theme') || 'dark';
}

/**
 * Saves tasks and theme preference to local storage.
 */
function saveState() {
  localStorage.setItem('tasks', JSON.stringify(state.tasks));
  localStorage.setItem('theme', state.theme);
}

// --- Core Operations ---

/**
 * Adds a new task to the state.
 * @param {string} title 
 * @param {string} priority - 'low' | 'medium' | 'high'
 * @param {string} dueDate - YYYY-MM-DD format
 * @returns {object} The created task object
 */
function addTask(title, priority = 'medium', dueDate = '') {
  // Validation
  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new Error('Task title must be a non-empty string.');
  }

  const validPriorities = ['low', 'medium', 'high'];
  const cleanPriority = validPriorities.includes(priority) ? priority : 'medium';

  let cleanDueDate = '';
  if (dueDate) {
    if (isNaN(Date.parse(dueDate))) {
      throw new Error('Invalid due date format. Expected YYYY-MM-DD.');
    }
    cleanDueDate = dueDate;
  }

  const newTask = {
    id: `task-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    title: title.trim(),
    completed: false,
    priority: cleanPriority,
    dueDate: cleanDueDate,
    completedDate: null
  };

  state.tasks.push(newTask);
  saveState();
  render();
  return newTask;
}

/**
 * Deletes a task from the state by ID.
 * @param {string} id 
 * @returns {boolean} True if successful, false otherwise
 */
function deleteTask(id) {
  const index = state.tasks.findIndex(task => task.id === id);
  if (index === -1) return false;

  state.tasks.splice(index, 1);
  saveState();
  render();
  return true;
}

/**
 * Toggles the completed status of a task and sets or clears the completed date.
 * @param {string} id 
 * @returns {boolean} True if successful, false otherwise
 */
function toggleTaskComplete(id) {
  const task = state.tasks.find(task => task.id === id);
  if (!task) return false;

  task.completed = !task.completed;
  if (task.completed) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    task.completedDate = `${year}-${month}-${day}`;
  } else {
    task.completedDate = null;
  }

  saveState();
  render();
  return true;
}

/**
 * Updates an existing task with new field values.
 * @param {string} id 
 * @param {object} updatedFields - { title, priority, dueDate }
 * @returns {boolean} True if successful, false otherwise
 */
function updateTask(id, updatedFields) {
  const task = state.tasks.find(task => task.id === id);
  if (!task) return false;

  if (updatedFields.title !== undefined) {
    if (typeof updatedFields.title !== 'string' || updatedFields.title.trim() === '') {
      throw new Error('Task title must be a non-empty string.');
    }
    task.title = updatedFields.title.trim();
  }

  if (updatedFields.priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(updatedFields.priority)) {
      throw new Error('Invalid priority. Choose low, medium, or high.');
    }
    task.priority = updatedFields.priority;
  }

  if (updatedFields.dueDate !== undefined) {
    let cleanDueDate = '';
    if (updatedFields.dueDate) {
      if (isNaN(Date.parse(updatedFields.dueDate))) {
        throw new Error('Invalid due date format. Expected YYYY-MM-DD.');
      }
      cleanDueDate = updatedFields.dueDate;
    }
    task.dueDate = cleanDueDate;
  }

  saveState();
  render();
  return true;
}

/**
 * Sets the application theme and saves to storage.
 * @param {string} theme - 'light' | 'dark'
 */
function setTheme(theme) {
  if (theme !== 'light' && theme !== 'dark') return;
  state.theme = theme;
  saveState();
  if (theme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
}

// --- Rendering Logic ---

/**
 * Rebuilds the HTML template for a single task card.
 * Matches exactly the design classes and structure of index.html.
 * @param {object} task 
 * @returns {string} HTML string
 */
function generateTaskCardHTML(task) {
  const priorityLabels = {
    low: 'Low Priority',
    medium: 'Medium Priority',
    high: 'High Priority'
  };

  const priorityLabel = priorityLabels[task.priority] || 'Medium Priority';
  const isTaskOverdue = !task.completed && isOverdue(task.dueDate);

  // Determine card classes
  let cardClasses = 'task-card';
  if (task.completed) cardClasses += ' completed';
  cardClasses += ` priority-${task.priority}`;
  if (isTaskOverdue) cardClasses += ' overdue';

  // Badges structure
  let badgesHTML = `<span class="priority-badge">${priorityLabel}</span>`;
  if (task.completed) {
    badgesHTML += `
      <span class="completed-badge">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Completed
      </span>`;
  } else if (isTaskOverdue) {
    badgesHTML += `
      <span class="warning-badge">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        Overdue
      </span>`;
  }

  // Meta structure (Due date or Completed Date)
  let metaHTML = '';
  if (task.completed) {
    const compDateStr = formatFriendlyDate(task.completedDate || task.dueDate);
    metaHTML = `
      <span class="completed-date">
        Completed on ${compDateStr}
      </span>`;
  } else if (task.dueDate) {
    const dateLabel = getDueDateLabel(task.dueDate);
    const dangerClass = isTaskOverdue ? ' text-danger' : '';
    metaHTML = `
      <span class="due-date${dangerClass}">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        ${dateLabel}
      </span>`;
  } else {
    metaHTML = `
      <span class="due-date">
        No due date
      </span>`;
  }

  // Actions structure
  let actionsHTML = '';
  if (task.completed) {
    actionsHTML = `
      <button class="btn-action btn-reopen" aria-label="Reopen task" data-id="${task.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0-.57-8.38l5.67-5.67"></path></svg>
        <span>Reopen</span>
      </button>
      <div class="action-subgroup">
        <button class="btn-icon-action btn-delete-task btn-danger-action" aria-label="Delete task" data-id="${task.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>`;
  } else {
    actionsHTML = `
      <button class="btn-action btn-complete" aria-label="Mark task as complete" data-id="${task.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>Complete</span>
      </button>
      <div class="action-subgroup">
        <button class="btn-icon-action btn-edit-task" aria-label="Edit task" data-id="${task.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="btn-icon-action btn-delete-task btn-danger-action" aria-label="Delete task" data-id="${task.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>`;
  }

  return `
    <div class="${cardClasses}" tabindex="0" data-id="${task.id}">
      <div class="task-card-header">
        <div class="badge-row">
          ${badgesHTML}
        </div>
      </div>
      <h3 class="task-title">${escapeHTML(task.title)}</h3>
      <div class="task-meta">
        ${metaHTML}
      </div>
      <div class="task-actions">
        ${actionsHTML}
      </div>
    </div>
  `;
}

/**
 * Main render function that synchronizes the DOM with the state.
 */
function render() {
  // 1. Calculate and update dashboard stats (based on entire unfiltered task list)
  const totalTasksCount = state.tasks.length;
  const pendingTasksCount = state.tasks.filter(t => !t.completed).length;
  const completedTasksCount = state.tasks.filter(t => t.completed).length;
  const progressPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // DOM Stats references
  const totalStatVal = document.querySelector('.stat-icon-wrapper.total + .stat-info .stat-value');
  const pendingStatVal = document.querySelector('.stat-icon-wrapper.pending + .stat-info .stat-value');
  const completedStatVal = document.querySelector('.stat-icon-wrapper.completed + .stat-info .stat-value');
  const progressPctText = document.querySelector('.progress-percentage');
  const progressBar = document.querySelector('.progress-bar');

  if (totalStatVal) totalStatVal.textContent = totalTasksCount;
  if (pendingStatVal) pendingStatVal.textContent = pendingTasksCount;
  if (completedStatVal) completedStatVal.textContent = completedTasksCount;
  if (progressPctText) progressPctText.textContent = `${progressPercentage}%`;
  if (progressBar) progressBar.style.width = `${progressPercentage}%`;

  // 2. Filter and search tasks for column lists
  const filteredTasks = state.tasks.filter(task => {
    // Priority filter match
    if (state.priorityFilter !== 'all' && task.priority !== state.priorityFilter) {
      return false;
    }
    // Search query match
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      if (!task.title.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  const pendingTasksList = filteredTasks.filter(t => !t.completed);
  const completedTasksList = filteredTasks.filter(t => t.completed);

  // 3. Render lists and column badges
  const pendingBadge = document.querySelector('#pending-section .column-badge.pending');
  const completedBadge = document.querySelector('#completed-section .column-badge.completed');

  if (pendingBadge) pendingBadge.textContent = pendingTasksList.length;
  if (completedBadge) completedBadge.textContent = completedTasksList.length;

  const pendingContainer = document.querySelector('#pending-section .task-list');
  const completedContainer = document.querySelector('#completed-section .task-list');

  const emptyPendingHTML = `
    <div class="empty-state-card glass-panel" style="text-align: center; padding: 2.5rem 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; border-style: dashed; border-width: 2px; background: rgba(255,255,255,0.01);">
      <div class="empty-icon-wrapper" style="width: 50px; height: 50px; border-radius: 50%; background: rgba(168, 85, 247, 0.1); display: flex; align-items: center; justify-content: center; color: var(--primary-color);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      </div>
      <div style="font-weight: 700; font-size: 1.05rem; letter-spacing: -0.01em;">Your task list is empty!</div>
      <p style="color: var(--text-secondary); font-size: 0.85rem; max-width: 220px; line-height: 1.4; margin: 0;">Add a new task using the form on the left, or reload sample tasks below.</p>
      <button id="btn-load-demo-empty" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8rem; border-radius: 8px; margin-top: 0.25rem; box-shadow: none; width: auto; height: auto;">Load Demo Data</button>
    </div>`;

  const emptyCompletedHTML = `
    <div class="empty-state-card glass-panel" style="text-align: center; padding: 2.5rem 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; border-style: dashed; border-width: 2px; background: rgba(255,255,255,0.01);">
      <div class="empty-icon-wrapper" style="width: 50px; height: 50px; border-radius: 50%; background: rgba(34, 197, 94, 0.1); display: flex; align-items: center; justify-content: center; color: var(--completed-border);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <div style="font-weight: 700; font-size: 1.05rem; letter-spacing: -0.01em;">No completed tasks</div>
      <p style="color: var(--text-secondary); font-size: 0.85rem; max-width: 220px; line-height: 1.4; margin: 0;">Completed tasks will show up here to track your progress.</p>
    </div>`;

  if (pendingContainer) {
    if (pendingTasksList.length === 0) {
      pendingContainer.innerHTML = emptyPendingHTML;
    } else {
      pendingContainer.innerHTML = pendingTasksList.map(generateTaskCardHTML).join('');
    }
  }

  if (completedContainer) {
    if (completedTasksList.length === 0) {
      completedContainer.innerHTML = emptyCompletedHTML;
    } else {
      completedContainer.innerHTML = completedTasksList.map(generateTaskCardHTML).join('');
    }
  }

  // 4. Synchronize Active tab buttons and section display layout
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    const isSelected = tab.getAttribute('data-tab') === state.filter;
    tab.classList.toggle('active', isSelected);
    tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  });

  const pendingSection = document.getElementById('pending-section');
  const completedSection = document.getElementById('completed-section');
  const grid = document.querySelector('.task-lists-grid');

  if (state.filter === 'all') {
    if (pendingSection) pendingSection.style.display = 'block';
    if (completedSection) completedSection.style.display = 'block';
    if (grid) grid.style.gridTemplateColumns = ''; // Restore grid layout
  } else if (state.filter === 'pending') {
    if (pendingSection) pendingSection.style.display = 'block';
    if (completedSection) completedSection.style.display = 'none';
    if (grid) grid.style.gridTemplateColumns = '1fr'; // Full width single column
  } else if (state.filter === 'completed') {
    if (pendingSection) pendingSection.style.display = 'none';
    if (completedSection) completedSection.style.display = 'block';
    if (grid) grid.style.gridTemplateColumns = '1fr'; // Full width single column
  }
}

// --- Application Startup ---
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  // Apply loaded theme to body
  if (state.theme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }

  render();

  // Cached IDs for modal forms
  let activeEditId = null;
  let activeDeleteId = null;

  // Dialog elements
  const editDialog = document.getElementById('edit-dialog');
  const deleteDialog = document.getElementById('delete-dialog');

  // Form Submission
  const taskForm = document.getElementById('task-form');
  if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('task-title');
      const prioritySelect = document.getElementById('task-priority');
      const dueDateInput = document.getElementById('task-due-date');
      
      const title = titleInput ? titleInput.value : '';
      const priority = prioritySelect ? prioritySelect.value : 'medium';
      const dueDate = dueDateInput ? dueDateInput.value : '';
      
      addTask(title, priority, dueDate);
      taskForm.reset();
    });
  }

  // Event Delegation on Task Card Actions
  document.addEventListener('click', (event) => {
    const target = event.target;
    
    // Load Demo button delegation (header or empty state)
    const loadDemoBtn = target.closest('#btn-load-demo') || target.closest('#btn-load-demo-empty');
    if (loadDemoBtn) {
      loadDemoData();
      return;
    }
    
    // Complete/Reopen button delegation
    const completeBtn = target.closest('.btn-complete');
    const reopenBtn = target.closest('.btn-reopen');
    if (completeBtn) {
      const id = completeBtn.dataset.id || completeBtn.closest('.task-card').dataset.id;
      toggleTaskComplete(id);
      return;
    }
    if (reopenBtn) {
      const id = reopenBtn.dataset.id || reopenBtn.closest('.task-card').dataset.id;
      toggleTaskComplete(id);
      return;
    }

    // Delete button delegation
    const deleteBtn = target.closest('.btn-delete-task');
    if (deleteBtn) {
      const id = deleteBtn.dataset.id || deleteBtn.closest('.task-card').dataset.id;
      activeDeleteId = id;
      if (deleteDialog) {
        deleteDialog.showModal();
      }
      return;
    }

    // Edit button delegation
    const editBtn = target.closest('.btn-edit-task');
    if (editBtn) {
      const id = editBtn.dataset.id || editBtn.closest('.task-card').dataset.id;
      activeEditId = id;
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        const editTitle = document.getElementById('edit-title');
        const editPriority = document.getElementById('edit-priority');
        const editDueDate = document.getElementById('edit-due-date');
        
        if (editTitle) editTitle.value = task.title;
        if (editPriority) editPriority.value = task.priority;
        if (editDueDate) editDueDate.value = task.dueDate || '';
        
        if (editDialog) {
          editDialog.showModal();
        }
      }
      return;
    }
  });

  // Edit Modal Cancel Actions
  const btnCloseEdit = document.getElementById('btn-close-edit');
  const btnCancelEdit = document.getElementById('btn-cancel-edit');
  if (btnCloseEdit) {
    btnCloseEdit.addEventListener('click', () => {
      if (editDialog) editDialog.close();
    });
  }
  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', () => {
      if (editDialog) editDialog.close();
    });
  }

  // Edit Modal Confirm Action
  const editForm = document.getElementById('edit-form');
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updatedFields = {
        title: document.getElementById('edit-title').value,
        priority: document.getElementById('edit-priority').value,
        dueDate: document.getElementById('edit-due-date').value
      };
      if (activeEditId) {
        updateTask(activeEditId, updatedFields);
      }
      if (editDialog) editDialog.close();
    });
  }

  // Delete Modal Cancel Actions
  const btnCloseDelete = document.getElementById('btn-close-delete');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  if (btnCloseDelete) {
    btnCloseDelete.addEventListener('click', () => {
      if (deleteDialog) deleteDialog.close();
    });
  }
  if (btnCancelDelete) {
    btnCancelDelete.addEventListener('click', () => {
      if (deleteDialog) deleteDialog.close();
    });
  }

  // Delete Modal Confirm Action
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', () => {
      if (activeDeleteId) {
        deleteTask(activeDeleteId);
      }
      if (deleteDialog) deleteDialog.close();
    });
  }

  // Dialog close event cleanups
  if (editDialog) {
    editDialog.addEventListener('close', () => {
      activeEditId = null;
    });
  }
  if (deleteDialog) {
    deleteDialog.addEventListener('close', () => {
      activeDeleteId = null;
    });
  }

  // Real-time Search
  const searchInput = document.getElementById('task-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      render();
    });
  }

  // Priority Filter
  const priorityFilter = document.getElementById('priority-filter');
  if (priorityFilter) {
    priorityFilter.addEventListener('change', (e) => {
      state.priorityFilter = e.target.value;
      render();
    });
  }

  // Filter Tabs
  const filterTabsContainer = document.querySelector('.filter-tabs');
  if (filterTabsContainer) {
    filterTabsContainer.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.tab-btn');
      if (tabBtn) {
        state.filter = tabBtn.getAttribute('data-tab');
        render();
      }
    });
  }

  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      setTheme(nextTheme);
    });
  }
});
