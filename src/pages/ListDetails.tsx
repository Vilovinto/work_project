import { useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
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

    const fetchTasks = useCallback(async () => {
        if (!id) return;
        const snapshot = await getDocs(collection(db, 'lists', id, 'tasks'));
        setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[]);
    }, [id]);

    const fetchRole = useCallback(async () => {
        if (!id || !user) return;
        const snap = await getDoc(doc(db, 'lists', id));
        const data = snap.data();
        if (!data) return;
        if (data.ownerId === user.uid) setRole('Admin');
        else {
            const collab = data.collaborators?.find((c: any) => c.email === user.email);
            setRole(collab?.role || null);
        }
    }, [id, user]);

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
    }, [id, user, fetchTasks, fetchRole]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-center text-gray-800">Task Details</h1>

                {role === 'Admin' && (
                    <>
                        <div className="space-y-4 mb-6">
                            <div className="flex flex-col space-y-4">
                                <Input
                                    placeholder="Task title"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="w-full"
                                />
                                <Input
                                    placeholder="Task description"
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    className="w-full"
                                />
                                <Button onClick={addTask} className="w-full bg-blue-600 text-white hover:bg-blue-700">
                                    Add Task
                                </Button>
                            </div>
                            <div className="flex space-x-4">
                                <Input
                                    placeholder="Collaborator email"
                                    value={collabEmail}
                                    onChange={e => setCollabEmail(e.target.value)}
                                    className="flex-1"
                                />
                                <Button onClick={addCollaborator} className="bg-green-600 text-white hover:bg-green-700">
                                    Add Collaborator
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                <div className="space-y-4">
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
            </div>
        </div>
    );
}