type Props = {
    title: string;
    onClick: () => void;
    children?: React.ReactNode;
};

export default function ListCard({ title, onClick, children }: Props) {
    return (
        <div onClick={onClick} className="p-4 border rounded mb-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center">
            <span>{title}</span>
            {children}
        </div>
    );
}