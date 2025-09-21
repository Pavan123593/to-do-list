// Enhanced Todo List Application with Modern Features
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.categoryFilter = '';
        this.priorityFilter = '';
        this.darkMode = this.loadTheme();
        this.draggedElement = null;
        this.init();
    }

    init() {
        this.applyTheme();
        this.bindEvents();
        this.render();
        this.updateStats();
        this.updateProgress();
    }

    bindEvents() {
        // Add todo form
        const addForm = document.getElementById('addTodoForm');
        addForm.addEventListener('submit', (e) => this.handleAddTodo(e));

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => this.handleSearch(e));

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });

        // Category and priority filters
        const categoryFilter = document.getElementById('categoryFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        categoryFilter.addEventListener('change', (e) => this.handleCategoryFilter(e));
        priorityFilter.addEventListener('change', (e) => this.handlePriorityFilter(e));

        // Clear completed button
        const clearCompletedBtn = document.getElementById('clearCompleted');
        clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Drag and drop
        this.initDragAndDrop();
    }

    handleAddTodo(e) {
        e.preventDefault();
        const input = document.getElementById('todoInput');
        const dueDate = document.getElementById('dueDate').value;
        const category = document.getElementById('category').value;
        const priority = document.getElementById('priority').value;
        const text = input.value.trim();
        
        if (text) {
            this.addTodo(text, dueDate, category, priority);
            input.value = '';
            document.getElementById('dueDate').value = '';
            document.getElementById('category').value = '';
            document.getElementById('priority').value = 'medium';
            input.focus();
        }
    }

    addTodo(text, dueDate = '', category = '', priority = 'medium') {
        const todo = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: dueDate,
            category: category,
            priority: priority
        };
        
        this.todos.unshift(todo);
        this.saveTodos();
        this.render();
        this.updateStats();
        this.updateProgress();
        this.showNotification('Task added successfully!');
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.updateStats();
            this.updateProgress();
        }
    }

    deleteTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.showConfirmation(
            'Delete Task',
            `Are you sure you want to delete "${todo.text}"?`,
            () => {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveTodos();
                this.render();
                this.updateStats();
                this.updateProgress();
                this.showNotification('Task deleted!');
            }
        );
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const newText = prompt('Edit task:', todo.text);
        if (newText !== null && newText.trim()) {
            todo.text = newText.trim();
            this.saveTodos();
            this.render();
            this.showNotification('Task updated!');
        }
    }

    handleSearch(e) {
        this.searchQuery = e.target.value.toLowerCase();
        this.render();
    }

    handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        this.render();
    }

    handleCategoryFilter(e) {
        this.categoryFilter = e.target.value;
        this.render();
    }

    handlePriorityFilter(e) {
        this.priorityFilter = e.target.value;
        this.render();
    }

    getFilteredTodos() {
        let filtered = this.todos;

        // Status filter
        switch (this.currentFilter) {
            case 'active':
                filtered = filtered.filter(todo => !todo.completed);
                break;
            case 'completed':
                filtered = filtered.filter(todo => todo.completed);
                break;
        }

        // Search filter
        if (this.searchQuery) {
            filtered = filtered.filter(todo => 
                todo.text.toLowerCase().includes(this.searchQuery)
            );
        }

        // Category filter
        if (this.categoryFilter) {
            filtered = filtered.filter(todo => todo.category === this.categoryFilter);
        }

        // Priority filter
        if (this.priorityFilter) {
            filtered = filtered.filter(todo => todo.priority === this.priorityFilter);
        }

        return filtered;
    }

    clearCompleted() {
        const completedCount = this.todos.filter(todo => todo.completed).length;
        if (completedCount === 0) return;

        this.showConfirmation(
            'Clear Completed Tasks',
            `Are you sure you want to delete ${completedCount} completed task(s)?`,
            () => {
                this.todos = this.todos.filter(todo => !todo.completed);
                this.saveTodos();
                this.render();
                this.updateStats();
                this.updateProgress();
                this.showNotification(`${completedCount} completed task(s) cleared!`);
            }
        );
    }

    toggleTheme() {
        this.darkMode = !this.darkMode;
        this.applyTheme();
        this.saveTheme();
    }

    applyTheme() {
        const body = document.body;
        const themeIcon = document.querySelector('#themeToggle i');
        
        if (this.darkMode) {
            body.classList.add('dark-mode');
            themeIcon.className = 'fas fa-sun';
        } else {
            body.classList.remove('dark-mode');
            themeIcon.className = 'fas fa-moon';
        }
    }

    updateProgress() {
        const totalTodos = this.todos.length;
        const completedTodos = this.todos.filter(todo => todo.completed).length;
        const percentage = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
        
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}% Complete`;
    }

    render() {
        const todosList = document.getElementById('todosList');
        const emptyState = document.getElementById('emptyState');
        const filteredTodos = this.getFilteredTodos();

        // Clear current todos
        todosList.innerHTML = '';

        if (filteredTodos.length === 0) {
            emptyState.style.display = 'block';
            todosList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            todosList.style.display = 'block';

            filteredTodos.forEach(todo => {
                const todoElement = this.createTodoElement(todo);
                todosList.appendChild(todoElement);
            });
        }

        this.updateClearButton();
    }

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`;
        li.setAttribute('data-id', todo.id);
        li.draggable = true;

        const dueDateText = this.formatDueDate(todo.dueDate);
        const categoryText = this.getCategoryText(todo.category);
        const priorityText = this.getPriorityText(todo.priority);

        li.innerHTML = `
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="app.toggleTodo('${todo.id}')">
                ${todo.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <div class="todo-content">
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-meta">
                    ${categoryText ? `<span class="todo-category">${categoryText}</span>` : ''}
                    ${dueDateText ? `<span class="todo-due-date ${this.getDueDateClass(todo.dueDate)}">${dueDateText}</span>` : ''}
                    <span class="todo-priority">${priorityText}</span>
                </div>
            </div>
            <div class="todo-actions">
                <button class="action-btn edit-btn" onclick="app.editTodo('${todo.id}')" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="app.deleteTodo('${todo.id}')" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return li;
    }

    formatDueDate(dueDate) {
        if (!dueDate) return '';
        
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
        } else if (diffDays === 0) {
            return 'Due today';
        } else if (diffDays === 1) {
            return 'Due tomorrow';
        } else if (diffDays <= 7) {
            return `Due in ${diffDays} days`;
        } else {
            return `Due ${due.toLocaleDateString()}`;
        }
    }

    getDueDateClass(dueDate) {
        if (!dueDate) return '';
        
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'overdue';
        if (diffDays <= 3) return 'due-soon';
        return '';
    }

    getCategoryText(category) {
        const categories = {
            'work': '💼 Work',
            'personal': '👤 Personal',
            'shopping': '🛒 Shopping',
            'health': '🏥 Health',
            'education': '📚 Education',
            'finance': '💰 Finance',
            'other': '📝 Other'
        };
        return categories[category] || '';
    }

    getPriorityText(priority) {
        const priorities = {
            'high': '🔴 High',
            'medium': '🟡 Medium',
            'low': '🟢 Low'
        };
        return priorities[priority] || '';
    }

    updateStats() {
        const activeTodos = this.todos.filter(todo => !todo.completed);
        const countElement = document.getElementById('todoCount');
        
        if (activeTodos.length === 0) {
            countElement.textContent = 'All tasks completed! 🎉';
        } else if (activeTodos.length === 1) {
            countElement.textContent = '1 task remaining';
        } else {
            countElement.textContent = `${activeTodos.length} tasks remaining`;
        }
    }

    updateClearButton() {
        const clearBtn = document.getElementById('clearCompleted');
        const completedCount = this.todos.filter(todo => todo.completed).length;
        
        clearBtn.disabled = completedCount === 0;
        clearBtn.style.display = completedCount > 0 ? 'inline-flex' : 'none';
    }

    initDragAndDrop() {
        const todosList = document.getElementById('todosList');
        
        todosList.addEventListener('dragstart', (e) => {
            this.draggedElement = e.target;
            e.target.classList.add('dragging');
        });

        todosList.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
            this.draggedElement = null;
        });

        todosList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(todosList, e.clientY);
            if (afterElement == null) {
                todosList.appendChild(this.draggedElement);
            } else {
                todosList.insertBefore(this.draggedElement, afterElement);
            }
        });

        todosList.addEventListener('drop', (e) => {
            e.preventDefault();
            this.updateTodoOrder();
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    updateTodoOrder() {
        const todosList = document.getElementById('todosList');
        const todoElements = todosList.querySelectorAll('.todo-item');
        const newOrder = [];
        
        todoElements.forEach(element => {
            const todoId = element.dataset.id;
            const todo = this.todos.find(t => t.id === todoId);
            if (todo) newOrder.push(todo);
        });
        
        this.todos = newOrder;
        this.saveTodos();
    }

    handleKeyboard(e) {
        // Ctrl/Cmd + Enter to add todo
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const input = document.getElementById('todoInput');
            if (document.activeElement === input) {
                document.getElementById('addTodoForm').dispatchEvent(new Event('submit'));
            }
        }
        
        // Escape to clear input
        if (e.key === 'Escape') {
            const input = document.getElementById('todoInput');
            input.value = '';
            input.blur();
        }

        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }

        // Ctrl/Cmd + D to toggle dark mode
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            this.toggleTheme();
        }
    }

    showConfirmation(title, message, onConfirm) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="modal-buttons">
                    <button class="modal-btn cancel">Cancel</button>
                    <button class="modal-btn confirm">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.cancel').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.confirm').addEventListener('click', () => {
            document.body.removeChild(modal);
            onConfirm();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Local Storage Methods
    saveTodos() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('Error saving todos:', error);
            this.showNotification('Error saving tasks to local storage');
        }
    }

    loadTodos() {
        try {
            const stored = localStorage.getItem('todos');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading todos:', error);
            return [];
        }
    }

    saveTheme() {
        try {
            localStorage.setItem('darkMode', JSON.stringify(this.darkMode));
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    }

    loadTheme() {
        try {
            const stored = localStorage.getItem('darkMode');
            return stored ? JSON.parse(stored) : false;
        } catch (error) {
            console.error('Error loading theme:', error);
            return false;
        }
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});

// Add touch support for mobile
document.addEventListener('touchstart', (e) => {
    if (e.target.classList.contains('todo-checkbox')) {
        e.preventDefault();
        const todoId = e.target.closest('.todo-item').dataset.id;
        window.app.toggleTodo(todoId);
    }
}, { passive: false });