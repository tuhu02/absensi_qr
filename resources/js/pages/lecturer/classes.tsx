import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/lecturer-layout';
import type { BreadcrumbItem } from '@/types';
import { BookOpen, Users, CalendarCheck } from 'lucide-react';
import { UserRound, Clock3 } from 'lucide-react';

export default function LecturerClasses() {
    const { classes = [] } = usePage().props as any;

    return (
        <AppLayout>
            <Head title="Kelas Saya" />
            <div className="flex min-h-screen w-full flex-col gap-6 bg-[#F8FAFC] p-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    Kelas yang Saya Ampu
                </h1>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {classes.length === 0 && (
                        <div className="col-span-full py-10 text-center text-slate-400">
                            Tidak ada kelas yang diampu.
                        </div>
                    )}
                    {classes.map((kelas: any) => (
                        <div
                            key={kelas.id}
                            className="rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                        >
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <h6 className="line-clamp-2 flex-1 text-base font-bold text-slate-900">
                                    {kelas.name}
                                </h6>
                                <p className="shrink-0 rounded-full bg-blue-100 px-3 py-1.5 text-xs whitespace-nowrap">
                                    {kelas.classroom?.location?.name &&
                                    kelas.classroom?.name
                                        ? `${kelas.classroom.location.name} - ${kelas.classroom.name}`
                                        : (kelas.classroom?.name ??
                                          kelas.room ??
                                          '-')}
                                </p>
                            </div>
                            <div className="space-y-2 text-sm text-slate-600">
                                <p className="flex items-center gap-2">
                                    <UserRound className="size-4 text-sky-600" />
                                    {kelas.lecturer?.user?.name ?? '-'}
                                </p>
                                <p className="flex items-center gap-2">
                                    <Clock3 className="size-4 text-sky-600" />
                                    {kelas.start_time && kelas.end_time
                                        ? `${kelas.day ? `${kelas.day}, ` : ''}${kelas.start_time.slice(0, 5)} - ${kelas.end_time.slice(0, 5)}`
                                        : '-'}
                                </p>
                            </div>
                            <div className="mt-5 flex items-center justify-end">
                                <a
                                    href={`/lecturer/classes/${kelas.id}`}
                                    className="inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                                >
                                    Lihat Detail
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
