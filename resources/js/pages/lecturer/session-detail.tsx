import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/lecturer-layout';
import {
    ArrowLeft,
    CalendarDays,
    Clock3,
    GraduationCap,
    MapPin,
    Paperclip,
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
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';

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
    permission_proof_extension: string | null;
};

type SessionDetail = {
    id: number;
    name: string;
    date: string;
    qr_token: string;
    qr_url: string | null;
    course: any;
    students_attendance: StudentAttendance[];
    present_count: number;
    permission_count: number;
    absent_count: number;
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

function getStatusSelectClass(status: string): string {
    if (status === 'hadir') {
        return 'border-green-200 bg-green-50 text-green-700 focus:border-green-400 focus:ring-green-100';
    }

    if (status === 'izin') {
        return 'border-yellow-200 bg-yellow-50 text-yellow-700 focus:border-yellow-400 focus:ring-yellow-100';
    }

    return 'border-red-200 bg-red-50 text-red-700 focus:border-red-400 focus:ring-red-100';
}

function getProofStatusLabel(
    status: StudentAttendance['permission_proof_status'],
): string {
    if (status === 'pending') return 'Menunggu Approval';
    if (status === 'accepted') return 'Diterima';
    if (status === 'rejected') return 'Ditolak';

    return '-';
}

function getProofStatusClass(
    status: StudentAttendance['permission_proof_status'],
): string {
    if (status === 'pending') {
        return 'bg-yellow-50 text-yellow-700';
    }

    if (status === 'accepted') {
        return 'bg-green-50 text-green-700';
    }

    if (status === 'rejected') {
        return 'bg-red-50 text-red-700';
    }

    return 'bg-slate-50 text-slate-500';
}

function recalculateSessionSummary(session: SessionDetail): SessionDetail {
    const students = session.students_attendance ?? [];

    return {
        ...session,
        present_count: students.filter((student) => student.status === 'hadir')
            .length,
        permission_count: students.filter(
            (student) => student.status === 'izin',
        ).length,
        absent_count: students.filter((student) => student.status === 'alpha')
            .length,
    };
}

export default function LecturerSessionDetail() {
    const props = usePage().props as Record<string, any>;

    const initialSession = props.session as SessionDetail;

    const [session, setSession] = React.useState<SessionDetail>(initialSession);

    const [selectedProofUrl, setSelectedProofUrl] = React.useState<
        string | null
    >(null);

    const [selectedProofStudent, setSelectedProofStudent] =
        React.useState<StudentAttendance | null>(null);

    const [approvingProof, setApprovingProof] = React.useState(false);

    const course = session.course;

    const handleAttendanceStatusChange = (
        sessionId: number,
        studentId: number,
        status: string,
    ) => {
        setSession((currentSession) => {
            const updatedStudents = currentSession.students_attendance.map(
                (student) =>
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
            );

            return recalculateSessionSummary({
                ...currentSession,
                students_attendance: updatedStudents,
            });
        });

        router.post(
            `/lecturer/sessions/${sessionId}/manual-attendance`,
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

                    setSession((currentSession) => {
                        const updatedStudents =
                            currentSession.students_attendance.map(
                                (student): StudentAttendance =>
                                    student.attendance_id === attendanceId
                                        ? {
                                              ...student,
                                              status: 'izin',
                                              permission_proof_status:
                                                  'accepted',
                                          }
                                        : student,
                            );

                        return recalculateSessionSummary({
                            ...currentSession,
                            students_attendance: updatedStudents,
                        });
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

                    setSession((currentSession) => {
                        const updatedStudents =
                            currentSession.students_attendance.map(
                                (student): StudentAttendance =>
                                    student.attendance_id === attendanceId
                                        ? {
                                              ...student,
                                              status: 'alpha',
                                              scanned_at: null,
                                              permission_proof_status:
                                                  'rejected',
                                          }
                                        : student,
                            );

                        return recalculateSessionSummary({
                            ...currentSession,
                            students_attendance: updatedStudents,
                        });
                    });
                },
                onError: () => {
                    setApprovingProof(false);
                },
            },
        );
    };

    if (!session || !course) {
        return (
            <AppLayout>
                <Head title="Detail Pertemuan" />
                <div className="p-6">Pertemuan tidak ditemukan.</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title={`Detail Pertemuan - ${session.name}`} />

            <div className="flex min-h-screen w-full flex-col gap-6 bg-[#F8FAFC] p-6">
                <div className="flex items-center justify-between gap-4">
                    <Button
                        variant="outline"
                        onClick={() =>
                            router.visit(`/lecturer/classes/${course.id}`)
                        }
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali
                    </Button>
                </div>

                <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div>
                            <p className="text-sm font-medium text-sky-600">
                                Detail Pertemuan
                            </p>

                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                {session.name}
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                {course.name}
                            </p>
                        </div>

                        <div className="rounded-xl bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
                            {formatDate(session.date)}
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                        <p className="flex items-center gap-2">
                            <CalendarDays className="size-4 text-sky-600" />
                            {formatDate(session.date)}
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

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                        <p className="text-sm font-medium text-green-600">
                            Hadir
                        </p>
                        <p className="mt-2 text-3xl font-bold text-green-700">
                            {session.present_count ?? 0}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-5">
                        <p className="text-sm font-medium text-yellow-600">
                            Izin
                        </p>
                        <p className="mt-2 text-3xl font-bold text-yellow-700">
                            {session.permission_count ?? 0}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                        <p className="text-sm font-medium text-red-600">
                            Alpha
                        </p>
                        <p className="mt-2 text-3xl font-bold text-red-700">
                            {session.absent_count ?? 0}
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Daftar Kehadiran Mahasiswa
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Ubah status kehadiran langsung dari tabel.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 text-xs text-slate-500 uppercase">
                                    <TableHead className="pl-6 font-semibold">
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
                                {session.students_attendance &&
                                session.students_attendance.length > 0 ? (
                                    session.students_attendance.map(
                                        (student) => (
                                            <TableRow
                                                key={student.student_id}
                                                className="h-16"
                                            >
                                                <TableCell className="pl-6 font-medium text-slate-700">
                                                    {student.nim}
                                                </TableCell>

                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-slate-900">
                                                            {student.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {student.email}
                                                        </p>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <select
                                                        value={student.status}
                                                        onChange={(e) =>
                                                            handleAttendanceStatusChange(
                                                                session.id,
                                                                student.student_id,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={`w-20 appearance-none rounded-md border px-3 py-2 text-center text-sm font-semibold transition outline-none focus:ring-2 ${getStatusSelectClass(
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

                                                <TableCell>
                                                    {student.permission_proof ? (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedProofUrl(
                                                                    `/lecturer/attendances/${student.attendance_id}/permission-proof/view`,
                                                                );
                                                                setSelectedProofStudent(
                                                                    student,
                                                                );
                                                            }}
                                                            className="relative inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                                                        >
                                                            <Paperclip className="size-3" />
                                                            Lihat Bukti
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
                                            className="py-10 text-center text-sm text-slate-500"
                                        >
                                            Belum ada mahasiswa di kelas ini.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Dialog
                    open={!!selectedProofUrl}
                    onOpenChange={(open) => {
                        if (!open) {
                            setSelectedProofUrl(null);
                            setSelectedProofStudent(null);
                        }
                    }}
                >
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                        <DialogHeader className="pr-10">
                            <div className="flex items-center justify-between gap-3">
                                <DialogTitle>Bukti Izin</DialogTitle>

                                {selectedProofStudent && (
                                    <span
                                        className={`mr-2 rounded-full px-2 py-1 text-xs font-semibold ${getProofStatusClass(
                                            selectedProofStudent.permission_proof_status,
                                        )}`}
                                    >
                                        {getProofStatusLabel(
                                            selectedProofStudent.permission_proof_status,
                                        )}
                                    </span>
                                )}
                            </div>
                        </DialogHeader>

                        {selectedProofUrl && selectedProofStudent && (
                            <div className="space-y-4">
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                    <p className="text-xs font-medium text-slate-500">
                                        Mahasiswa
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-900">
                                        {selectedProofStudent.name}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {selectedProofStudent.nim}
                                    </p>
                                </div>

                                <div className="flex min-h-96 flex-col items-center justify-center rounded-xl border border-slate-100 bg-white p-4">
                                    {selectedProofStudent?.permission_proof_extension &&
                                    [
                                        'jpg',
                                        'jpeg',
                                        'png',
                                        'gif',
                                        'webp',
                                    ].includes(
                                        selectedProofStudent.permission_proof_extension.toLowerCase(),
                                    ) ? (
                                        <img
                                            src={selectedProofUrl || ''}
                                            alt="Bukti izin"
                                            className="max-h-96 max-w-full rounded-lg border border-slate-200"
                                        />
                                    ) : selectedProofStudent?.permission_proof_extension?.toLowerCase() ===
                                      'pdf' ? (
                                        <iframe
                                            src={selectedProofUrl || ''}
                                            className="h-96 w-full rounded-lg border border-slate-200"
                                            title="Bukti izin PDF"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 text-center">
                                            <a
                                                href={selectedProofUrl || ''}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 font-semibold text-blue-600 transition hover:bg-blue-100"
                                            >
                                                <Paperclip className="size-4" />
                                                Buka File
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {selectedProofStudent.permission_proof_status ===
                                    'pending' &&
                                    selectedProofStudent.attendance_id && (
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <Button
                                                onClick={() =>
                                                    handleApproveProof(
                                                        selectedProofStudent.attendance_id as number,
                                                    )
                                                }
                                                disabled={approvingProof}
                                                className="bg-green-600 text-white hover:bg-green-700"
                                            >
                                                {approvingProof
                                                    ? 'Menerima...'
                                                    : 'Terima'}
                                            </Button>

                                            <Button
                                                onClick={() =>
                                                    handleRejectProof(
                                                        selectedProofStudent.attendance_id as number,
                                                    )
                                                }
                                                disabled={approvingProof}
                                                variant="destructive"
                                            >
                                                {approvingProof
                                                    ? 'Menolak...'
                                                    : 'Tolak'}
                                            </Button>
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
