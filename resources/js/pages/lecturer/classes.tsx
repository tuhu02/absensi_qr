import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/lecturer-layout';
import type { BreadcrumbItem } from '@/types';
import { BookOpen, Users, CalendarCheck } from 'lucide-react';


export default function LecturerClasses() {
    const { classes = [] } = usePage().props as any;

    return (
        <AppLayout>
            <Head title="Kelas Saya" />

            <div className="flex min-h-screen flex-col gap-6 bg-[#F8FAFC] p-6 w-full">
                <h1 className="text-2xl font-bold text-slate-900">
                    Kelas yang Saya Ampu
                </h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {classes.length === 0 && (
                        <div className="col-span-full py-10 text-center text-slate-400">
                            Tidak ada kelas yang diampu.
                        </div>
                    )}

                    {classes.map((kelas: any) => (
                        <div
                            key={kelas.id}
                            className="flex flex-col gap-3 rounded-2xl border border-sky-100 bg-white p-6 shadow transition-all hover:shadow-md"
                        >
                            <div className="mb-2 flex items-center gap-3">
                                <BookOpen className="size-6 text-sky-600" />
                                <span className="text-lg font-bold text-slate-800">
                                    {kelas.name}
                                </span>
                            </div>

                            <div className="mb-1 text-xs text-slate-500">
                                Kode: {kelas.code}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Users className="mr-1 size-4" />
                                {kelas.students} Mahasiswa
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <CalendarCheck className="mr-1 size-4" />
                                Jadwal: {kelas.schedule}
                            </div>

                            <div className="text-xs text-slate-400">
                                Ruangan: {kelas.room}
                            </div>

                            <a
                                href={`/lecturer/classes/${kelas.id}`}
                                className="mt-4 inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                            >
                                Lihat Detail
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
