import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { doc, updateDoc, arrayUnion, addDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import TaskItem from '../components/TaskItem';
import Input from '../components/Input';
import Button from '../components/Button';
import { FirebaseError } from 'firebase/app';

type Task = {
    id: string;
    title: string;
    description: string;
    completed: boolean;
};

type Role = 'Admin' | 'Viewer';

export default function ListDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [role, setRole] = useState<Role | null>(null);
    const [collabEmail, setCollabEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const fetchListDetailsAndTasks = useCallback(() => {
        if (!id || !user) {
            setIsLoading(false);
            return;
        }

        setError(null);
        setIsLoading(true);

        const listRef = doc(db, 'lists', id);
        const tasksCollectionRef = collection(db, 'lists', id, 'tasks');

        const unsubscribeList = onSnapshot(listRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.ownerId === user.uid) {
                    setRole('Admin');
                } else {
                    const collab = data.collaborators?.find((c: any) => c.email === user.email);
                    setRole(collab?.role || null);
                }
            } else {
                setError('List not found.');
                setRole(null);
            }
            setIsLoading(false);
        }, (err: unknown) => {
            console.error("Error fetching list details:", err);
            if (err instanceof FirebaseError) {
                setError('Error fetching list details: ' + err.message);
            } else {
                setError('An unknown error occurred while fetching list details.');
            }
            setIsLoading(false);
        });

        const unsubscribeTasks = onSnapshot(tasksCollectionRef, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
            setTasks(fetchedTasks);
        }, (err: unknown) => {
            console.error("Error fetching tasks:", err);
            if (err instanceof FirebaseError) {
                setError('Error fetching tasks: ' + err.message);
            } else {
                setError('An unknown error occurred while fetching tasks.');
            }
        });

        return () => {
            unsubscribeList();
            unsubscribeTasks();
        };
    }, [id, user]);

    useEffect(() => {
        const unsubscribe = fetchListDetailsAndTasks();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [fetchListDetailsAndTasks]);

    const addTask = async () => {
        if (!newTitle.trim() || !id) {
            setError("Task title cannot be empty.");
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await addDoc(collection(db, 'lists', id, 'tasks'), {
                title: newTitle,
                description: newDesc,
                completed: false,
            });
            setNewTitle('');
            setNewDesc('');
        } catch (err: unknown) {
            console.error("Error adding task:", err);
            if (err instanceof FirebaseError) {
                setError('Failed to add task: ' + err.message);
            } else {
                setError('An unknown error occurred while adding task.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTask = async (task: Task) => {
        if (!id) return;
        setError(null);
        setTasks(prevTasks => prevTasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
        try {
            const ref = doc(db, 'lists', id, 'tasks', task.id);
            await updateDoc(ref, { completed: !task.completed });
        } catch (err: unknown) {
            console.error("Error toggling task:", err);
            setTasks(prevTasks => prevTasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
            if (err instanceof FirebaseError) {
                setError('Failed to toggle task: ' + err.message);
            } else {
                setError('An unknown error occurred while toggling task.');
            }
        }
    };

    const removeTask = async (taskId: string) => {
        if (!id) return;
        setError(null);
        setIsLoading(true);
        try {
            await deleteDoc(doc(db, 'lists', id, 'tasks', taskId));
        } catch (err: unknown) {
            console.error("Error removing task:", err);
            if (err instanceof FirebaseError) {
                setError('Failed to remove task: ' + err.message);
            } else {
                setError('An unknown error occurred while removing task.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const addCollaborator = async () => {
        if (!collabEmail.trim() || !id) {
            setError("Collaborator email cannot be empty.");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(collabEmail)) {
            setError("Please enter a valid email address for the collaborator.");
            return;
        }

        setError(null);
        setIsLoading(true);
        try {
            const listRef = doc(db, 'lists', id);
            await updateDoc(listRef, {
                collaborators: arrayUnion({ email: collabEmail, role: 'Viewer' })
            });
            setCollabEmail('');
        } catch (err: unknown) {
            console.error("Error adding collaborator:", err);
            if (err instanceof FirebaseError) {
                setError('Failed to add collaborator: ' + err.message);
            } else {
                setError('An unknown error occurred while adding collaborator.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const startEditingTask = (task: Task) => {
        setEditingTask(task);
        setNewTitle(task.title);
        setNewDesc(task.description);
    };

    const updateTask = async () => {
        if (!editingTask || !id || !newTitle.trim()) {
            setError("Task title cannot be empty for update.");
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            const taskRef = doc(db, 'lists', id, 'tasks', editingTask.id);
            await updateDoc(taskRef, {
                title: newTitle,
                description: newDesc,
            });
            setEditingTask(null);
            setNewTitle('');
            setNewDesc('');
        } catch (err: unknown) {
            console.error("Error updating task:", err);
            if (err instanceof FirebaseError) {
                setError('Failed to update task: ' + err.message);
            } else {
                setError('An unknown error occurred while updating task.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-center text-gray-800">Task Details</h1>

                {isLoading && <p className="text-center text-blue-600">Loading...</p>}
                {error && <p className="text-red-500 text-center bg-red-50 p-3 rounded-lg">{error}</p>}

                {role === 'Admin' && (
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
                            {editingTask ? (
                                <Button onClick={updateTask} className="w-full bg-yellow-600 text-white hover:bg-yellow-700" disabled={isLoading}>
                                    Update Task
                                </Button>
                            ) : (
                                <Button onClick={addTask} className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={isLoading}>
                                    Add Task
                                </Button>
                            )}
                        </div>
                        <div className="flex space-x-4">
                            <Input
                                placeholder="Collaborator email"
                                value={collabEmail}
                                onChange={e => setCollabEmail(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={addCollaborator} className="bg-green-600 text-white hover:bg-green-700" disabled={isLoading}>
                                Add Collaborator
                            </Button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {tasks.length === 0 && !isLoading && !error && <p className="text-center text-gray-600">No tasks found. Add some!</p>}
                    {tasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={() => toggleTask(task)}
                            onDelete={role === 'Admin' ? () => removeTask(task.id) : undefined}
                            onEdit={role === 'Admin' ? () => startEditingTask(task) : undefined}
                            isAdmin={role === 'Admin'}
                            isViewer={role === 'Viewer'}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}