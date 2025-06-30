import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, addDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import TaskItem from '../components/TaskItem';
import Input from '../components/Input';
import Button from '../components/Button';

type Task = {
    id: string;
    title: string;
    description: string;
    completed: boolean;
};

export default function ListDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [role, setRole] = useState<'Admin' | 'Viewer' | null>(null);
    const [collabEmail, setCollabEmail] = useState('');

    const fetchTasks = async () => {
        if (!id) return;
        const snapshot = await getDocs(collection(db, 'lists', id, 'tasks'));
        setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[]);
    };

    const fetchRole = async () => {
        if (!id || !user) return;
        const snap = await getDoc(doc(db, 'lists', id));
        const data = snap.data();
        if (!data) return;
        if (data.ownerId === user.uid) setRole('Admin');
        else {
            const collab = data.collaborators?.find((c: any) => c.email === user.email);
            setRole(collab?.role || null);
        }
    };

    const addTask = async () => {
        if (!newTitle.trim() || !id) return;
        await addDoc(collection(db, 'lists', id, 'tasks'), {
            title: newTitle,
            description: newDesc,
            completed: false,
        });
        setNewTitle('');
        setNewDesc('');
        fetchTasks();
    };

    const toggleTask = async (task: Task) => {
        if (!id) return;
        const ref = doc(db, 'lists', id, 'tasks', task.id);
        await updateDoc(ref, { completed: !task.completed });
        fetchTasks();
    };

    const removeTask = async (taskId: string) => {
        if (!id) return;
        await deleteDoc(doc(db, 'lists', id, 'tasks', taskId));
        fetchTasks();
    };

    const addCollaborator = async () => {
        if (!collabEmail.trim() || !id) return;
        const listRef = doc(db, 'lists', id);
        await updateDoc(listRef, {
            collaborators: arrayUnion({ email: collabEmail, role: 'Viewer' })
        });
        setCollabEmail('');
        fetchRole();
    };

    useEffect(() => {
        fetchTasks();
        fetchRole();
    }, [id, user]);

    return (
        <div className="p-4 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Tasks</h1>

            {role === 'Admin' && (
                <>
                    <div className="flex flex-col space-y-2 mb-4">
                        <Input placeholder="Task title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                        <Input placeholder="Task description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                        <Button onClick={addTask}>Add Task</Button>
                    </div>
                    <div className="flex mb-4">
                        <Input placeholder="Collaborator email" value={collabEmail} onChange={e => setCollabEmail(e.target.value)} />
                        <Button onClick={addCollaborator}>Add Collaborator</Button>
                    </div>
                </>
            )}

            {tasks.map(task => (
                <TaskItem
                    key={task.id}
                    title={task.title}
                    description={task.description}
                    completed={task.completed}
                    onToggle={() => toggleTask(task)}
                    onDelete={role === 'Admin' ? () => removeTask(task.id) : undefined}
                />
            ))}
        </div>
    );
}