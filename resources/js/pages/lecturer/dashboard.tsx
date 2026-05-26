import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/lecturer-layout';
import { Calendar, BookOpen, MapPin, Clock, Users } from 'lucide-react';

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface MasterCourse {
    code: string;
    name: string;
    day: string;
    time: string;
    room: string;
    class: string;
    studentsCount: number;
}

interface ClassEvent {
    id: string;
    courseCode: string;
    status: 'completed' | 'today' | 'upcoming';
}

interface CalendarEvents {
    [dateStr: string]: ClassEvent[];
}

// ==========================================
// DATA JADWAL MASTER DOSEN (Samping Kanan)
// ==========================================
const MASTER_COURSES: MasterCourse[] = [
    { code: "IF-301", name: "Basis Data 2", day: "Senin", time: "08:00 - 10:30", room: "Lab Komputer 3", class: "IF-A", studentsCount: 32 },
    { code: "IF-302", name: "Algoritma Pemrograman", day: "Senin", time: "13:00 - 15:30", room: "Ruang Teori 202", class: "IF-C", studentsCount: 28 },
    { code: "IF-305", name: "Pengembangan Aplikasi Web", day: "Selasa", time: "09:30 - 12:00", room: "Lab Komputer 1", class: "IF-B", studentsCount: 30 },
    { code: "IF-309", name: "Struktur Data", day: "Selasa", time: "14:00 - 16:30", room: "Ruang Teori 104", class: "IF-A", studentsCount: 35 },
    { code: "IF-312", name: "Rekayasa Perangkat Lunak", day: "Kamis", time: "10:00 - 12:30", room: "Lab Riset AI", class: "IF-B", studentsCount: 25 }
];

// Data Event Kalender untuk Indikator Absensi Bulanan (Mei 2026)
const CALENDAR_EVENTS: CalendarEvents = {
    "2026-05-04": [{ id: "e1", courseCode: "IF-301", status: "completed" }],
    "2026-05-11": [{ id: "e2", courseCode: "IF-301", status: "completed" }],
    "2026-05-18": [
        { id: "e3", courseCode: "IF-301", status: "completed" },
        { id: "e4", courseCode: "IF-302", status: "completed" }
    ],
    // Hari ini (Asumsi Selasa, 26 Mei 2026)
    "2026-05-26": [
        { id: "e5", courseCode: "IF-305", status: "today" },
        { id: "e6", courseCode: "IF-309", status: "today" }
    ],
    "2026-05-28": [{ id: "e7", courseCode: "IF-312", status: "upcoming" }]
};

