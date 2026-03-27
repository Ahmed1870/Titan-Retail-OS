'use client';

export default function ThemeHandler({ primaryColor }: { primaryColor: string }) {
  return (
    <style >{`
      :root {
        --primary-brand: ${primaryColor || '#10b981'};
      }
      .btn-primary {
        background-color: var(--primary-brand);
      }
      .text-primary {
        color: var(--primary-brand);
      }
    `}</style>
  );
}
