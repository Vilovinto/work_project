import React, { useEffect, useState, useCallback } from 'react';
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ListCard from '../components/ListCard';
import Input from '../components/Input';
import Button from '../components/Button';
import { FirebaseError } from 'firebase/app';

type TodoList = {
    id: string;
    title: string;
    ownerId: string;
    collaborators?: { email: string; role: string; }[];
};

export default function Dashboard() {
    const [lists, setLists] = useState<TodoList[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingList, setEditingList] = useState<TodoList | null>(null);

    const fetchListsRealtime = useCallback(() => {
        if (!user) {
            setIsLoading(false);
            return () => {};
        }

        setError(null);
        setIsLoading(true);

        const listsCollectionRef = collection(db, 'lists');
        return onSnapshot(listsCollectionRef, (snapshot) => {
            const fetchedLists: TodoList[] = [];
            snapshot.docs.forEach(doc => {
                const listData = { id: doc.id, ...doc.data() } as TodoList;
                if (listData.ownerId === user.uid ||
                    listData.collaborators?.some(c => c.email === user.email)) {
                    fetchedLists.push(listData);
                }
            });
            setLists(fetchedLists);
            setIsLoading(false);
        }, (err: unknown) => {
            console.error("Error fetching lists:", err);
            if (err instanceof FirebaseError) {
                setError('Error fetching lists: ' + err.message);
            } else {
                setError('An unknown error occurred while fetching lists.');
            }
            setIsLoading(false);
        });
    }, [user]);

    useEffect(() => {
        return fetchListsRealtime();
    }, [fetchListsRealtime]);

    const addList = async () => {
        if (!newTitle.trim() || !user) {
            setError("List title cannot be empty.");
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await addDoc(collection(db, 'lists'), {
                title: newTitle,
                ownerId: user.uid,
                collaborators: [],
            });
            setNewTitle('');
        } catch (err: unknown) {
            console.error("Error adding list:", err);
            if (err instanceof FirebaseError) {
                setError('Failed to add list: ' + err.message);
            } else {
                setError('An unknown error occurred while adding list.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const removeList = async (listId: string) => {
        setError(null);
        setIsLoading(true);
        try {
            await deleteDoc(doc(db, 'lists', listId));
        } catch (err: unknown) {
            console.error("Error removing list:", err);
            if (err instanceof FirebaseError) {
                setError('Failed to remove list: ' + err.message);
            } else {
                setError('An unknown error occurred while removing list.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const startEditingList = (list: TodoList) => {
        setEditingList(list);
        setNewTitle(list.title);
    };

    const updateListTitle = async () => {
        if (!editingList || !newTitle.trim()) {
            setError("List title cannot be empty for update.");
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            const listRef = doc(db, 'lists', editingList.id);
            await updateDoc(listRef, {
                title: newTitle,
            });
            setEditingList(null);
            setNewTitle('');
        } catch (err: unknown) {
            console.error("Error updating list title:", err);
            if (err instanceof FirebaseError) {
                setError('Failed to update list title: ' + err.message);
            } else {
                setError('An unknown error occurred while updating list title.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-center text-gray-800">Your To-Do Lists</h1>
                {isLoading && <p className="text-center text-blue-600">Loading lists...</p>}
                {error && <p className="text-red-500 text-center bg-red-50 p-3 rounded-lg">{error}</p>}
                <div className="flex space-x-4">
                    <Input
                        placeholder={editingList ? "Edit list title" : "New list title"}
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        className="flex-1"
                    />
                    {editingList ? (
                        <Button onClick={updateListTitle} className="bg-yellow-600 text-white hover:bg-yellow-700" disabled={isLoading}>
                            Update
                        </Button>
                    ) : (
                        <Button onClick={addList} className="bg-blue-600 text-white hover:bg-blue-700" disabled={isLoading}>
                            Add
                        </Button>
                    )}
                </div>
                <div className="space-y-4">
                    {lists.length === 0 && !isLoading && !error && <p className="text-center text-gray-600">No lists found. Create one!</p>}
                    {lists.map(list => (
                        <ListCard
                            key={list.id}
                            list={list}
                            onClick={() => navigate(`/list/${list.id}`)}
                            onDelete={removeList}
                            onEdit={startEditingList}
                            isOwner={user?.uid === list.ownerId}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}