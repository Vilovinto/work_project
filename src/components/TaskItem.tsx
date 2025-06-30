type Props = {
    title: string;
    description: string;
    completed: boolean;
    onToggle: () => void;
    onDelete?: () => void;
};

export default function TaskItem({ title, description, completed, onToggle, onDelete }: Props) {
    return (
        <div className="border p-3 rounded mb-2 flex justify-between items-center">
            <div>
                <p className={completed ? 'line-through' : ''}>{title}</p>
                <p className="text-gray-500 text-sm">{description}</p>
            </div>
            <div className="flex space-x-2">
                <button onClick={onToggle} className="text-blue-500">{completed ? 'Undo' : 'Done'}</button>
                {onDelete && <button onClick={onDelete} className="text-red-500">Delete</button>}
            </div>
        </div>
    );
}