# Smart Task Manager - Project Plan

This document outlines the architecture, features, implementation phases, and design considerations for the Smart Task Manager application.

## 1. Project Overview
The Smart Task Manager is a responsive, highly interactive web application designed to help users manage tasks efficiently. It leverages modern, semantic frontend technologies to deliver a fast, accessible, and user-friendly experience without external framework overhead.

---

## 2. Core Features
The application supports the following functionality:
- **Task Management**:
  - Add tasks with details (Title, Priority, Due Date).
  - Complete/Toggle tasks (strikes through text, moves to completed state).
  - Delete tasks (with confirmation).
- **Views & Filtering**:
  - **All View**: Lists all tasks.
  - **Active View**: Shows tasks that are yet to be completed.
  - **Completed View**: Shows completed tasks.
- **Search**:
  - Real-time search filtering tasks by title as the user types.
- **Priority Levels**:
  - Low, Medium, High priorities with distinct color-coded indicators.
  - Sorting and organization based on priority levels.
- **Due Dates & Overdue Status**:
  - Tasks can have due dates.
  - Visual indicator (e.g., warning text or badge) when a task is overdue.
- **Task Analytics/Counts**:
  - Counters showing the number of Active, Completed, and Total tasks.
- **Dark Mode**:
  - Detects system preferences automatically.
  - Manual toggle button that persists the preference in `localStorage`.
- **Persistence**:
  - Auto-save state to `localStorage` so data is preserved upon reload.

---

## 3. Technology Stack & Modern Web APIs
To ensure performance, responsiveness, and clean code, we use:
- **HTML5**:
  - Semantic tags (`<header>`, `<main>`, `<footer>`, `<section>`).
  - `<dialog>` element for interactive modals (e.g., task details or delete confirmations).
  - Modern form validation (`required`, `<input type="date">`).
- **CSS3**:
  - CSS Custom Properties (Variables) for theming (Light/Dark mode transitions).
  - CSS Flexbox and Grid for layout structures and responsiveness.
  - CSS Nesting (native modern CSS nesting).
  - Modern selectors like `:has()` to style list items based on checkbox state.
  - Container Queries for component responsiveness.
- **JavaScript (ES6+)**:
  - Clean modular script design.
  - LocalStorage API for task persistence.
  - Event Delegation for high-performance interaction handlers.
  - Date API for due date calculations.

---

## 4. File Structure
The project will be laid out in the workspace as follows:
```
/Users/vishu/Documents/multi agent web app/
├── index.html        # HTML structure & layouts
├── style.css         # Styling, themes, & variables
├── app.js            # Main application state and interactivity script
├── plan.md           # This planning document
└── walkthrough.md    # General project walkthrough & documentation
```

---

## 5. State Management & Design Pattern
The application will utilize a simple **State-driven Rendering Pattern** in `app.js` to ensure the UI is a pure function of the application state.

### Application State
```javascript
const state = {
  tasks: [],            // Array of Task objects: { id, title, completed, priority, dueDate }
  currentFilter: 'all', // 'all' | 'active' | 'completed'
  searchQuery: '',      // String for search filtering
  theme: 'light'        // 'light' | 'dark'
};
```

### Flow of Execution
1. **Init**: Load state from `localStorage` (tasks and theme). Apply active theme class.
2. **Action / Event**: User clicks "Add Task", "Toggle Complete", "Delete", "Filter", or types search.
3. **State Mutator**: Function updates the `state` object and commits to `localStorage`.
4. **Render UI**: `render()` function updates the DOM lists, counts, and search results to match current state.

---

## 6. Implementation Roadmap
- **Phase 1: Planning and File Initialization**: Set up `plan.md` and placeholder files for CSS, JS, HTML, and README.
- **Phase 2: HTML Skeleton**: Code the semantic layout, header, footer, filters bar, list container, and modal dialogs.
- **Phase 3: Visual Design & Theming**: Set up variables in `style.css` for light/dark themes, build responsive grids, style components, and implement clean animations.
- **Phase 4: JavaScript Core Mechanics**: Build the core functions in `app.js` to handle state logic, DOM updates, task addition, status toggling, deletion, and local storage synchronization.
- **Phase 5: Search, Filters, Priority, & Due Dates**: Implement filtering logic, real-time search logic, sorting by priority or date, due date checks (marking overdue tasks), and update task counts.
- **Phase 6: Accessibility (a11y) & Polish**: Add keyboard navigation, ARIA attributes, semantic focus styling, perform responsive testing, and finalize details.
