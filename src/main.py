#!/usr/bin/env python3
"""Todo Console Application - Phase I

A simple command-line todo list manager with in-memory storage.
Implements full CRUD operations for task management.

Run: python src/main.py
"""

from dataclasses import dataclass


@dataclass
class Task:
    """Represents a todo item."""
    id: int
    title: str
    description: str = ""
    completed: bool = False


# Module-level storage
tasks: list[Task] = []
_next_id: int = 1


def find_task(task_id: int) -> Task | None:
    """Find a task by its ID."""
    for task in tasks:
        if task.id == task_id:
            return task
    return None


def get_non_empty_input(prompt: str) -> str:
    """Prompt user for input until non-empty value provided."""
    while True:
        value = input(prompt).strip()
        if value:
            return value
        print("\nTitle cannot be empty. Please try again.")


def add_task() -> None:
    """Add a new task with title and optional description."""
    global _next_id

    print("\n--- Add Task ---")
    title = get_non_empty_input("Enter task title: ")
    description = input("Enter task description (optional): ").strip()

    task = Task(id=_next_id, title=title, description=description)
    tasks.append(task)
    print(f"\nTask created successfully! (ID: {_next_id})")
    _next_id += 1


def format_task(task: Task) -> str:
    """Format a single task for display."""
    checkbox = "[✓]" if task.completed else "[ ]"
    return f"{checkbox} ID: {task.id} | {task.title}"


def view_tasks() -> None:
    """Display all tasks or message if none exist."""
    print("\n--- Your Tasks ---")
    if not tasks:
        print("No tasks found. Add a task to get started!")
        return

    for task in tasks:
        print(format_task(task))


def get_task_id_input(prompt: str) -> int | None:
    """Get and validate task ID input from user."""
    try:
        task_id = int(input(prompt))
        return task_id
    except ValueError:
        print("\nInvalid input. Please enter a number.")
        return None


def update_task() -> None:
    """Update an existing task's title and/or description."""
    print("\n--- Update Task ---")
    task_id = get_task_id_input("Enter task ID: ")
    if task_id is None:
        return

    task = find_task(task_id)
    if task is None:
        print("\nTask not found.")
        return

    new_title = input("Enter new title (press Enter to keep current): ").strip()
    new_description = input("Enter new description (press Enter to keep current): ").strip()

    if new_title:
        task.title = new_title
    if new_description:
        task.description = new_description

    print("\nTask updated successfully!")


def get_confirmation(prompt: str) -> bool:
    """Get y/n confirmation from user. Returns True only for 'y' or 'Y'."""
    response = input(prompt).strip().lower()
    return response == "y"


def delete_task() -> None:
    """Delete a task with confirmation."""
    print("\n--- Delete Task ---")
    task_id = get_task_id_input("Enter task ID: ")
    if task_id is None:
        return

    task = find_task(task_id)
    if task is None:
        print("\nTask not found.")
        return

    if get_confirmation("Are you sure you want to delete this task? (y/n): "):
        tasks.remove(task)
        print("\nTask deleted successfully!")
    else:
        print("\nDeletion cancelled.")


def toggle_task() -> None:
    """Toggle a task's completion status."""
    print("\n--- Toggle Task Completion ---")
    task_id = get_task_id_input("Enter task ID: ")
    if task_id is None:
        return

    task = find_task(task_id)
    if task is None:
        print("\nTask not found.")
        return

    task.completed = not task.completed
    status = "complete" if task.completed else "incomplete"
    print(f"\nTask marked as {status}!")


def display_menu() -> None:
    """Display the main menu options."""
    print("\n=== Todo Application ===\n")
    print("1. Add Task")
    print("2. View Tasks")
    print("3. Update Task")
    print("4. Delete Task")
    print("5. Toggle Task Completion")
    print("6. Exit")
    print()


def get_menu_choice() -> int | None:
    """Get and validate menu choice from user."""
    try:
        choice_str = input("Enter your choice (1-6): ")
        choice = int(choice_str)
        if 1 <= choice <= 6:
            return choice
        print("\nInvalid option. Please enter a number between 1 and 6.")
        return None
    except ValueError:
        print("\nInvalid input. Please enter a number.")
        return None


def main() -> None:
    """Main application loop."""
    while True:
        display_menu()
        choice = get_menu_choice()

        if choice is None:
            continue

        if choice == 1:
            add_task()
        elif choice == 2:
            view_tasks()
        elif choice == 3:
            update_task()
        elif choice == 4:
            delete_task()
        elif choice == 5:
            toggle_task()
        elif choice == 6:
            print("\nGoodbye!")
            break


if __name__ == "__main__":
    main()
