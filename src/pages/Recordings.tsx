import { useRecordings } from '@/stores/recordings';
import RecordingCard from '@/components/RecordingCard';
import { useState } from 'react';
import { Recording } from '@/types/domain';

export default function Recordings() {
  const { recordings } = useRecordings();
  const [recordingsById, setRecordingsById] = useState<Record<string, Recording>>({});

  return (
    <div className="min-h-screen pb-24">
      <header className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Recordings</h1>
        <p className="mt-1 text-sm text-text-secondary">{recordings.length} recordings</p>
      </header>

      <div className="px-5 space-y-2">
        {recordings.map((r) => {
          console.log("recording in list:", r);
          return <RecordingCard key={r.id} recording={r} />;
        })}
      </div>
    </div>
  );
}
