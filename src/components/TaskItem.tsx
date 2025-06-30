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
};

export default function TaskItem({ task, onToggle, onDelete, onEdit, isAdmin }: Props) {
    const { title, description, completed } = task;

    return (
        <div onClick={onToggle} className="border p-3 rounded mb-2 flex justify-between items-center cursor-pointer hover:bg-gray-50">
            <div>
                <p className={completed ? 'line-through text-gray-500' : 'text-gray-800'}>{title}</p>
                {description && <p className="text-gray-500 text-sm">{description}</p>}
            </div>
            <div className="flex space-x-2">
                {isAdmin && onEdit && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="text-yellow-500 hover:text-yellow-700"
                    >
                        Edit
                    </button>
                )}
                {isAdmin && onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="text-red-500 hover:text-red-700"
                    >
                        Delete
                    </button>
                )}
                <span className={`px-2 py-1 rounded text-xs font-semibold ${completed ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>
                    {completed ? 'Done' : 'Pending'}
                </span>
            </div>
        </div>
    );
}