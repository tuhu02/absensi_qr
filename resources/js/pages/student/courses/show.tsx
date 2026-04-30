import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/student-layout';
import type { BreadcrumbItem, Course } from '@/types';
import {
    ArrowLeft,
    CalendarDays,
    Clock3,
    GraduationCap,
    MapPin,
    UserRound,
} from 'lucide-react';

type MeetingItem = {
    id: number;
    name: string;
    date: string;
    status: 'hadir' | 'izin' | 'alpha' | null;
    logged_at: string | null;
};

type ClassDetailPageProps = {
    course: Course;
    meetings: MeetingItem[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Beranda',
        href: '/student/dashboard',
    },
    {
        title: 'Kelas Saya',
        href: '/student/classes',
    },
    {
        title: 'Detail Kelas',
        href: '#',
    },
];

const statusLabel: Record<NonNullable<MeetingItem['status']>, string> = {
    hadir: 'Hadir',
    izin: 'Izin',
    alpha: 'Alpha',
};

const statusClass: Record<NonNullable<MeetingItem['status']>, string> = {
    hadir: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    izin: 'border border-amber-200 bg-amber-50 text-amber-700',
    alpha: 'border border-rose-200 bg-rose-50 text-rose-700',
};

function formatDate(value: string): string {
    if (!value) {
        return '-';
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function formatTime(value: string | null): string {
    if (!value) {
        return '-';
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return '-';
    }

    return parsed.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function StudentCourseShow() {
    const { course, meetings } = usePage<ClassDetailPageProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Kelas - ${course.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 bg-[#F8FAFC] p-6">
                <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        {course.name}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {course.study_program?.name ??
                            course.studyProgram?.name ??
                            '-'}
                    </p>

                    <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                        <p className="flex items-center gap-2">
                            <UserRound className="size-4 text-sky-600" />
                            {course.lecturer?.user?.name ?? '-'}
                        </p>
                        <p className="flex items-center gap-2">
                            <MapPin className="size-4 text-sky-600" />
                            {course.classroom?.location?.name &&
                            course.classroom?.name
                                ? `${course.classroom.location.name} - ${course.classroom.name}`
                                : (course.classroom?.name ??
                                  course.room ??
                                  '-')}
                        </p>
                        <p className="flex items-center gap-2">
                            <Clock3 className="size-4 text-sky-600" />
                            {course.start_time && course.end_time
                                ? `${course.day ? `${course.day}, ` : ''}${course.start_time.slice(0, 5)} - ${course.end_time.slice(0, 5)}`
                                : '-'}
                        </p>
                        <p className="flex items-center gap-2">
                            <GraduationCap className="size-4 text-sky-600" />
                            {course.semester?.name ?? '-'}
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex items-center gap-2 border-b border-slate-100 bg-sky-50/50 px-6 py-4 text-sm font-semibold text-slate-800">
                        <CalendarDays className="size-4 text-sky-600" />
                        Tabel Pertemuan & Status Kehadiran
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">
                                        Pertemuan
                                    </th>
                                    <th className="px-6 py-3 font-semibold">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-3 font-semibold">
                                        Jam Kehadiran
                                    </th>
                                    <th className="px-6 py-3 font-semibold">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {meetings.map((meeting, index) => {
                                    const normalizedStatus = meeting.status;
                                    const badgeClass = normalizedStatus
                                        ? statusClass[normalizedStatus]
                                        : 'border border-slate-200 bg-slate-50 text-slate-600';
                                    const label = normalizedStatus
                                        ? statusLabel[normalizedStatus]
                                        : 'Belum Absen';

                                    return (
                                        <tr
                                            key={meeting.id}
                                            className="hover:bg-slate-50/80"
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-800">
                                                {meeting.name ||
                                                    `Pertemuan ${index + 1}`}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {formatDate(meeting.date)}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {formatTime(meeting.logged_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
                                                >
                                                    {label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {meetings.length === 0 && (
                        <div className="px-6 py-10 text-center text-sm text-slate-500">
                            Pertemuan belum tersedia untuk kelas ini.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
