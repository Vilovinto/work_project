import React from 'react';

type TodoList = {
    id: string;
    title: string;
    ownerId: string;
};

type Props = {
    list: TodoList;
    onClick: () => void;
    onDelete: (listId: string) => void;
    onEdit: (list: TodoList) => void;
    isOwner: boolean;
};

export default function ListCard({ list, onClick, onDelete, onEdit, isOwner }: Props) {
    const handleCardClick = (e: React.MouseEvent) => {
        if (e.target instanceof HTMLElement && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) {
            return;
        }
        onClick();
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(list.id);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(list);
    };

    return (
        <div onClick={handleCardClick} className="p-4 border rounded mb-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center">
            <span>{list.title}</span>
            <div className="flex space-x-2">
                {isOwner && (
                    <button
                        onClick={handleEditClick}
                        className="text-yellow-500"
                    >
                        Edit
                    </button>
                )}
                {isOwner && (
                    <button
                        onClick={handleDeleteClick}
                        className="text-red-500"
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
}