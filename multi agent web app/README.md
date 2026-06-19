# 🧠 Smart Task Manager (AI-Powered)

Smart Task Manager is a premium, glassmorphic, and highly interactive web application designed to help users manage tasks efficiently. The project was built using a **multi-agent orchestration workflow** powered by the **Google AntiGravity SDK** combined with **Claude Code**.

The application is implemented in pure, semantic **HTML5**, **CSS3**, and **JavaScript** (no third-party frameworks or build steps required), featuring LocalStorage persistence, a dark/light theme, real-time search, priority filtering, and overdue warnings.

---

## 📸 Deliverables & Architecture

### 1. Glassmorphic Dark Mode Dashboard
![Smart Task Manager Dashboard Mockup](https://raw.githubusercontent.com/vishu/multi-agent-web-app/main/task_manager_ui_mockup_1781898095993.png)

### 2. Multi-Agent System Architecture Flow
![AntiGravity Multi-Agent Architecture](https://raw.githubusercontent.com/vishu/multi-agent-web-app/main/antigravity_agent_setup_1781898110889.png)

---

## 🤖 Multi-Agent Setup & Collaboration Prompts

The system was designed and integrated via 4 specialized subagents running concurrently under the AntiGravity SDK. Below are the roles, IDs, and the exact prompts executed by each agent:

### 1. Planning Agent (`planning_agent`)
* **Role**: Smart Task Manager Project Planner
* **ID**: `1f5d4879-9feb-4d9a-b168-f16341b40453`
* **Prompt Used**:
  > *Create a project plan for a Smart Task Manager application. Define features, folder structure, workflow, and implementation strategy using modern frontend technologies. Write this to plan.md in the workspace. Then, initialize empty or placeholder files for index.html, style.css, app.js, and README.md in the workspace.*

### 2. Frontend Agent (`frontend_agent`)
* **Role**: Task Manager Frontend Designer
* **ID**: `52c92d1b-bb30-4047-b360-bc495ff5d1ed`
* **Prompt Used**:
  > *Design a modern and responsive Task Manager UI with task input, add button, pending tasks section, completed tasks section, task counter, and mobile responsive layout. Please edit index.html and style.css in the workspace to implement these designs, using the write_to_file tool directly without running terminal commands. Ensure you implement glassmorphism, dark/light theme properties, task priority visual indicators, and overdue warnings.*

### 3. Backend Logic Agent (`backend_logic_agent`)
* **Role**: Task Manager Backend Logic Developer
* **ID**: `0836e203-bbdf-47cc-838c-b329db557037`
* **Prompt Used**:
  > *Implement task management functionality including add, delete, complete task actions and localStorage persistence. Write the logic in app.js in the workspace using the write_to_file tool directly without running terminal commands. Ensure you write robust state mutations and structure a render() function that generates the HTML for task cards matching index.html.*

### 4. Integration & Testing Agent (`integration_agent`)
* **Role**: Task Manager System Integration Developer
* **ID**: `66fcad9b-2fb1-44ac-b85d-ea1e0f3cafb8`
* **Prompt Used**:
  > *Integrate frontend and backend functionality. Test all user flows and fix any issues. Specifically, edit index.html to remove the temporary script block, edit app.js to wire up all the DOM event listeners (form submit, check/complete, edit modal, delete modal, search, tab filters, priority filter, theme toggles, and dialog modal confirmations), and verify the user flow. Please execute this work in the workspace using the write_to_file and replace_file_content tools directly without running terminal commands.*

---

## 📋 Implemented Features

### Core Capabilities (100% Completed)
* **Add Task**: Input details (Title, Priority, and Due Date) with auto-validation and timezone-shift protection.
* **Mark Completed**: Instantly move tasks to the completed column with dynamic visual feedback (strikethrough & faded glass effect).
* **Delete Task**: Accessible confirmation dialog (`<dialog>` modal) before deleting a task from the client state.
* **Columns Layout**: Separate sections for **Pending** and **Completed** tasks that dynamically expand when filters are activated.
* **Progress Tracking**: Responsive counters for Total, Pending, and Completed tasks paired with a glowing progress bar.

### UX Enhancement Features (100% Completed)
1. **Interactive Demo Loader**: Instantly populate the task list with sample pre-configured mockup tasks using the "Load Sample Tasks" button in the header.
2. **Dynamic Spacing & Breakpoints**:
   - Sidebar auto-collapses from two columns to one at `1180px` screen width to prevent cards from becoming squeezed.
   - Sidebar is set to `320px` width to save desktop space.
   - On mobile viewports (`768px`), the "Load Sample Tasks" button transforms from a text-pill to a compact circular button.
3. **Live Search**: Instantly filters tasks by typing text keywords.
4. **Priority Filtering**: Dropdown filter selector to display only High, Medium, or Low priority tasks.
5. **Due Date & Overdue Indicators**: Automatically flags overdue items with a glowing crimson warning border.
6. **Dark/Light Theme Toggle**: Full light/dark mode support with persistent choice cached in LocalStorage.

---

## 🚀 How to Run the Application

Since this is a client-side vanilla JavaScript app, you can launch it instantly:

### Option A: Local Web Server (Recommended)
1. Open your terminal in the workspace directory:
   ```bash
   cd "/Users/vishu/Documents/multi agent web app"
   ```
2. Start a Python HTTP server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open your browser and navigate to:
   [http://localhost:8000](http://localhost:8000)

### Option B: Direct File Run
You can double-click the `index.html` file in your system file explorer to open it directly:
* [index.html](file:///Users/vishu/Desktop/multi%20agent%20web%20app/index.html)
