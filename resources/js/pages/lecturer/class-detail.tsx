import { Head, router, useForm, usePage } from '@inertiajs/react';
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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import QRCode from 'react-qr-code';
import React from 'react';

type StudentAttendance = {
    student_id: number;
    nim: string;
    name: string;
    email: string;
    status: 'hadir' | 'izin' | 'alpha' | string;
    scanned_at: string | null;
    attendance_id: number | null;
    permission_proof: string | null;
    permission_proof_status: 'pending' | 'accepted' | 'rejected' | null;
};

type MeetingItem = {
    id: number;
    name: string;
    date: string;
    logged_at: string | null;
    qr_token: string;
    qr_url: string | null;
    students_attendance?: StudentAttendance[];
    present_count?: number;
    permission_count?: number;
    absent_count?: number;
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

function formatDateTime(value: string | null): string {
    if (!value) return '-';

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getStatusSelectClass(status: string) {
    if (status === 'hadir') {
        return 'border-green-200 bg-green-50 text-green-700 focus:border-green-400 focus:ring-green-100';
    }

    if (status === 'izin') {
        return 'border-yellow-200 bg-yellow-50 text-yellow-700 focus:border-yellow-400 focus:ring-yellow-100';
    }

    return 'border-red-200 bg-red-50 text-red-700 focus:border-red-400 focus:ring-red-100';
}

function getStatusLabel(status: string) {
    if (status === 'hadir') return 'Hadir';
    if (status === 'izin') return 'Izin';
    return 'Alpha';
}

function recalculateMeetingSummary(meeting: MeetingItem): MeetingItem {
    const students = meeting.students_attendance ?? [];

    return {
        ...meeting,
        present_count: students.filter((student) => student.status === 'hadir')
            .length,
        permission_count: students.filter(
            (student) => student.status === 'izin',
        ).length,
        absent_count: students.filter((student) => student.status === 'alpha')
            .length,
    };
}

export default function LecturerClassDetail() {
    const props = usePage().props as Record<string, any>;

    const kelas = props.class;
    const meetings = props.meetings as MeetingItem[];

    const [openAddMeeting, setOpenAddMeeting] = React.useState(false);
    const [selectedMeeting, setSelectedMeeting] =
        React.useState<MeetingItem | null>(null);
    const [selectedProofUrl, setSelectedProofUrl] = React.useState<
        string | null
    >(null);
    const [selectedProofStudent, setSelectedProofStudent] =
        React.useState<StudentAttendance | null>(null);
    const [approvingProof, setApprovingProof] = React.useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        date: '',
    });

    const handleAddMeeting = (e: React.FormEvent) => {
        e.preventDefault();

        post(`/lecturer/classes/${kelas.id}/sessions`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpenAddMeeting(false);
            },
        });
    };

    const handleManualAttendance = (
        meetingId: number,
        studentId: number,
        status: string,
    ) => {
        setSelectedMeeting((currentMeeting) => {
            if (!currentMeeting) return currentMeeting;

            const updatedStudents =
                currentMeeting.students_attendance?.map((student) =>
                    student.student_id === studentId
                        ? {
                              ...student,
                              status,
                              scanned_at:
                                  status === 'alpha'
                                      ? null
                                      : (student.scanned_at ??
                                        new Date().toISOString()),
                          }
                        : student,
                ) ?? [];

            return recalculateMeetingSummary({
                ...currentMeeting,
                students_attendance: updatedStudents,
            });
        });

        router.post(
            `/lecturer/sessions/${meetingId}/manual-attendance`,
            {
                student_id: studentId,
                status,
            },
            {
                preserveScroll: true,
            },
        );
    };

    const handleApproveProof = (attendanceId: number) => {
        setApprovingProof(true);

        router.post(
            `/lecturer/attendances/${attendanceId}/approve-proof`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setApprovingProof(false);
                    setSelectedProofUrl(null);
                    setSelectedProofStudent(null);

                    setSelectedMeeting((currentMeeting) => {
                        if (!currentMeeting) return currentMeeting;

                        const updatedStudents =
                            currentMeeting.students_attendance?.map(
                                (student): StudentAttendance =>
                                    student.attendance_id === attendanceId
                                        ? {
                                              ...student,
                                              permission_proof_status:
                                                  'accepted',
                                          }
                                        : student,
                            ) ?? [];

                        return {
                            ...currentMeeting,
                            students_attendance: updatedStudents,
                        };
                    });
                },
                onError: () => {
                    setApprovingProof(false);
                },
            },
        );
    };

    const handleRejectProof = (attendanceId: number) => {
        setApprovingProof(true);

        router.post(
            `/lecturer/attendances/${attendanceId}/reject-proof`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setApprovingProof(false);
                    setSelectedProofUrl(null);
                    setSelectedProofStudent(null);

                    setSelectedMeeting((currentMeeting) => {
                        if (!currentMeeting) return currentMeeting;

                        const updatedStudents =
                            currentMeeting.students_attendance?.map(
                                (student): StudentAttendance =>
                                    student.attendance_id === attendanceId
                                        ? {
                                              ...student,
                                              permission_proof_status:
                                                  'rejected',
                                          }
                                        : student,
                            ) ?? [];

                        return {
                            ...currentMeeting,
                            students_attendance: updatedStudents,
                        };
                    });
                },
                onError: () => {
                    setApprovingProof(false);
                },
            },
        );
    };
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
                    <div className="flex items-center justify-between border-b border-slate-100 bg-sky-50/50 px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                            <CalendarDays className="size-4 text-sky-600" />
                            Tabel Pertemuan
                        </div>

                        <Dialog
                            open={openAddMeeting}
                            onOpenChange={setOpenAddMeeting}
                        >
                            <DialogTrigger asChild>
                                <Button size="sm">Tambah Pertemuan</Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Tambah Pertemuan</DialogTitle>
                                </DialogHeader>

                                <form
                                    onSubmit={handleAddMeeting}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Nama Pertemuan
                                        </Label>

                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder="Contoh: Pertemuan 1"
                                        />

                                        {errors.name && (
                                            <p className="text-sm text-red-500">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date">Tanggal</Label>

                                        <Input
                                            id="date"
                                            type="date"
                                            value={data.date}
                                            onChange={(e) =>
                                                setData('date', e.target.value)
                                            }
                                        />

                                        {errors.date && (
                                            <p className="text-sm text-red-500">
                                                {errors.date}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full"
                                    >
                                        {processing
                                            ? 'Menyimpan...'
                                            : 'Simpan Pertemuan'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
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
                                        Kehadiran
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
                                            onClick={() =>
                                                setSelectedMeeting(meeting)
                                            }
                                            className="h-16 cursor-pointer hover:bg-slate-50/80"
                                        >
                                            <TableCell className="pl-6 font-medium text-slate-800">
                                                {meeting.name ||
                                                    `Pertemuan ${index + 1}`}
                                            </TableCell>

                                            <TableCell className="text-slate-700">
                                                {formatDate(meeting.date)}
                                            </TableCell>

                                            <TableCell className="text-slate-700">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                                        {meeting.present_count ??
                                                            0}{' '}
                                                        hadir
                                                    </span>

                                                    <span className="rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
                                                        {meeting.permission_count ??
                                                            0}{' '}
                                                        izin
                                                    </span>

                                                    <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                                                        {meeting.absent_count ??
                                                            0}{' '}
                                                        alpha
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-slate-700">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <button
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500 transition-all hover:bg-sky-100 hover:text-sky-600"
                                                        >
                                                            LIHAT QR
                                                        </button>
                                                    </DialogTrigger>

                                                    <DialogContent
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                        className="sm:max-w-md"
                                                    >
                                                        <DialogHeader>
                                                            <DialogTitle className="text-center">
                                                                QR Code -{' '}
                                                                {meeting.name ||
                                                                    `Pertemuan ${index + 1}`}
                                                            </DialogTitle>
                                                        </DialogHeader>

                                                        <div className="flex flex-col items-center justify-center space-y-4 py-6">
                                                            <div className="rounded-xl bg-white p-4">
                                                                {meeting.qr_url ? (
                                                                    <QRCode
                                                                        value={
                                                                            meeting.qr_url
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

                <Dialog
                    open={!!selectedMeeting}
                    onOpenChange={(open) => {
                        if (!open) {
                            setSelectedMeeting(null);
                        }
                    }}
                >
                    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-6xl">
                        <DialogHeader>
                            <DialogTitle>
                                Detail Kehadiran -{' '}
                                {selectedMeeting?.name ?? 'Pertemuan'}
                            </DialogTitle>
                        </DialogHeader>

                        {selectedMeeting && (
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-4">
                                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                        <p className="text-xs font-medium text-slate-500">
                                            Tanggal
                                        </p>
                                        <p className="mt-1 font-semibold text-slate-900">
                                            {formatDate(selectedMeeting.date)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                                        <p className="text-xs font-medium text-green-600">
                                            Hadir
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-green-700">
                                            {selectedMeeting.present_count ?? 0}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
                                        <p className="text-xs font-medium text-yellow-600">
                                            Izin
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-yellow-700">
                                            {selectedMeeting.permission_count ??
                                                0}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                                        <p className="text-xs font-medium text-red-600">
                                            Alpha
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-red-700">
                                            {selectedMeeting.absent_count ?? 0}
                                        </p>
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-slate-100">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50 text-xs text-slate-500 uppercase">
                                                <TableHead className="font-semibold">
                                                    NIM
                                                </TableHead>

                                                <TableHead className="font-semibold">
                                                    Nama
                                                </TableHead>

                                                <TableHead className="font-semibold">
                                                    Status Kehadiran
                                                </TableHead>

                                                <TableHead className="font-semibold">
                                                    Waktu Absen
                                                </TableHead>

                                                <TableHead className="font-semibold">
                                                    Bukti Izin
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {selectedMeeting.students_attendance &&
                                            selectedMeeting.students_attendance
                                                .length > 0 ? (
                                                selectedMeeting.students_attendance.map(
                                                    (student) => (
                                                        <TableRow
                                                            key={
                                                                student.student_id
                                                            }
                                                        >
                                                            <TableCell className="font-medium text-slate-700">
                                                                {student.nim}
                                                            </TableCell>

                                                            <TableCell>
                                                                <div>
                                                                    <p className="font-medium text-slate-900">
                                                                        {
                                                                            student.name
                                                                        }
                                                                    </p>

                                                                    <p className="text-xs text-slate-500">
                                                                        {
                                                                            student.email
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </TableCell>

                                                            <TableCell>
                                                                <select
                                                                    value={
                                                                        student.status
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleManualAttendance(
                                                                            selectedMeeting.id,
                                                                            student.student_id,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className={`appearance-none rounded-md border px-3 py-2 text-sm font-semibold transition outline-none focus:ring-2 ${getStatusSelectClass(
                                                                        student.status,
                                                                    )}`}
                                                                >
                                                                    <option value="hadir">
                                                                        Hadir
                                                                    </option>
                                                                    <option value="izin">
                                                                        Izin
                                                                    </option>
                                                                    <option value="alpha">
                                                                        Alpha
                                                                    </option>
                                                                </select>
                                                            </TableCell>

                                                            <TableCell className="text-sm text-slate-600">
                                                                {formatDateTime(
                                                                    student.scanned_at,
                                                                )}
                                                            </TableCell>

                                                            <TableCell className="text-sm text-slate-600">
                                                                {student.permission_proof ? (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedProofUrl(
                                                                                student.permission_proof,
                                                                            );
                                                                            setSelectedProofStudent(
                                                                                student,
                                                                            );
                                                                        }}
                                                                        className="relative inline-flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                                                                    >
                                                                        <span>
                                                                            📎
                                                                        </span>
                                                                        Lihat
                                                                        Bukti
                                                                        {student.permission_proof_status ===
                                                                            'pending' && (
                                                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                                                !
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-xs text-slate-400">
                                                                        -
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={5}
                                                        className="py-8 text-center text-sm text-slate-500"
                                                    >
                                                        Belum ada mahasiswa di
                                                        kelas ini.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                <p className="text-xs text-slate-500">
                                    Status bisa diubah langsung dari kolom
                                    Status Kehadiran. Pilih Hadir, Izin, atau
                                    Alpha sesuai kondisi mahasiswa.
                                </p>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={!!selectedProofUrl}
                    onOpenChange={(open) => {
                        if (!open) {
                            setSelectedProofUrl(null);
                            setSelectedProofStudent(null);
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <DialogTitle>Bukti Izin</DialogTitle>
                                {selectedProofStudent &&
                                    selectedProofStudent.permission_proof_status && (
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                selectedProofStudent.permission_proof_status ===
                                                'pending'
                                                    ? 'bg-yellow-50 text-yellow-700'
                                                    : selectedProofStudent.permission_proof_status ===
                                                        'accepted'
                                                      ? 'bg-green-50 text-green-700'
                                                      : 'bg-red-50 text-red-700'
                                            }`}
                                        >
                                            {selectedProofStudent.permission_proof_status ===
                                            'pending'
                                                ? 'Menunggu Approval'
                                                : selectedProofStudent.permission_proof_status ===
                                                    'accepted'
                                                  ? 'Diterima'
                                                  : 'Ditolak'}
                                        </span>
                                    )}
                            </div>
                        </DialogHeader>

                        {selectedProofUrl && selectedProofStudent && (
                            <div className="space-y-4">
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-xs font-medium text-slate-600">
                                        Bukti dari:
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-900">
                                        {selectedProofStudent.name}{' '}
                                        <span className="font-normal text-slate-500">
                                            ({selectedProofStudent.nim})
                                        </span>
                                    </p>
                                </div>

                                <div className="flex flex-col items-center justify-center space-y-4 py-6">
                                    {selectedProofUrl.match(
                                        /\.(jpg|jpeg|png|gif|webp)$/i,
                                    ) ? (
                                        <img
                                            src={selectedProofUrl}
                                            alt="Bukti izin"
                                            className="max-h-96 max-w-full rounded-lg border border-slate-200"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-3">
                                            <a
                                                href={selectedProofUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 font-semibold text-blue-600 transition hover:bg-blue-100"
                                            >
                                                <span>📥</span>
                                                Unduh Bukti Izin
                                            </a>
                                            <p className="text-sm text-slate-500">
                                                Klik tombol di atas untuk
                                                mengunduh file bukti izin
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {selectedProofStudent.permission_proof_status ===
                                    'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                handleApproveProof(
                                                    selectedProofStudent.attendance_id ||
                                                        0,
                                                )
                                            }
                                            disabled={approvingProof}
                                            className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {approvingProof
                                                ? 'Menerima...'
                                                : '✓ Terima'}
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleRejectProof(
                                                    selectedProofStudent.attendance_id ||
                                                        0,
                                                )
                                            }
                                            disabled={approvingProof}
                                            className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {approvingProof
                                                ? 'Menolak...'
                                                : '✕ Tolak'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
