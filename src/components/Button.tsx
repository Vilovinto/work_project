type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;
export default function Button({ children, ...props }: Props) {
    return (
        <button {...props} className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${props.className || ''}`}>
            {children}
        </button>
    );
}