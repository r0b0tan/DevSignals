interface CodeProps {
  children: React.ReactNode;
}

export function Code({ children }: CodeProps) {
  return (
    <code className="rounded bg-gray-100/80 px-1 py-0.5 font-mono text-[0.8125rem] text-gray-600">
      {children}
    </code>
  );
}
