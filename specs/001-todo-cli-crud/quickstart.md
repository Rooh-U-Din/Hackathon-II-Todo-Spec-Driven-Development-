# Quickstart: Todo Console Application

**Feature**: 001-todo-cli-crud
**Date**: 2025-12-18

## Prerequisites

- Python 3.13 or later installed
- Terminal/command prompt access

## Running the Application

```bash
# From repository root
python src/main.py
```

Or on systems where Python 3 is explicit:

```bash
python3 src/main.py
```

## Expected Behavior

### Main Menu

On startup, you will see:

```
=== Todo Application ===

1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Toggle Task Completion
6. Exit

Enter your choice (1-6):
```

### Adding a Task

```
Enter your choice (1-6): 1

--- Add Task ---
Enter task title: Buy groceries
Enter task description (optional): Milk, eggs, bread

Task created successfully! (ID: 1)
```

### Viewing Tasks

```
Enter your choice (1-6): 2

--- Your Tasks ---
[ ] ID: 1 | Buy groceries
[✓] ID: 2 | Call dentist
[ ] ID: 3 | Finish report
```

Or if no tasks:

```
Enter your choice (1-6): 2

No tasks found. Add a task to get started!
```

### Updating a Task

```
Enter your choice (1-6): 3

--- Update Task ---
Enter task ID: 1
Enter new title (press Enter to keep current): Get groceries
Enter new description (press Enter to keep current):

Task updated successfully!
```

### Deleting a Task

```
Enter your choice (1-6): 4

--- Delete Task ---
Enter task ID: 1
Are you sure you want to delete this task? (y/n): y

Task deleted successfully!
```

### Toggling Completion

```
Enter your choice (1-6): 5

--- Toggle Task Completion ---
Enter task ID: 1

Task marked as complete!
```

### Exiting

```
Enter your choice (1-6): 6

Goodbye!
```

## Error Handling Examples

### Invalid Menu Choice

```
Enter your choice (1-6): 7

Invalid option. Please enter a number between 1 and 6.
```

### Non-Numeric Input

```
Enter your choice (1-6): abc

Invalid input. Please enter a number.
```

### Task Not Found

```
Enter task ID: 999

Task not found.
```

### Empty Title

```
Enter task title:

Title cannot be empty. Please try again.
Enter task title:
```

## Data Persistence

**Important**: All data is stored in memory only. When you exit the application (option 6) or terminate it (Ctrl+C), all tasks are lost. This is by design per Phase I requirements.

## Verification Checklist

After running the application, verify these behaviors:

- [ ] Menu displays all 6 options
- [ ] Can add a task with title only
- [ ] Can add a task with title and description
- [ ] Empty title is rejected and re-prompted
- [ ] View shows all tasks with correct status indicators
- [ ] View shows friendly message when no tasks exist
- [ ] Can update task title
- [ ] Can update task description
- [ ] Empty update input preserves original value
- [ ] Can delete task with confirmation
- [ ] Deletion cancelled if user enters 'n'
- [ ] Can toggle task between complete/incomplete
- [ ] Invalid task IDs show error message
- [ ] Invalid menu input shows error and re-prompts
- [ ] Application exits cleanly with goodbye message
