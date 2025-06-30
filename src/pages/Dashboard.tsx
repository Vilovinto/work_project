import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ListCard from '../components/ListCard';
import Input from '../components/Input';
import Button from '../components/Button';

type TodoList = {
    id: string;
    title: string;
};

export default function Dashboard() {
    const [lists, setLists] = useState<TodoList[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchLists = async () => {
        if (!user) return;
        const snapshot = await getDocs(collection(db, 'lists'));
        const filtered = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter((list: any) =>
                list.ownerId === user.uid ||
                list.collaborators?.some((c: any) => c.email === user.email)
            );
        setLists(filtered as TodoList[]);
    };

    const addList = async () => {
        if (!newTitle.trim() || !user) return;
        await addDoc(collection(db, 'lists'), {
            title: newTitle,
            ownerId: user.uid,
            collaborators: [],
        });
        setNewTitle('');
        fetchLists();
    };

    const removeList = async (id: string) => {
        await deleteDoc(doc(db, 'lists', id));
        fetchLists();
    };

    useEffect(() => {
        fetchLists();
    }, [user]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-center text-gray-800">Your To-Do Lists</h1>
                <div className="flex space-x-4">
                    <Input
                        placeholder="New list title"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        className="flex-1"
                    />
                    <Button onClick={addList} className="bg-blue-600 text-white hover:bg-blue-700">
                        Add
                    </Button>
                </div>
                <div className="space-y-4">
                    {lists.map(list => (
                        <ListCard
                            key={list.id}
                            title={list.title}
                            onClick={() => navigate(`/list/${list.id}`)}
                        >
                            <Button
                                onClick={() => removeList(list.id)}
                                className="bg-red-500 text-white hover:bg-red-600 ml-4"
                            >
                                Delete
                            </Button>
                        </ListCard>
                    ))}
                </div>
            </div>
        </div>
    );
}