export default function Dashboard() {
    // Mengambil data autentikasi dari share props Inertia Laravel Anda
    const { auth } = usePage().props as any;
    const firstName = auth?.user?.name?.split(' ')[0] ?? 'Dosen';

    const [currentCalendarDate] = useState<Date>(new Date(2026, 4, 26)); // Fix Mei 2026
    const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-05-26");

    // Logic Generator Grid Tanggal Kalender
    const generateCalendarGrid = () => {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();

        const firstDayIndex = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const prevLastDay = new Date(year, month, 0).getDate();

        const grid = [];

        for (let x = firstDayIndex; x > 0; x--) {
            grid.push({ dayNum: prevLastDay - x + 1, isCurrentMonth: false, dateStr: '' });
        }
        for (let i = 1; i <= lastDay; i++) {
            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            grid.push({ dayNum: i, isCurrentMonth: true, dateStr: dayStr });
        }

        return grid;
    };

    const calendarDays = generateCalendarGrid();

    return (
        <AppLayout>
            <Head title="Jadwal & Absensi" />

            <div className="flex min-h-full w-full flex-col gap-6 bg-slate-50 p-6">
                
                {/* Bagian Header Sambutan Dosen */}
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">
                        Selamat datang, {firstName}
                    </h1>
                    <p className="mt-0.5 text-sm text-slate-500">
                        Kelola agenda mengajar dan presensi kelas mahasiswa Anda melalui panel kalender interaktif
                    </p>
                </div>

                {/* CONTAINER GRID UTAMA (KALENDER BULANAN & JADWAL MASTER) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    
                    {/* KOLOM KIRI & TENGAH: KALENDER JADWAL BULANAN */}
                    <div className="rounded-xl border border-slate-100 bg-white p-6 lg:col-span-2 shadow-xs flex flex-col h-fit">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
                            <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                <Calendar className="size-4.5 text-sky-500" />
                                Kalender : <span className="text-sky-600">{currentCalendarDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                            </h2>
                            {/* Petunjuk Status Warna Bulatan */}
                            <div className="flex flex-wrap gap-3 text-[11px] font-medium text-slate-500">
                                <div className="flex items-center gap-1">
                                    <span className="size-2 rounded-full bg-emerald-400" /> Selesai Diabsen
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="size-2 rounded-full bg-amber-400" /> Hari Ini
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="size-2 rounded-full bg-sky-400" /> Akan Datang
                                </div>
                            </div>
                        </div>

                        {/* Nama-Nama Hari */}
                        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3 mb-2">
                            <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
                        </div>

                        {/* Grid Tanggal Kalender */}
                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((cell, idx) => {
                                if (!cell.isCurrentMonth) {
                                    return <div key={`empty-${idx}`} className="p-3 text-slate-200 text-sm text-center">{cell.dayNum}</div>;
                                }

                                const events = CALENDAR_EVENTS[cell.dateStr] || [];
                                const isSelected = cell.dateStr === selectedDateStr;
                                const isTodayDate = cell.dateStr === "2026-05-26";
                                
                                // Variasi warna penanda active / today / selection
                                let borderStyle = "border-slate-100 bg-slate-50/20";
                                if (isTodayDate) borderStyle = "border-amber-300 bg-amber-50/30";
                                if (isSelected) borderStyle = "border-sky-500 bg-sky-50/40 ring-1 ring-sky-400";

                                return (
                                    <button
                                        key={`day-${idx}`}
                                        onClick={() => setSelectedDateStr(cell.dateStr)}
                                        className={`min-h-[85px] p-2 rounded-xl border flex flex-col justify-between items-start transition cursor-pointer group hover:border-sky-300 hover:bg-sky-50/10 ${borderStyle}`}
                                    >
                                        {/* Badge Angka Tanggal */}
                                        <span className={`text-xs font-bold size-6 flex items-center justify-center rounded-lg ${
                                            isTodayDate ? 'bg-amber-400 text-amber-950 font-black' : isSelected ? 'bg-sky-500 text-white' : 'text-slate-600'
                                        }`}>
                                            {cell.dayNum}
                                        </span>

                                        {/* Label Kode Kelas Kuliah di dalam kotak tanggal */}
                                        {events.length > 0 && (
                                            <div className="w-full mt-1.5 space-y-1">
                                                {events.map((ev) => (
                                                    <div 
                                                        key={ev.id} 
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Biar klik tombol kelas tidak bentrok dengan trigger tanggal
                                                            alert(`Navigasi ke form absensi mahasiswa kelas: ${ev.courseCode}`);
                                                        }}
                                                        className={`text-[9px] truncate font-bold px-1.5 py-0.5 rounded border text-left shadow-2xs transition group-hover:scale-[1.02] ${
                                                            ev.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                            ev.status === 'today' ? 'bg-amber-50 border-amber-300 text-amber-800' :
                                                            'bg-sky-50 border-sky-200 text-sky-700'
                                                        }`}
                                                    >
                                                        ⚡ {ev.courseCode}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* KOLOM KANAN: MASTER LIST SEMUA JADWAL MENGAJAR SEMESTER */}
                    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col h-[525px]">
                        <div className="border-b border-slate-100 pb-4 mb-4">
                            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                <BookOpen className="size-4 text-sky-500" /> 
                                Jadwal Mengajar
                            </h2>
                        </div>

                        {/* List Scroll Card Jadwal */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                            {MASTER_COURSES.map((course, index) => (
                                <div 
                                    key={index} 
                                    className="p-4 rounded-xl border border-sky-100/60 bg-gradient-to-r from-sky-50/40 to-white hover:shadow-xs transition flex flex-col gap-2.5 group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[9px] font-bold text-sky-600 bg-sky-100/50 px-2 py-0.5 rounded-md tracking-wide uppercase">
                                                {course.code} • KELAS {course.class}
                                            </span>
                                            <h4 className="font-semibold text-slate-800 text-sm mt-1.5 group-hover:text-sky-600 transition-colors">
                                                {course.name}
                                            </h4>
                                        </div>
                                    </div>

                                    {/* Detail Komponen Waktu Hari, Jam, Ruangan */}
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-xs text-slate-500 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100/80">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="size-3.5 text-slate-400" /> 
                                            <span className="font-medium text-slate-700">{course.day}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-slate-400 font-medium">🕒</span> 
                                            <span className="text-slate-600 font-medium">{course.time}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 col-span-2 text-[11px] pt-1.5 border-t border-slate-200/50 text-slate-400">
                                            <MapPin className="size-3 text-slate-400" />
                                            <span className="truncate">Ruang: {course.room}</span>
                                            <span className="mx-1 text-slate-300">|</span>
                                            <Users className="size-3 text-slate-400" />
                                            <span>{course.studentsCount} Mhs</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}