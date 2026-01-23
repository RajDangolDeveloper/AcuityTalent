import { useState, useEffect } from 'react';

'use client';


interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                // Replace with your actual API endpoint
                const response = await fetch('/api/jobs');
                if (!response.ok) throw new Error('Failed to fetch jobs');
                const data = await response.json();
                setJobs(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    if (loading) return <div className="p-8">Loading jobs...</div>;
    if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Available Jobs</h1>
            <div className="grid gap-4">
                {jobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                        <h2 className="text-xl font-semibold">{job.title}</h2>
                        <p className="text-gray-600">{job.company}</p>
                        <p className="text-sm text-gray-500">{job.location}</p>
                        <p className="mt-2 text-gray-700">{job.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}