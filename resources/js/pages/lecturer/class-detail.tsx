import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/lecturer-layout';
import {
    CalendarDays,
    Clock3,
    GraduationCap,
    MapPin,
    UserRound,
} from 'lucide-react';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import QRCode from 'react-qr-code';

type MeetingItem = {
    id: number;
    name: string;
    date: string;
    logged_at: string | null;
    qr_token: string;
};

function formatDate(value: string): string {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function LecturerClassDetail() {
    const props = usePage().props as Record<string, any>;
    const kelas = props.class;
    const meetings = props.meetings as MeetingItem[];

    console.log(meetings);

    if (!kelas) {
        return (
            <AppLayout>
                <Head title="Detail Kelas" />
                <div className="p-6">Kelas tidak ditemukan.</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title={`Detail Kelas - ${kelas.name}`} />

            <div className="flex min-h-screen w-full flex-col gap-6 bg-[#F8FAFC] p-6">
                <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        {kelas.name}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {kelas.study_program?.name ??
                            kelas.studyProgram?.name ??
                            '-'}
                    </p>

                    <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                        <p className="flex items-center gap-2">
                            <UserRound className="size-4 text-sky-600" />
                            {kelas.lecturer?.user?.name ?? '-'}
                        </p>
                        <p className="flex items-center gap-2">
                            <MapPin className="size-4 text-sky-600" />
                            {kelas.classroom?.location?.name &&
                            kelas.classroom?.name
                                ? `${kelas.classroom.location.name} - ${kelas.classroom.name}`
                                : (kelas.classroom?.name ?? kelas.room ?? '-')}
                        </p>
                        <p className="flex items-center gap-2">
                            <Clock3 className="size-4 text-sky-600" />
                            {kelas.start_time && kelas.end_time
                                ? `${kelas.day ? `${kelas.day}, ` : ''}${kelas.start_time.slice(0, 5)} - ${kelas.end_time.slice(0, 5)}`
                                : '-'}
                        </p>
                        <p className="flex items-center gap-2">
                            <GraduationCap className="size-4 text-sky-600" />
                            {kelas.semester?.name ?? '-'}
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex items-center gap-2 border-b border-slate-100 bg-sky-50/50 px-6 py-4 text-sm font-semibold text-slate-800">
                        <CalendarDays className="size-4 text-sky-600" />
                        Tabel Pertemuan
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 text-xs text-slate-500 uppercase">
                                    <TableHead className="pl-6 font-semibold">
                                        Pertemuan
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Tanggal
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        QR Code
                                    </TableHead>
                        
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {meetings && meetings.length > 0 ? (
                                    meetings.map((meeting, index) => (
                                        <TableRow
                                            key={meeting.id}
                                            className="h-16 hover:bg-slate-50/80"
                                        >
                                            <TableCell className="pl-6 font-medium text-slate-800">
                                                {meeting.name ||
                                                    `Pertemuan ${index + 1}`}
                                            </TableCell>
                                            <TableCell className="text-slate-700">
                                                {formatDate(meeting.date)}
                                            </TableCell>
                                            <TableCell className="text-slate-700">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <button className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500 transition-all hover:bg-sky-100 hover:text-sky-600">
                                                            LIHAT QR
                                                        </button>
                                                    </DialogTrigger>

                                                    <DialogContent className="sm:max-w-md">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-center">
                                                                QR Code -{' '}
                                                                {meeting.name ||
                                                                    `Pertemuan ${index + 1}`}
                                                            </DialogTitle>
                                                        </DialogHeader>
                                                        <div className="flex flex-col items-center justify-center space-y-4 py-6">
                                                            <div className="rounded-xl bg-white p-4">
                                                                {meeting.qr_token ? (
                                                                    <QRCode
                                                                        value={
                                                                            meeting.qr_token
                                                                        }
                                                                        size={
                                                                            220
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <p className="text-sm text-red-500">
                                                                        QR belum
                                                                        tersedia
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="text-center">
                                                                <p className="text-sm font-medium text-slate-900">
                                                                    {formatDate(
                                                                        meeting.date,
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    Minta
                                                                    mahasiswa
                                                                    untuk
                                                                    melakukan
                                                                    scan melalui
                                                                    aplikasi.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="py-10 text-center text-sm text-slate-500"
                                        >
                                            Pertemuan belum tersedia untuk kelas
                                            ini.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
