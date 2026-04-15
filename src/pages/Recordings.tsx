import { mockRecordings } from '@/data/mock';

export default function Recordings() {
  return (
    <div className="min-h-screen pb-24">
      <header className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Recordings</h1>
        <p className="mt-1 text-sm text-text-secondary">{mockRecordings.length} recordings</p>
      </header>

      <div className="px-5 space-y-2">
        {mockRecordings.map((r) => {
          const s = Math.floor(r.durationMs / 1000);
          const dur = `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
          const date = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <div
              key={r.id}
              className="rounded-xl bg-card p-4 transition-colors hover:bg-surface-hover cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {r.title || r.notePreview || 'Untitled recording'}
                </p>
                {r.notePreview && r.title && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{r.notePreview}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5 text-xs text-text-tertiary">
                  <span>{dur}</span>
                  <span>·</span>
                  <span>{date}</span>
                  {r.projectName && (
                    <>
                      <span>·</span>
                      <span className="text-text-secondary">{r.projectName}</span>
                    </>
                  )}
                </div>
              </div>
              {r.tagLabels.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {r.tagLabels.map((tag) => (
                    <span key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
