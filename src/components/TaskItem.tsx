import React from 'react';

type Task = {
    id: string;
    title: string;
    description: string;
    completed: boolean;
};

type Props = {
    task: Task;
    onToggle: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
    isAdmin: boolean;
    isViewer: boolean;
};

export default function TaskItem({ task, onToggle, onDelete, onEdit, isAdmin }: Props) {
    const { title, description, completed } = task;

    return (
        <div className="border p-3 rounded mb-2 flex justify-between items-center">
            <div>
                <p className={completed ? 'line-through' : ''}>{title}</p>
                <p className="text-gray-500 text-sm">{description}</p>
            </div>
            <div className="flex space-x-2">
                <button onClick={onToggle} className="text-blue-500">{completed ? 'Undo' : 'Done'}</button>
                {isAdmin && onEdit && <button onClick={onEdit} className="text-yellow-500">Edit</button>}
                {isAdmin && onDelete && <button onClick={onDelete} className="text-red-500">Delete</button>}
            </div>
        </div>
    );
}