import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/student-layout';
import type { BreadcrumbItem } from '@/types';
import {
    User,
    IdCard,
    MapPin,
    DoorOpen,
    BookOpen,
    CalendarDays,
    ArrowLeft,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Beranda', href: '/dashboard' },
    { title: 'Presensi Mata Kuliah', href: '#' },
];

export default function DetailAbsensi() {
    const courseInfo = {
        subject: 'Pemrograman Web',
        sks: 3,
        lecturer: 'Dr. Aris Sudarsono, M.T.',
        nip: '19850312 201012 1 001',
        class: 'TI-4A',
        room: 'Lab Terpadu 1',
        semester: 'Genap 2025/2026',
    };

    const attendanceLogs = [
        { meeting: 1, date: '10 Feb 2026', time: '08:05', status: 'Hadir' },
        { meeting: 2, date: '17 Feb 2026', time: '08:10', status: 'Hadir' },
        { meeting: 3, date: '24 Feb 2026', time: '-', status: 'Izin' },
        { meeting: 4, date: '03 Mar 2026', time: '-', status: 'Alfa' },
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Hadir':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Izin':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Alfa':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Presensi" />

            <div className="flex h-full flex-1 flex-col gap-6 bg-sky-50/20 p-6">
                <Link
                    href="/dashboard"
                    className="flex w-fit items-center gap-2 font-bold text-sky-600 hover:underline"
                >
                    <ArrowLeft className="size-4" /> Kembali
                </Link>

                {/* Info Card */}
                <div className="rounded-4xl border border-sky-100 bg-white p-8 shadow-sm">
                    <div className="mb-6 flex items-center gap-4">
                        <div className="rounded-3xl bg-sky-100 p-4 text-sky-600">
                            <BookOpen className="size-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800">
                                {courseInfo.subject}
                            </h1>
                            <p className="font-bold text-sky-500">
                                {courseInfo.semester} • {courseInfo.sks} SKS
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center gap-3">
                            <User className="size-5 text-slate-400" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                    Dosen
                                </p>
                                <p className="text-sm font-bold text-slate-700">
                                    {courseInfo.lecturer}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <IdCard className="size-5 text-slate-400" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                    NIP
                                </p>
                                <p className="text-sm font-bold text-slate-700">
                                    {courseInfo.nip}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <DoorOpen className="size-5 text-slate-400" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                    Kelas
                                </p>
                                <p className="text-sm font-bold text-slate-700">
                                    {courseInfo.class}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="size-5 text-slate-400" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                    Ruangan
                                </p>
                                <p className="text-sm font-bold text-slate-700">
                                    {courseInfo.room}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="overflow-hidden rounded-4xl border border-sky-100 bg-white shadow-sm">
                    <div className="flex items-center gap-2 border-b bg-sky-50/30 p-6 font-bold text-slate-800">
                        <CalendarDays className="size-5 text-sky-600" /> Riwayat
                        Kehadiran
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Pertemuan</th>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4">Jam</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {attendanceLogs.map((log, i) => (
                                <tr key={i} className="hover:bg-sky-50/10">
                                    <td className="px-6 py-4 font-bold text-slate-700">
                                        Ke-{log.meeting}
                                    </td>
                                    <td className="px-6 py-4">{log.date}</td>
                                    <td className="px-6 py-4">{log.time}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`rounded-full border px-3 py-1 text-[11px] font-black ${getStatusStyle(log.status)}`}
                                        >
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
